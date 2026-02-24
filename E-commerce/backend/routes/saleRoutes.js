const express = require("express");
const router = express.Router();

const {
  createSale,
  getSales,
  getSalesReport,
  deleteSale,
} = require("../controllers/saleController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ================= CREATE SALE =================
// Admin & Staff allowed
router.post("/", protect, authorize("admin", "staff"), createSale);

// ================= SALES REPORT =================
// /api/sales/report?type=daily
// /api/sales/report?type=monthly
router.get("/report", protect, authorize("admin", "accountant"), getSalesReport);

// ================= GET ALL SALES =================
router.get("/", protect, authorize("admin", "accountant", "staff"), getSales);

// ================= DELETE SALE =================
router.delete("/:id", protect, authorize("admin"), deleteSale);

module.exports = router;
