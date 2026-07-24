export default function StatCard({
  label,
  value,
  icon,
  accent = "brand",
}: {
  label: string;
  value: number | string;
  icon: string;
  accent?: "brand" | "green" | "amber" | "red";
}) {
  const accentMap: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${accentMap[accent]}`}
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
