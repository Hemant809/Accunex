const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

/* ---------- Load ENV ---------- */
dotenv.config();

/* ---------- Connect Database ---------- */
connectDB();

/* ---------- Initialize App ---------- */
const app = express();

/* ---------- Global Middlewares ---------- */
app.use(cors());
app.use(express.json());

/* ---------- Import Middlewares ---------- */
const { protect, authorize } = require("./middleware/authMiddleware");
const { checkPasswordResetRequired } = require("./middleware/resetMiddleware");

/* ---------- Import Routes ---------- */
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const saleRoutes = require("./routes/saleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const staffRoutes = require("./routes/staffRoutes");
const shopRoutes = require("./routes/shopRoutes");

/* ---------- Base Route ---------- */
app.get("/", (req, res) => {
  res.send("Smart Grocery Accounting System API running 🚀");
});

/* ---------- Auth Routes ---------- */
app.use("/api/auth", authRoutes);

/* ---------- Onboarding Routes (Unprotected) ---------- */
const User = require("./models/User");
app.put("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: false }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------- Protected User Routes ---------- */
app.use(
  "/api/users",
  protect,
  checkPasswordResetRequired,
  userRoutes
);

/* ---------- Main Business Routes ---------- */
app.use("/api/products", protect, productRoutes);
app.use("/api/purchases", protect, purchaseRoutes);
app.use("/api/suppliers", protect, supplierRoutes);
app.use("/api/sales", protect, saleRoutes);
app.use("/api/dashboard", protect, dashboardRoutes);
app.use("/api/expenses", protect, expenseRoutes);
app.use("/api/payments", protect, paymentRoutes);
app.use("/api/receipts", protect, receiptRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/shops", shopRoutes);

/* ---------- RBAC Test Routes ---------- */
app.get("/admin-only", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Welcome Admin 👑" });
});

app.get("/accountant-only", protect, authorize("accountant"), (req, res) => {
  res.json({ message: "Welcome Accountant 📊" });
});

app.get("/staff-only", protect, authorize("staff"), (req, res) => {
  res.json({ message: "Welcome Staff 👨‍💼" });
});

/* ---------- 404 Handler ---------- */
app.use((req, res) => {
  res.status(404).json({ message: "Route Not Found ❌" });
});

/* ---------- Global Error Handler ---------- */
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

/* ---------- Start Server ---------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
