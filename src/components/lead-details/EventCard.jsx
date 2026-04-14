import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export default function EventCard({
  event,
  headers,
  onRefresh,
  canDelete = true,
  getCfg,
  toLocalDateTimeInputValue,
  toApiDateTimeValue,
  TASK_STATUS_OPTIONS,
  API,
  toastSuccess,
  toastError,
  formatDateTime,
}) {
  const cfg = getCfg(event.type);
  const Icon = cfg.icon;
  const isTask = event.type === "tasks";

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(
    event.text || event.description || "",
  );
  const [editDate, setEditDate] = useState(() =>
    toLocalDateTimeInputValue(event.taskDate),
  );
  const [editStatus, setEditStatus] = useState(event.status || "STARTED");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const STATUS_MAP = {
    STARTED: {
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
      icon: Clock,
      label: "Jarayonda",
    },
    CANCELED: {
      color: "#6b7280",
      bg: "rgba(107,114,128,0.1)",
      border: "rgba(107,114,128,0.2)",
      icon: AlertCircle,
      label: "Bekor qilingan",
    },
    FINISHED: {
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.18)",
      icon: CheckCircle2,
      label: "Bajarildi",
    },
  };
  const tsCfg = isTask ? STATUS_MAP[event.status] || STATUS_MAP.CANCELED : null;

  const handleSaveTask = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const body = { description: editText.trim(), status: editStatus };
      if (editDate) body.taskDate = toApiDateTimeValue(editDate);
      const res = await fetch(`${API}/tasks/${event.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toastSuccess("Task yangilandi ✅");
      setEditing(false);
      await onRefresh();
    } catch {
      toastError("Xatolik ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDesc = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/Description/${event.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ text: editText.trim() }),
      });
      if (!res.ok) throw new Error();
      toastSuccess("Izoh yangilandi ✅");
      setEditing(false);
      await onRefresh();
    } catch {
      toastError("Xatolik ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      toastError("Sizda o'chirish uchun ruxsat yo'q");
      return;
    }
    if (!window.confirm("O'chirilsinmi?")) return;
    setDeleting(true);
    try {
      const url = isTask
        ? `${API}/tasks/${event.id}`
        : `${API}/Description/${event.id}`;
      const res = await fetch(url, { method: "DELETE", headers });
      if (!res.ok) throw new Error();
      toastSuccess("O'chirildi ✅");
      await onRefresh();
    } catch {
      toastError("O'chirishda xato ❌");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = isTask ? handleSaveTask : handleSaveDesc;

  return (
    <div className="group flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `${cfg.color}15`,
            border: `1px solid ${cfg.color}28`,
          }}
        >
          <Icon size={14} style={{ color: cfg.color }} />
        </div>
        <div
          className="w-px flex-1 bg-white/[0.04]"
          style={{ minHeight: 12 }}
        />
      </div>

      <div
        className="mb-3 flex-1 overflow-hidden rounded-xl border border-white/[0.05] p-4 transition-colors group-hover:bg-white/[0.02]"
        style={{
          background: isTask
            ? "rgba(16,185,129,0.03)"
            : "rgba(255,255,255,0.015)",
          borderLeft: `2px solid ${cfg.color}35`,
        }}
      >
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
              style={{ color: cfg.color, background: `${cfg.color}15` }}
            >
              {cfg.label}
            </span>
            {isTask && tsCfg && (
              <span
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  color: tsCfg.color,
                  background: tsCfg.bg,
                  border: `1px solid ${tsCfg.border}`,
                }}
              >
                <tsCfg.icon size={9} />
                {tsCfg.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-gray-600">
              <Clock size={10} />
              {formatDateTime(event.createdAt)}
            </div>
            {!editing && (
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => {
                    setEditing(true);
                    setEditText(event.text || event.description || "");
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white/10 hover:text-blue-400"
                >
                  <Pencil size={11} />
                </button>
                {canDelete ? (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white/10 hover:text-red-400 disabled:opacity-40"
                  >
                    <Trash2 size={11} />
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {!editing && (
          <>
            <p className="text-sm leading-relaxed text-gray-300">
              {event.text || event.description}
            </p>
            {isTask && (
              <div
                className="mt-3 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
                style={{
                  background: tsCfg ? tsCfg.bg : "rgba(16,185,129,0.06)",
                  border: `1px solid ${tsCfg ? tsCfg.border : "rgba(16,185,129,0.15)"}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Calendar
                    size={13}
                    style={{ color: tsCfg ? tsCfg.color : "#10b981" }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: tsCfg ? tsCfg.color : "#10b981" }}
                  >
                    Muddat:
                  </span>
                  <span className="text-xs font-bold text-white">
                    {event.taskDate
                      ? formatDateTime(event.taskDate)
                      : "Belgilanmagan"}
                  </span>
                </div>
                {tsCfg && (
                  <tsCfg.icon
                    size={14}
                    style={{ color: tsCfg.color, flexShrink: 0 }}
                  />
                )}
              </div>
            )}
          </>
        )}

        {editing && (
          <div className="space-y-2.5">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50"
              placeholder={isTask ? "Vazifa matni..." : "Izoh matni..."}
              autoFocus
            />
            {isTask && (
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  {TASK_STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setEditStatus(s.value)}
                      className="rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all"
                      style={{
                        color: editStatus === s.value ? s.color : "#4b5563",
                        background:
                          editStatus === s.value
                            ? `${s.color}18`
                            : "rgba(255,255,255,0.04)",
                        border: `1px solid ${editStatus === s.value ? `${s.color}35` : "transparent"}`,
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-300 outline-none focus:border-green-500/40"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !editText.trim()}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40"
                style={{ background: "#10b981", color: "#fff" }}
              >
                {saving ? (
                  <div className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                ) : (
                  <Check size={12} />
                )}
                Saqlash
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-white"
              >
                <X size={12} />
                Bekor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
