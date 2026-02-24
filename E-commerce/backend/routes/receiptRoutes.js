const express = require("express");
const router = express.Router();
const { createReceipt, getAllReceipts, deleteReceipt, updateReceipt } = require("../controllers/receiptController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createReceipt);
router.get("/", protect, getAllReceipts);
router.put("/:id", protect, updateReceipt);
router.delete("/:id", protect, deleteReceipt);

module.exports = router;
