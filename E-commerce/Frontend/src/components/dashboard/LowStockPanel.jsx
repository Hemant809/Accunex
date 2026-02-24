import { AlertTriangle } from "lucide-react";

export default function LowStockPanel({ products = [] }) {
  const getSeverity = (stock, minStock) => {
    if (stock === 0) {
      return { label: "Out of Stock", color: "bg-red-900 text-red-400" };
    }
    if (stock <= minStock / 2) {
      return { label: "Critical", color: "bg-red-800 text-red-300" };
    }
    if (stock <= minStock) {
      return { label: "Warning", color: "bg-yellow-900 text-yellow-300" };
    }
    return null;
  };

  const lowStockItems = products
    .map((p) => ({
      ...p,
      severity: getSeverity(p.stock, p.minStock),
    }))
    .filter((p) => p.severity !== null);

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle size={18} />
        Low Stock Alerts
      </h2>

      {lowStockItems.length === 0 ? (
        <p className="text-green-400 text-sm">
          All inventory levels are healthy ✅
        </p>
      ) : (
        <div className="space-y-3">
          {lowStockItems.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg flex justify-between items-center ${item.severity.color}`}
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs">
                  Stock: {item.stock} | Min: {item.minStock}
                </p>
              </div>
              <span className="text-xs font-bold">{item.severity.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
