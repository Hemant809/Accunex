const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["Rent", "Electricity", "Salary", "Transport", "Misc"],
      default: "Misc",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    mode: {
      type: String,
      enum: ["cash", "online"],
      default: "cash",
    },

    note: {
      type: String,
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
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

module.exports = mongoose.model("Expense", expenseSchema);
