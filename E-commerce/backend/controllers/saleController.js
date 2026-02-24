const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Receipt = require("../models/Receipt");

// ================= CREATE SALE =================
exports.createSale = async (req, res) => {
  try {
    const { customerName, items, mode, invoiceNumber, saleDate } = req.body;

    if (!req.user.shop) {
      return res.status(400).json({ message: "User shop not found. Please complete onboarding." });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Sale items required" });
    }

    let subTotal = 0;
    let totalGST = 0;
    let totalAmount = 0;
    let totalProfit = 0;

    const processedItems = [];

    for (let item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();

      const itemSubTotal = item.quantity * item.sellingPrice;

      const gstPercent = item.gst || 0;
      const itemGSTAmount = (itemSubTotal * gstPercent) / 100;

      const itemTotal = itemSubTotal + itemGSTAmount;

      const itemProfit =
        (item.sellingPrice - product.purchasePrice) * item.quantity;

      subTotal += itemSubTotal;
      totalGST += itemGSTAmount;
      totalAmount += itemTotal;
      totalProfit += itemProfit;

      processedItems.push({
        product: item.product,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
        gst: gstPercent,
        gstAmount: itemGSTAmount,
        subTotal: itemSubTotal,
        total: itemTotal,
        profit: itemProfit,
      });
    }

    // Auto Invoice Number if not provided
    const finalInvoiceNumber = invoiceNumber || "INV-" + Date.now().toString().slice(-6);
    const finalMode = mode || "cash";

    const sale = await Sale.create({
      invoiceNumber: finalInvoiceNumber,
      customerName: customerName || "Walk-in Customer",
      mode: finalMode,
      saleDate: saleDate || new Date(),
      items: processedItems,
      subTotal,
      totalGST,
      totalAmount: Math.round(totalAmount),
      totalProfit,
      receivedAmount: finalMode === "cash" || finalMode === "online" ? Math.round(totalAmount) : 0,
      shop: req.user.shop,
      createdBy: req.user._id,
    });

    // Auto create receipt for cash/online sales
    if (finalMode === "cash" || finalMode === "online") {
      await Receipt.create({
        customerName: customerName || "Walk-in Customer",
        party: customerName || "Walk-in Customer",
        amount: Math.round(totalAmount),
        mode: finalMode,
        receiptType: "bill",
        bills: [{
          saleId: sale._id,
          invoiceNumber: finalInvoiceNumber,
          amount: Math.round(totalAmount)
        }],
        narration: `Auto receipt for ${finalMode} sale ${finalInvoiceNumber}`,
        date: saleDate || new Date(),
        shop: req.user.shop,
      });
    }

    res.status(201).json(sale);
  } catch (error) {
    console.error("Create Sale Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET SALES =================
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find({ shop: req.user.shop })
      .populate("items.product", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= SALES REPORT (DAILY / MONTHLY) =================
exports.getSalesReport = async (req, res) => {
  try {
    const { type } = req.query;
    const shopId = req.user.shop;

    let groupStage;

    if (type === "monthly") {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalSales: { $sum: "$totalAmount" },
        totalProfit: { $sum: "$totalProfit" },
        totalBills: { $sum: 1 },
      };
    } else {
      groupStage = {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalSales: { $sum: "$totalAmount" },
        totalProfit: { $sum: "$totalProfit" },
        totalBills: { $sum: 1 },
      };
    }

    const report = await Sale.aggregate([
      { $match: { shop: shopId } },
      { $group: groupStage },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json(report);
  } catch (error) {
    console.error("Sales Report Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE SALE =================
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    if (sale.shop.toString() !== req.user.shop.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Restore stock for each item
    for (let item of sale.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: "Sale deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
