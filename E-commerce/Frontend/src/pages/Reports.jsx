import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Package,
  ShoppingCart,
  Truck,
  ArrowDownCircle,
  ArrowUpCircle,
  BookOpen,
  BarChart3,
  Wallet,
  DollarSign,
} from "lucide-react";

function ReportCard({ to, icon: Icon, title, description }) {
  return (
    <Link
      to={to}
      className="block bg-white border border-slate-200 hover:border-teal-600 transition-colors duration-200 p-4"
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-teal-600" />
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
    </Link>
  );
}

export default function Reports() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleApplyFilter = () => {
    console.log("Applying filter:", { fromDate, toDate });
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
            <p className="text-slate-500 text-sm mt-1">Financial, inventory and performance reports</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-1.5 border border-slate-300 text-sm" />
            <span className="text-slate-400">-</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-1.5 border border-slate-300 text-sm" />
            <button onClick={handleApplyFilter} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium transition">Apply</button>
          </div>
        </div>
      </div>

      {/* Top Priority Reports */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Key Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReportCard to="/reports/stock" icon={Package} title="Stock Report" description="View stock quantity and value." />
          <ReportCard to="/reports/party-ledger" icon={BookOpen} title="Party Ledger" description="Complete party account statements." />
          <ReportCard to="/reports/profit-loss" icon={BarChart3} title="Profit & Loss" description="Overall business performance." />
        </div>
      </div>

      {/* Sales Reports */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Sales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReportCard to="/reports/sales" icon={ShoppingCart} title="Sales Report" description="Analyze sales performance." />
          <ReportCard to="/reports/receipt" icon={ArrowDownCircle} title="Receipt Report" description="View incoming payments." />
        </div>
      </div>

      {/* Purchase Reports */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Purchase</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReportCard to="/reports/purchase" icon={Truck} title="Purchase Report" description="Track all purchase transactions." />
          <ReportCard to="/reports/payment" icon={ArrowUpCircle} title="Payment Report" description="Track outgoing payments." />
        </div>
      </div>

      {/* Financial Reports */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Financial</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReportCard to="/reports/receivable" icon={Wallet} title="Receivable Report" description="View all pending receivable amounts." />
          <ReportCard to="/reports/payable" icon={BookOpen} title="Payable Report" description="View all pending payable amounts." />
          <ReportCard to="/reports/cash" icon={Wallet} title="Cash Balance" description="Detailed cash transactions." />
          <ReportCard to="/reports/online" icon={Wallet} title="Online Balance" description="View digital transactions." />
        </div>
      </div>

    </div>
  );
}
