const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "General",
    },

    purchasePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    gst: {
      type: Number,
      default: 0,
    },

    unit: {
      type: String,
      default: "pcs",
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    minStock: {
      type: Number,
      default: 5,
    },

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

/* 🔥 Prevent duplicate product names inside same shop */
productSchema.index({ name: 1, shop: 1 }, { unique: true });

/* 🔥 Virtual field for Low Stock */
productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.minStock;
});

module.exports = mongoose.model("Product", productSchema);
