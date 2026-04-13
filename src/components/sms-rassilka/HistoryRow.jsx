import { CheckCheck, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function HistoryRow({ item, formatDate }) {
  const statusCfg = {
    SENT: { color: "#10b981", icon: CheckCheck, label: "Yuborildi" },
    PENDING: { color: "#f59e0b", icon: Clock, label: "Kutilmoqda" },
    FAILED: { color: "#ef4444", icon: XCircle, label: "Xato" },
    SUCCESS: { color: "#10b981", icon: CheckCircle2, label: "Muvaffaqiyatli" },
  };
  const cfg = statusCfg[item?.status] || statusCfg.PENDING;
  const Icon = cfg.icon;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1220] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#111827]">
          <Icon size={16} style={{ color: cfg.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {item?.message || item?.text || "Xabar"}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-white/45">
                <span>{item?.recipientCount ?? item?.leads?.length ?? 0} ta qabulchi</span>
                <span>{formatDate(item?.createdAt)}</span>
              </div>
            </div>
            <span
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium"
              style={{ color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
