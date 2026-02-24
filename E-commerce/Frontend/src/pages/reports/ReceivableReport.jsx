import { useFinance } from "../../context/FinanceContext";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ReceivableReport() {
  const navigate = useNavigate();
  const { sales, fetchSales } = useFinance();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const handleReceiptUpdate = () => {
      fetchSales();
    };
    window.addEventListener('receiptUpdated', handleReceiptUpdate);
    return () => window.removeEventListener('receiptUpdated', handleReceiptUpdate);
  }, [fetchSales]);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      if (s.mode !== "credit") return false;
      const receivedAmount = s.receivedAmount !== undefined ? s.receivedAmount : 0;
      const pending = Number(s.totalAmount || 0) - Number(receivedAmount);
      if (Math.round(pending) <= 0) return false;
      if (!fromDate && !toDate) return true;

      const sDate = new Date(s.saleDate || s.createdAt);
      if (fromDate && sDate < new Date(fromDate)) return false;
      if (toDate && sDate > new Date(toDate)) return false;

      return true;
    });
  }, [sales, fromDate, toDate]);

  const totalReceivable = filteredSales.reduce(
    (sum, s) => {
      const receivedAmount = s.receivedAmount !== undefined ? s.receivedAmount : 0;
      return sum + Math.round(Number(s.totalAmount || 0) - Number(receivedAmount));
    },
    0
  );

  const handleReceipt = (sale) => {
    navigate('/receipt', {
      state: {
        prefilledData: {
          customerId: sale._id,
          customerName: sale.customerName,
          amount: sale.totalAmount,
          narration: `Receipt for ${sale.invoiceNumber || 'sale'}`,
          invoiceNumber: sale.invoiceNumber,
        }
      }
    });
    window.dispatchEvent(new Event('receivableUpdated'));
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold text-neutral-800">
        Receivable Report
      </h1>

      {/* Date Filter */}
      <div className="bg-white p-6 rounded-xl border shadow-sm flex gap-4">
        <div>
          <label className="text-sm text-neutral-600">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="block border px-3 py-2 rounded mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-neutral-600">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="block border px-3 py-2 rounded mt-1"
          />
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <p className="text-neutral-500 text-sm">
          Total Pending Receivable
        </p>
        <p className="text-green-600 text-2xl font-semibold mt-1">
          ₹ {totalReceivable.toLocaleString()}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">

        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          Credit Sales Details
        </h2>

        {filteredSales.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            No receivable entries found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-neutral-600">
              <tr>
                <th className="text-left py-3">Date</th>
                <th className="text-left">Customer</th>
                <th className="text-left">Type</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale, index) => {
                const receivedAmount = sale.receivedAmount !== undefined ? sale.receivedAmount : 0;
                const pending = Math.round(Number(sale.totalAmount || 0) - Number(receivedAmount));
                return (
                  <tr key={index} className="border-b border-neutral-200">
                    <td className="py-2">{new Date(sale.saleDate || sale.createdAt).toLocaleDateString('en-GB')}</td>
                    <td>{sale.customerName || "Customer"}</td>
                    <td>
                      <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                        Credit Sale
                      </span>
                    </td>
                    <td className="text-right font-medium text-green-600">
                      ₹ {pending.toLocaleString()}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleReceipt(sale)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                      >
                        Receive
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
