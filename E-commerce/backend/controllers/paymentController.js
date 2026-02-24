const Payment = require("../models/Payment");
const Supplier = require("../models/Supplier");
const Purchase = require("../models/Purchase");

exports.createPayment = async (req, res) => {
  try {
    const { supplier, amount, mode, paymentType, bills, narration, date } = req.body;

    let supplierId = supplier;
    let partyName = "";

    if (supplier) {
      const supplierDoc = await Supplier.findById(supplier);
      if (supplierDoc) {
        partyName = supplierDoc.name;
      }
    }

    const payment = new Payment({
      supplier: supplierId,
      party: partyName,
      amount,
      mode,
      paymentType,
      bills,
      narration,
      date,
      shop: req.user.shop,
    });

    await payment.save();

    // Update purchase status if payment is against bills
    if (paymentType === "bill" && bills && bills.length > 0) {
      for (const bill of bills) {
        const purchase = await Purchase.findById(bill.purchaseId);
        if (purchase) {
          purchase.paidAmount = (purchase.paidAmount || 0) + bill.amount;
          await purchase.save();
        }
      }
    }

    // Update supplier balance
    if (supplier) {
      const supplierDoc = await Supplier.findById(supplier);
      if (supplierDoc) {
        supplierDoc.totalPaid = (supplierDoc.totalPaid || 0) + amount;
        supplierDoc.balance = (supplierDoc.totalPurchase || 0) - supplierDoc.totalPaid;
        await supplierDoc.save();
      }
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ shop: req.user.shop })
      .populate("supplier")
      .sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.shop.toString() !== req.user.shop.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Revert purchase status if payment was against bills
    if (payment.paymentType === "bill" && payment.bills && payment.bills.length > 0) {
      for (const bill of payment.bills) {
        const purchase = await Purchase.findById(bill.purchaseId);
        if (purchase) {
          purchase.paidAmount = (purchase.paidAmount || 0) - bill.amount;
          await purchase.save();
        }
      }
    }

    // Update supplier balance
    if (payment.supplier) {
      const supplierDoc = await Supplier.findById(payment.supplier);
      if (supplierDoc) {
        supplierDoc.totalPaid = (supplierDoc.totalPaid || 0) - payment.amount;
        supplierDoc.balance = (supplierDoc.totalPurchase || 0) - supplierDoc.totalPaid;
        await supplierDoc.save();
      }
    }

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.shop.toString() !== req.user.shop.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { amount, mode, narration, date } = req.body;
    const oldAmount = payment.amount;

    // Update purchase paidAmount if amount changed
    if (amount && amount !== oldAmount && payment.paymentType === "bill" && payment.bills && payment.bills.length > 0) {
      const amountDiff = Number(amount) - Number(oldAmount);
      for (const bill of payment.bills) {
        const purchase = await Purchase.findById(bill.purchaseId);
        if (purchase) {
          purchase.paidAmount = (purchase.paidAmount || 0) + amountDiff;
          await purchase.save();
        }
      }
    }

    // Update supplier balance if amount changed
    if (amount && amount !== oldAmount && payment.supplier) {
      const amountDiff = Number(amount) - Number(oldAmount);
      const supplierDoc = await Supplier.findById(payment.supplier);
      if (supplierDoc) {
        supplierDoc.totalPaid = (supplierDoc.totalPaid || 0) + amountDiff;
        supplierDoc.balance = (supplierDoc.totalPurchase || 0) - supplierDoc.totalPaid;
        await supplierDoc.save();
      }
    }

    if (amount) payment.amount = amount;
    if (mode) payment.mode = mode;
    if (narration !== undefined) payment.narration = narration;
    if (date) payment.date = date;

    await payment.save();
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
