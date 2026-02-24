const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  gst: {
    type: Number,
    default: 0,
  },
  gstAmount: {
    type: Number,
    default: 0,
  },
  subTotal: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  profit: {
    type: Number,
    required: true,
  },
});

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      default: "Walk-in Customer",
    },

    saleDate: {
      type: Date,
      default: Date.now,
    },

    mode: {
      type: String,
      enum: ["cash", "online", "credit"],
      default: "cash",
    },

    items: [saleItemSchema],

    subTotal: {
      type: Number,
      required: true,
    },

    totalGST: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    totalProfit: {
      type: Number,
      required: true,
    },

    receivedAmount: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model("Sale", saleSchema);
