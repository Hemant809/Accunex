import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";

const PartyContext = createContext();

export function PartyProvider({ children }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.get("/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSuppliers = () => {
    fetchSuppliers();
  };

  return (
    <PartyContext.Provider
      value={{
        suppliers,
        loading,
        refreshSuppliers,
      }}
    >
      {children}
    </PartyContext.Provider>
  );
}

export function useParty() {
  return useContext(PartyContext);
}
