import { STATUS_META } from "@/components/dashboard/statusMeta";

export default function DashboardLeadConversion({ byStatus, totalLeads }) {
  return (
    <div
      className="crm-card"
      style={{
        animation: "fadeUp 0.5s ease 0.35s both",
      }}
    >
      <div className="mb-4">
        <p className="crm-kicker">Lead konversiyasi</p>
        <p className="mt-1 text-xs text-[color:var(--crm-muted)]">
          Jami leadlar qaysi holatda qancha ekanini ko'rsatadi.
        </p>
      </div>
      <div className="flex h-16 items-end gap-1">
        {Object.entries(byStatus).map(([key, count]) => {
          const meta = STATUS_META[key] || { color: "#6b7280", label: key };
          const h = totalLeads > 0 ? Math.max((count / totalLeads) * 100, 4) : 4;
          return (
            <div key={key} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-white">{count}</span>
              <div
                className="w-full rounded-t-md transition-all duration-1000"
                style={{
                  height: `${h}%`,
                  minHeight: 6,
                  background: `linear-gradient(to top, ${meta.color}cc, ${meta.color}40)`,
                  boxShadow: `0 -2px 8px ${meta.color}40`,
                }}
              />
              <span className="text-[9px] text-[color:var(--crm-muted-2)]">
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
