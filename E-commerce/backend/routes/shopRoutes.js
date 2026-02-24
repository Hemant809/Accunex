const express = require("express");
const { getShopDetails, updateShopDetails } = require("../controllers/shopController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getShopDetails);
router.put("/", protect, updateShopDetails);
router.put("/:id", updateShopDetails);
router.get("/:id", (req, res, next) => {
  if (req.user) return next();
  res.status(401).json({ message: "Unauthorized" });
}, getShopDetails);

module.exports = router;
