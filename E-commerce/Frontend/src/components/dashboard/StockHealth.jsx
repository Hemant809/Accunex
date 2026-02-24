export default function StockHealth({ percentage = 0 }) {
  let color = "#16a34a"; // green

  if (percentage < 70) color = "#f59e0b"; // amber
  if (percentage < 40) color = "#dc2626"; // red

  return (
    <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm text-center">
      <h2 className="text-lg font-semibold text-neutral-800 mb-6">
        Inventory Health
      </h2>

      <div className="relative w-40 h-40 mx-auto">
        
        {/* Background Circle */}
        <div className="absolute inset-0 rounded-full border-[10px] border-neutral-200"></div>

        {/* Progress Ring */}
        <div
          className="absolute inset-0 rounded-full border-[10px]"
          style={{
            borderColor: `${color} transparent transparent transparent`,
            transform: `rotate(${(percentage / 100) * 360}deg)`,
            transition: "transform 0.6s ease",
          }}
        ></div>

        {/* Percentage Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-2xl font-semibold"
            style={{ color }}
          >
            {percentage}%
          </span>
        </div>
      </div>

      <p className="text-xs text-neutral-500 mt-4">
        Based on stock availability & turnover
      </p>
    </div>
  );
}
