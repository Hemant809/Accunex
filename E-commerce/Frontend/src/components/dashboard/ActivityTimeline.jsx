export default function ActivityTimeline({ activities }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

      <ul className="space-y-3">
        {activities.map((item, index) => (
          <li
            key={index}
            className="flex justify-between text-sm text-gray-400"
          >
            <span>{item.message}</span>
            <span className="text-xs text-gray-500">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
