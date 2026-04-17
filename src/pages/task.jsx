import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Calendar,
  Search,
  Ban,
  Phone,
  User,
  Clock,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  LayoutList,
  Columns3,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import KotibamLoader from "@/components/KotibamLoader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;
const IMAGE_BASE = "https://back.prohome.uz/api/v1/image";

function getImageUrl(src) {
  if (!src) return null;
  if (src.startsWith("http") || src.startsWith("blob:")) return src;
  return `${API}/image/${src}`;
}

const API_STATUSES = {
  STARTED: { label: "Jarayonda", color: "#f59e0b" },
  FINISHED: { label: "Bajarildi", color: "#10b981" },
  CANCELED: { label: "Bekor qilingan", color: "#ef4444" },
};

const TYPES = {
  task: { label: "Vazifa", color: "#3b82f6" },
  call: { label: "Qo'ng'iroq", color: "#10b981" },
  meeting: { label: "Uchrashuv", color: "#8b5cf6" },
};

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isOverdue(dateStr, status) {
  if (status === "FINISHED" || !dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function isFutureTask(dateStr, status) {
  if (status === "FINISHED" || !dateStr) return false;
  return dateStr.slice(0, 10) > getLocalDateKey();
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
  });
}

function formatPhone(phone) {
  if (!phone) return null;
  return phone.replace(/(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
}

function Avatar({ name, size = 7 }) {
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
      className={`flex h-${size} w-${size} shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white`}
      style={{ background: clrs[idx] }}
    >
      {initials}
    </div>
  );
}

function SourceIcon({ source }) {
  if (!source) return null;
  const url = getImageUrl(source.icon);
  if (url) {
    return (
      <img
        src={url}
        alt={source.name}
        title={source.name}
        className="h-4 w-4 rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }
  return (
    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-gray-500">
      {source.name}
    </span>
  );
}

function SortIcon({ field, sortBy, dir }) {
  if (sortBy !== field)
    return <ChevronsUpDown size={12} className="text-gray-600" />;
  return dir === "asc" ? (
    <ChevronUp size={12} className="text-blue-400" />
  ) : (
    <ChevronDown size={12} className="text-blue-400" />
  );
}

export default function Tasks() {
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("taskDate");
  const [sortDir, setSortDir] = useState("desc");
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("tasks:viewMode") || "table",
  );
  const [previewTask, setPreviewTask] = useState(null);
  const [previewDescription, setPreviewDescription] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sortedColumns, setSortedColumns] = useState({
    pastTasks: [],
    todayTasks: [],
    futureTasks: [],
  });

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchSortedColumns = async (signal) => {
    const res = await fetch(`${API}/tasks/sort/${projectId}`, {
      headers: authHeaders,
      signal,
    });
    if (!res.ok) throw new Error("TASK_SORT_FETCH_FAILED");
    const data = await res.json();
    setSortedColumns({
      pastTasks: Array.isArray(data?.pastTasks) ? data.pastTasks : [],
      todayTasks: Array.isArray(data?.todayTasks) ? data.todayTasks : [],
      futureTasks: Array.isArray(data?.futureTasks) ? data.futureTasks : [],
    });
  };

  const fetchTasks = async (signal) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (dateFrom) params.set("fromDate", dateFrom);
    if (dateTo) params.set("toDate", dateTo);
    const query = params.toString();
    const url = `${API}/tasks/${projectId}${query ? `?${query}` : ""}`;
    const res = await fetch(url, {
      headers: authHeaders,
      signal,
    });
    if (!res.ok) throw new Error("TASK_FETCH_FAILED");
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : (data?.data ?? []));
  };

  useEffect(() => {
    localStorage.setItem("tasks:viewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    if (filterStatus !== "all") params.set("status", filterStatus);
    else params.delete("status");

    if (dateFrom) params.set("fromDate", dateFrom);
    else params.delete("fromDate");

    if (dateTo) params.set("toDate", dateTo);
    else params.delete("toDate");

    if (activeTab !== "all") params.set("tab", activeTab);
    else params.delete("tab");

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
    window.history.replaceState(null, "", nextUrl);
  }, [search, filterStatus, dateFrom, dateTo, activeTab]);

  useEffect(() => {
    if (!token || !projectId) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchTasks(controller.signal),
          fetchSortedColumns(controller.signal),
        ]);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          toast.error("Ma'lumotlar yuklanmadi");
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [token, projectId, search, filterStatus, dateFrom, dateTo]);

  useEffect(() => {
    if (!previewTask) {
      setPreviewDescription("");
      setPreviewLoading(false);
      return;
    }

    const leadId = previewTask.leads?.id;
    if (!leadId) {
      setPreviewDescription(previewTask.description || "—");
      return;
    }

    const controller = new AbortController();
    const loadTaskDetails = async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch(`${API}/tasks/by-lead/${leadId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        const matched = list.find((t) => t.id === previewTask.id);
        setPreviewDescription(
          matched?.description || previewTask.description || "—",
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setPreviewDescription(previewTask.description || "—");
        }
      } finally {
        setPreviewLoading(false);
      }
    };

    loadTaskDetails();
    return () => controller.abort();
  }, [previewTask, token]);

  const handleToggle = async (task) => {
    const newStatus = task.status === "FINISHED" ? "STARTED" : "FINISHED";
    setTasks((p) =>
      p.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
    );
    try {
      const res = await fetch(`${API}/tasks/${task.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      await fetchSortedColumns();
    } catch {
      setTasks((p) =>
        p.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)),
      );
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleCancelTask = async (task) => {
    if (!task || task.status === "CANCELED") return;
    const prev = tasks;
    setTasks((p) =>
      p.map((t) => (t.id === task.id ? { ...t, status: "CANCELED" } : t)),
    );
    try {
      const res = await fetch(`${API}/tasks/${task.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: "CANCELED" }),
      });
      if (!res.ok) throw new Error();
      await fetchSortedColumns();
      toast.success("Vazifa bekor qilindi ✅");
    } catch {
      setTasks(prev);
      toast.error("Bekor qilishda xato ❌");
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const today = getLocalDateKey();

  const stats = {
    today: tasks.filter(
      (t) => t.taskDate?.slice(0, 10) === today && t.status !== "FINISHED",
    ).length,
    overdue: tasks.filter((t) => isOverdue(t.taskDate, t.status)).length,
    future: tasks.filter((t) => isFutureTask(t.taskDate, t.status)).length,
    all: tasks.length,
  };

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => {
        const taskDay = t.taskDate ? t.taskDate.slice(0, 10) : "";
        if (activeTab === "today" && taskDay !== today) return false;
        if (activeTab === "overdue" && !isOverdue(t.taskDate, t.status))
          return false;
        if (activeTab === "future" && !isFutureTask(t.taskDate, t.status))
          return false;
        return true;
      })
      .sort((a, b) => {
        let va, vb;
        if (sortBy === "lead") {
          va = a.leads ? `${a.leads.firstName} ${a.leads.lastName}` : "";
          vb = b.leads ? `${b.leads.firstName} ${b.leads.lastName}` : "";
        } else if (sortBy === "status") {
          va = a.status ?? "";
          vb = b.status ?? "";
        } else {
          va = a[sortBy] ?? "";
          vb = b[sortBy] ?? "";
        }
        if (va < vb) return sortDir === "asc" ? -1 : 1;
        if (va > vb) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [
    tasks,
    activeTab,
    sortBy,
    sortDir,
  ]);

  const hasFilters =
    filterStatus !== "all" ||
    dateFrom ||
    dateTo ||
    search ||
    activeTab !== "all";

  if (loading) {
    return (
      <KotibamLoader
        minHeight="100%"
        className="h-full rounded-none border-0 bg-[#071828]"
      />
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#071828]">
      {/* Grid bg */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Header ── */}
      <div className="relative z-10 shrink-0 border-b border-white/5 bg-[#071828]/90 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-white">Vazifalar</h1>
            <p className="text-xs text-gray-600">{stats.all} ta vazifa</p>
          </div>
          <div className="flex max-w-sm flex-1 items-center gap-2 rounded-xl border border-white/5 bg-white/3 px-3 py-2">
            <Search size={14} className="shrink-0 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Vazifa yoki mijoz ismi..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            />
          </div>
        </div>

        {/* Tabs + Filters */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "Barchasi", count: stats.all, alert: false },
            {
              key: "today",
              label: "Bugun",
              count: stats.today,
              alert: stats.today > 0,
            },
            {
              key: "overdue",
              label: "Muddati o'tgan",
              count: stats.overdue,
              alert: stats.overdue > 0,
            },
            {
              key: "future",
              label: "Kelgusi tasklar",
              count: stats.future,
              alert: stats.future > 0,
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
                  activeTab === tab.key
                    ? "bg-white/12 text-white"
                    : "bg-white/5 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}

          <div className="mx-1 h-4 w-px bg-white/5" />

          {/* Status select */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-white/5 bg-white/3 px-2 py-1.5 text-xs text-gray-400 outline-none"
          >
            <option value="all">Barcha holat</option>
            {Object.entries(API_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>

          {/* Date range */}
          <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/3 px-3 py-1.5">
            <Filter size={12} className="text-gray-600" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-xs text-gray-400 [color-scheme:dark] outline-none"
            />
            <span className="text-gray-600">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-xs text-gray-400 [color-scheme:dark] outline-none"
            />
          </div>

          {hasFilters && (
            <button
              onClick={() => {
                setFilterStatus("all");
                setDateFrom("");
                setDateTo("");
                setSearch("");
                setActiveTab("all");
              }}
              className="text-xs text-gray-600 transition-colors hover:text-red-400"
            >
              Tozalash ✕
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-white/5 bg-white/3 p-0.5">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors ${
                  viewMode === "table"
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <LayoutList size={12} />
                Table
              </button>
              <button
                onClick={() => setViewMode("column")}
                className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors ${
                  viewMode === "column"
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Columns3 size={12} />
                Column
              </button>
            </div>
            <span className="text-xs text-gray-600">
              {filtered.length} ta natija
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex-1 overflow-auto px-6 py-4">
        {viewMode === "column" ? (
          <div className="grid min-w-[980px] grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[
              {
                key: "past",
                label: "O'tgan vazifalar",
                color: "#ef4444",
                tasks: sortedColumns.pastTasks,
              },
              {
                key: "today",
                label: "Bugungi vazifalar",
                color: "#0ea5e9",
                tasks: sortedColumns.todayTasks,
              },
              {
                key: "future",
                label: "Kelgusi vazifalar",
                color: "#22c55e",
                tasks: sortedColumns.futureTasks,
              },
            ].map((column) => {
              const columnTasks = Array.isArray(column.tasks) ? column.tasks : [];
              return (
                <div
                  key={column.key}
                  className="rounded-xl border border-white/5 bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: column.color }}
                      />
                      <p
                        className="text-xs font-semibold"
                        style={{ color: column.color }}
                      >
                        {column.label}
                      </p>
                    </div>
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="flex max-h-[calc(100vh-270px)] flex-col gap-2 overflow-auto p-3">
                    {columnTasks.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-white/10 px-3 py-6 text-center text-xs text-gray-600">
                        Vazifa yo'q
                      </div>
                    ) : (
                      columnTasks.map((task, i) => {
                        const isDone = task.status === "FINISHED";
                        const isCanceled = task.status === "CANCELED";
                        const isResolved = isDone || isCanceled;
                        const overdue = isOverdue(task.taskDate, task.status);
                        const type = TYPES[task.type] || TYPES.task;
                        const lead = task.leads;
                        const leadName = lead
                          ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim()
                          : null;
                        const leadPhone = lead?.phone;
                        const assignedUser =
                          lead?.assignedUser || task.assignedUser;
                        const remaining =
                          task.taskRemainingDays ?? lead?.taskRemainingDays;

                        return (
                          <div
                            key={task.id}
                            className={`group rounded-xl border border-white/5 bg-[#0a1d30] p-3 transition-colors hover:border-white/15 ${isResolved ? "opacity-60" : ""} ${isCanceled ? "border-red-500/20 bg-red-500/[0.04]" : ""}`}
                            style={{
                              animation: `taskIn .25s ease ${i * 0.03}s both`,
                            }}
                          >
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <button
                                onClick={() => handleToggle(task)}
                                className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                              >
                                {isDone ? (
                                  <CheckCircle2
                                    size={16}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <Circle
                                    size={16}
                                    className="text-gray-600 hover:text-blue-400"
                                  />
                                )}
                              </button>
                              <button
                                onClick={() => handleCancelTask(task)}
                                disabled={task.status === "CANCELED"}
                                className="text-gray-700 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                <Ban size={13} />
                              </button>
                            </div>

                            <div className="mb-2 flex min-w-0 items-center gap-2">
                              <span
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{
                                  background: type.color,
                                  boxShadow: `0 0 5px ${type.color}`,
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewTask(task)}
                                className={`text-left text-sm transition-colors hover:text-white hover:underline ${
                                  isCanceled
                                    ? "text-red-300/80 line-through decoration-red-400/70"
                                    : isDone
                                      ? "text-gray-500 line-through"
                                      : "text-gray-200"
                                }`}
                                title={task.description || ""}
                              >
                                <span className="block truncate">
                                  {task.description || "—"}
                                </span>
                              </button>
                              <span
                                className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold"
                                style={{
                                  color:
                                    API_STATUSES[task.status]?.color ||
                                    "#6b7280",
                                  background: `${
                                    API_STATUSES[task.status]?.color ||
                                    "#6b7280"
                                  }20`,
                                }}
                              >
                                {API_STATUSES[task.status]?.label ||
                                  "Kutilmoqda"}
                              </span>
                            </div>

                            {leadName && (
                              <div className="mb-2 flex items-center gap-1.5">
                                <Avatar name={leadName} size={5} />
                                <Link
                                  to={`/leadDetails?leadId=${lead?.id}`}
                                  className="text-xs text-gray-300 transition-colors hover:text-white hover:underline"
                                >
                                  {leadName}
                                </Link>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                              <span
                                className={`flex items-center gap-1 ${overdue ? "text-red-400" : ""}`}
                              >
                                {overdue && <AlertCircle size={10} />}
                                <Calendar size={10} />
                                {formatDate(task.taskDate)}
                              </span>
                              {remaining != null && !isResolved && (
                                <span
                                  className={`flex items-center gap-1 ${remaining <= 1 ? "text-red-400" : ""}`}
                                >
                                  <Clock size={10} />
                                  {remaining > 0 ? `${remaining} kun` : "Bugun"}
                                </span>
                              )}
                              {leadPhone && (
                                <a
                                  href={`tel:${leadPhone}`}
                                  className="flex items-center gap-1 transition-colors hover:text-blue-400"
                                >
                                  <Phone size={10} />
                                  {formatPhone(leadPhone)}
                                </a>
                              )}
                              {assignedUser?.fullName && (
                                <span className="flex items-center gap-1">
                                  <User size={10} />
                                  {assignedUser.fullName}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <CheckCircle2 size={40} className="text-gray-700" />
            <p className="text-sm font-medium text-gray-500">
              Vazifalar topilmadi
            </p>
            <p className="text-xs text-gray-700">
              Filter o'zgartiring yoki yangi vazifa qo'shing
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  { key: "status", label: "Holat" },
                  { key: "lead", label: "Mijoz" },
                  { key: "description", label: "Vazifa" },
                  { key: "taskDate", label: "Sana" },
                  { key: "assignedUser", label: "Mas'ul" },
                  { key: "remaining", label: "Qoldi" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="cursor-pointer px-4 py-3 text-left text-[11px] font-medium tracking-wider text-gray-600 uppercase transition-colors select-none hover:text-gray-300"
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      <SortIcon field={col.key} sortBy={sortBy} dir={sortDir} />
                    </div>
                  </th>
                ))}
                <th className="w-8 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((task, i) => {
                const isDone = task.status === "FINISHED";
                const isCanceled = task.status === "CANCELED";
                const isResolved = isDone || isCanceled;
                const overdue = isOverdue(task.taskDate, task.status);
                const type = TYPES[task.type] || TYPES.task;
                const statusInfo = API_STATUSES[task.status] || {
                  label: "Noma'lum",
                  color: "#6b7280",
                };
                const lead = task.leads;
                const leadName = lead
                  ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim()
                  : null;
                const leadPhone = lead?.phone;
                const leadSource = lead?.leadSource;
                const leadStatus = lead?.status;
                const assignedUser = lead?.assignedUser || task.assignedUser;
                const remaining =
                  task.taskRemainingDays ?? lead?.taskRemainingDays;

                return (
                  <tr
                    key={task.id}
                    className={`group border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] ${isResolved ? "opacity-60" : ""} ${isCanceled ? "bg-red-500/[0.03]" : ""}`}
                    style={{ animation: `taskIn .25s ease ${i * 0.03}s both` }}
                  >
                    {/* Holat */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(task)}
                          className="shrink-0 transition-transform hover:scale-110"
                        >
                          {isDone ? (
                            <CheckCircle2
                              size={16}
                              className="text-green-500"
                            />
                          ) : (
                            <Circle
                              size={16}
                              className="text-gray-600 hover:text-blue-400"
                            />
                          )}
                        </button>
                        <span
                          className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            color: statusInfo.color,
                            background: `${statusInfo.color}18`,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    </td>

                    {/* Mijoz */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {leadName ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <Avatar name={leadName} size={5} />
                              <Link
                                to={`/leadDetails?leadId=${lead?.id}`}
                                className={`text-sm font-medium transition-colors hover:underline ${
                                  isCanceled
                                    ? "text-red-300/80 line-through decoration-red-400/70"
                                    : isDone
                                      ? "text-gray-500 line-through"
                                      : "text-white"
                                }`}
                              >
                                {leadName}
                              </Link>
                              {leadStatus && (
                                <span
                                  className="rounded px-1.5 py-px text-[9px] font-semibold"
                                  style={{
                                    color: leadStatus.color || "#94a3b8",
                                    background: `${leadStatus.color || "#94a3b8"}20`,
                                  }}
                                >
                                  {leadStatus.name}
                                </span>
                              )}
                            </div>
                            {leadPhone && (
                              <a
                                href={`tel:${leadPhone}`}
                                className="flex items-center gap-1 text-[10px] text-gray-600 transition-colors hover:text-blue-400"
                              >
                                <Phone size={9} />
                                {formatPhone(leadPhone)}
                              </a>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </div>
                    </td>

                    {/* Vazifa */}
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{
                            background: type.color,
                            boxShadow: `0 0 5px ${type.color}`,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewTask(task)}
                          className={`text-left text-sm transition-colors hover:text-white hover:underline ${
                            isCanceled
                              ? "text-red-300/80 line-through decoration-red-400/70"
                              : isDone
                                ? "text-gray-500 line-through"
                                : "text-gray-200"
                          }`}
                          title={task.description || ""}
                        >
                          <span className="block max-w-[420px] truncate">
                            {task.description || "—"}
                          </span>
                        </button>
                      </div>
                      {leadSource && (
                        <div className="mt-1 flex items-center gap-1">
                          <SourceIcon source={leadSource} />
                          <span className="text-[10px] text-gray-600">
                            {leadSource.name}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Sana */}
                    <td className="px-4 py-3">
                      <div
                        className={`flex items-center gap-1.5 text-xs ${overdue ? "text-red-400" : "text-gray-500"}`}
                      >
                        {overdue && <AlertCircle size={10} />}
                        <Calendar size={10} />
                        {formatDate(task.taskDate)}
                      </div>
                    </td>

                    {/* Mas'ul */}
                    <td className="px-4 py-3">
                      {assignedUser?.fullName ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-[9px] font-bold text-blue-400">
                            {assignedUser.fullName[0]}
                          </div>
                          {assignedUser.fullName}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-700">—</span>
                      )}
                    </td>

                    {/* Qoldi */}
                    <td className="px-4 py-3">
                      {isDone ? (
                        <span className="text-[10px] text-green-500">
                          ✓ Tugadi
                        </span>
                      ) : isCanceled ? (
                        <span className="text-[10px] text-red-400">
                          Bekor qilingan
                        </span>
                      ) : overdue ? (
                        <span className="text-[10px] text-red-400">
                          Kechikdi
                        </span>
                      ) : remaining != null && remaining > 0 ? (
                        <div
                          className={`flex items-center gap-1 text-xs ${remaining <= 1 ? "text-red-400" : "text-gray-500"}`}
                        >
                          <Clock size={10} />
                          {remaining} kun
                        </div>
                      ) : (
                        <span className="text-xs text-gray-700">—</span>
                      )}
                    </td>

                    {/* Delete */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleCancelTask(task)}
                        disabled={task.status === "CANCELED"}
                        className="text-gray-700 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Ban size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Dialog
        open={Boolean(previewTask)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewTask(null);
            setPreviewDescription("");
          }
        }}
      >
        <DialogContent className="border-white/10 bg-[#0b1b2a] text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base">Task tafsiloti</DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              To'liq task matni
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {previewTask?.leads && (
              <p className="text-xs text-gray-500">
                Mijoz:{" "}
                <span className="text-gray-300">
                  {`${previewTask.leads.firstName || ""} ${previewTask.leads.lastName || ""}`.trim() ||
                    "—"}
                </span>
              </p>
            )}
            <div className="max-h-[55vh] overflow-auto rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm leading-6 whitespace-pre-wrap text-gray-200">
              {previewLoading ? "Yuklanmoqda..." : previewDescription || "—"}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes taskIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
