import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useFinance } from "../context/FinanceContext";

export default function Receipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const { prefilledData, editEntry } = location.state || {};
  const { refreshFinanceData } = useFinance();

  const generateVoucher = () =>
    "RV-" + Date.now().toString().slice(-5);

  const [form, setForm] = useState({
    voucherNo: generateVoucher(),
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    customerId: "",
    receiptType: "bill",
    billRef: "",
    amount: "",
    mode: "cash",
    narration: "",
  });

  const [customers, setCustomers] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);

  useEffect(() => {
    fetchCustomers();
    if (editEntry) {
      // Edit mode
      setForm({
        ...form,
        voucherNo: editEntry.voucherNo || form.voucherNo,
        date: editEntry.date ? new Date(editEntry.date).toISOString().split('T')[0] : form.date,
        customerName: editEntry.customerName || editEntry.party || "",
        customerId: editEntry.customer || "",
        receiptType: editEntry.receiptType || "bill",
        amount: editEntry.amount || "",
        mode: editEntry.mode || "cash",
        narration: editEntry.narration || "",
      });
      setCustomerName(editEntry.customerName || editEntry.party || "");
    } else if (prefilledData) {
      setForm({
        ...form,
        customerId: prefilledData.customerId || "",
        customerName: prefilledData.customerName || "",
        amount: prefilledData.amount || "",
        narration: prefilledData.narration || "",
        billRef: prefilledData.invoiceNumber || "",
        receiptType: "bill",
      });
      setCustomerName(prefilledData.customerName || "");
      if (prefilledData.customerName) {
        fetchPendingBills(prefilledData.customerName);
      }
    }
  }, [prefilledData, editEntry]);

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get("/sales");
      const creditSales = data.filter(s => s.mode === "credit");
      const uniqueCustomers = [...new Map(creditSales.map(s => [s.customerName, s])).values()];
      setCustomers(uniqueCustomers);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  const handleCustomerChange = (value) => {
    const capitalized = value.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    setCustomerName(capitalized);
    setForm({ ...form, customerName: capitalized, customerId: "" });
    
    if (capitalized.trim()) {
      const filtered = customers.filter(c => 
        c.customerName.toLowerCase().includes(capitalized.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (customer) => {
    setCustomerName(customer.customerName);
    setForm({ ...form, customerName: customer.customerName, customerId: customer._id });
    setShowSuggestions(false);
    fetchPendingBills(customer.customerName);
  };

  const fetchPendingBills = async (customerName) => {
    try {
      const { data } = await axios.get("/sales");
      const filtered = data.filter(s => {
        if (s.customerName !== customerName) return false;
        const receivedAmount = s.receivedAmount !== undefined ? s.receivedAmount : (s.mode === "cash" || s.mode === "online" ? s.totalAmount : 0);
        const pending = s.totalAmount - receivedAmount;
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
      const receivedAmount = bill.receivedAmount !== undefined ? bill.receivedAmount : (bill.mode === "cash" || bill.mode === "online" ? bill.totalAmount : 0);
      const pendingAmount = Math.round(bill.totalAmount - receivedAmount);
      setSelectedBills([...selectedBills, { ...bill, receiveAmount: pendingAmount }]);
    }
  };

  const updateBillAmount = (billId, amount) => {
    setSelectedBills(selectedBills.map(b => 
      b._id === billId ? { ...b, receiveAmount: Number(amount) } : b
    ));
  };

  const totalReceiptAmount = selectedBills.reduce((sum, b) => sum + Number(b.receiveAmount || 0), 0);

  useEffect(() => {
    if (form.receiptType === "bill" && selectedBills.length > 0) {
      setForm(prev => ({ ...prev, amount: totalReceiptAmount }));
    }
  }, [totalReceiptAmount, form.receiptType, selectedBills.length]);

  // Sync amount changes back to selected bills
  useEffect(() => {
    if (form.receiptType === "bill" && selectedBills.length > 0 && form.amount) {
      const manualAmount = Number(form.amount);
      if (manualAmount !== totalReceiptAmount && manualAmount > 0) {
        // Distribute the manual amount proportionally across selected bills
        const totalPending = selectedBills.reduce((sum, b) => {
          const receivedAmount = b.receivedAmount !== undefined ? b.receivedAmount : (b.mode === "cash" || b.mode === "online" ? b.totalAmount : 0);
          return sum + (b.totalAmount - receivedAmount);
        }, 0);
        
        const updatedBills = selectedBills.map(b => {
          const receivedAmount = b.receivedAmount !== undefined ? b.receivedAmount : (b.mode === "cash" || b.mode === "online" ? b.totalAmount : 0);
          const pendingAmount = b.totalAmount - receivedAmount;
          const proportion = pendingAmount / totalPending;
          return { ...b, receiveAmount: Math.round(manualAmount * proportion) };
        });
        
        setSelectedBills(updatedBills);
      }
    }
  }, [form.amount, form.receiptType]);

  const handleSave = async () => {
    try {
      if (!form.customerName) {
        toast.error("Enter customer name");
        return;
      }

      const finalAmount = Number(form.amount);
      
      if (!finalAmount || finalAmount <= 0) {
        toast.error("Enter valid amount");
        return;
      }

      const receiptData = {
        customer: form.customerId,
        customerName: form.customerName,
        amount: finalAmount,
        mode: form.mode,
        receiptType: form.receiptType,
        bills: form.receiptType === "bill" ? selectedBills.map(b => ({
          saleId: b._id,
          invoiceNumber: b.invoiceNumber,
          amount: b.receiveAmount
        })) : [],
        narration: form.narration,
        date: form.date,
      };

      if (editEntry) {
        // Update existing receipt
        await axios.put(`/receipts/${editEntry._id}`, receiptData);
        toast.success("Receipt Updated Successfully!");
      } else {
        // Create new receipt
        await axios.post("/receipts", receiptData);
        toast.success("Receipt Saved Successfully!");
      }
      
      await refreshFinanceData();
      navigate(-1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Receipt failed");
    }
  };

  return (
    <div className="space-y-6">

      {/* Header with Customer Name */}
      <div className="bg-white p-6 rounded-xl border">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Receipt Voucher</h1>
          <span className="text-sm text-neutral-500">Voucher: {form.voucherNo}</span>
        </div>
        
        {/* Customer Name - Prominent */}
        <div className="relative">
          <label className="text-sm text-neutral-600 font-medium">Customer Name *</label>
          <input
            type="text"
            placeholder="Type customer name..."
            value={customerName}
            onChange={(e) => handleCustomerChange(e.target.value)}
            disabled={!!prefilledData || !!editEntry}
            className={`mt-1 w-full border-2 border-green-300 px-4 py-3 rounded-lg text-lg font-semibold ${prefilledData || editEntry ? 'bg-green-50' : ''}`}
          />
          {showSuggestions && filteredCustomers.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-neutral-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {filteredCustomers.map((c) => (
                <div
                  key={c._id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectCustomer(c);
                  }}
                  className="px-4 py-2 hover:bg-teal-50 cursor-pointer border-b border-neutral-100 last:border-0"
                >
                  {c.customerName}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Details */}
      <div className="bg-white p-6 rounded-xl border grid grid-cols-2 gap-6">

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
            <label className="text-sm text-neutral-600">Receipt Type</label>
            <select
              value={form.receiptType}
              onChange={(e) => setForm({ ...form, receiptType: e.target.value })}
              className="mt-1 w-full border border-neutral-300 px-4 py-2 rounded-lg"
            >
              <option value="bill">Against Bill</option>
              <option value="advance">Advance Receipt</option>
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
            <label className="text-sm text-neutral-600">Receipt Mode</label>
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
      {form.receiptType === "bill" && pendingBills.length > 0 && (
        <div className="bg-white p-6 rounded-xl border">
          <h3 className="text-lg font-semibold mb-4">Pending Bills</h3>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Select</th>
                <th className="text-left">Date</th>
                <th className="text-left">Invoice No</th>
                <th className="text-right">Total</th>
                <th className="text-right">Received</th>
                <th className="text-right">Pending</th>
                <th className="text-right">Receive Amount</th>
              </tr>
            </thead>
            <tbody>
              {pendingBills.map((bill) => {
                const isSelected = selectedBills.find(b => b._id === bill._id);
                const receivedAmount = bill.receivedAmount !== undefined ? bill.receivedAmount : (bill.mode === "cash" || bill.mode === "online" ? bill.totalAmount : 0);
                const pendingAmount = Math.round(bill.totalAmount - receivedAmount);
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
                    <td>{new Date(bill.saleDate || bill.createdAt).toLocaleDateString('en-GB')}</td>
                    <td>{bill.invoiceNumber || "-"}</td>
                    <td className="text-right">₹ {Math.round(bill.totalAmount).toLocaleString()}</td>
                    <td className="text-right text-blue-600">₹ {Math.round(receivedAmount).toLocaleString()}</td>
                    <td className="text-right font-medium text-green-600">₹ {pendingAmount.toLocaleString()}</td>
                    <td className="text-right">
                      {isSelected ? (
                        <input
                          type="number"
                          value={isSelected.receiveAmount}
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
                <td colSpan="6" className="py-2 text-right">Total Receipt:</td>
                <td className="text-right text-lg">₹ {Math.round(totalReceiptAmount).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
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
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
        >
          {editEntry ? "Update Receipt" : "Save Receipt"}
        </button>
      </div>

    </div>
  );
}
