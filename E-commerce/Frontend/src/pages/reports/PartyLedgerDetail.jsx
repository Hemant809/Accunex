import { useLocation, useNavigate } from "react-router-dom";
import { useFinance } from "../../context/FinanceContext";
import { useState } from "react";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";

export default function PartyLedgerDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { partyName, supplierId, partyType } = location.state || {};
  const { purchases = [], payments = [], sales = [], receipts = [] } = useFinance();
  const { fetchPurchases, fetchPayments, fetchSales, fetchReceipts } = useFinance();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  if (!partyName) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="text-blue-600">
          ← Back
        </button>
        <p className="mt-4">No party selected</p>
      </div>
    );
  }

  // Filter entries by date
  const allEntries = [];

  if (partyType === 'Customer') {
    // Customer entries - Sales and Receipts
    sales
      .filter(s => s.customerName === partyName)
      .forEach(s => {
        const date = new Date(s.saleDate || s.createdAt);
        allEntries.push({
          date,
          type: "Sale",
          invoiceNo: s.invoiceNumber,
          debit: Math.round(s.totalAmount), // Customer owes us
          credit: 0,
          id: s._id,
          docType: "sale",
        });
      });

    receipts
      .filter(r => r.customerName === partyName)
      .forEach(r => {
        allEntries.push({
          date: new Date(r.date),
          type: "Receipt",
          invoiceNo: r.refNo || "-",
          debit: 0,
          credit: Math.round(r.amount), // Customer paid us
          id: r._id,
          docType: "receipt",
        });
      });
  } else {
    // Supplier entries - Purchases and Payments
    purchases
      .filter(p => p.supplier?._id === supplierId || p.supplier?.name === partyName)
      .forEach(p => {
        const date = new Date(p.purchaseDate || p.createdAt);
        allEntries.push({
          date,
          type: "Purchase",
          invoiceNo: p.invoiceNumber,
          debit: 0,
          credit: Math.round(p.totalAmount), // Supplier ko dena hai
          id: p._id,
          docType: "purchase",
        });
      });

    payments
      .filter(p => p.party === partyName)
      .forEach(p => {
        allEntries.push({
          date: new Date(p.date),
          type: "Payment",
          invoiceNo: p.refNo || "-",
          debit: Math.round(p.amount), // Supplier ko diya
          credit: 0,
          id: p._id,
          docType: "payment",
        });
      });
  }

  // Sort by date
  allEntries.sort((a, b) => a.date - b.date);

  // Filter by date range
  const filteredEntries = allEntries.filter(entry => {
    if (fromDate && entry.date < new Date(fromDate)) return false;
    if (toDate && entry.date > new Date(toDate)) return false;
    return true;
  });

  // Calculate opening balance (entries before fromDate)
  let openingBalance = 0;
  if (fromDate) {
    allEntries.forEach(entry => {
      if (entry.date < new Date(fromDate)) {
        openingBalance += entry.debit - entry.credit;
      }
    });
  }

  // Calculate running balance
  let runningBalance = openingBalance;
  const entriesWithBalance = filteredEntries.map(entry => {
    runningBalance += entry.debit - entry.credit;
    return { ...entry, balance: Math.round(runningBalance) };
  });

  const closingBalance = Math.round(runningBalance);

  // Totals
  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);

  const handleDelete = async (entry) => {
    if (!window.confirm(`Delete this ${entry.type}?`)) return;

    try {
      if (entry.docType === "purchase") {
        await axios.delete(`/purchases/${entry.id}`);
        await fetchPurchases();
      } else if (entry.docType === "payment") {
        await axios.delete(`/payments/${entry.id}`);
        await fetchPayments();
      } else if (entry.docType === "sale") {
        await axios.delete(`/sales/${entry.id}`);
        await fetchSales();
      } else if (entry.docType === "receipt") {
        await axios.delete(`/receipts/${entry.id}`);
        await fetchReceipts();
      }
      toast.success("Entry deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6 p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button 
            onClick={() => navigate(-1)} 
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Party Ledger
          </button>
          <h1 className="text-2xl font-bold text-neutral-800">
            Ledger: {partyName}
          </h1>
        </div>
        <div className="flex gap-2">
          {partyType === 'Customer' ? (
            <>
              <button
                onClick={() => navigate('/sales', { state: { prefilledCustomer: partyName } })}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                + Sale
              </button>
              <button
                onClick={() => navigate('/receipt', { state: { prefilledData: { customerName: partyName } } })}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Receipt
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/purchase', { state: { prefilledSupplier: { name: partyName, _id: supplierId } } })}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                + Purchase
              </button>
              <button
                onClick={() => navigate('/payment', { state: { prefilledData: { supplierId: supplierId, supplierName: partyName } } })}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Payment
              </button>
            </>
          )}
          <button
            onClick={() => window.print()}
            className="bg-neutral-600 text-white px-4 py-2 rounded hover:bg-neutral-700"
          >
            Print
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white p-4 rounded-xl border flex gap-4">
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

      {/* Opening Balance */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <div className="flex justify-between">
          <span className="font-semibold">Opening Balance:</span>
          <span className={`font-bold ${openingBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            ₹ {Math.abs(Math.round(openingBalance)).toLocaleString()} {openingBalance >= 0 ? 'Dr' : 'Cr'}
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 border-b">
            <tr>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left px-4">Particulars</th>
              <th className="text-left px-4">Vch Type</th>
              <th className="text-left px-4">Vch No.</th>
              <th className="text-right px-4">Debit</th>
              <th className="text-right px-4">Credit</th>
              <th className="text-right px-4">Balance</th>
              <th className="text-center px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {entriesWithBalance.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-neutral-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              entriesWithBalance.map((entry, index) => (
                <tr key={index} className="border-b hover:bg-neutral-50">
                  <td className="py-3 px-4">{entry.date.toLocaleDateString('en-GB')}</td>
                  <td className="px-4">{partyName}</td>
                  <td className="px-4">{entry.type}</td>
                  <td className="px-4">{entry.invoiceNo}</td>
                  <td className="text-right px-4 text-red-600">
                    {entry.debit ? `₹ ${Math.round(entry.debit).toLocaleString()}` : "-"}
                  </td>
                  <td className="text-right px-4 text-green-600">
                    {entry.credit ? `₹ ${Math.round(entry.credit).toLocaleString()}` : "-"}
                  </td>
                  <td className="text-right px-4 font-medium">
                    ₹ {Math.abs(entry.balance).toLocaleString()} {entry.balance >= 0 ? 'Dr' : 'Cr'}
                  </td>
                  <td className="text-center px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          if (entry.docType === 'purchase') {
                            navigate('/purchase', { state: { editEntry: entry } });
                          } else if (entry.docType === 'payment') {
                            navigate('/payment', { state: { editEntry: entry } });
                          } else if (entry.docType === 'sale') {
                            navigate('/sales', { state: { editEntry: entry } });
                          } else if (entry.docType === 'receipt') {
                            navigate('/receipt', { state: { editEntry: entry } });
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 hover:bg-blue-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry)}
                        className="text-red-600 hover:text-red-800 text-xs px-2 py-1 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Totals Row */}
          <tfoot className="bg-neutral-100 font-semibold">
            <tr>
              <td colSpan="4" className="py-3 px-4 text-right">Total:</td>
              <td className="text-right px-4 text-red-600">₹ {Math.round(totalDebit).toLocaleString()}</td>
              <td className="text-right px-4 text-green-600">₹ {Math.round(totalCredit).toLocaleString()}</td>
              <td className="text-right px-4"></td>
              <td className="px-4"></td>
            </tr>
          </tfoot>
        </table>
        </div>
      </div>

      {/* Closing Balance */}
      <div className="bg-green-50 p-4 rounded-xl border border-green-200">
        <div className="flex justify-between">
          <span className="font-semibold">Closing Balance:</span>
          <span className={`font-bold text-lg ${closingBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            ₹ {Math.abs(closingBalance).toLocaleString()} {closingBalance >= 0 ? 'Dr' : 'Cr'}
          </span>
        </div>
      </div>

    </div>
  );
}
