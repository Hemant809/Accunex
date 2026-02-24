import { useFinance } from "../../context/FinanceContext";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function CashReport() {
  const { receipts = [], payments = [], sales = [], purchases = [], refreshFinanceData } = useFinance();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ---------------- FILTER ---------------- */

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      if (r.mode !== "cash") return false;

      if (!fromDate && !toDate) return true;

      const rDate = new Date(r.date);

      if (fromDate && rDate < new Date(fromDate)) return false;
      if (toDate && rDate > new Date(toDate)) return false;

      return true;
    });
  }, [receipts, fromDate, toDate]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (s.mode !== "cash") return false;

      if (!fromDate && !toDate) return true;

      const sDate = new Date(s.saleDate || s.createdAt);

      if (fromDate && sDate < new Date(fromDate)) return false;
      if (toDate && sDate > new Date(toDate)) return false;

      return true;
    });
  }, [sales, fromDate, toDate]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (p.mode !== "cash") return false;

      if (!fromDate && !toDate) return true;

      const pDate = new Date(p.date);

      if (fromDate && pDate < new Date(fromDate)) return false;
      if (toDate && pDate > new Date(toDate)) return false;

      return true;
    });
  }, [payments, fromDate, toDate]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (p.mode !== "cash") return false;

      if (!fromDate && !toDate) return true;

      const pDate = new Date(p.purchaseDate || p.createdAt);

      if (fromDate && pDate < new Date(fromDate)) return false;
      if (toDate && pDate > new Date(toDate)) return false;

      return true;
    });
  }, [purchases, fromDate, toDate]);

  /* ---------------- SUMMARY ---------------- */

  const totalCashIn = filteredReceipts.reduce(
    (sum, r) => sum + Math.round(Number(r.amount || 0)),
    0
  ) + filteredSales.reduce(
    (sum, s) => sum + Math.round(Number(s.totalAmount || 0)),
    0
  );

  const totalCashOut = filteredPayments.reduce(
    (sum, p) => sum + Math.round(Number(p.amount || 0)),
    0
  ) + filteredPurchases.reduce(
    (sum, p) => sum + Math.round(Number(p.totalAmount || 0)),
    0
  );

  const netCash = totalCashIn - totalCashOut;

  /* ---------------- EXPORT ---------------- */

  const exportExcel = () => {
    const data = [
      ...filteredReceipts.map((r) => ({
        Date: r.date,
        Party: r.party || "Receipt",
        Type: "Cash In",
        Amount: r.amount,
      })),
      ...filteredPayments.map((p) => ({
        Date: p.date,
        Party: p.party || "Payment",
        Type: "Cash Out",
        Amount: p.amount,
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CashReport");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "CashReport.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Cash Report", 14, 15);

    const tableData = [
      ...filteredReceipts.map((r) => [
        r.date,
        r.party || "Receipt",
        "Cash In",
        r.amount,
      ]),
      ...filteredPayments.map((p) => [
        p.date,
        p.party || "Payment",
        "Cash Out",
        p.amount,
      ]),
    ];

    doc.autoTable({
      startY: 25,
      head: [["Date", "Party", "Type", "Amount"]],
      body: tableData,
    });

    doc.save("CashReport.pdf");
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold text-neutral-800">
        Cash Balance Report
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

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-neutral-500">Total Cash In</p>
          <p className="text-emerald-600 text-xl font-semibold mt-1">
            ₹ {totalCashIn.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-neutral-500">Total Cash Out</p>
          <p className="text-red-600 text-xl font-semibold mt-1">
            ₹ {totalCashOut.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-neutral-500">Net Cash Balance</p>
          <p className={`text-xl font-semibold mt-1 ${
            netCash >= 0 ? "text-teal-600" : "text-red-600"
          }`}>
            ₹ {netCash.toLocaleString()}
          </p>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">

        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          Cash Transactions
        </h2>

        {(filteredReceipts.length === 0 &&
          filteredPayments.length === 0 &&
          filteredSales.length === 0 &&
          filteredPurchases.length === 0) ? (
          <p className="text-neutral-500 text-sm">
            No cash transactions found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3">Date</th>
                <th className="text-left">Party</th>
                <th className="text-left">Type</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((s) => (
                <tr key={s._id} className="border-b">
                  <td className="py-2">{new Date(s.saleDate || s.createdAt).toLocaleDateString('en-GB')}</td>
                  <td>{s.customerName || "Customer"}</td>
                  <td className="text-emerald-600">Cash Sale</td>
                  <td className="text-right text-emerald-600 font-medium">
                    ₹ {Math.round(Number(s.totalAmount)).toLocaleString()}
                  </td>
                  <td className="text-center">
                    <button onClick={() => navigate('/sales', { state: { editEntry: s } })} className="text-blue-600 hover:underline text-xs px-2">Edit</button>
                    <button onClick={async () => {
                      if (window.confirm('Delete this sale?')) {
                        try {
                          await axios.delete(`/sales/${s._id}`);
                          await refreshFinanceData();
                          toast.success('Sale deleted');
                        } catch (error) {
                          toast.error(error.response?.data?.message || 'Delete failed');
                        }
                      }
                    }} className="text-red-600 hover:underline text-xs px-2">Delete</button>
                  </td>
                </tr>
              ))}

              {filteredReceipts.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="py-2">{new Date(r.date).toLocaleDateString('en-GB')}</td>
                  <td>{r.party || "Receipt"}</td>
                  <td className="text-emerald-600">Cash Receipt</td>
                  <td className="text-right text-emerald-600 font-medium">
                    ₹ {Math.round(Number(r.amount)).toLocaleString()}
                  </td>
                  <td className="text-center">
                    <button onClick={() => navigate('/receipt', { state: { editEntry: r } })} className="text-blue-600 hover:underline text-xs px-2">Edit</button>
                    <button onClick={async () => {
                      if (window.confirm('Delete this receipt?')) {
                        try {
                          await axios.delete(`/receipts/${r._id}`);
                          await refreshFinanceData();
                          toast.success('Receipt deleted');
                        } catch (error) {
                          toast.error(error.response?.data?.message || 'Delete failed');
                        }
                      }
                    }} className="text-red-600 hover:underline text-xs px-2">Delete</button>
                  </td>
                </tr>
              ))}

              {filteredPurchases.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="py-2">{new Date(p.purchaseDate || p.createdAt).toLocaleDateString('en-GB')}</td>
                  <td>{p.supplier?.name || "Supplier"}</td>
                  <td className="text-red-600">Cash Purchase</td>
                  <td className="text-right text-red-600 font-medium">
                    ₹ {Math.round(Number(p.totalAmount)).toLocaleString()}
                  </td>
                  <td className="text-center">
                    <button onClick={() => navigate('/purchase', { state: { editEntry: p } })} className="text-blue-600 hover:underline text-xs px-2">Edit</button>
                    <button onClick={async () => {
                      if (window.confirm('Delete this purchase?')) {
                        try {
                          await axios.delete(`/purchases/${p._id}`);
                          await refreshFinanceData();
                          toast.success('Purchase deleted');
                        } catch (error) {
                          toast.error(error.response?.data?.message || 'Delete failed');
                        }
                      }
                    }} className="text-red-600 hover:underline text-xs px-2">Delete</button>
                  </td>
                </tr>
              ))}

              {filteredPayments.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="py-2">{new Date(p.date).toLocaleDateString('en-GB')}</td>
                  <td>{p.party || "Payment"}</td>
                  <td className="text-red-600">Cash Payment</td>
                  <td className="text-right text-red-600 font-medium">
                    ₹ {Math.round(Number(p.amount)).toLocaleString()}
                  </td>
                  <td className="text-center">
                    <button onClick={() => navigate('/payment', { state: { editEntry: p } })} className="text-blue-600 hover:underline text-xs px-2">Edit</button>
                    <button onClick={async () => {
                      if (window.confirm('Delete this payment?')) {
                        try {
                          await axios.delete(`/payments/${p._id}`);
                          await refreshFinanceData();
                          toast.success('Payment deleted');
                        } catch (error) {
                          toast.error(error.response?.data?.message || 'Delete failed');
                        }
                      }
                    }} className="text-red-600 hover:underline text-xs px-2">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
}
