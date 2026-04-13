export default function StatCard({
  title,
  value,
  caption,
  icon: Icon,
  tone = "#69a7ff",
}) {
  return (
    <div className="crm-card crm-hairline relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-10 right-0 h-24 w-24 rounded-full opacity-30 blur-3xl"
        style={{ background: tone }}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="crm-kicker">{title}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
              {value}
            </p>
          </div>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{
              background: `${tone}18`,
              border: `1px solid ${tone}30`,
            }}
          >
            <Icon size={18} style={{ color: tone }} />
          </div>
        </div>
        <p className="mt-3 text-sm text-[color:var(--crm-muted)]">{caption}</p>
      </div>
    </div>
  );
}
