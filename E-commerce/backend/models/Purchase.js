const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
    min: 1,
  },

  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },

  gst: {
    type: Number,
    default: 0,
  },

  gstAmount: {
    type: Number,
    default: 0,
  },

  total: {
    type: Number,
    required: true,
  },
});

const purchaseSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },

    mode: {
      type: String,
      enum: ["cash", "credit", "online"],
      default: "credit",
    },

    items: [purchaseItemSchema],

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

    paidAmount: {
      type: Number,
      default: 0,
    },

    narration: {
      type: String,
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

module.exports = mongoose.model("Purchase", purchaseSchema);
