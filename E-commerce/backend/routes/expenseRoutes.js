const express = require("express");
const router = express.Router();

const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

const { protect, authorize } = require("../middleware/authMiddleware");

/* ================= CREATE EXPENSE ================= */
router.post(
  "/",
  protect,
  authorize("admin", "accountant"),
  createExpense
);

/* ================= GET ALL EXPENSES ================= */
router.get("/", protect, getExpenses);

/* ================= UPDATE EXPENSE ================= */
router.put(
  "/:id",
  protect,
  authorize("admin", "accountant"),
  updateExpense
);

/* ================= DELETE EXPENSE ================= */
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteExpense
);

module.exports = router;
