import { useFinance } from "../../context/FinanceContext";
import { useInventory } from "../../context/InventoryContext";
import { useState, useMemo, useEffect } from "react";
import axios from "../../api/axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ProfitLossReport() {
  const { sales = [] } = useFinance();
  const { products = [] } = useInventory();
  const [expenses, setExpenses] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data } = await axios.get("/expenses");
      setExpenses(data);
    } catch (error) {
      console.error("Error loading expenses:", error);
    }
  };

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

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (!fromDate && !toDate) return true;

      const expDate = new Date(expense.date);

      if (fromDate && expDate < new Date(fromDate)) return false;
      if (toDate && expDate > new Date(toDate)) return false;

      return true;
    });
  }, [expenses, fromDate, toDate]);

  /* ---------------- CALCULATIONS ---------------- */

  const totalSales = filteredSales.reduce(
    (sum, s) => sum + Math.round(Number(s.totalAmount || 0)),
    0
  );

  // Calculate total profit from sales (already calculated in backend)
  const totalProfit = filteredSales.reduce(
    (sum, s) => sum + Math.round(Number(s.totalProfit || 0)),
    0
  );

  // Calculate COGS from profit
  const totalCOGS = totalSales - totalProfit;

  const totalExpenses = filteredExpenses.reduce(
    (sum, e) => sum + Math.round(Number(e.amount || 0)),
    0
  );

  const grossProfit = totalProfit;
  const netProfit = grossProfit - totalExpenses;

  /* ---------------- EXPORT EXCEL ---------------- */

  const exportExcel = () => {
    const data = [
      { Type: "Income", Description: "Total Sales", Amount: totalSales },
      { Type: "Expense", Description: "Cost of Goods Sold", Amount: totalCOGS },
      { Type: "Result", Description: "Gross Profit", Amount: grossProfit },
      { Type: "Expense", Description: "Operating Expenses", Amount: totalExpenses },
      { Type: "Result", Description: netProfit >= 0 ? "Net Profit" : "Net Loss", Amount: Math.abs(netProfit) },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProfitLoss");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "ProfitLossReport.xlsx");
  };

  /* ---------------- EXPORT PDF ---------------- */

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Profit & Loss Report", 14, 15);

    const tableData = [
      ["Income", "Total Sales", totalSales.toLocaleString()],
      ["Expense", "Cost of Goods Sold", totalCOGS.toLocaleString()],
      ["Result", "Gross Profit", grossProfit.toLocaleString()],
      ["Expense", "Operating Expenses", totalExpenses.toLocaleString()],
      ["Result", netProfit >= 0 ? "Net Profit" : "Net Loss", Math.abs(netProfit).toLocaleString()],
    ];

    doc.autoTable({
      startY: 25,
      head: [["Type", "Description", "Amount"]],
      body: tableData,
    });

    doc.save("ProfitLossReport.pdf");
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold text-neutral-800">
        Profit & Loss Report
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

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-neutral-500 text-sm">Total Sales</p>
          <p className="text-emerald-600 text-xl font-semibold mt-1">
            ₹ {totalSales.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-neutral-500 text-sm">COGS</p>
          <p className="text-red-600 text-xl font-semibold mt-1">
            ₹ {totalCOGS.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-neutral-500 text-sm">Gross Profit</p>
          <p className="text-blue-600 text-xl font-semibold mt-1">
            ₹ {grossProfit.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-neutral-500 text-sm">
            {netProfit >= 0 ? "Net Profit" : "Net Loss"}
          </p>
          <p className={`text-xl font-semibold mt-1 ${
            netProfit >= 0 ? "text-emerald-600" : "text-red-600"
          }`}>
            ₹ {Math.abs(netProfit).toLocaleString()}
          </p>
        </div>

      </div>

      {/* DETAILED SUMMARY */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          Financial Summary
        </h2>

        <div className="space-y-3 text-sm">

          <div className="flex justify-between">
            <span>Total Sales Revenue</span>
            <span className="text-emerald-600">
              ₹ {totalSales.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Cost of Goods Sold (COGS)</span>
            <span className="text-red-600">
              ₹ {totalCOGS.toLocaleString()}
            </span>
          </div>

          <div className="border-t border-neutral-200 pt-2 flex justify-between font-medium">
            <span>Gross Profit</span>
            <span className="text-blue-600">
              ₹ {grossProfit.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Operating Expenses</span>
            <span className="text-red-600">
              ₹ {totalExpenses.toLocaleString()}
            </span>
          </div>

          <div className="border-t border-neutral-200 pt-3 flex justify-between font-semibold">
            <span>
              {netProfit >= 0 ? "Net Profit" : "Net Loss"}
            </span>
            <span className={
              netProfit >= 0 ? "text-emerald-600" : "text-red-600"
            }>
              ₹ {Math.abs(netProfit).toLocaleString()}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
