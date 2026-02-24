import { useInventory } from "../../context/InventoryContext";
import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function StockReport() {
  const { products = [], refreshProducts } = useInventory();

  const [search, setSearch] = useState("");

  useEffect(() => {
    refreshProducts();
  }, []);

  /* ---------------- FILTER ---------------- */

  const filteredProducts = useMemo(() => {
    if (!search) return products;

    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  /* ---------------- CALCULATIONS ---------------- */

  const totalStockValue = filteredProducts.reduce(
    (sum, p) => {
      const priceWithGst = Math.round(Number(p.purchasePrice || 0) * (1 + Number(p.gst || 0) / 100));
      return sum + Number(p.stock || 0) * priceWithGst;
    },
    0
  );

  /* ---------------- EXPORT EXCEL ---------------- */

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map((p) => {
        const priceWithGst = Math.round(Number(p.purchasePrice || 0) * (1 + Number(p.gst || 0) / 100));
        const stockValue = Math.round(Number(p.stock || 0) * priceWithGst);
        return {
          Product: p.name,
          StockQty: p.stock + ' ' + (p.unit || 'pcs'),
          PurchaseRateIncGST: priceWithGst,
          StockValue: stockValue,
        };
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, "StockReport.xlsx");
  };

  /* ---------------- EXPORT PDF ---------------- */

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Stock Report", 14, 15);

    doc.autoTable({
      startY: 25,
      head: [["Product", "Stock Qty", "Purchase Rate (Inc. GST)", "Stock Value"]],
      body: filteredProducts.map((p) => {
        const priceWithGst = Math.round(Number(p.purchasePrice || 0) * (1 + Number(p.gst || 0) / 100));
        const stockValue = Math.round(Number(p.stock || 0) * priceWithGst);
        return [
          p.name,
          p.stock + ' ' + (p.unit || 'pcs'),
          priceWithGst,
          stockValue,
        ];
      }),
    });

    doc.save("StockReport.pdf");
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold text-neutral-800">
        Stock Report
      </h1>

      {/* FILTER BAR */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex gap-4 flex-wrap">

        <input
          type="text"
          placeholder="Search Product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-60"
        />

        <div className="flex gap-3">
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
        <p className="text-sm text-neutral-500">
          Total Inventory Value
        </p>
        <p className="text-xl font-semibold text-blue-600 mt-1">
          ₹ {Math.round(totalStockValue).toLocaleString()}
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">

        {filteredProducts.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            No products found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-neutral-600">
              <tr>
                <th className="text-left py-3">Product</th>
                <th className="text-center">Stock Qty</th>
                <th className="text-center">Purchase Rate (Inc. GST)</th>
                <th className="text-right">Stock Value</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((p) => {
                const priceWithGst = Math.round(Number(p.purchasePrice || 0) * (1 + Number(p.gst || 0) / 100));
                const stockValue = Math.round(Number(p.stock || 0) * priceWithGst);
                return (
                  <tr key={p._id} className="border-b border-neutral-200">
                    <td className="py-2">{p.name}</td>
                    <td className="text-center">{p.stock} {p.unit || 'pcs'}</td>
                    <td className="text-center">
                      ₹ {priceWithGst.toLocaleString()}
                    </td>
                    <td className="text-right font-medium text-neutral-800">
                      ₹ {stockValue.toLocaleString()}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => window.location.href = '/products'}
                        className="text-blue-600 hover:text-blue-800 text-xs mr-2"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
}
