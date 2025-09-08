import Category from "../models/Category.js";

export async function getAllCategories(req, res) {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.log("error in getAllCategories in controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    const newCategory = new Category({ name, description });

    const savedCategory = await newCategory.save();
    res
      .status(201)
      .json(savedCategory, { message: "category added successfully" });
      
  } catch (error) {
    console.log("error in getAllCategories in controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
