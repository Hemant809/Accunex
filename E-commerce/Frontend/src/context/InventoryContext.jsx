import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get("/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = () => {
    fetchProducts();
  };

  const addProduct = async (productData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/products", {
        name: productData.name,
        unit: productData.unit,
        gst: productData.gst,
        purchasePrice: productData.purchaseRate,
        sellingPrice: productData.saleRate,
        stock: productData.stock,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/products/${id}`, {
        unit: productData.unit,
        gst: productData.gst,
        purchasePrice: productData.purchaseRate,
        sellingPrice: productData.saleRate,
        stock: productData.stock,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        loading,
        refreshProducts,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}
