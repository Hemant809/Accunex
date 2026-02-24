import { useNavigate } from "react-router-dom";

export default function KPIStrip({ data = {} }) {
  const navigate = useNavigate();

  const cards = [
    {
      label: "This Month Sales",
      value: data.monthlySales || 0,
      borderColor: "border-slate-400",
      path: "/reports/sales",
      money: true,
    },
    {
      label: "This Month Purchase",
      value: data.totalPurchaseAmount || 0,
      borderColor: "border-slate-400",
      path: "/reports/purchase",
      money: true,
    },
    {
      label: "Total Expenses",
      value: data.totalExpenses || 0,
      borderColor: "border-slate-400",
      path: "/expense",
      money: true,
    },
    {
      label: "Cash Balance",
      value: data.cashBalance || 0,
      borderColor: "border-slate-400",
      path: "/reports/cash",
      money: true,
    },
    {
      label: "Online Balance",
      value: data.onlineBalance || 0,
      borderColor: "border-slate-400",
      path: "/reports/online",
      money: true,
    },
    {
      label: "Stock Value",
      value: data.stockValue || 0,
      borderColor: "border-blue-500",
      path: "/products",
      money: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          onClick={() => navigate(card.path)}
          className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all border-l-4 ${card.borderColor}`}
        >
          <p className="text-xs text-slate-500 mb-2">{card.label}</p>
          <p className="text-2xl font-bold text-slate-800">
            {card.money
              ? `₹${Number(card.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              : card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
