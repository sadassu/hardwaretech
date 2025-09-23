import Sale from "../models/Sale.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// create sale to the sale and sale_details
export const createSale = asyncHandler(async (req, res) => {
  const { items, amountPaid, cashier } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Sale must include items." });
  }

  const sale = new Sale({
    items,
    amountPaid,
    cashier,
    type: "pos",
  });

  await sale.save();

  res.status(201).json({ message: "Sale created successfully.", sale });
});
// fetch the sale per user

// fetch all sale for admin
