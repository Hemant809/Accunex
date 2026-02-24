const Receipt = require("../models/Receipt");
const Sale = require("../models/Sale");

exports.createReceipt = async (req, res) => {
  try {
    const { customer, customerName, amount, mode, receiptType, bills, narration, date } = req.body;

    const receipt = new Receipt({
      customer,
      customerName,
      party: customerName,
      amount,
      mode,
      receiptType,
      bills,
      narration,
      date,
      shop: req.user.shop,
    });

    await receipt.save();

    // Update sale status if receipt is against bills
    if (receiptType === "bill" && bills && bills.length > 0) {
      for (const bill of bills) {
        const sale = await Sale.findById(bill.saleId);
        if (sale) {
          // Initialize receivedAmount if undefined
          if (sale.receivedAmount === undefined) {
            sale.receivedAmount = 0;
          }
          
          sale.receivedAmount = sale.receivedAmount + bill.amount;
          await sale.save();
        }
      }
    }

    res.status(201).json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ shop: req.user.shop }).sort({ date: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    if (receipt.shop.toString() !== req.user.shop.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Revert sale status if receipt was against bills
    if (receipt.receiptType === "bill" && receipt.bills && receipt.bills.length > 0) {
      for (const bill of receipt.bills) {
        const sale = await Sale.findById(bill.saleId);
        if (sale) {
          if (sale.receivedAmount === undefined) {
            sale.receivedAmount = 0;
          }
          
          sale.receivedAmount = sale.receivedAmount - bill.amount;
          await sale.save();
        }
      }
    }

    await Receipt.findByIdAndDelete(req.params.id);
    res.json({ message: "Receipt deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    if (receipt.shop.toString() !== req.user.shop.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { amount, mode, narration, date } = req.body;
    const oldAmount = receipt.amount;

    // Update sale receivedAmount if amount changed
    if (amount && amount !== oldAmount && receipt.receiptType === "bill" && receipt.bills && receipt.bills.length > 0) {
      const amountDiff = Number(amount) - Number(oldAmount);
      for (const bill of receipt.bills) {
        const sale = await Sale.findById(bill.saleId);
        if (sale) {
          sale.receivedAmount = (sale.receivedAmount || 0) + amountDiff;
          await sale.save();
        }
      }
    }

    if (amount) receipt.amount = amount;
    if (mode) receipt.mode = mode;
    if (narration !== undefined) receipt.narration = narration;
    if (date) receipt.date = date;

    await receipt.save();
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
