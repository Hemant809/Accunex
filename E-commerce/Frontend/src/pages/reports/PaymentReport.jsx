import { useFinance } from "../../context/FinanceContext";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";

export default function PaymentReport() {
  const navigate = useNavigate();
  const { payments = [], refreshFinanceData } = useFinance();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editingPayment, setEditingPayment] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const handlePayableUpdate = () => {
      refreshFinanceData();
    };
    window.addEventListener('payableUpdated', handlePayableUpdate);
    return () => window.removeEventListener('payableUpdated', handlePayableUpdate);
  }, [refreshFinanceData]);

  /* ---------------- FILTER ---------------- */

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (!fromDate && !toDate) return true;

      const pDate = new Date(p.date);

      if (fromDate && pDate < new Date(fromDate)) return false;
      if (toDate && pDate > new Date(toDate)) return false;

      return true;
    });
  }, [payments, fromDate, toDate]);

  /* ---------------- SUMMARY ---------------- */

  const totalCash = filteredPayments
    .filter(p => p.mode === "cash")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalOnline = filteredPayments
    .filter(p => p.mode === "online")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalCredit = filteredPayments
    .filter(p => p.mode === "credit")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const grandTotal = totalCash + totalOnline + totalCredit;

  /* ---------------- EXPORT ---------------- */

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredPayments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "PaymentReport.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Payment Report", 14, 15);

    doc.autoTable({
      startY: 25,
      head: [["Date", "Party", "Mode", "Amount"]],
      body: filteredPayments.map(p => [
        new Date(p.date).toLocaleDateString(),
        p.party || "General",
        p.mode,
        p.amount,
      ]),
    });

    doc.save("PaymentReport.pdf");
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm("Delete this payment?")) return;
    try {
      await axios.delete(`/payments/${paymentId}`);
      await refreshFinanceData();
      toast.success("Payment deleted");
      window.dispatchEvent(new Event('paymentUpdated'));
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment._id);
    setEditForm({
      amount: payment.amount,
      mode: payment.mode,
      narration: payment.narration || "",
      date: new Date(payment.date).toISOString().split('T')[0]
    });
  };

  const handleUpdate = async (paymentId) => {
    try {
      await axios.put(`/payments/${paymentId}`, editForm);
      await refreshFinanceData();
      setEditingPayment(null);
      toast.success("Payment updated");
      window.dispatchEvent(new Event('paymentUpdated'));
    } catch (error) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold text-neutral-800">
        Payment Report
      </h1>

      {/* FILTER */}
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
          <button onClick={exportExcel} className="bg-emerald-600 text-white px-4 py-2 rounded">
            Export Excel
          </button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded">
            Export PDF
          </button>
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded">
            Print
          </button>
          <button onClick={() => navigate('/reports/payable')} className="bg-purple-600 text-white px-4 py-2 rounded">
            View Payables
          </button>
        </div>

      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard title="Cash Payment" value={totalCash} color="text-red-600" />
        <SummaryCard title="Online Payment" value={totalOnline} color="text-blue-600" />
        <SummaryCard title="Credit Payment" value={totalCredit} color="text-amber-600" />
        <SummaryCard title="Total Payment" value={grandTotal} color="text-neutral-800" />
      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-3">Date</th>
              <th className="text-left">Party</th>
              <th className="text-left">Mode</th>
              <th className="text-right">Amount</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p, i) => (
              <tr key={i} className="border-b">
                {editingPayment === p._id ? (
                  <>
                    <td className="py-2">
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                        className="border px-2 py-1 rounded text-xs w-full"
                      />
                    </td>
                    <td>{p.party || "General"}</td>
                    <td>
                      <select
                        value={editForm.mode}
                        onChange={(e) => setEditForm({...editForm, mode: e.target.value})}
                        className="border px-2 py-1 rounded text-xs w-full"
                      >
                        <option value="cash">Cash</option>
                        <option value="online">Online</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </td>
                    <td className="text-right">
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                        className="border px-2 py-1 rounded text-xs w-20 text-right"
                      />
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => handleUpdate(p._id)}
                        className="text-green-600 hover:text-green-800 text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPayment(null)}
                        className="text-gray-600 hover:text-gray-800 text-xs"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2">{new Date(p.date).toLocaleDateString()}</td>
                    <td>{p.party || "General"}</td>
                    <td className="capitalize">{p.mode}</td>
                    <td className="text-right text-red-600 font-medium">
                      ₹ {Number(p.amount).toFixed(2)}
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <p className="text-sm text-neutral-500">{title}</p>
      <p className={`text-xl font-semibold mt-1 ${color}`}>
        ₹ {value.toFixed(2)}
      </p>
    </div>
  );
}
