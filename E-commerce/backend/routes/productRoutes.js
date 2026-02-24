const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
} = require("../controllers/productController");

const { protect, authorize } = require("../middleware/authMiddleware");

// ================= LOW STOCK PRODUCTS =================
router.get("/low-stock", protect, getLowStockProducts);

// ================= CREATE PRODUCT =================
router.post("/", protect, authorize("admin", "accountant"), createProduct);

// ================= GET ALL PRODUCTS =================
router.get("/", protect, getProducts);

// ================= UPDATE PRODUCT =================
router.put("/:id", protect, authorize("admin", "accountant"), updateProduct);

// ================= DELETE PRODUCT =================
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;
