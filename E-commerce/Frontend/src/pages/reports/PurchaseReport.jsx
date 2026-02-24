import { useFinance } from "../../context/FinanceContext";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function PurchaseReport() {
  const { purchases = [], fetchPurchases } = useFinance();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ---------------- FILTER ---------------- */

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (!fromDate && !toDate) return true;

      const pDate = new Date(p.purchaseDate || p.createdAt);

      if (fromDate && pDate < new Date(fromDate)) return false;
      if (toDate && pDate > new Date(toDate)) return false;

      return true;
    });
  }, [purchases, fromDate, toDate]);

  /* ---------------- SUMMARY ---------------- */

  const totalPurchase = filteredPurchases.reduce(
    (sum, p) => sum + Math.round(Number(p.totalAmount || 0)),
    0
  );

  const cashPurchase = filteredPurchases
    .filter(p => p.mode === "cash")
    .reduce((sum, p) => sum + Math.round(Number(p.totalAmount || 0)), 0);

  const onlinePurchase = filteredPurchases
    .filter(p => p.mode === "online")
    .reduce((sum, p) => sum + Math.round(Number(p.totalAmount || 0)), 0);

  const creditPurchase = filteredPurchases
    .filter(p => p.mode === "credit")
    .reduce((sum, p) => sum + Math.round(Number(p.totalAmount || 0)), 0);

  /* ---------------- EXPORT ---------------- */

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPurchases);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "PurchaseReport.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Purchase Report", 14, 15);

    doc.autoTable({
      startY: 25,
      head: [["Date", "Supplier", "Mode", "Amount"]],
      body: filteredPurchases.map((p) => [
        new Date(p.purchaseDate || p.createdAt).toLocaleDateString(),
        p.supplier?.name || "Supplier",
        p.mode,
        p.totalAmount,
      ]),
    });

    doc.save("PurchaseReport.pdf");
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold text-neutral-800">
        Purchase Report
      </h1>

      {/* FILTER BAR */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex gap-4 flex-wrap">

        <div>
          <label className="text-sm text-neutral-600">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="block border px-3 py-2 rounded mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-neutral-600">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="block border px-3 py-2 rounded mt-1"
          />
        </div>

        <div className="flex items-end gap-3">
          <button
            onClick={exportExcel}
            className="bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Export Excel
          </button>

          <button
            onClick={exportPDF}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Export PDF
          </button>

          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Print
          </button>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">

        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          Purchase Transactions
        </h2>

        {filteredPurchases.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            No purchase entries found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3">Date</th>
                <th className="text-left">Supplier</th>
                <th className="text-left">Mode</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPurchases.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="py-2">{new Date(p.purchaseDate || p.createdAt).toLocaleDateString('en-GB')}</td>
                  <td>{p.supplier?.name || "Supplier"}</td>
                  <td className="capitalize">{p.mode}</td>
                  <td className="text-right font-medium text-red-600">
                    ₹ {Math.round(Number(p.totalAmount)).toLocaleString()}
                  </td>
                  <td className="text-center">
                    <button onClick={() => navigate('/purchase', { state: { editEntry: p } })} className="text-blue-600 hover:underline text-xs px-2">Edit</button>
                    <button onClick={async () => {
                      if (window.confirm('Delete this purchase?')) {
                        try {
                          await axios.delete(`/purchases/${p._id}`);
                          await fetchPurchases();
                          toast.success('Purchase deleted');
                        } catch (error) {
                          toast.error(error.response?.data?.message || 'Delete failed');
                        }
                      }
                    }} className="text-red-600 hover:underline text-xs px-2">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="bg-neutral-50 font-semibold border-t-2">
              <tr>
                <td colSpan="3" className="py-3 text-right">Total Purchase:</td>
                <td className="text-right text-lg text-neutral-800">
                  ₹ {totalPurchase.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}

      </div>

    </div>
  );
}
