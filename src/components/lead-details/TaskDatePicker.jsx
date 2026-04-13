import { useEffect, useRef, useState } from "react";
import { Calendar } from "lucide-react";

export default function TaskDatePicker({
  value,
  onChange,
  parseTaskDateValue,
  pad2,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const parsed = parseTaskDateValue(value);
  const today = new Date();
  const [viewYear, setViewYear] = useState(
    parsed ? parsed.getFullYear() : today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    parsed ? parsed.getMonth() : today.getMonth(),
  );
  const [selDay, setSelDay] = useState(parsed ? parsed.getDate() : null);
  const [hour, setHour] = useState(parsed ? parsed.getHours() : 9);
  const [minute, setMinute] = useState(parsed ? parsed.getMinutes() : 0);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const MONTHS = [
    "Yan",
    "Fev",
    "Mar",
    "Apr",
    "May",
    "Iyn",
    "Iyl",
    "Avg",
    "Sen",
    "Okt",
    "Noy",
    "Dek",
  ];
  const WDAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = (() => {
    const d = new Date(viewYear, viewMonth, 1).getDay();
    return d === 0 ? 6 : d - 1;
  })();
  const isPast = (d) =>
    new Date(viewYear, viewMonth, d) <
    new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () =>
    viewMonth === 0
      ? (setViewMonth(11), setViewYear((y) => y - 1))
      : setViewMonth((m) => m - 1);
  const nextMonth = () =>
    viewMonth === 11
      ? (setViewMonth(0), setViewYear((y) => y + 1))
      : setViewMonth((m) => m + 1);

  const confirm = () => {
    if (!selDay) return;
    onChange(
      `${viewYear}-${pad2(viewMonth + 1)}-${pad2(selDay)}T${pad2(hour)}:${pad2(minute)}`,
    );
    setOpen(false);
  };

  const displayLabel = value
    ? (() => {
        const d = parseTaskDateValue(value);
        if (!d) return null;
        return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
      })()
    : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all"
        style={{
          borderColor: value
            ? "rgba(16,185,129,0.35)"
            : "rgba(255,255,255,0.07)",
          background: value
            ? "rgba(16,185,129,0.07)"
            : "rgba(255,255,255,0.03)",
          color: value ? "#e2ffe8" : "#6b7280",
        }}
      >
        <Calendar size={13} style={{ color: value ? "#10b981" : "#4b5563" }} />
        <span>{displayLabel || "Muddat tanlang"}</span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="ml-1 cursor-pointer text-gray-500 transition-colors hover:text-red-400"
          >
            ✕
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 z-50 mb-2 overflow-hidden rounded-xl shadow-2xl"
          style={{
            width: 272,
            background: "#0a1929",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center justify-between border-b border-white/[0.05] px-3 py-2">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-6 w-6 items-center justify-center rounded text-base text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              ‹
            </button>
            <span className="text-xs font-semibold text-white">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-6 w-6 items-center justify-center rounded text-base text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 px-2 pt-2">
            {WDAYS.map((d) => (
              <div
                key={d}
                className="py-0.5 text-center text-[9px] font-bold text-gray-700 uppercase"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5 px-2 pb-2">
            {Array(firstDay)
              .fill(null)
              .map((_, i) => (
                <div key={`e${i}`} />
              ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const past = isPast(d);
              const isSel = selDay === d;
              const isToday =
                d === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();
              return (
                <button
                  key={d}
                  type="button"
                  disabled={past}
                  onClick={() => setSelDay(d)}
                  className="aspect-square rounded-md text-[11px] transition-all"
                  style={{
                    background: isSel
                      ? "#10b981"
                      : isToday
                        ? "rgba(16,185,129,0.12)"
                        : "transparent",
                    color: isSel
                      ? "#fff"
                      : past
                        ? "#1e3a4a"
                        : isToday
                          ? "#10b981"
                          : "#c8dce8",
                    fontWeight: isSel || isToday ? 700 : 400,
                    cursor: past ? "not-allowed" : "pointer",
                    border:
                      isToday && !isSel
                        ? "1px solid rgba(16,185,129,0.25)"
                        : "1px solid transparent",
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
          <div className="space-y-2.5 border-t border-white/[0.05] px-3 py-3">
            {[
              ["Soat", hour, setHour, 23],
              ["Daqiqa", minute, setMinute, 59],
            ].map(([label, val, setter, max]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-right text-[10px] text-gray-600">
                  {label}
                </span>
                <input
                  type="range"
                  min={0}
                  max={max}
                  step={label === "Daqiqa" ? 5 : 1}
                  value={val}
                  onChange={(e) => setter(+e.target.value)}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full"
                  style={{
                    accentColor: "#10b981",
                    background: `linear-gradient(to right,#10b981 ${(val / max) * 100}%,#162840 ${(val / max) * 100}%)`,
                  }}
                />
                <span className="w-7 shrink-0 text-xs font-bold text-white tabular-nums">
                  {pad2(val)}
                </span>
              </div>
            ))}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {[
                [9, 0],
                [10, 0],
                [12, 0],
                [14, 0],
                [16, 0],
                [18, 0],
              ].map(([h, m]) => (
                <button
                  key={`qt${h}${m}`}
                  type="button"
                  onClick={() => {
                    setHour(h);
                    setMinute(m);
                  }}
                  className="rounded px-2 py-0.5 text-[10px] font-semibold transition-colors"
                  style={{
                    background:
                      hour === h && minute === m
                        ? "rgba(16,185,129,0.2)"
                        : "rgba(255,255,255,0.05)",
                    color: hour === h && minute === m ? "#10b981" : "#4b6070",
                    border: `1px solid ${hour === h && minute === m ? "rgba(16,185,129,0.3)" : "transparent"}`,
                  }}
                >
                  {pad2(h)}:{pad2(m)}
                </button>
              ))}
            </div>
          </div>
          <div
            className="flex items-center justify-between border-t border-white/[0.05] px-3 py-2"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <span className="text-[11px] text-gray-600">
              {selDay
                ? `${selDay} ${MONTHS[viewMonth]}, ${pad2(hour)}:${pad2(minute)}`
                : "Kun tanlanmagan"}
            </span>
            <button
              type="button"
              onClick={confirm}
              disabled={!selDay}
              className="rounded-lg px-3 py-1 text-xs font-semibold transition-all"
              style={{
                background: selDay ? "#10b981" : "#162840",
                color: selDay ? "#fff" : "#2a4560",
                cursor: selDay ? "pointer" : "not-allowed",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
