import mongoose from "mongoose";
import ProductVariant from "./ProductVariant.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: { type: String, default: "", require: true },
  },
  { timestamps: true }
);

productSchema.virtual("variants", {
  ref: "ProductVariant",
  localField: "_id",
  foreignField: "product",
});

productSchema.set("toObject", { virtuals: true });
productSchema.set("toJSON", { virtuals: true });

// 🧹 Cascade delete variants (and their histories)
productSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const variants = await ProductVariant.find({ product: doc._id });
    for (const variant of variants) {
      await ProductVariant.findOneAndDelete({ _id: variant._id });
    }
  }
});

const Product = mongoose.model("Product", productSchema);
export default Product;
