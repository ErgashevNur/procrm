export default function LeadRow({ lead, checked, onToggle, imgUrl, getLeadName }) {
  const src = imgUrl(lead?.leadSource?.icon);
  const name = getLeadName(lead);

  return (
    <label
      className={`group flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition-all ${
        checked
          ? "border-white/20 bg-[#111827]"
          : "border-white/10 bg-[#0b1220] hover:border-white/20"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(lead.id)}
        className="mt-1 h-4 w-4 rounded accent-cyan-400"
      />
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
        style={{
          background: `hsl(${((name.charCodeAt(0) || 65) * 9) % 360}, 48%, 33%)`,
        }}
      >
        {(name[0] || "?").toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          {lead?.status?.name ? (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                color: lead.status.color || "#94a3b8",
                background: `${lead.status.color || "#94a3b8"}24`,
              }}
            >
              {lead.status.name}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-white/45">
          <span>{lead?.phone || "Telefon yo'q"}</span>
          {lead?.leadSource?.name ? <span>• {lead.leadSource.name}</span> : null}
        </div>
      </div>
      {src ? (
        <img
          src={src}
          className="mt-0.5 h-5 w-5 rounded-full object-cover"
          alt=""
          onError={(e) => e.currentTarget.remove()}
        />
      ) : null}
    </label>
  );
}
