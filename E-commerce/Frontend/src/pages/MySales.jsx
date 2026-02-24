import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { ShoppingBag, Calendar, DollarSign, Package, User } from "lucide-react";

export default function MySales() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySales();
  }, []);

  const fetchMySales = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://accunex.onrender.com/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const today = new Date().toISOString().split("T")[0];
      const mySales = res.data.filter(
        (s) =>
          s.createdBy?._id === user?._id &&
          new Date(s.saleDate).toISOString().split("T")[0] === today
      );
      setSales(mySales);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const uniqueCustomers = new Set(sales.map(s => s.customerName)).size;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 rounded-xl text-white shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag size={28} />
          My Sales - Today
        </h1>
        <p className="text-teal-100 mt-1">View today's sales transactions</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-md border">
          <p className="text-slate-600 text-sm mb-1">Total Sales</p>
          <p className="text-2xl font-bold text-slate-800">{sales.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border">
          <p className="text-slate-600 text-sm mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-green-600">₹{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border">
          <p className="text-slate-600 text-sm mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-teal-600">{uniqueCustomers}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading...</div>
        ) : sales.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500">No sales found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Invoice</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Mode</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Amount</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{sale.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{sale.customerName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{sale.items?.length || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        sale.mode === "cash" ? "bg-green-100 text-green-700" :
                        sale.mode === "online" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {sale.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                      ₹{sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-teal-600 text-right">
                      ₹{sale.totalProfit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
