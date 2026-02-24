const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    businessType: String,
    establishedYear: String,
    email: String,
    phone: String,

    gstNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    panNumber: String,
    registrationNumber: String,
    fssaiLicense: String,

    ownerName: String,
    ownerAadhaar: String,
    ownerPan: String,

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    banking: {
      bankName: String,
      accountNumber: String,
      ifsc: String,
      upiId: String,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Shop", shopSchema);
