import Category from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 🟢 Get all categories
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json(categories);
});

// 🟢 Create new category
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const newCategory = new Category({ name });
  const savedCategory = await newCategory.save();

  res.status(201).json({
    category: savedCategory,
    message: "Category added successfully",
  });
});

// 🟢 Delete category by ID
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedCategory = await Category.findByIdAndDelete(id);
  if (!deletedCategory) {
    return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json({ message: "Category deleted successfully" });
});
