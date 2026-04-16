export default function ActivityStatsWidget({
  total,
  trend,
}: {
  total: number;
  trend: number;
}) {
  const isPositive = trend >= 0;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold">Activity</h3>

      <p className="text-2xl">{total}</p>

      <span
        className={`text-sm px-2 py-1 rounded ${
          isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {isPositive ? "+" : ""}
        {trend}%
      </span>
    </div>
  );
}