import { useFinance } from "../../context/FinanceContext";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PayableReport() {
  const navigate = useNavigate();
  const { purchases, refreshFinanceData } = useFinance();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const handlePaymentUpdate = () => {
      refreshFinanceData();
    };
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    return () => window.removeEventListener('paymentUpdated', handlePaymentUpdate);
  }, [refreshFinanceData]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      if (p.mode !== "credit") return false;
      const paidAmount = p.paidAmount !== undefined ? p.paidAmount : 0;
      const pending = Number(p.totalAmount || 0) - Number(paidAmount);
      if (Math.round(pending) <= 0) return false;
      if (!fromDate && !toDate) return true;

      const pDate = new Date(p.purchaseDate || p.createdAt);
      if (fromDate && pDate < new Date(fromDate)) return false;
      if (toDate && pDate > new Date(toDate)) return false;

      return true;
    });
  }, [purchases, fromDate, toDate]);

  const totalPayable = filteredPurchases.reduce(
    (sum, p) => {
      const paidAmount = p.paidAmount !== undefined ? p.paidAmount : 0;
      return sum + Math.round(Number(p.totalAmount || 0) - Number(paidAmount));
    },
    0
  );

  const handlePayment = (purchase) => {
    navigate('/payment', {
      state: {
        prefilledData: {
          supplierId: purchase.supplier?._id,
          supplierName: purchase.supplier?.name,
          amount: purchase.totalAmount,
          narration: `Payment for ${purchase.invoiceNumber || 'purchase'}`,
          invoiceNumber: purchase.invoiceNumber,
        }
      }
    });
    window.dispatchEvent(new Event('payableUpdated'));
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-bold text-neutral-800">
        Payable Report
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
          Total Pending Payable
        </p>
        <p className="text-red-600 text-2xl font-semibold mt-1">
          ₹ {totalPayable.toLocaleString()}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">

        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          Credit Purchase Details
        </h2>

        {filteredPurchases.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            No payable entries found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-neutral-600">
              <tr>
                <th className="text-left py-3">Date</th>
                <th className="text-left">Supplier</th>
                <th className="text-left">Type</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredPurchases.map((purchase, index) => {
                const paidAmount = purchase.paidAmount !== undefined ? purchase.paidAmount : 0;
                const pending = Math.round(Number(purchase.totalAmount || 0) - Number(paidAmount));
                return (
                  <tr
                    key={index}
                    className="border-b border-neutral-200"
                  >
                    <td className="py-2">{new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString('en-GB')}</td>
                    <td>{purchase.supplier?.name || "Supplier"}</td>
                    <td>
                      <span className="inline-block px-2 py-1 text-xs rounded bg-orange-100 text-orange-700">
                        {purchase.narration || "Bill Payment"}
                      </span>
                    </td>
                    <td className="text-right text-red-600 font-medium">
                      ₹ {pending.toLocaleString()}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handlePayment(purchase)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                      >
                        Pay
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
