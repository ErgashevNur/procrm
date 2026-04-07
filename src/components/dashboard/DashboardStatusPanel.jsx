import StatusBar from "@/components/dashboard/StatusBar";

export default function DashboardStatusPanel({ totalLeads, byStatus, percentages }) {
  return (
    <div
      className="crm-card"
      style={{
        animation: "fadeUp 0.5s ease 0.25s both",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="crm-kicker">Statuslar bo'yicha</p>
          <p className="mt-1 text-xs text-[color:var(--crm-muted)]">
            Leadlar qaysi holatda turgani shu yerda ko'rinadi.
          </p>
        </div>
        <span className="text-xs font-semibold text-[color:var(--crm-muted-2)]">
          {totalLeads} ta
        </span>
      </div>
      <div className="space-y-1 divide-y divide-white/3">
        {Object.entries(byStatus).map(([key, count]) => (
          <StatusBar
            key={key}
            statusKey={key}
            count={count}
            total={totalLeads}
            percent={percentages[key] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
