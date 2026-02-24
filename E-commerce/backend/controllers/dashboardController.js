const Product = require("../models/Product");
const Purchase = require("../models/Purchase");
const Sale = require("../models/Sale");
const Expense = require("../models/Expense");
const Payment = require("../models/Payment");
const Receipt = require("../models/Receipt");

exports.getDashboardSummary = async (req, res) => {
  try {
    const shopId = req.user.shop;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* ================= SALES ================= */

    const sales = await Sale.find({ shop: shopId });

    const todaySales = sales
      .filter((s) => new Date(s.createdAt) >= today)
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlySales = sales
      .filter((s) => {
        const saleDate = new Date(s.saleDate || s.createdAt);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      })
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const totalSalesAmount = sales.reduce(
      (sum, s) => sum + Number(s.totalAmount || 0),
      0
    );

    const totalProfit = sales.reduce(
      (sum, s) => sum + Number(s.totalProfit || 0),
      0
    );

    /* ================= PURCHASE ================= */

    const purchases = await Purchase.find({ shop: shopId });

    const totalPurchaseAmount = purchases.reduce(
      (sum, p) => sum + Number(p.totalAmount || 0),
      0
    );

    /* ================= EXPENSE ================= */

    const expenses = await Expense.find({ shop: shopId });

    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    /* ================= PAYMENTS & RECEIPTS ================= */

    const payments = await Payment.find({ shop: shopId });
    const receipts = await Receipt.find({ shop: shopId });

    const totalPayments = payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const totalReceipts = receipts.reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0
    );

    /* ================= RECEIVABLE & PAYABLE ================= */

    const totalReceivable = sales
      .filter((s) => s.mode === "credit")
      .reduce((sum, s) => {
        const receivedAmount = s.receivedAmount || 0;
        return sum + Math.round(Number(s.totalAmount || 0) - Number(receivedAmount));
      }, 0);

    const totalPayable = purchases
      .filter((p) => p.mode === "credit")
      .reduce((sum, p) => {
        const paidAmount = p.paidAmount || 0;
        return sum + Math.round(Number(p.totalAmount || 0) - Number(paidAmount));
      }, 0);

    /* ================= CASH & ONLINE BALANCE ================= */

    const cashSales = sales.filter(s => s.mode === "cash").reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    const cashReceipts = receipts.filter(r => r.mode === "cash").reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const cashPurchases = purchases.filter(p => p.mode === "cash").reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
    const cashPayments = payments.filter(p => p.mode === "cash").reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const cashBalance = cashSales + cashReceipts - cashPurchases - cashPayments;

    const onlineSales = sales.filter(s => s.mode === "online").reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    const onlineReceipts = receipts.filter(r => r.mode === "online").reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const onlinePurchases = purchases.filter(p => p.mode === "online").reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
    const onlinePayments = payments.filter(p => p.mode === "online").reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const onlineBalance = onlineSales + onlineReceipts - onlinePurchases - onlinePayments;

    /* ================= BALANCE ================= */

    const netProfit = totalProfit - totalExpenses;

    /* ================= LOW STOCK ================= */

    const products = await Product.find({ shop: shopId });

    const lowStockProducts = products
      .filter((p) => p.stock < 3)
      .slice(0, 3)
      .map((p) => ({
        name: p.name,
        stock: p.stock,
        minStock: p.minStock
      }));

    const alerts = products.filter((p) => p.stock < 3).length;

    /* ================= STOCK VALUE ================= */

    const stockValue = products.reduce(
      (sum, p) => {
        const priceWithGst = Math.round(Number(p.purchasePrice || 0) * (1 + Number(p.gst || 0) / 100));
        return sum + (Number(p.stock || 0) * priceWithGst);
      },
      0
    );

    /* ================= RECENT TRANSACTIONS ================= */

    const recentSales = await Sale.find({ shop: shopId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('customerName invoiceNumber totalAmount createdAt');

    const recentPurchases = await Purchase.find({ shop: shopId })
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('supplier invoiceNumber totalAmount createdAt');

    /* ================= WEEKLY SALES TREND ================= */

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }

    const weeklySalesTrend = last7Days.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const daySales = sales.filter(s => {
        const saleDate = new Date(s.saleDate || s.createdAt);
        return saleDate >= date && saleDate < nextDay;
      }).reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return {
        day: dayNames[date.getDay()],
        sales: Math.round(daySales)
      };
    });

    /* ================= RESPONSE ================= */

    res.json({
      todaySales,
      monthlySales,
      totalSalesAmount,
      totalPurchaseAmount,
      totalProfit,
      totalExpenses,
      totalPayments,
      totalReceipts,
      totalReceivable,
      totalPayable,
      cashBalance,
      onlineBalance,
      stockValue,
      netProfit,
      alerts,
      lowStockProducts,
      recentSales,
      recentPurchases,
      weeklySalesTrend,
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: error.message });
  }
};
