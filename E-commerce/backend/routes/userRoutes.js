const express = require("express");
const { createUser, resetPassword, updateUser } = require("../controllers/userController");
const { getStaffUserProfile } = require("../controllers/staffController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { checkPasswordResetRequired } = require("../middleware/resetMiddleware");

const router = express.Router();

// Create user (Admin / Accountant)
router.post(
  "/",
  protect,
  authorize("admin", "accountant"),
  checkPasswordResetRequired,
  createUser,
);

// Get staff user profile
router.get("/staff/:staffId", protect, authorize("admin"), getStaffUserProfile);

// Reset password (no restriction here)
router.put("/reset-password", protect, resetPassword);

// Update user
router.put("/:id", updateUser);

module.exports = router;
