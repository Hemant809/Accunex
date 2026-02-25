import { useInventory } from "../context/InventoryContext";
import { useFinance } from "../context/FinanceContext";
import { useState, useEffect } from "react";
import axios from "../api/axios";
import KPIStrip from "../components/dashboard/KPIStrip";
import SalesChart from "../components/dashboard/SalesChart";
import StockHealth from "../components/dashboard/StockHealth";
import { PlusCircle, TrendingUp, TrendingDown, ShoppingBag, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get("/dashboard");
      console.log("Dashboard Data:", data);
      console.log("Low Stock Products:", data.lowStockProducts);
      setDashboardData(data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const kpiData = {
    todaySales: dashboardData?.todaySales || 0,
    monthlySales: dashboardData?.monthlySales || 0,
    totalSalesAmount: dashboardData?.totalSalesAmount || 0,
    totalPurchaseAmount: dashboardData?.totalPurchaseAmount || 0,
    totalExpenses: dashboardData?.totalExpenses || 0,
    netProfit: dashboardData?.netProfit || 0,
    totalReceivable: dashboardData?.totalReceivable || 0,
    totalPayable: dashboardData?.totalPayable || 0,
    cashBalance: dashboardData?.cashBalance || 0,
    onlineBalance: dashboardData?.onlineBalance || 0,
    stockValue: dashboardData?.stockValue || 0,
  };

  const netProfit = dashboardData?.netProfit || 0;
  const totalSales = dashboardData?.totalSalesAmount || 0;
  const profitGrowth = totalSales > 0 ? ((netProfit / totalSales) * 100) : 0;

  const netOutstanding = (dashboardData?.totalReceivable || 0) - (dashboardData?.totalPayable || 0);

  const dailyTarget = 20000;
  const targetProgress = ((dashboardData?.todaySales || 0) / dailyTarget) * 100;

  const trendData = dashboardData?.weeklySalesTrend || [
    { day: "Mon", sales: 0 },
    { day: "Tue", sales: 0 },
    { day: "Wed", sales: 0 },
    { day: "Thu", sales: 0 },
    { day: "Fri", sales: 0 },
    { day: "Sat", sales: 0 },
    { day: "Sun", sales: 0 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-8">
            <div>
              <p className="text-teal-100 text-xs sm:text-sm mb-1">Net Profit (This Month)</p>
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${
                  netProfit >= 0 ? "text-white" : "text-red-200"
                }`}>
                  ₹{Math.abs(netProfit).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </h2>
                <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm ${
                  profitGrowth >= 0 ? "bg-green-500/20 text-green-100" : "bg-red-500/20 text-red-100"
                }`}>
                  {profitGrowth >= 0 ? <TrendingUp size={14} className="sm:w-4 sm:h-4" /> : <TrendingDown size={14} className="sm:w-4 sm:h-4" />}
                  <span className="font-semibold">{Math.abs(profitGrowth)}%</span>
                </div>
              </div>
              <p className="text-teal-100 text-xs mt-1 sm:mt-2">
                {netProfit >= 0 ? "Great performance! 🎉" : "Focus on reducing expenses"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate("/sales")}
              className="flex-1 sm:flex-none bg-white text-teal-700 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition font-medium text-sm"
            >
              <PlusCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Sale</span>
              <span className="sm:hidden">Sale</span>
            </button>
            <button
              onClick={() => navigate("/purchase")}
              className="flex-1 sm:flex-none bg-white/10 backdrop-blur text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition font-medium border border-white/20 text-sm"
            >
              <PlusCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
              Purchase
            </button>
            <button
              onClick={() => navigate("/expense")}
              className="flex-1 sm:flex-none bg-white/10 backdrop-blur text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition font-medium border border-white/20 text-sm"
            >
              <PlusCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
              Expense
            </button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <KPIStrip data={kpiData} />

      {/* Main Grid */}
      <div className="space-y-4 sm:space-y-6">
        
        {/* Daily Target + Low Stock + Net Outstanding - Single Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Daily Target */}
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-slate-700 font-semibold text-base sm:text-lg">Daily Sales Target</h3>
                <p className="text-slate-500 text-xs sm:text-sm">Track your daily performance</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl sm:text-3xl font-bold ${
                  targetProgress >= 100 ? "text-green-600" : "text-amber-600"
                }`}>
                  {targetProgress.toFixed(0)}%
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  {targetProgress >= 100 ? "Target Achieved! 🎉" : "Keep Going!"}
                </p>
              </div>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  targetProgress >= 100 ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-amber-500 to-amber-600"
                }`}
                style={{ width: `${Math.min(targetProgress, 100)}%` }}
              />
            </div>

            <div className="flex justify-between mt-3">
              <p className="text-sm text-slate-600">
                Today: <span className="font-semibold text-slate-800">₹ {(dashboardData?.todaySales || 0).toLocaleString()}</span>
              </p>
              <p className="text-sm text-slate-600">
                Target: <span className="font-semibold text-slate-800">₹ {dailyTarget.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md border border-red-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-slate-700 font-semibold">Low Stock Alert</h3>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                {dashboardData?.alerts || 0}
              </span>
            </div>
            <div className="space-y-2 min-h-[120px]">
              {dashboardData?.lowStockProducts?.length > 0 ? (
                dashboardData.lowStockProducts.slice(0, 3).map((product, i) => (
                  <div 
                    key={i} 
                    onClick={() => navigate('/products')}
                    className="flex justify-between items-center p-3 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition"
                  >
                    <p className="font-medium text-slate-800 text-sm">{product.name}</p>
                    <span className="text-red-600 font-bold text-sm">{product.stock}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-green-600 font-medium">✓ All Good</p>
                  <p className="text-slate-400 text-xs mt-1">Stock levels are healthy</p>
                </div>
              )}
            </div>
            {dashboardData?.alerts > 0 && (
              <button onClick={() => navigate('/products')} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition">
                View Stock
              </button>
            )}
          </div>

          {/* Net Outstanding */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-xl text-white border-2 border-slate-700">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider mb-4">
              Net Outstanding Position
            </h3>
            
            <div className="mb-4">
              <p className={`text-2xl sm:text-3xl font-bold mb-1 ${
                netOutstanding >= 0 ? "text-green-400" : "text-red-400"
              }`}>
                ₹{Math.abs(netOutstanding).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-slate-300 text-xs">
                {netOutstanding >= 0 ? "Net Receivable" : "Net Payable"}
              </p>
            </div>

            <div className="space-y-3 mb-4 pb-8 border-b border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Total Receivable</span>
                <span className="text-green-400 font-semibold text-sm">
                  ₹{(dashboardData?.totalReceivable || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Total Payable</span>
                <span className="text-red-400 font-semibold text-sm">
                  ₹{(dashboardData?.totalPayable || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => navigate("/reports/receivable")} className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-xl text-xs font-semibold transition shadow-lg">
                View Receivables
              </button>
              <button onClick={() => navigate("/reports/payable")} className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-xl text-xs font-semibold transition shadow-lg">
                View Payables
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions + Inventory Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Recent Sales */}
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-700 font-semibold">Recent Sales</h3>
                <button onClick={() => navigate('/reports/sales')} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {dashboardData?.recentSales?.length > 0 ? (
                  dashboardData.recentSales.slice(0, 4).map((sale, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{sale.customerName || 'Customer'}</p>
                        <p className="text-xs text-slate-500">{sale.invoiceNumber}</p>
                      </div>
                      <span className="text-green-600 font-bold text-sm">₹ {sale.totalAmount?.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-3">
                      <ShoppingBag className="text-slate-400" size={28} />
                    </div>
                    <p className="text-slate-500 font-medium text-sm mb-1">No sales yet</p>
                    <p className="text-slate-400 text-xs">Start by adding your first sale</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Purchases */}
            <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-700 font-semibold">Recent Purchases</h3>
                <button onClick={() => navigate('/reports/purchase')} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {dashboardData?.recentPurchases?.length > 0 ? (
                  dashboardData.recentPurchases.slice(0, 4).map((purchase, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{purchase.supplier?.name || 'Supplier'}</p>
                        <p className="text-xs text-slate-500">{purchase.invoiceNumber}</p>
                      </div>
                      <span className="text-red-600 font-bold text-sm">₹ {purchase.totalAmount?.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-3">
                      <ShoppingCart className="text-slate-400" size={28} />
                    </div>
                    <p className="text-slate-500 font-medium text-sm mb-1">No purchases yet</p>
                    <p className="text-slate-400 text-xs">Start by adding your first purchase</p>
                  </div>
                )}
              </div>
            </div>

          {/* Business Health Score */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl text-white border-2 border-teal-500">
            <h3 className="text-teal-100 text-sm font-semibold mb-6">Business Health</h3>
            
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 sm:border-8 border-white/20 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl sm:text-5xl font-bold text-white">{dashboardData ? Math.min(Math.round((dashboardData.totalSalesAmount / (dashboardData.totalSalesAmount + dashboardData.totalPurchaseAmount + dashboardData.totalExpenses || 1)) * 100), 100) : 0}</p>
                    <p className="text-xs sm:text-sm text-teal-100">/ 100</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <span className="inline-block bg-green-500/20 text-green-100 px-4 py-2 rounded-full text-sm font-semibold">
                  {dashboardData && dashboardData.totalSalesAmount > 0 ? '✓ Healthy' : 'No Data'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Sales Chart - Full Width */}
      <SalesChart trendData={trendData} />

    </div>
  );
}
