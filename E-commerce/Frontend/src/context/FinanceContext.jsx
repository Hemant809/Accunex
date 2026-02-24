import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

const FinanceContext = createContext();

export function FinanceProvider({ children }) {
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [purchasesRes, salesRes, receiptsRes, paymentsRes, expensesRes] = await Promise.all([
        axios.get("/purchases", config),
        axios.get("/sales", config),
        axios.get("/receipts", config),
        axios.get("/payments", config),
        axios.get("/expenses", config),
      ]);

      setPurchases(purchasesRes.data);
      setSales(salesRes.data);
      setReceipts(receiptsRes.data);
      setPayments(paymentsRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshFinanceData = () => {
    fetchFinanceData();
  };

  const addSale = async (saleData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/sales", saleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFinanceData();
    } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
    }
  };

  const addPurchase = async (purchaseData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/purchases", purchaseData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFinanceData();
    } catch (error) {
      console.error("Error adding purchase:", error);
      throw error;
    }
  };

  const addReceipt = async (receiptData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/receipts", receiptData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFinanceData();
    } catch (error) {
      console.error("Error adding receipt:", error);
      throw error;
    }
  };

  const addPayment = async (paymentData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("/payments", paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFinanceData();
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  };

  const deleteSale = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFinanceData();
    } catch (error) {
      console.error("Error deleting sale:", error);
      throw error;
    }
  };

  const deletePurchase = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/purchases/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFinanceData();
    } catch (error) {
      console.error("Error deleting purchase:", error);
      throw error;
    }
  };

  const deleteReceipt = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/receipts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFinanceData();
    } catch (error) {
      console.error("Error deleting receipt:", error);
      throw error;
    }
  };

  const deletePayment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFinanceData();
    } catch (error) {
      console.error("Error deleting payment:", error);
      throw error;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        purchases,
        sales,
        receipts,
        payments,
        expenses,
        loading,
        refreshFinanceData,
        addSale,
        addPurchase,
        addReceipt,
        addPayment,
        deleteSale,
        deletePurchase,
        deleteReceipt,
        deletePayment,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}
