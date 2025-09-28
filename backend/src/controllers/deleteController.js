import Product from "../models/Product.js";
import ProductVariant from "../models/ProductVariant.js";
import Reservation from "../models/Reservation.js";
import ReservationDetail from "../models/ReservationDetail.js";
import Sale from "../models/Sale.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const deleteAllProducts = asyncHandler(async (req, res) => {
  await ProductVariant.deleteMany({});
  await Product.deleteMany({});

  return res.status(200).json({
    message: "All products and their variants have been deleted successfully",
  });
});

export const deleteAllResrvations = asyncHandler(async (req, res) => {
  await ReservationDetail.deleteMany({});
  await Reservation.deleteMany({});

  return res.status(200).json({
    message: "All reservation and their details have been deleted successfully",
  });
});

export const deleteAllSales = asyncHandler(async (req, res) => {
  await Sale.deleteMany({});

  return res.status(200).json({
    message: "All sales have been deleted successfully",
  });
});
