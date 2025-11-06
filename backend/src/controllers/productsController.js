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

/**
 * @desc    Get all products with filtering, sorting, pagination, population,
 *          and optional category list
 * @route   GET /api/products
 * @access  Public (or adjust if protected)
 *
 * Features:
 * - Supports filtering (`req.queryOptions.filter`)
 * - Supports sorting (`req.queryOptions.sort`)
 * - Supports pagination (`skip`, `limit`, `page`)
 * - Populates `category` and `variants` fields
 * - If `req.query.includeCategories=true`, also returns all categories
 *
 * @example Request:
 *   GET /api/products?page=1&limit=10&includeCategories=true
 *
 * @example Response JSON:
 * {
 *   "total": 42,
 *   "page": 1,
 *   "pages": 5,
 *   "products": [ ... ],
 *   "categories": [
 *     { "_id": "64f1c8b2...", "name": "Electronics" },
 *     { "_id": "64f1c8b3...", "name": "Clothing" }
 *   ]
 * }
 */
export const getAllProducts = asyncHandler(async (req, res) => {
  const { filter, sort, skip, limit, page } = req.queryOptions;
  const { includeCategories } = req.query;

  const products = await Product.find(filter)
    .populate("category")
    .populate("variants")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Product.countDocuments(filter);

  // Build response
  const response = {
    total,
    page,
    pages: Math.ceil(total / limit),
    products,
  };

  // If requested, include categories
  if (includeCategories === "true") {
    const categories = await Category.find().sort({ name: 1 });
    response.categories = categories;
  }

  res.status(200).json(response);
});

//  Get single product by ID
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
});

// helper: build a regex to match the exact name, case-insensitive
const exactNameRegex = (name) =>
  new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i");

//  Create new product
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, image } = req.body || {};

  // ✅ Validate required fields
  if (!name || !category) {
    return res.status(400).json({ message: "Name and category are required" });
  }

  // Prevent duplicate product name (case-insensitive)
  const existingProduct = await Product.findOne({ name: exactNameRegex(name) });
  if (existingProduct) {
    return res
      .status(400)
      .json({ message: "A product with this name already exists" });
  }

  // ✅ Validate image (optional)
  if (image && typeof image !== "string") {
    return res
      .status(400)
      .json({ message: "Image must be a text URL or base64 string" });
  }

  // ✅ Ensure category exists or create it
  let existingCategory = await Category.findOne({ name: category });
  if (!existingCategory) {
    existingCategory = await Category.create({ name: category });
  }

  // ✅ Create product (no file handling)
  const newProduct = await Product.create({
    name,
    description: description || "",
    category: existingCategory._id,
    image: image || "",
  });

  const populatedProduct = await newProduct.populate("category");

  res.status(201).json({
    message: "Product created successfully",
    product: populatedProduct,
  });
});

// Update product
export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, category, image } = req.body || {};
  const productId = req.params.id;

  // ✅ Validate product ID
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  // ✅ Find existing product
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // If name is provided and differs from current, ensure uniqueness
  if (
    name &&
    !product.name.match(
      new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i")
    )
  ) {
    const conflicting = await Product.findOne({
      name: exactNameRegex(name),
      _id: { $ne: productId },
    });
    if (conflicting) {
      return res
        .status(400)
        .json({ message: "Another product with this name already exists" });
    }
  }

  // ✅ Handle category (reuse or create)
  let categoryId = product.category;
  if (category) {
    let existingCategory = await Category.findOne({ name: category });
    if (!existingCategory) {
      existingCategory = await Category.create({ name: category });
    }
    categoryId = existingCategory._id;
  }

  // ✅ Validate image (optional)
  if (image && typeof image !== "string") {
    return res
      .status(400)
      .json({ message: "Image must be a text URL or base64 string" });
  }

  // ✅ Update fields
  product.name = name || product.name;
  product.description = description || product.description;
  product.category = categoryId;
  if (image) product.image = image;

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
