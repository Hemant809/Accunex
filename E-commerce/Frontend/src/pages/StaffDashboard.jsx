import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useMemo } from "react";
import { PlusCircle, Package, ShoppingCart, TrendingUp, AlertCircle, DollarSign, ShoppingBag, Award, Target, Zap, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function StaffDashboard() {
  const { products } = useInventory();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [salesRes, purchasesRes] = await Promise.all([
        axios.get("http://accunex.onrender.com/api/sales", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://accunex.onrender.com/api/purchases", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setSales(salesRes.data);
      setPurchases(purchasesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const todaySales = sales
    .filter((s) => new Date(s.saleDate).toISOString().split("T")[0] === today)
    .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

  const todayOrders = sales.filter(
    (s) => new Date(s.saleDate).toISOString().split("T")[0] === today
  ).length;

  const mySales = sales
    .filter(
      (s) =>
        new Date(s.saleDate).toISOString().split("T")[0] === today &&
        s.createdBy?._id === user?._id
    )
    .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => p.stock > 5).length;

  const dailyTarget = 10000;
  const targetProgress = (todaySales / dailyTarget) * 100;

  const topProducts = useMemo(() => {
    const map = {};
    sales.forEach((sale) => {
      sale.items?.forEach((item) => {
        const productName = item.product?.name || "Unknown";
        if (!map[productName]) map[productName] = 0;
        map[productName] += Number(item.quantity || 0);
      });
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [sales]);

  const recentTransactions = useMemo(() => {
    const allTransactions = [
      ...sales.map((s) => ({
        type: "sale",
        customer: s.customerName,
        amount: s.totalAmount,
        date: s.saleDate,
        invoice: s.invoiceNumber,
      })),
      ...purchases.map((p) => ({
        type: "purchase",
        supplier: p.supplier?.name,
        amount: p.totalAmount,
        date: p.purchaseDate,
        invoice: p.invoiceNumber,
      })),
    ];
    return allTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [sales, purchases]);

  return (
    <div className="space-y-6">

      {/* Animated Header */}
      <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 p-6 rounded-2xl shadow-xl text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
            <Award className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Welcome, {user?.name}! 👋</h2>
            <p className="text-teal-100 text-sm flex items-center gap-2 mt-1">
              <Clock size={14} />
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Target Progress */}
      <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Target className="text-teal-600" size={20} />
            <div>
              <h3 className="text-base font-bold text-slate-800">Daily Target</h3>
              <p className="text-xs text-slate-500">Keep pushing!</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${targetProgress >= 100 ? 'text-green-600' : 'text-amber-600'}`}>
              {targetProgress.toFixed(0)}%
            </p>
          </div>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${
              targetProgress >= 100 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-teal-500 to-teal-600'
            }`}
            style={{ width: `${Math.min(targetProgress, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-slate-600">Today: <strong>₹{todaySales.toLocaleString()}</strong></span>
          <span className="text-slate-600">Target: <strong>₹{dailyTarget.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          title="Today's Sales" 
          value={`₹${todaySales.toLocaleString()}`} 
          icon={DollarSign}
          gradient="from-green-500 to-green-600"
          subtitle={`${todayOrders} orders (All staff)`}
        />
        <Card 
          title="My Sales" 
          value={`₹${mySales.toLocaleString()}`} 
          icon={TrendingUp}
          gradient="from-amber-500 to-amber-600"
          subtitle="Your contribution"
        />
        <Card 
          title="Low Stock" 
          value={lowStockCount} 
          icon={AlertCircle}
          gradient="from-rose-500 to-rose-600"
          subtitle="Needs attention"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-xl shadow-md border border-slate-200">
        <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Zap className="text-teal-600" size={18} />
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton
            icon={PlusCircle}
            label="Add New Sale"
            onClick={() => navigate("/sales")}
            color="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
          />

          <ActionButton
            icon={ShoppingCart}
            label="View My Sales"
            onClick={() => navigate("/my-sales")}
            color="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          />

          <ActionButton
            icon={Package}
            label="Check Products"
            onClick={() => navigate("/products")}
            color="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <TrendingUp className="text-teal-600" size={18} />
            Top Selling Products
          </h3>

          {topProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500">No sales data available yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map(([product, qty], index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg hover:from-teal-50 hover:to-teal-100 transition">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                      index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                      'bg-gradient-to-r from-teal-600 to-teal-700'
                    } text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-md`}>
                      {index + 1}
                    </div>
                    <span className="text-slate-700 font-medium text-sm">{product}</span>
                  </div>
                  <span className="text-teal-600 font-bold text-base">
                    {qty} pcs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <ShoppingBag className="text-teal-600" size={18} />
            Recent Transactions
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Loading...</p>
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-500">No recent transactions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    txn.type === "sale"
                      ? "bg-gradient-to-r from-green-50 to-green-100"
                      : "bg-gradient-to-r from-blue-50 to-blue-100"
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-800 text-sm">
                      {txn.type === "sale" ? txn.customer : txn.supplier}
                    </p>
                    <p className="text-xs text-slate-500">
                      {txn.invoice} • {new Date(txn.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold text-sm ${
                        txn.type === "sale" ? "text-green-600" : "text-blue-600"
                      }`}
                    >
                      {txn.type === "sale" ? "+" : "-"}₹{Number(txn.amount).toLocaleString()}
                    </span>
                    <p className="text-xs text-slate-500 capitalize">{txn.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

/* ---------------- Card Component ---------------- */
function Card({ title, value, icon: Icon, gradient, subtitle }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-all transform hover:scale-105">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-slate-600 font-medium mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="text-white" size={22} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Action Button ---------------- */
function ActionButton({ icon: Icon, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`${color} text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md transform hover:scale-105 font-semibold text-sm`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}
