const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  role: { type: String, enum: ["staff", "accountant", "manager"], default: "staff" },
  employeeId: { type: String },
  department: { type: String },
  status: { type: String, enum: ["Pending", "Active", "Inactive"], default: "Pending" },
  isRegistered: { type: Boolean, default: false },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);
