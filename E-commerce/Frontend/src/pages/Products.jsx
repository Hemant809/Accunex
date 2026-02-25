import { useState } from "react";
import { useInventory } from "../context/InventoryContext";

export default function Products() {
  const { products, addProduct, updateProduct } = useInventory();

  const [newProduct, setNewProduct] = useState({
    name: "",
    unit: "pcs",
    gst: "",
    purchaseRate: "",
    saleRate: "",
    stock: "",
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [tempData, setTempData] = useState({
    unit: "",
    gst: "",
    purchaseRate: "",
    saleRate: "",
    stock: "",
  });

  const calculateExclusive = (rate, gst) => {
    if (!rate) return "0.00";
    if (!gst || gst === 0) return Number(rate).toFixed(2);
    return (rate / (1 + gst / 100)).toFixed(2);
  };

  const handleNameChange = (value) => {
    const capitalized = value.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    setNewProduct({ ...newProduct, name: capitalized });
    
    if (capitalized.trim()) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(capitalized.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectProduct = (product) => {
    setNewProduct({
      name: product.name,
      unit: product.unit || "pcs",
      gst: product.gst || 0,
      purchaseRate: product.purchasePrice || 0,
      saleRate: product.sellingPrice || 0,
      stock: "",
    });
    setShowSuggestions(false);
  };

  const handleAdd = () => {
    if (!newProduct.name || !newProduct.saleRate) {
      toast.error("Product name and selling rate are required");
      return;
    }

    addProduct({
      name: newProduct.name,
      unit: newProduct.unit,
      gst: Number(newProduct.gst) || 0,
      purchaseRate: Number(newProduct.purchaseRate) || 0,
      saleRate: Number(newProduct.saleRate) || 0,
      stock: Number(newProduct.stock) || 0,
    });

    setNewProduct({ name: "", unit: "pcs", gst: "", purchaseRate: "", saleRate: "", stock: "" });
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && newProduct.name && newProduct.saleRate) {
      handleAdd();
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setTempData({
      unit: product.unit || "pcs",
      gst: product.gst || 0,
      purchaseRate: product.purchasePrice || 0,
      saleRate: product.sellingPrice || 0,
      stock: product.stock || 0,
    });
  };

  const handleSave = (id) => {
    updateProduct(id, {
      unit: tempData.unit,
      gst: Number(tempData.gst) || 0,
      purchaseRate: Number(tempData.purchaseRate) || 0,
      saleRate: Number(tempData.saleRate) || 0,
      stock: Number(tempData.stock) || 0,
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-8">

      <h1 className="text-2xl font-semibold">
        Product Master
      </h1>

      {/* Add Product */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-neutral-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">

        <div className="relative">
          <input
            type="text"
            placeholder="Product Name *"
            value={newProduct.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (newProduct.name.trim()) {
                const filtered = products.filter(p => 
                  p.name.toLowerCase().includes(newProduct.name.toLowerCase())
                );
                setFilteredProducts(filtered);
                setShowSuggestions(true);
              }
            }}
            className="w-full border border-neutral-300 px-4 py-2 rounded-lg"
          />
          {showSuggestions && filteredProducts.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-neutral-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectProduct(product);
                  }}
                  className="px-4 py-2 hover:bg-teal-50 cursor-pointer border-b border-neutral-100 last:border-0"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-neutral-500">
                    Sale: ₹{product.sellingPrice} | Stock: {product.stock}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <select
          value={newProduct.unit}
          onChange={(e) =>
            setNewProduct({ ...newProduct, unit: e.target.value })
          }
          className="border border-neutral-300 px-4 py-2 rounded-lg"
        >
          <option value="pcs">Pcs</option>
          <option value="kg">Kg</option>
          <option value="ltr">Ltr</option>
          <option value="box">Box</option>
          <option value="pack">Pack</option>
          <option value="tin">Tin</option>
        </select>

        <input
          type="number"
          placeholder="Purchase Rate"
          value={newProduct.purchaseRate}
          onChange={(e) =>
            setNewProduct({ ...newProduct, purchaseRate: e.target.value })
          }
          onKeyPress={handleKeyPress}
          className="border border-neutral-300 px-4 py-2 rounded-lg"
        />

        <input
          type="number"
          placeholder="Selling Rate *"
          value={newProduct.saleRate}
          onChange={(e) =>
            setNewProduct({ ...newProduct, saleRate: e.target.value })
          }
          onKeyPress={handleKeyPress}
          className="border border-neutral-300 px-4 py-2 rounded-lg"
        />

        <input
          type="number"
          placeholder="GST %"
          value={newProduct.gst}
          onChange={(e) =>
            setNewProduct({ ...newProduct, gst: e.target.value })
          }
          onKeyPress={handleKeyPress}
          className="border border-neutral-300 px-4 py-2 rounded-lg"
        />

        <input
          type="number"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: e.target.value })
          }
          onKeyPress={handleKeyPress}
          className="border border-neutral-300 px-4 py-2 rounded-lg"
        />

        <button
          onClick={handleAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition sm:col-span-2 lg:col-span-6"
        >
          Add Product
        </button>

      </div>

      {/* Table */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-neutral-200">

        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="border-b border-neutral-200 text-neutral-500">
            <tr>
              <th className="text-left py-3">Product</th>
              <th className="text-center">Unit</th>
              <th className="text-center">GST %</th>
              <th className="text-right">Purchase Rate (Inc GST)</th>
              <th className="text-right">Selling Rate</th>
              <th className="text-right">Selling (Excl GST)</th>
              <th className="text-center">Stock</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-b border-neutral-100 hover:bg-neutral-50 transition"
              >
                <td className="py-3 text-left">
                  {product.name}
                </td>

                <td className="text-center">
                  {editingId === product._id ? (
                    <select
                      value={tempData.unit}
                      onChange={(e) =>
                        setTempData({ ...tempData, unit: e.target.value })
                      }
                      className="border border-neutral-300 px-2 py-1 rounded w-20"
                    >
                      <option value="pcs">Pcs</option>
                      <option value="kg">Kg</option>
                      <option value="ltr">Ltr</option>
                      <option value="box">Box</option>
                      <option value="pack">Pack</option>
                      <option value="tin">Tin</option>
                    </select>
                  ) : (
                    product.unit || "pcs"
                  )}
                </td>

                <td className="text-center">
                  {editingId === product._id ? (
                    <input
                      type="number"
                      value={tempData.gst}
                      onChange={(e) =>
                        setTempData({ ...tempData, gst: e.target.value })
                      }
                      className="border border-neutral-300 px-2 py-1 rounded w-20 text-center"
                    />
                  ) : (
                    `${product.gst || 0}%`
                  )}
                </td>

                <td className="text-right">
                  {editingId === product._id ? (
                    <input
                      type="number"
                      value={tempData.purchaseRate}
                      onChange={(e) =>
                        setTempData({
                          ...tempData,
                          purchaseRate: e.target.value,
                        })
                      }
                      className="border border-neutral-300 px-2 py-1 rounded w-24 text-right"
                    />
                  ) : (
                    `₹ ${(Number(product.purchasePrice || 0) * (1 + (product.gst || 0) / 100)).toFixed(2)}`
                  )}
                </td>

                <td className="text-right">
                  {editingId === product._id ? (
                    <input
                      type="number"
                      value={tempData.saleRate}
                      onChange={(e) =>
                        setTempData({
                          ...tempData,
                          saleRate: e.target.value,
                        })
                      }
                      className="border border-neutral-300 px-2 py-1 rounded w-24 text-right"
                    />
                  ) : (
                    product.sellingPrice ? `₹ ${Number(product.sellingPrice).toFixed(2)}` : (
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-red-600 text-xs"
                      >
                        Add Rate
                      </button>
                    )
                  )}
                </td>

                <td className="text-right text-teal-600 font-medium">
                  ₹{" "}
                  {calculateExclusive(
                    product.sellingPrice,
                    product.gst
                  )}
                </td>

                <td className="text-center">
                  {editingId === product._id ? (
                    <input
                      type="number"
                      value={tempData.stock}
                      onChange={(e) =>
                        setTempData({ ...tempData, stock: e.target.value })
                      }
                      className="border border-neutral-300 px-2 py-1 rounded w-20 text-center"
                    />
                  ) : (
                    product.stock || 0
                  )}
                </td>

                <td className="text-right">
                  {editingId === product._id ? (
                    <button
                      onClick={() => handleSave(product._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-teal-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
        </div>

      </div>

    </div>
  );
}
