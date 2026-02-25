import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useFinance } from "../context/FinanceContext";
import { useInventory } from "../context/InventoryContext";

export default function Sales() {
  const { refreshFinanceData } = useFinance();
  const { refreshProducts } = useInventory();
  const today = new Date().toISOString().split("T")[0];
  const printRef = useRef();

  const generateBillNo = () => {
    const last = localStorage.getItem("lastSaleBill");
    const next = last ? Number(last) + 1 : 1;
    localStorage.setItem("lastSaleBill", next);
    return `INV-${String(next).padStart(4, "0")}`;
  };

  /* ---------------- Invoice Auto Generate ---------------- */
  const [billNo, setBillNo] = useState("");

  useEffect(() => {
    setBillNo(generateBillNo());
  }, []);

  /* ---------------- States ---------------- */

  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState(today);
  const [saleType, setSaleType] = useState("cash");
  const [products, setProducts] = useState([]);

  // Validating products loader
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("/products");
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  const [items, setItems] = useState([
    { product: "", name: "", unit: "pcs", qty: 1, rate: 0, gst: 0, stock: 0 }
  ]);

  /* ---------------- Item Functions ---------------- */

  const addItem = () => {
    setItems([...items, { product: "", name: "", unit: "pcs", qty: 1, rate: 0, gst: 0, stock: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];

    if (field === "product") {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        updated[index].product = selectedProduct._id;
        updated[index].name = selectedProduct.name;
        updated[index].unit = selectedProduct.unit || "pcs";
        const gst = selectedProduct.gst || 0;
        const rateExclGST = selectedProduct.sellingPrice / (1 + gst / 100);
        updated[index].rate = rateExclGST;
        updated[index].gst = gst;
        updated[index].stock = selectedProduct.stock;
      }
    } else if (field === "name") {
      const searchName = value.toLowerCase();
      const foundProduct = products.find(p => 
        p.name.toLowerCase() === searchName
      );
      
      if (foundProduct) {
        updated[index].product = foundProduct._id;
        updated[index].name = foundProduct.name;
        updated[index].unit = foundProduct.unit || "pcs";
        const gst = foundProduct.gst || 0;
        const rateExclGST = foundProduct.sellingPrice / (1 + gst / 100);
        updated[index].rate = rateExclGST;
        updated[index].gst = gst;
        updated[index].stock = foundProduct.stock;
      } else {
        updated[index].name = value;
      }
    } else {
      updated[index][field] = Number(value);
    }

    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  /* ---------------- Calculations ---------------- */

  const subtotal = items.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0
  );

  const totalGST = items.reduce(
    (sum, item) =>
      sum + (item.qty * item.rate * item.gst) / 100,
    0
  );

  const grandTotal = subtotal + totalGST;
  const roundOff = Math.round(grandTotal) - grandTotal;
  const finalTotal = Math.round(grandTotal);

  /* ---------------- Save ---------------- */

  const saveSale = async () => {
    try {
      if (!customer) return toast.error("Please enter customer name");
      if (items.some(i => !i.product)) return toast.error("Please select a product for all items");

      const saleData = {
        customerName: customer,
        mode: saleType,
        invoiceNumber: billNo,
        saleDate: date,
        items: items.map(i => ({
          product: i.product,
          quantity: i.qty,
          sellingPrice: i.rate,
          gst: i.gst
        }))
      };

      const { data } = await axios.post("/sales", saleData);

      toast.success("Sale Saved Successfully!");
      await refreshFinanceData();
      await refreshProducts();

      // Reset Form
      setBillNo(generateBillNo());
      setCustomer("");
      setItems([{ product: "", name: "", unit: "pcs", qty: 1, rate: 0, gst: 0, stock: 0 }]);

    } catch (error) {
      console.error("Save Sale Error:", error);
      toast.error(error.response?.data?.message || "Failed to save sale");
    }
  };

  /* ---------------- Print ---------------- */

  const printBill = () => {
    const printContents = printRef.current.innerHTML;
    const newWindow = window.open("", "", "width=900,height=600");
    newWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f4f4f4; }
            h2 { margin-bottom: 10px; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-semibold">
          Sales Voucher
        </h1>
        <div className="text-xs sm:text-sm text-neutral-500">
          <input
            type="text"
            value={billNo}
            onChange={(e) => setBillNo(e.target.value)}
            className="border border-neutral-300 px-3 py-1 rounded text-right"
            placeholder="Bill No"
          />
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

        <Input label="Customer" value={customer} onChange={setCustomer} />

        <Input label="Date" type="date" value={date} onChange={setDate} />

        <div>
          <label className="text-sm text-neutral-600">
            Sale Type
          </label>
          <select
            value={saleType}
            onChange={(e) => setSaleType(e.target.value)}
            className="mt-1 w-full border border-neutral-300 px-4 py-2 rounded-lg"
          >
            <option value="cash">Cash</option>
            <option value="online">Online</option>
            <option value="credit">Credit</option>
          </select>
        </div>

      </div>

      {/* Items */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-neutral-200">

        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="border-b border-neutral-200">
            <tr>
              <th className="w-1/3">Item</th>
              <th>Unit</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>GST %</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => {
              const amount = item.qty * item.rate;
              const gstAmount = (amount * item.gst) / 100;
              const total = amount + gstAmount;

              return (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      placeholder="Type product name..."
                      value={item.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                      list={`sales-products-${index}`}
                      className="border px-2 py-1 rounded w-full"
                    />
                    <datalist id={`sales-products-${index}`}>
                      {products.map(p => (
                        <option key={p._id} value={p.name} />
                      ))}
                    </datalist>
                  </td>

                  <td className="text-center text-neutral-500">
                    {item.unit}
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(index, "qty", e.target.value)
                      }
                      className="border px-2 py-1 rounded w-16"
                      min="1"
                      max={item.stock}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.rate}
                      readOnly
                      className="border px-2 py-1 rounded w-20 bg-gray-100"
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.gst}
                      readOnly
                      className="border px-2 py-1 rounded w-16 bg-gray-100"
                    />
                  </td>

                  <td>₹ {total.toFixed(2)}</td>

                  <td
                    onClick={() => removeItem(index)}
                    className="text-red-500 cursor-pointer"
                  >
                    ✕
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        <button
          onClick={addItem}
          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Item
        </button>

      </div>

      {/* Totals */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-neutral-200 space-y-3">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Total GST</span>
          <span>₹ {totalGST.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Round Off</span>
          <span>{roundOff >= 0 ? '+' : ''}{roundOff.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg text-teal-600">
          <span>Grand Total</span>
          <span>₹ {finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <button
          onClick={saveSale}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 w-full sm:w-auto"
        >
          Save Sale
        </button>

        <button
          onClick={printBill}
          className="bg-neutral-800 text-white px-6 py-2 rounded-lg hover:bg-neutral-900 w-full sm:w-auto"
        >
          Print Bill
        </button>
      </div>

      {/* Printable Invoice Layout */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <h2>Hemant Super Mart</h2>
          <p>Invoice No: {billNo}</p>
          <p>Customer: {customer}</p>
          <p>Date: {date}</p>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const total =
                  item.qty * item.rate +
                  (item.qty * item.rate * item.gst) / 100;

                return (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{item.rate}</td>
                    <td>{total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h3>Total: ₹ {finalTotal.toFixed(2)}</h3>
        </div>
      </div>

    </div>
  );
}

function Input({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="text-sm text-neutral-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-neutral-300 px-4 py-2 rounded-lg"
      />
    </div>
  );
}
