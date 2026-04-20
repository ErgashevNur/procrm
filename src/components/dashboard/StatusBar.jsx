import { BarChart3 } from "lucide-react";
import { getStatusMeta } from "@/components/dashboard/statusMeta";

export default function StatusBar({ statusKey, count, total, percent }) {
  const statusMeta = getStatusMeta();
  const meta = statusMeta[statusKey] || {
    label: statusKey,
    color: "#6b7280",
    icon: BarChart3,
  };
  const Icon = meta.icon;
  const w = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{
          background: `${meta.color}15`,
          border: `1px solid ${meta.color}25`,
        }}
      >
        <Icon size={13} style={{ color: meta.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-[color:var(--crm-muted)]">
            {meta.label}
          </span>
          <span className="text-xs font-bold text-white">
            {count}{" "}
            <span className="font-normal text-[color:var(--crm-muted-2)]">
              ({percent}%)
            </span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${w}%`,
              background: meta.color,
              boxShadow: `0 0 6px ${meta.color}60`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
