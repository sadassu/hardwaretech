import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    items: [saleItemSchema],

    totalPrice: {
      type: Number,
      required: true,
    },

    amountPaid: {
      type: Number,
      required: true,
    },

    change: {
      type: Number,
      required: true,
    },

    saleDate: {
      type: Date,
      default: Date.now,
    },

    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },
  },
  { timestamps: true }
);

saleSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
  });
  this.totalPrice = this.items.reduce((acc, item) => acc + item.subtotal, 0);
  this.change = this.amountPaid - this.totalPrice;
  next();
});

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;
