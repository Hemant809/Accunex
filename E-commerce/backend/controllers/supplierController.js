const Supplier = require("../models/Supplier");
const Purchase = require("../models/Purchase");
const Payment = require("../models/Payment");

// ================= CREATE SUPPLIER =================
exports.createSupplier = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Supplier name is required" });
    }

    const supplier = await Supplier.create({
      name,
      phone,
      address,
      shop: req.user.shop,
    });

    return res.status(201).json(supplier);
  } catch (error) {
    console.error("Create Supplier Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================= GET SUPPLIERS =================
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ shop: req.user.shop });
    return res.json(suppliers);
  } catch (error) {
    console.error("Get Suppliers Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ================= GET SUPPLIER LEDGER =================
exports.getSupplierLedger = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const purchases = await Purchase.find({ supplier: id, shop: req.user.shop })
      .populate("items.product", "name")
      .sort({ purchaseDate: 1 });

    const payments = await Payment.find({ supplier: id, shop: req.user.shop })
      .sort({ date: 1 });

    const transactions = [];
    let balance = 0;

    purchases.forEach(p => {
      balance += p.totalAmount;
      transactions.push({
        date: p.purchaseDate,
        type: "Purchase",
        invoiceNumber: p.invoiceNumber,
        debit: p.totalAmount,
        credit: 0,
        balance,
        ref: p._id
      });
    });

    payments.forEach(p => {
      balance -= p.amount;
      transactions.push({
        date: p.date,
        type: "Payment",
        mode: p.mode,
        debit: 0,
        credit: p.amount,
        balance,
        ref: p._id
      });
    });

    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = 0;
    transactions.forEach(t => {
      runningBalance += t.debit - t.credit;
      t.balance = runningBalance;
    });

    return res.json({
      supplier,
      transactions,
      summary: {
        totalPurchase: supplier.totalPurchase,
        totalPaid: supplier.totalPaid,
        balance: supplier.balance
      }
    });
  } catch (error) {
    console.error("Get Supplier Ledger Error:", error);
    return res.status(500).json({ message: error.message });
  }
};
