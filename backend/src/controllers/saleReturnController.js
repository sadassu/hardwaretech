import { asyncHandler } from "../utils/asyncHandler.js";
import Sale from "../models/Sale.js";
import ProductVariant from "../models/ProductVariant.js";

export const returnSales = asyncHandler(async (req, res) => {
  const { saleId } = req.params;

  const sale = await Sale.findById(saleId)
    .populate("items.productVariantId")
    .select("items");

  if (!sale) {
    return res.status(404).json({
      success: false,
      message: "Sale record not found. Please check the sale ID and try again.",
    });
  }

  const itemsWithQuantity = sale.items.map((item) => ({
    productVariantId: item.productVariantId._id,
    quantity: item.quantity,
    size: item.size,
    unit: item.unit,
    price: item.price,
  }));

  // Return items to stock by incrementing the quantity field
  for (const item of sale.items) {
    await ProductVariant.findByIdAndUpdate(item.productVariantId._id, {
      $inc: { quantity: item.quantity },
    });
  }

  // Delete the sale after processing the return
  await Sale.findByIdAndDelete(saleId);

  res.status(200).json({
    success: true,
    message: "Sale items returned to stock and sale deleted successfully",
    items: itemsWithQuantity,
  });
});
