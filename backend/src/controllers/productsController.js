import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/products
// this function return { "_id": "64fa9d8d0a123456789abcd", "name": "Rice" },
// good for making dropdowns that shows product name and id
export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}, "name _id");

  res.status(200).json(products);
});

//  Get all products
export const getAllProducts = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = req.queryOptions;

  const products = await Product.find(filter)
    .populate("category")
    .populate("variants")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(filter);

  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    products,
  });
});

//  Get single product by ID
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
});

//  Create new product
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category } = req.body || {};

  if (!name || !category) {
    return res.status(400).json({ message: "Name and category are required" });
  }

  let existingCategory = await Category.findOne({ name: category });
  if (!existingCategory) {
    existingCategory = await Category.create({ name: category });
  }

  const newProduct = await Product.create({
    name,
    description: description || "",
    category: existingCategory._id,
    image: req.file ? `/uploads/${req.file.filename}` : "",
  });

  const populatedProduct = await newProduct.populate("category");

  res.status(201).json({
    message: "Product created successfully",
    product: populatedProduct,
  });
});

// Update product
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, category } = req.body || {};
  const productId = req.params.id;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Handle category
  let categoryId = product.category;
  if (category) {
    let existingCategory = await Category.findOne({ name: category });
    if (!existingCategory) {
      existingCategory = await Category.create({ name: category });
    }
    categoryId = existingCategory._id;
  }

  product.name = name || product.name;
  product.description = description || product.description;
  product.category = categoryId;

  if (req.file) {
    product.image = `/uploads/${req.file.filename}`;
  }

  await product.save();
  await product.populate("category");

  res.status(200).json({
    message: "Product updated successfully",
    product,
  });
});

//  Delete product
export const deleteProduct = asyncHandler(async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  if (!deletedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json({ message: "Product deleted successfully" });
});
