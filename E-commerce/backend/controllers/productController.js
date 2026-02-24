const Product = require("../models/Product");

// ================= CREATE PRODUCT =================
exports.createProduct = async (req, res) => {
  try {
    const { name, category, purchasePrice, sellingPrice, stock, minStock, gst, unit } =
      req.body;

    if (!name || !sellingPrice) {
      return res.status(400).json({ message: "Name and selling price are required" });
    }

    if (!req.user.shop) {
      return res.status(400).json({ message: "User shop not found. Please complete onboarding." });
    }

    const existingProduct = await Product.findOne({
      name,
      shop: req.user.shop,
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "Product already exists in this shop" });
    }

    const product = await Product.create({
      name: name.trim(),
      category: category || "General",
      purchasePrice: Number(purchasePrice) || 0,
      sellingPrice: Number(sellingPrice),
      gst: Number(gst) || 0,
      unit: unit || "pcs",
      stock: Number(stock) || 0,
      minStock: Number(minStock) || 5,
      shop: req.user.shop,
      createdBy: req.user._id,
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================= GET ALL PRODUCTS =================
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ shop: req.user.shop })
      .sort({ createdAt: -1 });

    return res.json(products);
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PRODUCT =================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      shop: req.user.shop,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, category, purchasePrice, sellingPrice, stock, minStock, unit } =
      req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category;
    if (purchasePrice !== undefined)
      product.purchasePrice = Number(purchasePrice);
    if (sellingPrice !== undefined)
      product.sellingPrice = Number(sellingPrice);
    if (stock !== undefined) product.stock = Number(stock);
    if (minStock !== undefined) product.minStock = Number(minStock);
    if (unit !== undefined) product.unit = unit;

    const updatedProduct = await product.save();

    return res.json(updatedProduct);
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================= DELETE PRODUCT =================
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      shop: req.user.shop,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================= LOW STOCK PRODUCTS =================
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      shop: req.user.shop,
      $expr: { $lte: ["$stock", "$minStock"] },
    }).sort({ stock: 1 });

    res.json(products);
  } catch (error) {
    console.error("Low Stock Error:", error);
    res.status(500).json({ message: error.message });
  }
};
