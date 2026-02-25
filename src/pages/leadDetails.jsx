import { useEffect, useState, useRef } from "react";
import {
  Phone,
  MapPin,
  Tag,
  MessageSquare,
  ChevronLeft,
  MoreVertical,
  HandCoins,
  SendHorizonal,
  Calendar,
  MessageCircle,
  CheckSquare,
  ArrowRightLeft,
  Clock,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

// ─────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMonthYear = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("uz-UZ", {
    month: "long",
    year: "numeric",
  });
};

const maxBirthDate = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
})();

// ─────────────────────────────────────────────────────────────────────────
// EVENT CONFIG
// ─────────────────────────────────────────────────────────────────────────
const EVENT_CFG = {
  Description: { icon: MessageCircle, color: "#3b82f6", label: "Izoh" },
  tasks: { icon: CheckSquare, color: "#10b981", label: "Task" },
  message: { icon: MessageSquare, color: "#3b82f6", label: "Xabar" },
  status_change: {
    icon: ArrowRightLeft,
    color: "#8b5cf6",
    label: "Status o'zgardi",
  },
  default: { icon: Tag, color: "#6b7280", label: "Hodisa" },
};
const getCfg = (type) => EVENT_CFG[type] || EVENT_CFG.default;

const INPUT_TYPES = [
  {
    value: "Description",
    label: "Izoh",
    icon: MessageCircle,
    color: "#3b82f6",
    placeholder: "Izoh yozing...",
  },
  {
    value: "tasks",
    label: "Task",
    icon: CheckSquare,
    color: "#10b981",
    placeholder: "Vazifani kiriting...",
  },
];

// ─────────────────────────────────────────────────────────────────────────
// EVENT CARD
// ─────────────────────────────────────────────────────────────────────────
function EventCard({ event }) {
  const cfg = getCfg(event.type);
  const Icon = cfg.icon;
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
        className="bg-white/025 mb-3 flex-1 overflow-hidden rounded-xl border border-white/[0.05] p-4 transition-colors group-hover:bg-white/4"
        style={{ borderLeft: `2px solid ${cfg.color}35` }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
              style={{ color: cfg.color, background: `${cfg.color}15` }}
            >
              {cfg.label}
            </span>
            {event.user?.role && (
              <span className="text-xs text-gray-600">{event.user.role}</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-600">
            <Clock size={10} />
            {formatDateTime(event.createdAt)}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-gray-300">
          {event.text || event.description}
        </p>

        {/* Task: muddat ko'rsat */}
        {event.type === "tasks" && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
            >
              <CheckSquare size={11} /> Vazifa yaratildi
            </span>
            {event.taskDate && (
              <span
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
                style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}
              >
                <Calendar size={11} /> {formatDateTime(event.taskDate)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// INPUT BAR  ← asosiy o'zgarish shu yerda
// ─────────────────────────────────────────────────────────────────────────
function InputBar({ onSubmit, sending }) {
  const [text, setText] = useState("");
  const [type, setType] = useState(INPUT_TYPES[0]);
  const [taskDate, setTaskDate] = useState(""); // ← yangi state
  const textareaRef = useRef(null);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 130) + "px";
  }, [text]);

  // Type o'zgarganda date ni tozalash
  const handleTypeChange = (t) => {
    setType(t);
    if (t.value !== "tasks") setTaskDate("");
  };

  const submit = () => {
    if (!text.trim() || sending) return;
    onSubmit(text.trim(), type.value, taskDate || null);
    setText("");
    setTaskDate("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const TypeIcon = type.icon;
  const isTask = type.value === "tasks";

  return (
    <div
      className="sticky bottom-0 z-10 border-t px-5 py-4"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        background: "linear-gradient(to top, #071828 70%, rgba(7,24,40,0.88))",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="mx-auto max-w-3xl space-y-2.5">
        {/* ── Type tabs + date picker ──────────────────────────── */}
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1.5">
            {INPUT_TYPES.map((t) => {
              const TIcon = t.icon;
              const active = type.value === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => handleTypeChange(t)}
                  className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all"
                  style={{
                    color: active ? t.color : "#4b5563",
                    background: active ? `${t.color}12` : "transparent",
                    border: `1px solid ${active ? `${t.color}25` : "transparent"}`,
                  }}
                >
                  <TIcon size={12} />
                  {t.label}
                  {active && (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: t.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Task date picker — faqat task tanlanganda ─────── */}
          {isTask && (
            <div
              className="flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all"
              style={{
                borderColor: taskDate
                  ? "rgba(16,185,129,0.3)"
                  : "rgba(255,255,255,0.07)",
                background: taskDate
                  ? "rgba(16,185,129,0.06)"
                  : "rgba(255,255,255,0.03)",
              }}
            >
              <Calendar
                size={13}
                style={{ color: taskDate ? "#10b981" : "#4b5563" }}
              />
              <input
                type="datetime-local"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className="bg-transparent text-xs text-white [color-scheme:dark] outline-none"
                style={{ color: taskDate ? "#fff" : "#6b7280" }}
              />
            </div>
          )}

          <span className="ml-auto text-[11px] text-gray-700">Ctrl+Enter</span>
        </div>

        {/* ── Textarea + Send ──────────────────────────────────── */}
        <div className="flex items-end gap-2.5">
          <div
            className="flex flex-1 items-start gap-3 rounded-xl px-4 py-3 transition-all duration-200"
            style={{
              background: "#0c1e2e",
              border: `1px solid ${text ? `${type.color}30` : "rgba(255,255,255,0.06)"}`,
              boxShadow: text ? `0 0 0 3px ${type.color}08` : "none",
            }}
          >
            <TypeIcon
              size={15}
              className="mt-0.5 shrink-0"
              style={{ color: text ? type.color : "#374151" }}
            />
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
              }}
              placeholder={type.placeholder}
              rows={2}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
              style={{ lineHeight: "1.6", maxHeight: 130 }}
            />
          </div>

          <button
            onClick={submit}
            disabled={!text.trim() || sending}
            className="flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30"
            style={{
              background: text.trim()
                ? `linear-gradient(135deg, ${type.color}, ${type.color}88)`
                : "rgba(255,255,255,0.04)",
              border: `1px solid ${text.trim() ? `${type.color}35` : "rgba(255,255,255,0.05)"}`,
              boxShadow: text.trim() ? `0 4px 16px ${type.color}35` : "none",
            }}
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <>
                <span>Yuborish</span>
                <SendHorizonal size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────
const LeadDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get("leadId");
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");

  const [dealData, setDealData] = useState(null);
  const [events, setEvents] = useState([]);
  const [leadSource, setLeadSource] = useState([]);
  const [activeTab, setActiveTab] = useState("asosiy");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // ── Parallel fetch ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !leadId) return;
    const init = async () => {
      try {
        const [leadRes, descRes, sourceRes] = await Promise.all([
          fetch(`${API}/leeds/${leadId}`, { headers }),
          fetch(`${API}/Description/lead/${leadId}?projectId=${projectId}`, {
            headers,
          }),
          fetch(`${API}/lead-source/${projectId}`, { headers }),
        ]);
        if (leadRes.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        const [lead, descs, sources] = await Promise.all([
          leadRes.json(),
          descRes.ok ? descRes.json() : [],
          sourceRes.ok ? sourceRes.json() : [],
        ]);
        setDealData(lead);
        setEvents(Array.isArray(descs) ? descs : []);
        setLeadSource(Array.isArray(sources) ? sources : []);
      } catch (err) {
        console.error(err);
        toast.error("Ma'lumotlar yuklanmadi");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Refresh events ──────────────────────────────────────────────────
  const refreshEvents = async () => {
    try {
      const res = await fetch(
        `${API}/Description/lead/${leadId}?projectId=${projectId}`,
        { headers },
      );
      if (res.ok) setEvents(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  // ── Post comment / task  ← taskDate ham qabul qiladi ───────────────
  const handlePostDesc = async (text, type, taskDate) => {
    setSending(true);
    try {
      if (type === "tasks") {
        const body = {
          projectId: Number(projectId),
          leadsId: Number(leadId),
          description: text,
          // taskDate bor bo'lsa ISO formatda yuborish
          ...(taskDate && { taskDate: new Date(taskDate).toISOString() }),
        };
        const res = await fetch(`${API}/tasks`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch(`${API}/Description`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            projectId: Number(projectId),
            leadsId: Number(leadId),
            text,
          }),
        });
        if (!res.ok) throw new Error();
      }
      await refreshEvents();
      toast.success(
        type === "tasks" ? "Task qo'shildi ✅" : "Izoh qo'shildi ✅",
      );
    } catch {
      toast.error("Yuborishda xato ❌");
    } finally {
      setSending(false);
    }
  };

  // ── Update lead ─────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDealData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      firstName: dealData.firstName,
      lastName: dealData.lastName,
      phone: dealData.phone,
      extraPhone: dealData.extraPhone,
      adress: dealData.adress,
      budjet: Number(dealData.budjet),
      leadSourceId: Number(dealData.leadSourceId),
      projectId: Number(projectId),
      tag: dealData.tag,
      birthDate: dealData.birthDate
        ? new Date(dealData.birthDate).toISOString().split("T")[0]
        : undefined,
    };
    toast.promise(
      fetch(`${API}/leeds/${leadId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      }).then((res) => {
        if (!res.ok) throw new Error();
      }),
      {
        loading: "Saqlanmoqda...",
        success: "Yangilandi ✅",
        error: "Xatolik ❌",
      },
    );
  };

  // ─────────────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#071828] text-gray-200">
        <div className="flex w-96 shrink-0 flex-col border-r border-white/[0.05] bg-[#0a1929]">
          <div className="border-b border-white/[0.05] p-5">
            <div className="mb-3 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-xl bg-white/5" />
              <Skeleton className="h-5 w-28 rounded-lg bg-white/5" />
            </div>
            <Skeleton className="h-6 w-16 rounded-lg bg-white/5" />
          </div>
          <div className="border-b border-white/[0.05] p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-full bg-white/5" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded bg-white/5" />
                <Skeleton className="h-3 w-16 rounded bg-white/5" />
              </div>
            </div>
          </div>
          <div className="space-y-4 p-5">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-9 w-full rounded-xl bg-white/[0.03]"
                />
              ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex justify-end border-b border-white/[0.05] p-4">
            <Skeleton className="h-8 w-36 rounded-full bg-white/5" />
          </div>
          <div className="flex-1 space-y-3 p-6">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-24 w-full rounded-xl bg-white/[0.03]"
                />
              ))}
          </div>
          <div className="border-t border-white/[0.05] p-5">
            <Skeleton className="h-20 w-full rounded-xl bg-white/[0.03]" />
          </div>
        </div>
      </div>
    );
  }

  if (!dealData) return null;

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#071828] text-gray-200">
      {/* ═══════════ LEFT PANEL ═══════════ */}
      <div
        className="flex w-96 shrink-0 flex-col overflow-hidden border-r"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0a1929" }}
      >
        {/* Header */}
        <div
          className="shrink-0 border-b px-5 py-4"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <h1 className="text-base font-semibold text-white">
                Bitim #{dealData.id}
              </h1>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] text-gray-500 hover:text-white">
              <MoreVertical size={15} />
            </button>
          </div>
          {dealData.tag && (
            <span
              className="inline-block rounded-lg px-3 py-1 text-xs font-medium"
              style={{
                background: "rgba(59,130,246,0.12)",
                color: "#60a5fa",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              #{dealData.tag}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div
          className="shrink-0 border-b px-5 py-4"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-white"
              style={{ background: "linear-gradient(135deg,#1d4ed8,#7c3aed)" }}
            >
              {dealData.firstName?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-white">
                {dealData.firstName} {dealData.lastName}
              </p>
              <p className="text-xs text-gray-600">#{dealData.id} mijoz</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex shrink-0 border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          {["Asosiy", "Tahrirlash"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className="flex-1 border-b-2 py-3 text-xs font-semibold transition-all"
              style={{
                borderBottomColor:
                  activeTab === tab.toLowerCase() ? "#3b82f6" : "transparent",
                color: activeTab === tab.toLowerCase() ? "#60a5fa" : "#6b7280",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="scrollbar-hide flex-1 overflow-y-auto">
          {activeTab === "asosiy" && (
            <div className="space-y-4 p-5">
              <div>
                <p className="mb-0.5 text-[11px] text-gray-600 uppercase">
                  Loyiha
                </p>
                <p className="text-sm font-medium text-white">
                  {dealData?.project?.name || "—"}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-[11px] text-gray-600 uppercase">
                  Budjet
                </p>
                <div className="flex items-center gap-2">
                  <HandCoins size={14} className="text-yellow-400" />
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(dealData.budjet)}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-0.5 text-[11px] text-gray-600 uppercase">
                  Operator
                </p>
                <p className="text-sm text-white">
                  {dealData?.assignedUser?.fullName || "—"}
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-[11px] text-gray-600 uppercase">
                  Manba
                </p>
                <p className="text-sm text-white">
                  {dealData?.leadSource?.name || "—"}
                </p>
              </div>
              <div
                className="border-t pt-4"
                style={{ borderColor: "rgba(255,255,255,0.05)" }}
              >
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] text-gray-600">Tel raqam</p>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="shrink-0 text-blue-400" />
                      <a
                        href={`tel:${dealData.phone}`}
                        className="text-sm text-blue-400 hover:underline"
                      >
                        {dealData.phone || "—"}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600">
                      Qo'shimcha raqam
                    </p>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="shrink-0 text-blue-400" />
                      <a
                        href={`tel:${dealData.extraPhone}`}
                        className="text-sm text-blue-400 hover:underline"
                      >
                        {dealData.extraPhone || "—"}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600">Tug'ilgan sana</p>
                    <div className="flex items-center gap-2">
                      <Calendar
                        size={13}
                        className="shrink-0 text-yellow-400"
                      />
                      <p className="text-sm text-white">
                        {formatDate(dealData.birthDate)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600">Manzil</p>
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="shrink-0 text-red-400" />
                      <p className="text-sm text-white">
                        {dealData.adress || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tahrirlash" && (
            <form className="p-5 text-white" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Ism</FieldLabel>
                    <Input
                      type="text"
                      name="firstName"
                      value={dealData.firstName || ""}
                      onChange={handleChange}
                      placeholder="Ism"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Familiya</FieldLabel>
                    <Input
                      type="text"
                      name="lastName"
                      value={dealData.lastName || ""}
                      onChange={handleChange}
                      placeholder="Familiya"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Tug'ilgan sana</FieldLabel>
                  <Input
                    type="date"
                    name="birthDate"
                    value={dealData.birthDate?.slice(0, 10) ?? ""}
                    onChange={handleChange}
                    max={maxBirthDate}
                  />
                  <p className="mt-0.5 text-[11px] text-gray-600">
                    18 yoshdan katta (max: {maxBirthDate.slice(0, 4)}-yil)
                  </p>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Telefon</FieldLabel>
                    <Input
                      type="tel"
                      name="phone"
                      value={dealData.phone || ""}
                      onChange={handleChange}
                      placeholder="+998 __ ___ __ __"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Qo'shimcha</FieldLabel>
                    <Input
                      type="tel"
                      name="extraPhone"
                      value={dealData.extraPhone || ""}
                      onChange={handleChange}
                      placeholder="+998 __ ___ __ __"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Manzil</FieldLabel>
                  <Input
                    type="text"
                    name="adress"
                    value={dealData.adress || ""}
                    onChange={handleChange}
                    placeholder="Manzil"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>Budjet</FieldLabel>
                    <Input
                      type="number"
                      name="budjet"
                      value={dealData.budjet || ""}
                      onChange={handleChange}
                      placeholder="so'm"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Manba</FieldLabel>
                    <Select
                      value={
                        dealData.leadSourceId
                          ? String(dealData.leadSourceId)
                          : ""
                      }
                      onValueChange={(v) =>
                        setDealData((prev) => ({
                          ...prev,
                          leadSourceId: parseInt(v),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tanlang..." />
                      </SelectTrigger>
                      <SelectContent className="mt-2">
                        {leadSource.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Teg</FieldLabel>
                  <Input
                    type="text"
                    name="tag"
                    value={dealData.tag || ""}
                    onChange={handleChange}
                    placeholder="Teg..."
                  />
                </Field>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("asosiy")}
                    className="flex-1 text-gray-400 hover:text-white"
                  >
                    Bekor
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500"
                  >
                    Saqlash
                  </Button>
                </div>
              </FieldGroup>
            </form>
          )}
        </div>
      </div>

      {/* ═══════════ RIGHT PANEL ═══════════ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Status bar */}
        <div
          className="flex shrink-0 items-center justify-end border-b px-5 py-3"
          style={{
            borderColor: "rgba(255,255,255,0.05)",
            background: "#071828",
          }}
        >
          {dealData?.status && (
            <div
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-white"
              style={{
                background: dealData.status.color || "#3b82f6",
                boxShadow: `0 2px 12px ${dealData.status.color || "#3b82f6"}50`,
              }}
            >
              {dealData.status.name}
            </div>
          )}
        </div>

        {/* Events feed */}
        <div className="scrollbar-hide flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto h-[50vh] max-w-2xl">
            {dealData.createdAt && (
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/4" />
                <span className="rounded-full border border-white/6 bg-white/2 px-4 py-1 text-xs text-gray-600">
                  {formatMonthYear(dealData.createdAt)}
                </span>
                <div className="h-px flex-1 bg-white/4" />
              </div>
            )}
            {dealData.createdAt && (
              <div className="mb-4 flex items-center gap-2 text-xs text-gray-700">
                <Tag size={10} />
                {formatDateTime(dealData.createdAt)} • Lead yaratildi
              </div>
            )}
            {events.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <MessageSquare size={36} className="text-gray-800" />
                <p className="text-sm text-gray-600">Hali faoliyat yo'q</p>
                <p className="text-xs text-gray-700">
                  Izoh yoki task qo'shish uchun pastdagi maydondan foydalaning
                </p>
              </div>
            ) : (
              events.map((event) => <EventCard key={event.id} event={event} />)
            )}
          </div>
        </div>

        {/* Input bar */}
        <InputBar onSubmit={handlePostDesc} sending={sending} />
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LeadDetails;
