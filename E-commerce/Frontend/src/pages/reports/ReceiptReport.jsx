import { useFinance } from "../../context/FinanceContext";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";

export default function ReceiptReport() {
  const navigate = useNavigate();
  const { receipts = [], refreshFinanceData } = useFinance();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const handleReceivableUpdate = () => {
      refreshFinanceData();
    };
    window.addEventListener('receivableUpdated', handleReceivableUpdate);
    return () => window.removeEventListener('receivableUpdated', handleReceivableUpdate);
  }, [refreshFinanceData]);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      if (!fromDate && !toDate) return true;

      const rDate = new Date(r.date);

      if (fromDate && rDate < new Date(fromDate)) return false;
      if (toDate && rDate > new Date(toDate)) return false;

      return true;
    });
  }, [receipts, fromDate, toDate]);

  const totalReceipt = filteredReceipts.reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0
  );

  const cashReceipt = filteredReceipts
    .filter(r => r.mode === "cash")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const onlineReceipt = filteredReceipts
    .filter(r => r.mode === "online")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredReceipts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Receipts");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "ReceiptReport.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Receipt Report", 14, 15);

    doc.autoTable({
      startY: 25,
      head: [["Date", "Party", "Mode", "Amount"]],
      body: filteredReceipts.map(r => [
        new Date(r.date).toLocaleDateString(),
        r.party || "General",
        r.mode,
        r.amount,
      ]),
    });

    doc.save("ReceiptReport.pdf");
  };

  const handleDelete = async (receiptId) => {
    if (!window.confirm("Delete this receipt?")) return;
    try {
      await axios.delete(`/receipts/${receiptId}`);
      await refreshFinanceData();
      toast.success("Receipt deleted");
      window.dispatchEvent(new Event('receiptUpdated'));
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (receipt) => {
    setEditingReceipt(receipt._id);
    setEditForm({
      amount: receipt.amount,
      mode: receipt.mode,
      narration: receipt.narration || "",
      date: new Date(receipt.date).toISOString().split('T')[0]
    });
  };

  const handleUpdate = async (receiptId) => {
    try {
      await axios.put(`/receipts/${receiptId}`, editForm);
      await refreshFinanceData();
      setEditingReceipt(null);
      toast.success("Receipt updated");
      window.dispatchEvent(new Event('receiptUpdated'));
    } catch (error) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold text-neutral-800">
        Receipt Report
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
          <button onClick={() => navigate('/reports/receivable')} className="bg-purple-600 text-white px-4 py-2 rounded">
            View Receivables
          </button>
        </div>

      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="Total Receipt" value={totalReceipt} color="text-neutral-800" />
        <SummaryCard title="Cash Receipt" value={cashReceipt} color="text-emerald-600" />
        <SummaryCard title="Online Receipt" value={onlineReceipt} color="text-blue-600" />
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
            {filteredReceipts.map((r, i) => (
              <tr key={i} className="border-b">
                {editingReceipt === r._id ? (
                  <>
                    <td className="py-2">
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                        className="border px-2 py-1 rounded text-xs w-full"
                      />
                    </td>
                    <td>{r.party || "General"}</td>
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
                        onClick={() => handleUpdate(r._id)}
                        className="text-green-600 hover:text-green-800 text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingReceipt(null)}
                        className="text-gray-600 hover:text-gray-800 text-xs"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2">{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.party || "General"}</td>
                    <td className="capitalize">{r.mode}</td>
                    <td className="text-right text-emerald-600 font-medium">
                      ₹ {Number(r.amount).toFixed(2)}
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => handleEdit(r)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
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
