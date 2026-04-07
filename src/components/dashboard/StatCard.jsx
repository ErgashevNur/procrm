import Counter from "@/components/dashboard/Counter";

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  note,
  color,
  delay = 0,
}) {
  return (
    <div
      className="crm-card crm-hairline relative overflow-hidden"
      style={{
        animation: `fadeUp 0.5s ease ${delay}s both`,
      }}
    >
      {/* Glow blob */}
      <div
        className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20 blur-2xl"
        style={{ background: color }}
      />
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {sub != null && (
          <span className="rounded-full border border-white/8 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold tracking-[0.16em] text-[color:var(--crm-muted)] uppercase">
            {sub}
          </span>
        )}
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-white md:text-[2rem]">
        <Counter value={value} />
      </p>
      <p className="mt-1 text-[11px] font-semibold tracking-[0.2em] text-[color:var(--crm-muted-2)] uppercase">
        {label}
      </p>
      {note ? (
        <p className="mt-2 text-xs leading-5 text-[color:var(--crm-muted)]">
          {note}
        </p>
      ) : null}
    </div>
  );
}
