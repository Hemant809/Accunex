const express = require("express");
const router = express.Router();
const { createPayment, getAllPayments, deletePayment, updatePayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createPayment);
router.get("/", protect, getAllPayments);
router.put("/:id", protect, updatePayment);
router.delete("/:id", protect, deletePayment);

module.exports = router;
