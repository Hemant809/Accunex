import { useState, useEffect } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useInventory } from "../context/InventoryContext";
import { useFinance } from "../context/FinanceContext";

export default function Purchase() {

  const { products, fetchProducts } = useInventory();
  const { fetchPurchases } = useFinance();
  const [suppliers, setSuppliers] = useState([]);
  const [supplierName, setSupplierName] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [showSupplierSuggestions, setShowSupplierSuggestions] = useState(false);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  /* ---------------- Voucher Auto Generate ---------------- */

  const generateVoucher = () => {
    const last = localStorage.getItem("lastPurchase");
    const next = last ? Number(last) + 1 : 1;
    localStorage.setItem("lastPurchase", next);
    return `PV-${String(next).padStart(3, "0")}`;
  };

  const [voucherNo, setVoucherNo] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [supplier, setSupplier] = useState("");
  const [billNo, setBillNo] = useState("");
  const [purchaseType, setPurchaseType] = useState("credit");
  const [narration, setNarration] = useState("");

  const [rows, setRows] = useState([
    { product: "", name: "", unit: "pcs", qty: 0, rate: 0, gst: 0 }
  ]);

  useEffect(() => {
    setVoucherNo(generateVoucher());
    fetchSuppliers();
  }, []);

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
    setSupplierId("");
    
    if (capitalized.trim()) {
      const filtered = suppliers.filter(s => 
        s.name.toLowerCase().includes(capitalized.toLowerCase())
      );
      setFilteredSuppliers(filtered);
      setShowSupplierSuggestions(true);
    } else {
      setShowSupplierSuggestions(false);
    }
  };

  const selectSupplier = (supplier) => {
    setSupplierName(supplier.name);
    setSupplierId(supplier._id);
    setShowSupplierSuggestions(false);
  };

  const createSupplierIfNew = async () => {
    if (!supplierName.trim()) return null;
    
    if (supplierId) return supplierId;
    
    const existing = suppliers.find(s => 
      s.name.toLowerCase() === supplierName.toLowerCase()
    );
    
    if (existing) return existing._id;
    
    try {
      const { data } = await axios.post("/suppliers", { name: supplierName });
      setSuppliers([...suppliers, data]);
      setSupplierId(data._id);
      toast.success("New supplier added!");
      return data._id;
    } catch (error) {
      toast.error("Failed to create supplier");
      return null;
    }
  };

  /* ---------------- Row Functions ---------------- */

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    
    if (field === "product") {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        updated[index].product = selectedProduct._id;
        updated[index].name = selectedProduct.name;
        updated[index].unit = selectedProduct.unit || "pcs";
        updated[index].rate = selectedProduct.purchasePrice || 0;
        updated[index].gst = selectedProduct.gst || 0;
      }
    } else if (field === "name") {
      const capitalized = value.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      updated[index].name = capitalized;
      updated[index].product = "";
    } else {
      updated[index][field] = Number(value) || 0;
    }
    
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { product: "", name: "", unit: "pcs", qty: 0, rate: 0, gst: 0 }]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  /* ---------------- Calculations ---------------- */

  const subtotal = rows.reduce(
    (sum, r) => sum + r.qty * r.rate,
    0
  );

  const totalGST = rows.reduce(
    (sum, r) => sum + (r.qty * r.rate * r.gst) / 100,
    0
  );

  const grandTotal = subtotal + totalGST;
  const roundOff = Math.round(grandTotal) - grandTotal;
  const finalTotal = Math.round(grandTotal);

  /* ---------------- Save ---------------- */

  const handleSave = async () => {
    try {
      if (!supplierName || rows.length === 0) {
        toast.error("Please fill required details");
        return;
      }

      if (rows.some(r => !r.name || !r.qty || !r.rate)) {
        toast.error("Please fill all item details");
        return;
      }

      const finalSupplierId = await createSupplierIfNew();
      if (!finalSupplierId) return;

      // Create new products if needed
      const processedItems = [];
      for (let row of rows) {
        let productId = row.product;
        
        if (!productId) {
          // Create new product
          try {
            const { data } = await axios.post("/products", {
              name: row.name,
              unit: row.unit,
              purchasePrice: row.rate,
              sellingPrice: row.rate * 1.2,
              gst: row.gst,
              stock: 0
            });
            productId = data._id;
            toast.success(`New product "${row.name}" added!`);
          } catch (error) {
            console.error("Product creation error:", error);
            toast.error(`Failed to add product: ${row.name}`);
            return;
          }
        }
        
        processedItems.push({
          product: productId,
          quantity: row.qty,
          purchasePrice: row.rate,
          gst: row.gst
        });
      }

      const purchaseData = {
        supplier: finalSupplierId,
        invoiceNumber: billNo,
        purchaseDate: date,
        mode: purchaseType,
        items: processedItems,
        narration
      };

      await axios.post("/purchases", purchaseData);
      await fetchProducts();
      await fetchPurchases();
      
      toast.success("Purchase Saved Successfully!");

      setVoucherNo(generateVoucher());
      setSupplierName("");
      setSupplierId("");
      setBillNo("");
      setRows([{ product: "", name: "", unit: "pcs", qty: 0, rate: 0, gst: 0 }]);
      setNarration("");
    } catch (error) {
      console.error("Save Purchase Error:", error);
      toast.error(error.response?.data?.message || "Failed to save purchase");
    }
  };

  return (
    <div className="space-y-8">

      {/* Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Purchase Voucher
        </h1>
        <span className="text-sm text-neutral-500">
          Voucher No: {voucherNo}
        </span>
      </div>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 grid grid-cols-3 gap-6">

        <div className="relative">
          <label className="text-sm text-neutral-600">Supplier</label>
          <input
            type="text"
            placeholder="Type supplier name..."
            value={supplierName}
            onChange={(e) => handleSupplierChange(e.target.value)}
            onFocus={() => {
              if (supplierName.trim()) {
                const filtered = suppliers.filter(s => 
                  s.name.toLowerCase().includes(supplierName.toLowerCase())
                );
                setFilteredSuppliers(filtered);
                setShowSupplierSuggestions(true);
              }
            }}
            className="mt-1 w-full border border-neutral-300 px-4 py-2 rounded"
          />
          {showSupplierSuggestions && filteredSuppliers.length > 0 && (
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

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={setDate}
        />

        <Input label="Bill No"
          value={billNo}
          onChange={setBillNo}
        />

      </div>

      {/* Items Section */}
      <div className="grid grid-cols-4 gap-6">

        <div className="col-span-3 bg-white p-6 rounded-xl border border-neutral-200 overflow-x-auto">

          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-neutral-500">
              <tr>
                <th className="text-left py-3">Item</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>GST %</th>
                <th>GST Amt</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => {
                const amount = row.qty * row.rate;
                const gstAmt = (amount * row.gst) / 100;
                const total = amount + gstAmt;

                return (
                  <tr key={index} className="border-b border-neutral-100">
                    <td>
                      <input
                        type="text"
                        placeholder="Type product name..."
                        value={row.name}
                        onChange={(e) => handleChange(index, "name", e.target.value)}
                        list={`products-${index}`}
                        className="border border-neutral-300 px-2 py-1 rounded w-full"
                      />
                      <datalist id={`products-${index}`}>
                        {products.map(p => (
                          <option key={p._id} value={p.name} />
                        ))}
                      </datalist>
                    </td>

                    <td>
                      <select
                        className="border border-neutral-300 px-2 py-1 rounded w-20"
                        value={row.unit}
                        onChange={(e) => {
                          const updated = [...rows];
                          updated[index].unit = e.target.value;
                          setRows(updated);
                        }}
                      >
                        <option value="pcs">Pcs</option>
                        <option value="kg">Kg</option>
                        <option value="ltr">Ltr</option>
                        <option value="box">Box</option>
                        <option value="pack">Pack</option>
                        <option value="tin">Tin</option>
                      </select>
                    </td>

                    <td>
                      <input
                        type="number"
                        className="border border-neutral-300 px-2 py-1 rounded w-20"
                        onChange={(e) =>
                          handleChange(index, "qty", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={row.rate}
                        className="border border-neutral-300 px-2 py-1 rounded w-24"
                        onChange={(e) =>
                          handleChange(index, "rate", e.target.value)
                        }
                      />
                    </td>

                    <td>₹ {amount.toFixed(2)}</td>

                    <td>
                      <input
                        type="number"
                        value={row.gst}
                        className="border border-neutral-300 px-2 py-1 rounded w-16"
                        onChange={(e) =>
                          handleChange(index, "gst", e.target.value)
                        }
                      />
                    </td>

                    <td>₹ {gstAmt.toFixed(2)}</td>
                    <td className="font-semibold">
                      ₹ {total.toFixed(2)}
                    </td>

                    <td
                      className="text-red-500 cursor-pointer"
                      onClick={() => removeRow(index)}
                    >
                      ✕
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button
            onClick={addRow}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
          >
            + Add Row
          </button>

        </div>

        {/* Totals Panel */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-4 h-fit">

          <Row label="Subtotal" value={subtotal} />
          <Row label="Total GST" value={totalGST} />
          
          <div className="flex justify-between text-sm text-neutral-600">
            <span>Round Off</span>
            <span>{roundOff >= 0 ? '+' : ''}₹ {roundOff.toFixed(2)}</span>
          </div>

          <div className="border-t border-neutral-200 pt-4 flex justify-between text-lg font-semibold text-teal-600">
            <span>Grand Total</span>
            <span>₹ {finalTotal.toFixed(2)}</span>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-4">

        <div>
          <label className="text-sm text-neutral-600">
            Narration
          </label>
          <textarea
            rows="3"
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            className="mt-1 w-full border border-neutral-300 px-4 py-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-neutral-300 px-6 py-2 rounded"
          >
            Clear
          </button>

          <button
            onClick={handleSave}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded"
          >
            Save Purchase
          </button>
        </div>

      </div>

    </div>
  );
}

/* ---------------- Reusable ---------------- */

function Input({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="text-sm text-neutral-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-neutral-300 px-4 py-2 rounded"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm text-neutral-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-neutral-300 px-4 py-2 rounded"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{label}</span>
      <span>₹ {value.toFixed(2)}</span>
    </div>
  );
}
