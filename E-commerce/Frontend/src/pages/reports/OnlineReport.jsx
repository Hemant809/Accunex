import { useFinance } from "../../context/FinanceContext";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function OnlineReport() {
  const { sales = [], purchases = [], receipts = [], payments = [], refreshFinanceData } = useFinance();
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ---------------- FILTER ---------------- */

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (s.mode !== "online") return false;

      if (!fromDate && !toDate) return true;

      const sDate = new Date(s.saleDate || s.createdAt);

      if (fromDate && sDate < new Date(fromDate)) return false;
      if (toDate && sDate > new Date(toDate)) return false;

      return true;
    });
  }, [sales, fromDate, toDate]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (p.mode !== "online") return false;

      if (!fromDate && !toDate) return true;

      const pDate = new Date(p.purchaseDate || p.createdAt);

      if (fromDate && pDate < new Date(fromDate)) return false;
      if (toDate && pDate > new Date(toDate)) return false;

      return true;
    });
  }, [purchases, fromDate, toDate]);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      if (r.mode !== "online") return false;

      if (!fromDate && !toDate) return true;

      const rDate = new Date(r.date);

      if (fromDate && rDate < new Date(fromDate)) return false;
      if (toDate && rDate > new Date(toDate)) return false;

      return true;
    });
  }, [receipts, fromDate, toDate]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (p.mode !== "online") return false;

      if (!fromDate && !toDate) return true;

      const pDate = new Date(p.date);

      if (fromDate && pDate < new Date(fromDate)) return false;
      if (toDate && pDate > new Date(toDate)) return false;

      return true;
    });
  }, [payments, fromDate, toDate]);

  /* ---------------- SUMMARY ---------------- */

  const totalOnlineIn = filteredSales.reduce(
    (sum, s) => sum + Math.round(Number(s.totalAmount || 0)),
    0
  ) + filteredReceipts.reduce(
    (sum, r) => sum + Math.round(Number(r.amount || 0)),
    0
  );

  const totalOnlineOut = filteredPurchases.reduce(
    (sum, p) => sum + Math.round(Number(p.totalAmount || 0)),
    0
  ) + filteredPayments.reduce(
    (sum, p) => sum + Math.round(Number(p.amount || 0)),
    0
  );

  const netOnline = totalOnlineIn - totalOnlineOut;

  /* ---------------- EXPORT ---------------- */

  const exportExcel = () => {
    const data = [
      ...filteredSales.map((s) => ({
        Date: new Date(s.saleDate || s.createdAt).toLocaleDateString('en-GB'),
        Party: s.customerName || "Customer",
        Type: "Online Sale",
        Amount: Math.round(s.totalAmount),
      })),
      ...filteredReceipts.map((r) => ({
        Date: new Date(r.date).toLocaleDateString('en-GB'),
        Party: r.party || "Receipt",
        Type: "Online Receipt",
        Amount: Math.round(r.amount),
      })),
      ...filteredPurchases.map((p) => ({
        Date: new Date(p.purchaseDate || p.createdAt).toLocaleDateString('en-GB'),
        Party: p.supplier?.name || "Supplier",
        Type: "Online Purchase",
        Amount: Math.round(p.totalAmount),
      })),
      ...filteredPayments.map((p) => ({
        Date: new Date(p.date).toLocaleDateString('en-GB'),
        Party: p.party || "Payment",
        Type: "Online Payment",
        Amount: Math.round(p.amount),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "OnlineReport");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "OnlineReport.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Online Report", 14, 15);

    const tableData = [
      ...filteredSales.map((s) => [
        new Date(s.saleDate || s.createdAt).toLocaleDateString('en-GB'),
        s.customerName || "Customer",
        "Online Sale",
        Math.round(s.totalAmount).toLocaleString(),
      ]),
      ...filteredReceipts.map((r) => [
        new Date(r.date).toLocaleDateString('en-GB'),
        r.party || "Receipt",
        "Online Receipt",
        Math.round(r.amount).toLocaleString(),
      ]),
      ...filteredPurchases.map((p) => [
        new Date(p.purchaseDate || p.createdAt).toLocaleDateString('en-GB'),
        p.supplier?.name || "Supplier",
        "Online Purchase",
        Math.round(p.totalAmount).toLocaleString(),
      ]),
      ...filteredPayments.map((p) => [
        new Date(p.date).toLocaleDateString('en-GB'),
        p.party || "Payment",
        "Online Payment",
        Math.round(p.amount).toLocaleString(),
      ]),
    ];

    doc.autoTable({
      startY: 25,
      head: [["Date", "Party", "Type", "Amount"]],
      body: tableData,
    });

    doc.save("OnlineReport.pdf");
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold text-neutral-800">
        Online Balance Report
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
          <p className="text-sm text-neutral-500">Total Online In</p>
          <p className="text-emerald-600 text-xl font-semibold mt-1">
            ₹ {totalOnlineIn.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-neutral-500">Total Online Out</p>
          <p className="text-red-600 text-xl font-semibold mt-1">
            ₹ {totalOnlineOut.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-neutral-500">Net Online Balance</p>
          <p className={`text-xl font-semibold mt-1 ${
            netOnline >= 0 ? "text-teal-600" : "text-red-600"
          }`}>
            ₹ {netOnline.toLocaleString()}
          </p>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">

        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          Online Transactions
        </h2>

        {(filteredSales.length === 0 &&
          filteredPurchases.length === 0 &&
          filteredReceipts.length === 0 &&
          filteredPayments.length === 0) ? (
          <p className="text-neutral-500 text-sm">
            No online transactions found.
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
                  <td className="text-emerald-600">Online Sale</td>
                  <td className="text-right text-emerald-600 font-medium">
                    ₹ {Math.round(s.totalAmount).toLocaleString()}
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
                  <td className="text-emerald-600">Online Receipt</td>
                  <td className="text-right text-emerald-600 font-medium">
                    ₹ {Math.round(r.amount).toLocaleString()}
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
                  <td className="text-red-600">Online Purchase</td>
                  <td className="text-right text-red-600 font-medium">
                    ₹ {Math.round(p.totalAmount).toLocaleString()}
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
                  <td className="text-red-600">Online Payment</td>
                  <td className="text-right text-red-600 font-medium">
                    ₹ {Math.round(p.amount).toLocaleString()}
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
