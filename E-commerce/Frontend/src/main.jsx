import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { InventoryProvider } from "./context/InventoryContext";
import { FinanceProvider } from "./context/FinanceContext";
import { PartyProvider } from "./context/PartyContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <InventoryProvider>
          <FinanceProvider>
            <PartyProvider>
              <App />
              <Toaster position="top-right" />
            </PartyProvider>
          </FinanceProvider>
        </InventoryProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
