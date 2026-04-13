export default function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#111827] p-4"
      style={{ borderColor: "rgba(255,255,255,0.1)" }}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#0b1220]">
          <Icon size={17} style={{ color }} />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
          {label}
        </span>
      </div>
      <div className="text-2xl font-semibold tracking-tight text-white">{value ?? 0}</div>
    </div>
  );
}
