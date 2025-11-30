import { asyncHandler } from "../utils/asyncHandler.js";
import Sale from "../models/Sale.js";
import ProductVariant from "../models/ProductVariant.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import mongoose from "mongoose";

export const returnSales = asyncHandler(async (req, res) => {
  const { saleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(saleId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid sale ID format.",
    });
  }

  const sale = await Sale.findById(saleId);

  if (!sale) {
    return res.status(404).json({
      success: false,
      message: "Sale record not found. Please check the sale ID and try again.",
    });
  }

  if (!sale.items || sale.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Sale has no items to return.",
    });
  }

  // Use transaction for data consistency
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const itemsWithQuantity = [];
    const errors = [];

  // Return items to stock by incrementing the quantity field
  for (const item of sale.items) {
      // Handle both populated and non-populated productVariantId
      const variantId = item.productVariantId?._id || item.productVariantId;
      
      if (!variantId) {
        errors.push(`Item with quantity ${item.quantity} has no valid variant ID`);
        continue;
      }

      // Check if variant exists
      let variant = await ProductVariant.findById(variantId).session(session);
      let wasRecreated = false;
      
      if (!variant) {
        // Variant was deleted - recreate it using stored product information
        const productName = item.productName || "Unknown Product";
        const storedSize = item.size || "";
        const storedUnit = item.unit || "";
        const storedColor = item.color || "";
        const storedPrice = item.price || 0;

        // Find the product by name
        let product = await Product.findOne({ name: productName }).session(session);
        
        // If product doesn't exist, recreate it
        if (!product) {
          // Try to find the original category
          let categoryToUse = null;
          
          // First, check if category name is stored in the sale item
          const categoryName = item.categoryName;
          if (categoryName) {
            // Find or create the category with the stored name
            let category = await Category.findOne({ name: categoryName }).session(session);
            
            if (!category) {
              // Category was deleted - recreate it
              category = new Category({ name: categoryName });
              await category.save({ session });
            }
            
            categoryToUse = category._id;
          } else {
            // Fallback: Try to find the original category by checking if there are other products
            // with the same name (case-insensitive) that might have been recreated
            const existingProduct = await Product.findOne({
              name: { $regex: new RegExp(`^${productName}$`, "i") }
            }).session(session);
            
            if (existingProduct) {
              // Found a product with the same name - use its category
              categoryToUse = existingProduct.category;
            } else {
              // Try to find category from supply history
              const SupplyHistory = (await import("../models/SupplyHistory.js")).default;
              const supplyHistory = await SupplyHistory.findOne({
                productName: { $regex: new RegExp(`^${productName}$`, "i") }
              })
                .populate({
                  path: "product_variant",
                  populate: { 
                    path: "product", 
                    populate: { path: "category" }
                  }
                })
                .session(session);
              
              if (supplyHistory?.product_variant?.product?.category) {
                categoryToUse = supplyHistory.product_variant.product.category;
              } else {
                // Try to find any product with similar name pattern to get category
                const similarProduct = await Product.findOne({
                  name: { $regex: productName.split(" ")[0], $options: "i" }
                }).session(session);
                
                if (similarProduct) {
                  categoryToUse = similarProduct.category;
                }
              }
            }
            
            // If still no category found, use default
            if (!categoryToUse) {
              let defaultCategory = await Category.findOne({ name: "Recreated Products" }).session(session);
              
              if (!defaultCategory) {
                defaultCategory = new Category({ name: "Recreated Products" });
                await defaultCategory.save({ session });
              }
              
              categoryToUse = defaultCategory._id;
            }
          }

          // Product was also deleted - recreate it with stored name and original category
          product = new Product({
            name: productName,
            description: `Product recreated from sale return - ${productName}`,
            category: categoryToUse,
            image: "", // Default empty image (required field)
          });
          
          await product.save({ session });
        }

        // Check if a variant with the same characteristics already exists for this product
        const existingVariant = await ProductVariant.findOne({
          product: product._id,
          size: storedSize,
          unit: storedUnit,
          color: storedColor,
        }).session(session);

        if (existingVariant) {
          // Variant with same characteristics exists - increment its quantity
          existingVariant.quantity += item.quantity;
          await existingVariant.save({ session });
          variant = existingVariant;
          wasRecreated = false;
        } else {
          // Create new variant with returned quantity
          const newVariant = new ProductVariant({
            product: product._id,
            size: storedSize,
            unit: storedUnit,
            color: storedColor,
            price: storedPrice,
            supplier_price: storedPrice * 0.8, // Estimate supplier price as 80% of sale price
            quantity: item.quantity,
          });
          
          await newVariant.save({ session });
          variant = newVariant;
          wasRecreated = true;
        }
      } else {
        // Variant exists - just increment quantity
        variant.quantity += item.quantity;
        await variant.save({ session });
      }

      itemsWithQuantity.push({
        productVariantId: variant._id,
        quantity: item.quantity,
        size: item.size || variant.size,
        unit: item.unit || variant.unit,
        price: item.price,
        recreated: wasRecreated,
      });
    }

    // If there were errors but some items were processed, we might want to handle differently
    // For now, if all items failed, abort the transaction
    if (itemsWithQuantity.length === 0 && errors.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Failed to return items: " + errors.join(", "),
        errors,
    });
  }

  // Delete the sale after processing the return
    await Sale.findByIdAndDelete(saleId).session(session);

    await session.commitTransaction();
    session.endSession();

  res.status(200).json({
    success: true,
    message: "Sale items returned to stock and sale deleted successfully",
    items: itemsWithQuantity,
      warnings: errors.length > 0 ? errors : undefined,
  });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});
