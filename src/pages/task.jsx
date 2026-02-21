import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  Search,
  Trash2,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

// ── API statuslar (backend qiymatlari) ────────────────────────────────────
// Backend: "STARTED" | "DONE" | "PENDING"  (kelajakda kengayishi mumkin)
const API_STATUSES = {
  STARTED: { label: "Jarayonda", color: "#f59e0b" },
  PENDING: { label: "Kutilmoqda", color: "#6b7280" },
  DONE: { label: "Bajarildi", color: "#10b981" },
};

const TYPES = {
  task: { label: "Vazifa", color: "#3b82f6" },
  call: { label: "Qo'ng'iroq", color: "#10b981" },
  meeting: { label: "Uchrashuv", color: "#8b5cf6" },
};

// ── Helpers ───────────────────────────────────────────────────────────────
function isOverdue(dateStr, status) {
  if (status === "DONE") return false;
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
  });
}

function Avatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  const clrs = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
  ];
  const idx = name ? name.charCodeAt(0) % clrs.length : 0;
  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ background: clrs[idx] }}
    >
      {initials}
    </div>
  );
}

// ── Add Task Drawer ───────────────────────────────────────────────────────
function AddTaskDrawer({ onClose, onAdd, leads = [] }) {
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");

  const [form, setForm] = useState({
    description: "",
    taskDate: "",
    type: "task",
    leadsId: "",
  });
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.description.trim()) {
      toast.error("Tavsif kiriting");
      return;
    }

    setBusy(true);
    try {
      const body = {
        description: form.description.trim(),
        projectId: Number(projectId),
        status: "PENDING",
        ...(form.taskDate && {
          taskDate: new Date(form.taskDate).toISOString(),
        }),
        ...(form.leadsId && { leadsId: Number(form.leadsId) }),
      };

      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      onAdd(data);
      toast.success("Vazifa qo'shildi ✅");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Qo'shishda xato ❌");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn .2s ease both" }}
      />
      <div
        className="fixed top-0 right-0 z-50 flex h-full w-[400px] flex-col border-l border-white/5"
        style={{
          background: "linear-gradient(180deg,#0d1f33 0%,#071828 100%)",
          animation: "slideIn .25s cubic-bezier(.32,.72,0,1) both",
          boxShadow: "-24px 0 60px rgba(0,0,0,.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div>
            <p className="text-xs tracking-widest text-gray-500 uppercase">
              Yangi
            </p>
            <p className="text-base font-semibold text-white">
              Vazifa qo'shish
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/5 text-gray-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Vazifa tavsifi *
            </label>
            <textarea
              autoFocus
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Nima qilish kerak?"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/15 focus:bg-white/[0.06]"
            />
          </div>

          {/* Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Turi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TYPES).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => set("type", k)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs transition-all ${
                    form.type === k
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: v.color }}
                  />
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Muddat
            </label>
            <input
              type="datetime-local"
              value={form.taskDate}
              onChange={(e) => set("taskDate", e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-white/[0.04] px-4 py-2.5 text-sm text-white [color-scheme:dark] outline-none focus:border-white/15"
            />
          </div>

          {/* Lead */}
          {leads.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Lead (ixtiyoriy)
              </label>
              <select
                value={form.leadsId}
                onChange={(e) => set("leadsId", e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-white/[0.04] px-4 py-2.5 text-sm text-white [color-scheme:dark] outline-none focus:border-white/15"
              >
                <option value="">— Tanlang —</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.firstName} {l.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 p-6">
          <button
            onClick={submit}
            disabled={busy || !form.description.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-40"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Check size={15} />
            )}
            {busy ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Task Row ──────────────────────────────────────────────────────────────
function TaskRow({ task, onToggle, onDelete, style }) {
  const overdue = isOverdue(task.taskDate, task.status);
  const isDone = task.status === "DONE";
  const type = TYPES[task.type] || TYPES.task;
  const statusInfo = API_STATUSES[task.status] || API_STATUSES.PENDING;

  return (
    <div
      className={`group flex items-center gap-4 rounded-xl border px-4 py-3 transition-all duration-150 ${
        isDone
          ? "border-white/[0.03] bg-white/[0.01] opacity-55"
          : "border-white/[0.05] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]"
      }`}
      style={style}
    >
      {/* Toggle */}
      <button
        onClick={() => onToggle(task)}
        className="shrink-0 transition-transform hover:scale-110"
      >
        {isDone ? (
          <CheckCircle2 size={18} className="text-green-500" />
        ) : (
          <Circle size={18} className="text-gray-600 hover:text-blue-400" />
        )}
      </button>

      {/* Type dot */}
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: type.color, boxShadow: `0 0 5px ${type.color}` }}
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${isDone ? "text-gray-500 line-through" : "text-white"}`}
        >
          {task.description}
        </p>
        {task.lead && (
          <p className="mt-0.5 truncate text-xs text-gray-600">
            {task.lead.firstName} {task.lead.lastName}
          </p>
        )}
      </div>

      {/* Status badge */}
      <span
        className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold"
        style={{ color: statusInfo.color, background: `${statusInfo.color}18` }}
      >
        {statusInfo.label}
      </span>

      {/* Date */}
      {task.taskDate && (
        <div
          className={`flex shrink-0 items-center gap-1 text-xs ${
            overdue
              ? "text-red-400"
              : isDone
                ? "text-gray-600"
                : "text-gray-500"
          }`}
        >
          {overdue && <AlertCircle size={11} />}
          <Calendar size={11} />
          {formatDate(task.taskDate)}
        </div>
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        className="shrink-0 text-gray-700 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function Tasks() {
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");

  const [showAdd, setShowAdd] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // ── Fetch tasks + leads parallel ────────────────────────────────────
  useEffect(() => {
    if (!token || !projectId) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const [taskRes, leadRes] = await Promise.all([
          fetch(`${API}/tasks/${projectId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API}/leeds?projectId=${projectId}`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (taskRes.ok) {
          const data = await taskRes.json();
          setTasks(Array.isArray(data) ? data : (data.data ?? []));
        }
        if (leadRes.ok) {
          const data = await leadRes.json();
          setLeads(data.data ?? []);
        }
      } catch (err) {
        console.error(err);
        toast.error("Ma'lumotlar yuklanmadi");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ── Toggle status ────────────────────────────────────────────────────
  const handleToggle = async (task) => {
    const newStatus = task.status === "DONE" ? "STARTED" : "DONE";

    // Optimistic
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
    );

    try {
      const res = await fetch(`${API}/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)),
      );
      toast.error("Xatolik yuz berdi");
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const prev = tasks;
    setTasks((p) => p.filter((t) => t.id !== id));

    try {
      const res = await fetch(`${API}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Vazifa o'chirildi ✅");
    } catch {
      setTasks(prev);
      toast.error("O'chirishda xato ❌");
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);

  const filtered = tasks.filter((t) => {
    const taskDay = t.taskDate ? t.taskDate.slice(0, 10) : "";
    if (search && !t.description?.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterType !== "all" && t.type !== filterType) return false;
    if (activeTab === "today" && taskDay !== today) return false;
    if (activeTab === "overdue" && !isOverdue(t.taskDate, t.status))
      return false;
    return true;
  });

  // ── Stats ────────────────────────────────────────────────────────────
  const stats = {
    yesterday: tasks.length,
    today: tasks.filter(
      (t) => t.taskDate?.slice(0, 10) === today && t.status !== "DONE",
    ).length,
    overdue: tasks.filter((t) => isOverdue(t.taskDate, t.status)).length,
  };

  const active = filtered.filter((t) => t.status !== "DONE");
  const done = filtered.filter((t) => t.status === "DONE");

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen flex-col bg-[#071828]">
        <div className="border-b border-white/5 px-6 py-4">
          <div className="h-6 w-32 animate-pulse rounded-lg bg-white/5" />
        </div>
        <div className="flex flex-col gap-2 p-6">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-white/[0.03]"
                style={{ animationDelay: `${i * 0.07}s` }}
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#071828]">
      {/* Grid bg */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="relative z-10 border-b border-white/5 bg-[#071828]/90 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">Vazifalar</h1>
            <p className="text-xs text-gray-600">{stats.all} ta vazifa</p>
          </div>

          {/* Search */}
          <div className="flex max-w-sm flex-1 items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
            <Search size={14} className="shrink-0 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            />
          </div>
        </div>

        {/* Tabs + Filters */}
        <div className="mt-3 flex flex-wrap items-center gap-1">
          {[
            {
              key: "overdue",
              label: "Muddati o'tgan",
              count: stats.overdue,
              alert: stats.overdue > 0,
            },
            {
              key: "today",
              label: "Bugun",
              count: stats.today,
              alert: stats.today > 0,
            },
            {
              key: "yesterday",
              label: "Ertangi",
              count: stats.yesterday,
              alert: status.yesterday > 0,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  tab.alert
                    ? "bg-red-500/20 text-red-400"
                    : "bg-white/5 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}

          <div className="mx-1 h-4 w-px bg-white/5" />

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-xs text-gray-400 [color-scheme:dark] outline-none"
          >
            <option value="all">Barcha holat</option>
            {Object.entries(API_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          {/* Type filter */}
          {/* <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-xs text-gray-400 [color-scheme:dark] outline-none"
          >
            <option value="all">Barcha turlar</option>
            {Object.entries(TYPES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select> */}
        </div>
      </div>

      {/* ── Task list ───────────────────────────────────────────────── */}
      <div className="scrollbar-hide relative flex-1 overflow-y-auto px-6 py-4">
        {active.length === 0 && done.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <CheckCircle2 size={40} className="text-gray-700" />
            <p className="text-sm font-medium text-gray-500">
              Vazifalar topilmadi
            </p>
            <p className="text-xs text-gray-700">
              Filter o'zgartiring yoki yangi vazifa qo'shing
            </p>
          </div>
        )}

        {active.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold tracking-wider text-gray-600 uppercase">
              Bajarilishi kerak — {active.length}
            </p>
            <div className="flex flex-col gap-2">
              {active.map((t, i) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  style={{ animation: `taskIn .3s ease ${i * 0.04}s both` }}
                />
              ))}
            </div>
          </div>
        )}

        {done.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wider text-gray-700 uppercase">
              Bajarildi — {done.length}
            </p>
            <div className="flex flex-col gap-2">
              {done.map((t, i) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  style={{ animation: `taskIn .3s ease ${i * 0.04}s both` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add drawer */}
      {/* {showAdd && (
        <AddTaskDrawer
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          leads={leads}
        />
      )} */}

      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes taskIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
