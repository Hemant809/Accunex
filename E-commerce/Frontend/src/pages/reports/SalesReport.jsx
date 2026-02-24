import { useFinance } from "../../context/FinanceContext";
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";


export default function SalesReport() {
  const { sales = [] } = useFinance();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ---------------- FILTER ---------------- */

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (!fromDate && !toDate) return true;

      const saleDate = new Date(sale.saleDate || sale.createdAt);

      if (fromDate && saleDate < new Date(fromDate)) return false;
      if (toDate && saleDate > new Date(toDate)) return false;

      return true;
    });
  }, [sales, fromDate, toDate]);

  const totalSales = filteredSales.reduce(
    (sum, s) => sum + Number(s.totalAmount || 0),
    0
  );

  /* ---------------- EXCEL EXPORT ---------------- */

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSales);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(file, "SalesReport.xlsx");
  };

  /* ---------------- PDF EXPORT ---------------- */

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Sales Report", 14, 15);

    doc.autoTable({
      startY: 25,
      head: [["Date", "Party", "Mode", "Amount"]],
      body: filteredSales.map((sale) => [
        new Date(sale.saleDate || sale.createdAt).toLocaleDateString(),
        sale.customerName || "Customer",
        sale.mode,
        sale.totalAmount,
      ]),
    });

    doc.save("SalesReport.pdf");
  };



  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold text-neutral-800">
        Sales Report
      </h1>

      {/* DATE FILTER */}
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
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <p className="text-sm text-neutral-500">Total Sales</p>
        <p className="text-xl font-semibold text-blue-600 mt-1">
          ₹ {totalSales.toFixed(2)}
        </p>
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
            {filteredSales.map((sale, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{new Date(sale.saleDate || sale.createdAt).toLocaleDateString('en-GB')}</td>
                <td>{sale.customerName || "Customer"}</td>
                <td className="capitalize">{sale.mode}</td>
                <td className="text-right">
                  ₹ {Number(sale.totalAmount).toFixed(2)}
                </td>
                <td className="text-right">
                  <button
                    onClick={() => window.alert('View Details coming soon!')}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  );
}
