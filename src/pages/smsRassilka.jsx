import { useState, useEffect, useRef } from "react";
import {
  Send,
  Users,
  Clock,
  CheckCheck,
  XCircle,
  ChevronDown,
  Search,
  MessageSquare,
  Zap,
  BarChart2,
  RefreshCw,
  Filter,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;
const IMAGE_BASE = "https://back.prohome.uz/api/v1/image";

function getToken() {
  return localStorage.getItem("user") || "";
}
function getProjectId() {
  return localStorage.getItem("projectId") || "";
}

function hdr(json = true) {
  const h = { Authorization: `Bearer ${getToken()}` };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

function imgUrl(src) {
  if (!src) return null;
  if (src.startsWith("http") || src.startsWith("blob:")) return src;
  return `${IMAGE_BASE}/${src}`;
}

// ── Stats card ──────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5"
      style={{
        borderColor: `${color}22`,
        background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)`,
        animation: `fadeUp .5s ease ${delay}s both`,
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        <span
          className="text-[11px] font-medium"
          style={{ color: `${color}99` }}
        >
          {label}
        </span>
      </div>
      <p className="text-2xl font-black text-white">{value ?? "—"}</p>
      <div
        className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full opacity-5"
        style={{ background: color }}
      />
    </div>
  );
}

// ── Lead checkbox row ────────────────────────────────────────────────────────
function LeadRow({ lead, checked, onToggle }) {
  const name = `${lead.firstName || ""} ${lead.lastName || ""}`.trim();
  const src = imgUrl(lead.leadSource?.icon);
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
        checked
          ? "border-blue-500/40 bg-blue-500/8"
          : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(lead.id)}
        className="h-4 w-4 rounded accent-blue-500"
      />
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{
          background: `hsl(${((name.charCodeAt(0) || 65) * 7) % 360},55%,35%)`,
        }}
      >
        {(name[0] || "?").toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-200">
          {name || "Noma'lum"}
        </p>
        <p className="truncate text-[11px] text-gray-600">{lead.phone}</p>
      </div>
      {src && (
        <img
          src={src}
          className="h-4 w-4 rounded-full object-cover"
          alt=""
          onError={(e) => e.currentTarget.remove()}
        />
      )}
      {lead.status && (
        <span
          className="shrink-0 rounded-md px-1.5 py-px text-[9px] font-semibold"
          style={{
            color: lead.status.color || "#94a3b8",
            background: `${lead.status.color || "#94a3b8"}20`,
          }}
        >
          {lead.status.name}
        </span>
      )}
    </label>
  );
}

// ── History row ──────────────────────────────────────────────────────────────
function HistoryRow({ item }) {
  const statusCfg = {
    SENT: { color: "#10b981", icon: CheckCheck, label: "Yuborildi" },
    PENDING: { color: "#f59e0b", icon: Clock, label: "Kutilmoqda" },
    FAILED: { color: "#ef4444", icon: XCircle, label: "Xato" },
    SUCCESS: { color: "#10b981", icon: CheckCircle2, label: "Muvaffaqiyatli" },
  };
  const cfg = statusCfg[item.status] || statusCfg.PENDING;
  const SIcon = cfg.icon;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: `${cfg.color}15`,
          border: `1px solid ${cfg.color}25`,
        }}
      >
        <SIcon size={13} style={{ color: cfg.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 truncate text-sm font-medium text-gray-200">
          {item.message || item.text}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
          <span className="flex items-center gap-1">
            <Users size={10} />
            {item.recipientCount ?? item.leads?.length ?? "—"} ta
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {item.createdAt
              ? new Date(item.createdAt).toLocaleString("uz-UZ", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </span>
        </div>
      </div>
      <span
        className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold"
        style={{ color: cfg.color, background: `${cfg.color}18` }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function SmsRassilka() {
  const projectId = getProjectId();

  // Data
  const [leads, setLeads] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(new Set()); // lead id lar
  const [selectAll, setSelectAll] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [tab, setTab] = useState("yuborish"); // yuborish | tarix

  const textRef = useRef(null);

  // ── Fetch all data ─────────────────────────────────────────────────────────
  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [leadRes, histRes] = await Promise.all([
        fetch(`${API}/leeds?projectId=${projectId}`, { headers: hdr() }),
        fetch(`${API}/sms/history?projectId=${projectId}`, { headers: hdr() }),
        // Agar stats endpoint bo'lsa:
        // fetch(`${API}/sms/stats?projectId=${projectId}`, { headers: hdr() }),
      ]);

      if (leadRes.ok) {
        const d = await leadRes.json();
        setLeads(Array.isArray(d) ? d : (d.data ?? []));
      }

      if (histRes.ok) {
        const d = await histRes.json();
        const list = Array.isArray(d) ? d : (d.data ?? []);
        setHistory(list);
        // Stats hisoblash
        setStats({
          total: list.length,
          sent: list.filter(
            (i) => i.status === "SENT" || i.status === "SUCCESS",
          ).length,
          pending: list.filter((i) => i.status === "PENDING").length,
          failed: list.filter((i) => i.status === "FAILED").length,
        });
      }
    } catch (err) {
      console.error(err);
      if (!silent) toast.error("Ma'lumotlar yuklanmadi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Auto-resize textarea ───────────────────────────────────────────────────
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [message]);

  // ── Filtered leads ─────────────────────────────────────────────────────────
  const filteredLeads = leads.filter((l) => {
    const name = `${l.firstName || ""} ${l.lastName || ""}`.toLowerCase();
    if (
      search &&
      !name.includes(search.toLowerCase()) &&
      !l.phone?.includes(search)
    )
      return false;
    if (filterStatus !== "all" && l.status?.name !== filterStatus) return false;
    return true;
  });

  // ── Select all ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (selectAll) setSelected(new Set(filteredLeads.map((l) => l.id)));
    else setSelected(new Set());
  }, [selectAll]);

  const toggleLead = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Yuborish ───────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Xabar matni kiritilmagan");
      return;
    }
    if (selected.size === 0) {
      toast.error("Hech qanday mijoz tanlanmagan");
      return;
    }

    setSending(true);
    try {
      const body = {
        projectId: Number(projectId),
        message: message.trim(),
        leadIds: [...selected],
      };
      const res = await fetch(`${API}/sms/send`, {
        method: "POST",
        headers: hdr(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast.success(`✅ ${selected.size} ta mijozga SMS yuborildi`);
      setMessage("");
      setSelected(new Set());
      setSelectAll(false);
      setTab("tarix");
      await fetchAll(true);
    } catch (err) {
      toast.error("SMS yuborishda xato: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160) || 1;
  const uniqueStatuses = [
    ...new Set(leads.map((l) => l.status?.name).filter(Boolean)),
  ];

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="crm-page space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-14 rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-[#071828] text-white"
      style={{ fontFamily: "'IBM Plex Mono', 'Fira Code', monospace" }}
    >
      {/* Grid texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glow top-right */}
      <div
        className="pointer-events-none fixed -top-40 -right-40 h-96 w-96 rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 shrink-0 border-b px-6 py-4"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: "rgba(7,24,40,0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                boxShadow: "0 4px 16px #3b82f640",
              }}
            >
              <MessageSquare size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white">
                SMS Rassilka
              </h1>
              <p className="text-[11px] text-gray-600">
                {leads.length} ta mijoz mavjud
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-white/15 hover:text-white disabled:opacity-40"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            Yangilash
          </button>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* ── LEFT: form + leads ──────────────────────────────────────────── */}
        <div
          className="flex w-[420px] shrink-0 flex-col border-r"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          {/* Tabs */}
          <div
            className="flex shrink-0 border-b"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            {[
              ["yuborish", "Yuborish", Send],
              ["tarix", "Tarix", BarChart2],
            ].map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-xs font-semibold transition-all"
                style={{
                  borderBottomColor: tab === key ? "#3b82f6" : "transparent",
                  color: tab === key ? "#60a5fa" : "#4b5563",
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          {/* ── YUBORISH tab ── */}
          {tab === "yuborish" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Message compose */}
              <div
                className="shrink-0 border-b p-4"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-600 uppercase">
                    Xabar matni
                  </label>
                  <span
                    className={`text-[10px] tabular-nums ${charCount > 160 ? "text-yellow-400" : "text-gray-700"}`}
                  >
                    {charCount} belgi · {smsCount} SMS
                  </span>
                </div>
                <div
                  className="relative rounded-xl border transition-all"
                  style={{
                    borderColor: message
                      ? "rgba(59,130,246,0.35)"
                      : "rgba(255,255,255,0.08)",
                    background: "#0a1929",
                    boxShadow: message
                      ? "0 0 0 3px rgba(59,130,246,0.08)"
                      : "none",
                  }}
                >
                  <textarea
                    ref={textRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="SMS xabar matnini kiriting..."
                    rows={3}
                    className="w-full resize-none bg-transparent px-4 pt-3 pb-10 text-sm text-white placeholder-gray-700 outline-none"
                    style={{ maxHeight: 200 }}
                  />
                  {/* char indicator bottom bar */}
                  <div className="absolute right-0 bottom-0 left-0 px-4 pb-3">
                    <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((charCount / 160) * 100, 100)}%`,
                          background: charCount > 140 ? "#f59e0b" : "#3b82f6",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick templates */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    "Hurmatli mijoz, sizga maxsus taklif bor!",
                    "Yangi uylar haqida ma'lumot olish uchun bog'laning.",
                    "Sizni ko'rishdan xursand bo'lamiz!",
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      onClick={() => setMessage(tpl)}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[10px] text-gray-600 transition-colors hover:border-blue-500/30 hover:text-blue-400"
                    >
                      <Zap size={9} className="mr-1 inline" />
                      {tpl.slice(0, 22)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Lead selector */}
              <div
                className="flex shrink-0 items-center justify-between border-b px-4 py-2.5"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-[11px] text-gray-500">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => setSelectAll(e.target.checked)}
                      className="h-3.5 w-3.5 rounded accent-blue-500"
                    />
                    Barchasi
                  </label>
                  {selected.size > 0 && (
                    <span className="rounded-full bg-blue-500/20 px-2 py-px text-[10px] font-bold text-blue-400">
                      {selected.size} ta
                    </span>
                  )}
                </div>
                {/* Status filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1 text-[11px] text-gray-500 outline-none"
                >
                  <option value="all">Barcha status</option>
                  {uniqueStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div
                className="shrink-0 border-b px-4 py-2"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
                  <Search size={12} className="text-gray-700" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Mijoz ismi yoki telefon..."
                    className="flex-1 bg-transparent text-xs text-white placeholder-gray-700 outline-none"
                  />
                  {search && (
                    <button onClick={() => setSearch("")}>
                      <X size={12} className="text-gray-600 hover:text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lead list */}
              <div className="scrollbar-hide flex-1 overflow-y-auto p-3">
                {filteredLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                    <Users size={28} className="text-gray-800" />
                    <p className="text-xs text-gray-600">Mijozlar topilmadi</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {filteredLeads.map((l) => (
                      <LeadRow
                        key={l.id}
                        lead={l}
                        checked={selected.has(l.id)}
                        onToggle={toggleLead}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Send button */}
              <div
                className="shrink-0 border-t p-4"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
              >
                <button
                  onClick={handleSend}
                  disabled={sending || selected.size === 0 || !message.trim()}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-black tracking-wide text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30"
                  style={{
                    background:
                      sending || selected.size === 0 || !message.trim()
                        ? "rgba(255,255,255,0.05)"
                        : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                    boxShadow:
                      selected.size > 0 && message.trim()
                        ? "0 4px 24px rgba(59,130,246,0.4)"
                        : "none",
                  }}
                >
                  {sending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Yuborilmoqda...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      {selected.size > 0
                        ? `${selected.size} ta mijozga yuborish`
                        : "Yuborish"}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── TARIX tab ── */}
          {tab === "tarix" && (
            <div className="scrollbar-hide flex-1 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <Clock size={32} className="text-gray-800" />
                  <p className="text-sm text-gray-600">Tarix bo'sh</p>
                  <p className="text-xs text-gray-700">
                    Birinchi SMS yuborilganda bu yerda ko'rinadi
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {history.map((item, i) => (
                    <HistoryRow key={item.id ?? i} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: stats + preview ──────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Stats grid */}
          <div
            className="shrink-0 border-b p-5"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-gray-700 uppercase">
              Statistika
            </p>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <StatCard
                icon={Send}
                label="Jami"
                value={stats?.total}
                color="#3b82f6"
                delay={0}
              />
              <StatCard
                icon={CheckCheck}
                label="Yuborildi"
                value={stats?.sent}
                color="#10b981"
                delay={0.05}
              />
              <StatCard
                icon={Clock}
                label="Kutilmoqda"
                value={stats?.pending}
                color="#f59e0b"
                delay={0.1}
              />
              <StatCard
                icon={XCircle}
                label="Xato"
                value={stats?.failed}
                color="#ef4444"
                delay={0.15}
              />
            </div>
          </div>

          {/* SMS Preview */}
          <div className="flex flex-1 flex-col items-center justify-center overflow-auto p-6">
            <p className="mb-5 text-[11px] font-semibold tracking-wider text-gray-700 uppercase">
              SMS ko'rinishi
            </p>

            {/* Phone mockup */}
            <div className="relative w-72">
              {/* phone frame */}
              <div
                className="rounded-[2.5rem] border-4 border-white/10 bg-[#0a1929] p-3 shadow-2xl"
                style={{
                  boxShadow:
                    "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
                }}
              >
                {/* notch */}
                <div className="mb-4 flex justify-center">
                  <div className="h-1.5 w-20 rounded-full bg-white/10" />
                </div>

                {/* SMS bubble */}
                <div className="min-h-48 rounded-2xl bg-[#071828] p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold">
                      P
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-white">
                        ProHome
                      </p>
                      <p className="text-[9px] text-gray-600">SMS</p>
                    </div>
                  </div>

                  {message ? (
                    <div
                      className="rounded-2xl rounded-tl-sm bg-blue-600 px-3.5 py-2.5 text-xs leading-relaxed text-white"
                      style={{ boxShadow: "0 4px 16px rgba(59,130,246,0.3)" }}
                    >
                      {message}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-center text-[11px] text-gray-700">
                        Xabar matni kiritilganda
                        <br />
                        bu yerda ko'rinadi
                      </p>
                    </div>
                  )}

                  {message && (
                    <div className="mt-2 text-right text-[9px] text-gray-700">
                      {new Date().toLocaleTimeString("uz-UZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>

                {/* home indicator */}
                <div className="mt-3 flex justify-center">
                  <div className="h-1 w-24 rounded-full bg-white/10" />
                </div>
              </div>

              {/* Glow */}
              <div
                className="pointer-events-none absolute -inset-4 rounded-[3rem] opacity-20"
                style={{
                  background:
                    "radial-gradient(ellipse at center, #3b82f6 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />
            </div>

            {/* Selected summary */}
            {selected.size > 0 && (
              <div
                className="mt-6 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-2.5 text-sm"
                style={{ animation: "fadeUp .3s ease both" }}
              >
                <Users size={14} className="text-blue-400" />
                <span className="font-semibold text-blue-300">
                  {selected.size}
                </span>
                <span className="text-gray-500">ta mijoz tanlangan</span>
                {charCount > 0 && (
                  <>
                    <span className="text-gray-700">·</span>
                    <span className="text-gray-500">{smsCount} SMS</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .scrollbar-hide::-webkit-scrollbar { display:none }
        .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none }
      `}</style>
    </div>
  );
}
