import ArcProgress from "@/components/dashboard/ArcProgress";

export default function TaskRing({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <ArcProgress percent={pct} color={color} size={72} stroke={6} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-white">{pct}%</span>
        </div>
      </div>
      <p className="text-center text-[11px] leading-tight font-medium text-[color:var(--crm-muted)]">
        {label}
      </p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}
