const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
    },
    customerName: String,
    party: String,
    amount: { type: Number, required: true },
    mode: { type: String, enum: ["cash", "online", "cheque"], default: "cash" },
    receiptType: { type: String, enum: ["bill", "advance", "other"], default: "bill" },
    bills: [
      {
        saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Sale" },
        invoiceNumber: String,
        amount: Number,
      },
    ],
    narration: String,
    date: { type: Date, default: Date.now },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", receiptSchema);
