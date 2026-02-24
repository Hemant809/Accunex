import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function SalesChart({ trendData = [] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
      <h3 className="text-neutral-800 text-lg font-semibold mb-4">
        Weekly Sales Trend
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={trendData}>
          
          {/* Light grid */}
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

          <XAxis
            dataKey="day"
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />

          <Line
            type="monotone"
            dataKey="sales"
            stroke="#0d9488" // Teal professional
            strokeWidth={2.5}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesChart;
