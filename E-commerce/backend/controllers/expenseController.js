const Expense = require("../models/Expense");

/* ================= CREATE EXPENSE ================= */
exports.createExpense = async (req, res) => {
  try {
    const { title, category, amount, note, date } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ message: "Title and amount required" });
    }

    const expense = await Expense.create({
      title,
      category,
      amount,
      note,
      date: date || new Date(),
      shop: req.user.shop,
      createdBy: req.user._id,
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error("Create Expense Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL EXPENSES ================= */
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ shop: req.user.shop })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE EXPENSE ================= */
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      shop: req.user.shop,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const { title, category, amount, note, date } = req.body;

    if (title !== undefined) expense.title = title;
    if (category !== undefined) expense.category = category;
    if (amount !== undefined) expense.amount = amount;
    if (note !== undefined) expense.note = note;
    if (date !== undefined) expense.date = date;

    const updatedExpense = await expense.save();

    res.json(updatedExpense);
  } catch (error) {
    console.error("Update Expense Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE EXPENSE ================= */
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      shop: req.user.shop,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.deleteOne();

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    res.status(500).json({ message: error.message });
  }
};
