const express = require("express");
const router = express.Router();

const {
  createSupplier,
  getSuppliers,
  getSupplierLedger,
} = require("../controllers/supplierController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", protect, authorize("admin", "accountant"), createSupplier);
router.get("/", protect, getSuppliers);
router.get("/:id/ledger", protect, getSupplierLedger);

module.exports = router;
