const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    party: String,
    amount: { type: Number, required: true },
    mode: { type: String, enum: ["cash", "online", "cheque"], default: "cash" },
    paymentType: { type: String, enum: ["bill", "advance", "expense", "other"], default: "bill" },
    bills: [
      {
        purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase" },
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

module.exports = mongoose.model("Payment", paymentSchema);
