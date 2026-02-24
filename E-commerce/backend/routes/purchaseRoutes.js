const express = require("express");
const router = express.Router();

const {
  createPurchase,
  getPurchases,
  deletePurchase,
} = require("../controllers/purchaseController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Create purchase (admin & accountant only)
router.post("/", protect, authorize("admin", "accountant"), createPurchase);

// Get all purchases
router.get("/", protect, getPurchases);

// Delete purchase
router.delete("/:id", protect, authorize("admin", "accountant"), deletePurchase);

module.exports = router;
