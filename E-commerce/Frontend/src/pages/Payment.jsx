import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useFinance } from "../context/FinanceContext";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { prefilledData, editEntry } = location.state || {};
  const { refreshFinanceData } = useFinance();

  const generateVoucher = () =>
    "PV-" + Date.now().toString().slice(-5);

  const [form, setForm] = useState({
    voucherNo: generateVoucher(),
    date: new Date().toISOString().split("T")[0],
    partyName: "",
    supplierId: "",
    paymentType: "bill",
    billRef: "",
    amount: "",
    mode: "cash",
    narration: "",
  });

  const [suppliers, setSuppliers] = useState([]);
  const [supplierName, setSupplierName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);

  useEffect(() => {
    fetchSuppliers();
    if (editEntry) {
      // Edit mode
      setForm({
        ...form,
        voucherNo: editEntry.voucherNo || form.voucherNo,
        date: editEntry.date ? new Date(editEntry.date).toISOString().split('T')[0] : form.date,
        partyName: editEntry.party || "",
        supplierId: editEntry.supplier || "",
        paymentType: editEntry.paymentType || "bill",
        amount: editEntry.amount || "",
        mode: editEntry.mode || "cash",
        narration: editEntry.narration || "",
      });
      setSupplierName(editEntry.party || "");
    } else if (prefilledData) {
      setForm({
        ...form,
        supplierId: prefilledData.supplierId || "",
        partyName: prefilledData.supplierName || "",
        amount: prefilledData.amount || "",
        narration: prefilledData.narration || "",
        billRef: prefilledData.invoiceNumber || "",
        paymentType: "bill",
      });
      setSupplierName(prefilledData.supplierName || "");
      if (prefilledData.supplierId) {
        fetchPendingBills(prefilledData.supplierId);
      }
    }
  }, [prefilledData, editEntry]);

  const fetchSuppliers = async () => {
    try {
      const { data } = await axios.get("/suppliers");
      setSuppliers(data);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  const handleSupplierChange = (value) => {
    const capitalized = value.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    setSupplierName(capitalized);
    setForm({ ...form, partyName: capitalized, supplierId: "" });
    
    if (capitalized.trim()) {
      const filtered = suppliers.filter(s => 
        s.name.toLowerCase().includes(capitalized.toLowerCase())
      );
      setFilteredSuppliers(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSupplier = (supplier) => {
    setSupplierName(supplier.name);
    setForm({ ...form, partyName: supplier.name, supplierId: supplier._id });
    setShowSuggestions(false);
    fetchPendingBills(supplier._id);
  };

  const fetchPendingBills = async (supplierId) => {
    try {
      const { data } = await axios.get(`/purchases?supplier=${supplierId}`);
      const filtered = data.filter(p => {
        const paidAmount = p.paidAmount !== undefined ? p.paidAmount : (p.mode === "cash" || p.mode === "online" ? p.totalAmount : 0);
        const pending = p.totalAmount - paidAmount;
        return pending > 0;
      });
      setPendingBills(filtered);
    } catch (error) {
      console.error("Error loading bills:", error);
    }
  };

  const toggleBillSelection = (bill) => {
    const exists = selectedBills.find(b => b._id === bill._id);
    if (exists) {
      setSelectedBills(selectedBills.filter(b => b._id !== bill._id));
    } else {
      const paidAmount = bill.paidAmount !== undefined ? bill.paidAmount : (bill.mode === "cash" || bill.mode === "online" ? bill.totalAmount : 0);
      const pendingAmount = Math.round(bill.totalAmount - paidAmount);
      setSelectedBills([...selectedBills, { ...bill, payAmount: pendingAmount }]);
    }
  };

  const updateBillAmount = (billId, amount) => {
    setSelectedBills(selectedBills.map(b => 
      b._id === billId ? { ...b, payAmount: Number(amount) } : b
    ));
  };

  const totalPaymentAmount = selectedBills.reduce((sum, b) => sum + Number(b.payAmount || 0), 0);

  useEffect(() => {
    if (form.paymentType === "bill" && selectedBills.length > 0) {
      setForm(prev => ({ ...prev, amount: totalPaymentAmount }));
    }
  }, [totalPaymentAmount, form.paymentType, selectedBills.length]);

  // Sync amount changes back to selected bills
  useEffect(() => {
    if (form.paymentType === "bill" && selectedBills.length > 0 && form.amount) {
      const manualAmount = Number(form.amount);
      if (manualAmount !== totalPaymentAmount && manualAmount > 0) {
        // Distribute the manual amount proportionally across selected bills
        const totalPending = selectedBills.reduce((sum, b) => {
          const paidAmount = b.paidAmount !== undefined ? b.paidAmount : (b.mode === "cash" || b.mode === "online" ? b.totalAmount : 0);
          return sum + (b.totalAmount - paidAmount);
        }, 0);
        
        const updatedBills = selectedBills.map(b => {
          const paidAmount = b.paidAmount !== undefined ? b.paidAmount : (b.mode === "cash" || b.mode === "online" ? b.totalAmount : 0);
          const pendingAmount = b.totalAmount - paidAmount;
          const proportion = pendingAmount / totalPending;
          return { ...b, payAmount: Math.round(manualAmount * proportion) };
        });
        
        setSelectedBills(updatedBills);
      }
    }
  }, [form.amount, form.paymentType]);

  const handleSave = async () => {
    try {
      if (!form.partyName) {
        toast.error("Enter party name");
        return;
      }

      if (form.paymentType === "bill" && selectedBills.length === 0 && !editEntry) {
        toast.error("Please select at least one bill");
        return;
      }

      const finalAmount = Number(form.amount);
      
      if (!finalAmount || finalAmount <= 0) {
        toast.error("Enter valid amount");
        return;
      }

      const paymentData = {
        supplier: form.supplierId,
        amount: finalAmount,
        mode: form.mode,
        paymentType: form.paymentType,
        bills: form.paymentType === "bill" && !editEntry ? selectedBills.map(b => ({
          purchaseId: b._id,
          invoiceNumber: b.invoiceNumber,
          amount: b.payAmount
        })) : [],
        narration: form.narration,
        date: form.date,
      };

      if (editEntry) {
        // Update existing payment
        await axios.put(`/payments/${editEntry._id}`, paymentData);
        toast.success("Payment Updated Successfully!");
      } else {
        // Create new payment
        await axios.post("/payments", paymentData);
        toast.success("Payment Saved Successfully!");
      }
      
      await refreshFinanceData();
      navigate(-1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  return (
    <div className="space-y-6">

      {/* Header with Party Name */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold">Payment Voucher</h1>
          <span className="text-xs sm:text-sm text-neutral-500">Voucher: {form.voucherNo}</span>
        </div>
        
        {/* Party Name - Prominent */}
        <div className="relative">
          <label className="text-sm text-neutral-600 font-medium">Party Name *</label>
          <input
            type="text"
            placeholder="Type party name..."
            value={supplierName}
            onChange={(e) => handleSupplierChange(e.target.value)}
            disabled={!!prefilledData || !!editEntry}
            className={`mt-1 w-full border-2 border-blue-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold ${prefilledData || editEntry ? 'bg-blue-50' : ''}`}
          />
          {showSuggestions && filteredSuppliers.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-neutral-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {filteredSuppliers.map((s) => (
                <div
                  key={s._id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSupplier(s);
                  }}
                  className="px-4 py-2 hover:bg-teal-50 cursor-pointer border-b border-neutral-100 last:border-0"
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* LEFT */}
        <div className="space-y-4">

          <div>
            <label className="text-sm text-neutral-600">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="mt-1 w-full border border-neutral-300 px-4 py-2 rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Payment Type</label>
            <select
              value={form.paymentType}
              onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
              className="mt-1 w-full border border-neutral-300 px-4 py-2 rounded-lg"
            >
              <option value="bill">Against Bill</option>
              <option value="advance">Advance Payment</option>
              <option value="expense">Expense</option>
              <option value="other">Other</option>
            </select>
          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          <div>
            <label className="text-sm text-neutral-600">Amount *</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="mt-1 w-full border border-neutral-300 px-4 py-2 rounded-lg text-lg font-semibold"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Payment Mode</label>
            <select
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}
              className="mt-1 w-full border border-neutral-300 px-4 py-2 rounded-lg"
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

        </div>

      </div>

      {/* Pending Bills Section */}
      {form.paymentType === "bill" && pendingBills.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-xl border">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Pending Bills</h3>
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Select</th>
                <th className="text-left">Date</th>
                <th className="text-left">Invoice No</th>
                <th className="text-right">Total</th>
                <th className="text-right">Paid</th>
                <th className="text-right">Pending</th>
                <th className="text-right">Pay Amount</th>
              </tr>
            </thead>
            <tbody>
              {pendingBills.map((bill) => {
                const isSelected = selectedBills.find(b => b._id === bill._id);
                const paidAmount = bill.paidAmount !== undefined ? bill.paidAmount : (bill.mode === "cash" || bill.mode === "online" ? bill.totalAmount : 0);
                const pendingAmount = Math.round(bill.totalAmount - paidAmount);
                return (
                  <tr key={bill._id} className="border-b hover:bg-neutral-50">
                    <td className="py-2">
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => toggleBillSelection(bill)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td>{new Date(bill.purchaseDate || bill.createdAt).toLocaleDateString('en-GB')}</td>
                    <td>{bill.invoiceNumber || "-"}</td>
                    <td className="text-right">₹ {Math.round(bill.totalAmount).toLocaleString()}</td>
                    <td className="text-right text-green-600">₹ {Math.round(paidAmount).toLocaleString()}</td>
                    <td className="text-right font-medium text-red-600">₹ {pendingAmount.toLocaleString()}</td>
                    <td className="text-right">
                      {isSelected ? (
                        <input
                          type="number"
                          value={isSelected.payAmount}
                          onChange={(e) => updateBillAmount(bill._id, e.target.value)}
                          className="border px-2 py-1 rounded w-24 text-right"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-neutral-100 font-semibold">
              <tr>
                <td colSpan="6" className="py-2 text-right">Total Payment:</td>
                <td className="text-right text-lg">₹ {Math.round(totalPaymentAmount).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          </div>
        </div>
      )}

      {/* Narration - Full Width Below */}
      <div className="bg-white p-4 rounded-xl border">
        <label className="text-xs text-neutral-600">Narration</label>
        <textarea
          rows="2"
          value={form.narration}
          onChange={(e) => setForm({ ...form, narration: e.target.value })}
          className="mt-1 w-full border border-neutral-300 px-3 py-2 rounded-lg text-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg w-full sm:w-auto"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg w-full sm:w-auto"
        >
          {editEntry ? "Update Payment" : "Save Payment"}
        </button>
      </div>

    </div>
  );
}
