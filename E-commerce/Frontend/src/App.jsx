import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

/* ---------- Core Pages ---------- */
import Login from "./pages/Login";
import Register from "./pages/Register";
import StaffRegister from "./pages/StaffRegister";
import Onboarding from "./pages/Onboarding";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import StaffDashboard from "./pages/StaffDashboard";
import MySales from "./pages/MySales";
import Products from "./pages/Products";
import Purchase from "./pages/Purchase";
import Sales from "./pages/Sales";
import Receipt from "./pages/Receipt";
import Payment from "./pages/Payment";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import Parties from "./pages/Parties";
import Ledger from "./pages/Ledger";

/* ---------- Profile ---------- */
import ProfileRouter from "./pages/Profile/ProfileRouter";

/* ---------- Reports ---------- */
import StockReport from "./pages/reports/StockReport";
import PurchaseReport from "./pages/reports/PurchaseReport";
import SalesReport from "./pages/reports/SalesReport";
import ReceiptReport from "./pages/reports/ReceiptReport";
import PaymentReport from "./pages/reports/PaymentReport";
import ProfitLossReport from "./pages/reports/ProfitLossReport";
import CashReport from "./pages/reports/CashReport";
import OnlineReport from "./pages/reports/OnlineReport";
import PartyLedgerReport from "./pages/reports/PartyLedgerReport";
import PartyLedgerDetail from "./pages/reports/PartyLedgerDetail";
import ReceivableReport from "./pages/reports/ReceivableReport";
import PayableReport from "./pages/reports/PayableReport";

/* ---------- Layout ---------- */
import Layout from "./components/Layout";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>

      {/* 🔐 Login Route */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />

      {/* 📝 Register Route */}
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/" replace />}
      />

      {/* 👥 Staff Register Route */}
      <Route
        path="/staff-register"
        element={!user ? <StaffRegister /> : <Navigate to="/" replace />}
      />

      {/* 🎯 Onboarding Route */}
      <Route
        path="/onboarding"
        element={!user ? <Onboarding /> : <Navigate to="/" replace />}
      />

      {/* 🔑 Forgot Password Route */}
      <Route
        path="/forgot-password"
        element={!user ? <ForgotPassword /> : <Navigate to="/" replace />}
      />

      {/* 🔒 Protected Routes */}
      <Route
        path="/"
        element={user ? <Layout /> : <Navigate to="/login" replace />}
      >

        {/* 🔥 Role Based Dashboard */}
        <Route
          index
          element={
            user?.role === "staff"
              ? <StaffDashboard />
              : <Dashboard />
          }
        />

        {/* Core Modules */}
        <Route path="products" element={<Products />} />
        <Route path="my-sales" element={<MySales />} />
        <Route path="purchase" element={<Purchase />} />
        <Route path="sales" element={<Sales />} />
        <Route path="receipt" element={<Receipt />} />
        <Route path="payment" element={<Payment />} />
        <Route path="reports" element={<Reports />} />
        <Route path="staff" element={<Staff />} />
        <Route path="parties" element={<Parties />} />
        <Route path="ledger" element={<Ledger />} />

        {/* 🔥 Profile */}
        <Route path="profile" element={<ProfileRouter />} />

        {/* 🔥 Individual Reports */}
        <Route path="reports/stock" element={<StockReport />} />
        <Route path="reports/purchase" element={<PurchaseReport />} />
        <Route path="reports/sales" element={<SalesReport />} />
        <Route path="reports/receipt" element={<ReceiptReport />} />
        <Route path="reports/payment" element={<PaymentReport />} />
        <Route path="reports/profit-loss" element={<ProfitLossReport />} />
        <Route path="reports/cash" element={<CashReport />} />
        <Route path="reports/online" element={<OnlineReport />} />
        <Route path="reports/party-ledger" element={<PartyLedgerReport />} />
        <Route path="reports/party-ledger-detail" element={<PartyLedgerDetail />} />
        <Route path="reports/receivable" element={<ReceivableReport />} />
        <Route path="reports/payable" element={<PayableReport />} />

      </Route>

      {/* 🚫 Fallback */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;
