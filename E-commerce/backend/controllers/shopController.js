const Shop = require("../models/Shop");

exports.getShopDetails = async (req, res) => {
  try {
    const shop = await Shop.findById(req.user.shop);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateShopDetails = async (req, res) => {
  try {
    const shopId = req.params.id || req.user?.shop;
    const shop = await Shop.findByIdAndUpdate(
      shopId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json(shop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
