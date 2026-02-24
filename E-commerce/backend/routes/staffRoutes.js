const express = require("express");
const { getAllStaff, addStaff, updateStaff, deleteStaff, confirmRegistration, completeStaffRegistration, getStaffById } = require("../controllers/staffController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/complete-registration", completeStaffRegistration);
router.get("/:id", getStaffById);
router.get("/", protect, getAllStaff);
router.post("/", protect, addStaff);
router.put("/:id", protect, updateStaff);
router.put("/:id/confirm", protect, confirmRegistration);
router.delete("/:id", protect, deleteStaff);

module.exports = router;
