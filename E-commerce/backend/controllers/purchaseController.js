const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const Payment = require("../models/Payment");

/* ================= CREATE PURCHASE ================= */

exports.createPurchase = async (req, res) => {
  try {
    const {
      supplier,
      items,
      mode = "credit",
      invoiceNumber,
      purchaseDate,
      narration,
    } = req.body;

    if (!supplier || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Supplier and items are required" });
    }

    // Check supplier exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    let subTotal = 0;
    let totalGST = 0;

    const processedItems = [];

    for (let item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.product}` });
      }

      const quantity = Number(item.quantity);
      const price = Number(item.purchasePrice);
      const gst = Number(item.gst || 0);

      const itemSubTotal = quantity * price;
      const gstAmount = (itemSubTotal * gst) / 100;
      const total = itemSubTotal + gstAmount;

      // Update Stock
      product.stock += quantity;

      // Update latest purchase price
      product.purchasePrice = price;

      await product.save();

      subTotal += itemSubTotal;
      totalGST += gstAmount;

      processedItems.push({
        product: product._id,
        quantity,
        purchasePrice: price,
        gst,
        gstAmount,
        total,
      });
    }

    const totalAmount = Math.round(subTotal + totalGST);

    const purchase = await Purchase.create({
      supplier,
      invoiceNumber,
      purchaseDate: purchaseDate || new Date(),
      mode,
      items: processedItems,
      subTotal,
      totalGST,
      totalAmount,
      paidAmount: mode === "cash" || mode === "online" ? totalAmount : 0,
      narration,
      shop: req.user.shop,
      createdBy: req.user._id,
    });

    // Update supplier balance
    supplierExists.totalPurchase = (supplierExists.totalPurchase || 0) + totalAmount;
    if (mode === "cash" || mode === "online") {
      supplierExists.totalPaid = (supplierExists.totalPaid || 0) + totalAmount;
    }
    supplierExists.balance = supplierExists.totalPurchase - supplierExists.totalPaid;
    await supplierExists.save();

    // Auto create payment for cash/online purchases
    if (mode === "cash" || mode === "online") {
      await Payment.create({
        supplier: supplier,
        party: supplierExists.name,
        amount: totalAmount,
        mode: mode,
        paymentType: "bill",
        bills: [{
          purchaseId: purchase._id,
          invoiceNumber: invoiceNumber,
          amount: totalAmount
        }],
        narration: `Auto payment for ${mode} purchase ${invoiceNumber}`,
        date: purchaseDate || new Date(),
        shop: req.user.shop,
      });
    }

    res.status(201).json(purchase);
  } catch (error) {
    console.error("Create Purchase Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL PURCHASES ================= */

exports.getPurchases = async (req, res) => {
  try {
    const { supplier } = req.query;
    const filter = { shop: req.user.shop };
    
    if (supplier) {
      filter.supplier = supplier;
    }

    const purchases = await Purchase.find(filter)
      .populate("supplier", "name phone")
      .populate("items.product", "name purchasePrice")
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (error) {
    console.error("Get Purchases Error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE PURCHASE ================= */

exports.deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    if (purchase.shop.toString() !== req.user.shop.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Reduce stock for each item
    for (let item of purchase.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Update supplier balance
    const supplier = await Supplier.findById(purchase.supplier);
    if (supplier) {
      supplier.totalPurchase = (supplier.totalPurchase || 0) - purchase.totalAmount;
      supplier.totalPaid = (supplier.totalPaid || 0) - purchase.paidAmount;
      supplier.balance = supplier.totalPurchase - supplier.totalPaid;
      await supplier.save();
    }

    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ message: "Purchase deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
