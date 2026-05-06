import { useState, useEffect, useRef } from "react";
import {
  Plus,
  FolderOpen,
  AlertCircle,
  Loader2,
  CalendarCheck2,
  // TaskSquare,
  Settings,
  Search,
  X,
  Upload,
  Download,
  MoreHorizontal,
  History,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useExcelWorker } from "../hooks/Useexcelworker";
import { MANAGEMENT_ROLES, ROLES, getCurrentRole } from "@/lib/rbac";
import { toast } from "@/lib/toast";
import { useVoiceVisualizer, VoiceVisualizer } from "react-voice-visualizer";
import HorizontalScrollDock from "@/components/HorizontalScrollDock";
import KotibamLoader from "@/components/KotibamLoader";

//test

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;
const TRASH_DROPPABLE_ID = "__lead_trash__";

const maxBirthDate = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
})();

async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("user");
  const headers = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  if (
    !(options.body instanceof FormData) &&
    !Object.keys(headers).some((key) => key.toLowerCase() === "content-type")
  ) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
  return res;
}

async function extractApiMessage(res, fallback) {
  try {
    const text = await res.text();
    if (!text) return fallback;
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed?.message === "string" && parsed.message.trim()) {
        return parsed.message;
      }
      if (Array.isArray(parsed?.message) && parsed.message.length > 0) {
        return String(parsed.message[0]);
      }
      return fallback;
    } catch {
      return text.trim() || fallback;
    }
  } catch {
    return fallback;
  }
}

async function parseJsonSafeResponse(res, fallback = null) {
  if (!res) return fallback;
  try {
    const text = await res.text();
    if (!text) return fallback;
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function extractUsersFromPayload(payload) {
  const candidates = [
    payload,
    payload?.data,
    payload?.items,
    payload?.users,
    payload?.results,
    payload?.result,
    payload?.data?.items,
    payload?.data?.users,
    payload?.data?.results,
    payload?.result?.items,
    payload?.result?.users,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function normalizeOperator(user) {
  if (!user) return null;
  const id = user.id ?? user.userId ?? user._id;
  if (!id) return null;

  const fullName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.name ||
    "";

  return {
    id: Number(id),
    fullName,
    email: user.email || "",
    role: user.role,
  };
}

async function fetchProjectOperators(projectId) {
  const params = new URLSearchParams();
  if (projectId) params.set("projectId", String(projectId));
  params.set("limit", "100");
  params.set("page", "1");
  const query = params.toString();
  const res = await apiFetch(
    `${API}/user/all/sales-manager${query ? `?${query}` : ""}`,
  );
  if (!res || !res.ok) return [];
  const payload = await res.json();
  const users = extractUsersFromPayload(payload);
  return users
    .map(normalizeOperator)
    .filter(Boolean)
    .map((user) => ({ ...user, id: Number(user.id) }));
}

function applyDrag(statuses, source, destination, draggableId) {
  const srcId = Number(source.droppableId);
  const dstId = Number(destination.droppableId);
  const dragged = statuses
    .flatMap((s) => s.leads)
    .find((l) => String(l.id) === draggableId);
  if (!dragged) return statuses;
  if (srcId === dstId && source.index === destination.index) return statuses;
  return statuses.map((status) => {
    if (srcId === dstId && status.id === srcId) {
      const items = status.leads.filter((l) => String(l.id) !== draggableId);
      items.splice(destination.index, 0, { ...dragged, statusId: dstId });
      return { ...status, leads: items };
    }
    if (status.id === srcId)
      return {
        ...status,
        leads: status.leads.filter((l) => String(l.id) !== draggableId),
      };
    if (status.id === dstId) {
      const items = [...status.leads];
      items.splice(destination.index, 0, { ...dragged, statusId: dstId });
      return { ...status, leads: items };
    }
    return status;
  });
}

function formatCommentDate(days) {
  if (days === 0 || days === "0") return "Bugun";
  const d = new Date();
  d.setDate(d.getDate() - Number(days));
  return d.toLocaleDateString("ru-RU");
}

function buildTaskBadgeMeta(rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return null;
  }

  const normalized = String(rawValue).trim();
  if (!normalized) return null;

  const styles = {
    positive: {
      text: "text-sky-300",
      border: "border border-sky-400/40",
      bg: "bg-sky-600/10",
    },
    today: {
      text: "text-emerald-300",
      border: "border border-emerald-400/40",
      bg: "bg-emerald-600/10",
    },
    overdue: {
      text: "text-rose-300",
      border: "border border-rose-500/40",
      bg: "bg-rose-600/10",
    },
  };

  const numeric = Number(normalized);
  if (!Number.isNaN(numeric)) {
    if (numeric === 0) {
      return {
        label: "Bugungi task",
        ...styles.today,
      };
    }
    if (numeric > 0) {
      return {
        label: `${numeric} kun qoldi`,
        ...styles.positive,
      };
    }
    const daysAgo = Math.abs(numeric);
    return {
      label: `Muddati tugagan${daysAgo ? ` (${daysAgo} kun)` : ""}`,
      ...styles.overdue,
    };
  }

  if (normalized.startsWith("-")) {
    const payload = normalized.slice(1).trim();
    const suffix = payload ? ` (${payload} kun)` : "";
    return {
      label: `Muddati tugagan${suffix}`,
      ...styles.overdue,
    };
  }

  return {
    label: normalized,
    text: "text-gray-300",
    border: "border border-white/[0.08]",
    bg: "bg-white/[0.02]",
  };
}

const DEFAULT_SEARCH_PARAMS = {
  search: "",
  statusId: "",
  leadSourceId: "",
  assignedUserId: "",
  budjetFrom: "",
  budjetTo: "",
  adress: "",
  birthDateFrom: "",
  birthDateTo: "",
  createdFrom: "",
  createdTo: "",
};
const PAGE_LIMIT = 10;

function normalizeAiPhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("998")) return `+${digits.slice(0, 12)}`;
  return `+998${digits.slice(0, 9)}`;
}

function formatPhoneDisplay(raw) {
  const normalized = normalizeAiPhone(raw);
  if (!normalized) return "";

  const digits = normalized.replace(/\D/g, "");
  const country = digits.slice(0, 3);
  const part1 = digits.slice(3, 5);
  const part2 = digits.slice(5, 8);
  const part3 = digits.slice(8, 10);
  const part4 = digits.slice(10, 12);

  return ["+" + country, part1, part2, part3, part4].filter(Boolean).join(" ");
}

function normalizeBudgetInput(raw) {
  return String(raw || "").replace(/\D/g, "");
}

function formatBudgetDisplay(raw) {
  const digits = normalizeBudgetInput(raw);
  if (!digits) return "";
  return Number(digits).toLocaleString("ru-RU");
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeAiDate(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    const [d, m, y] = value.split(".");
    return `${y}-${m}-${d}`;
  }
  return "";
}

function parseAiLeadDraft(text) {
  const source = String(text || "");
  const pick = (regex) => source.match(regex)?.[1]?.trim() || "";

  const firstName =
    pick(/(?:ism|name)\s*[:\-]\s*([^\n,;]+)/i) ||
    pick(/(?:mijoz|klient)\s*[:\-]\s*([^\n,;]+)/i);
  const lastName = pick(/(?:familiya|surname|last name)\s*[:\-]\s*([^\n,;]+)/i);
  const phone = normalizeAiPhone(
    pick(/(?:telefon|phone|raqam)\s*[:\-]\s*([+()\d\s-]{7,})/i),
  );
  const extraPhone = normalizeAiPhone(
    pick(
      /(?:qo'?shimcha|ikkinchi)\s*(?:telefon|phone)?\s*[:\-]\s*([+()\d\s-]{7,})/i,
    ),
  );
  const adress = pick(/(?:manzil|address)\s*[:\-]\s*([^\n]+)/i);
  const budjet = pick(/(?:budjet|byudjet|budget)\s*[:\-]\s*([\d\s]+)/i).replace(
    /\s+/g,
    "",
  );
  const birthDate = normalizeAiDate(
    pick(/(?:tug['’]?ilgan sana|birth ?date)\s*[:\-]\s*([0-9.\-]{8,10})/i),
  );
  const tagsRaw = pick(/(?:teg|tag|tags)\s*[:\-]\s*([^\n]+)/i);
  const tags = tagsRaw
    ? tagsRaw
        .split(/[;,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return {
    firstName,
    lastName,
    phone,
    extraPhone,
    adress,
    budjet,
    birthDate,
    tags,
  };
}

function buildAiDraftFromObject(payload) {
  if (!payload || typeof payload !== "object") return null;

  const firstName = String(
    payload.firstName || payload.name || payload.clientName || "",
  ).trim();
  const lastName = String(
    payload.lastName || payload.surname || payload.familyName || "",
  ).trim();
  const phone = normalizeAiPhone(payload.phone || payload.phoneNumber || "");
  const extraPhone = normalizeAiPhone(
    payload.extraPhone || payload.additionalPhone || payload.secondPhone || "",
  );
  const adress = String(payload.adress || payload.address || "").trim();
  const budjetRaw = payload.budjet ?? payload.byudjet ?? payload.budget ?? "";
  const budjet = String(budjetRaw).replace(/[^\d]/g, "");
  const birthDate = normalizeAiDate(
    payload.birthDate || payload.birthday || payload.dateOfBirth || "",
  );
  const rawTags = Array.isArray(payload.tags)
    ? payload.tags
    : Array.isArray(payload.tag)
      ? payload.tag
      : typeof payload.tags === "string"
        ? payload.tags.split(/[;,]/)
        : typeof payload.tag === "string"
          ? payload.tag.split(/[;,]/)
          : [];
  const tags = rawTags.map((item) => String(item || "").trim()).filter(Boolean);

  return {
    firstName,
    lastName,
    phone,
    extraPhone,
    adress,
    budjet,
    birthDate,
    tags,
  };
}

function hasAiDraftData(draft) {
  if (!draft) return false;
  return Object.entries(draft).some(([key, value]) => {
    if (key === "tags") return Array.isArray(value) && value.length > 0;
    return String(value || "").trim() !== "";
  });
}

function resolveAiAudioPayload(payload) {
  const candidates = [
    payload,
    payload?.data,
    payload?.result,
    payload?.payload,
    payload?.response,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const draft = parseAiLeadDraft(candidate);
      return {
        transcript: candidate.trim(),
        draft,
      };
    }

    if (candidate && typeof candidate === "object") {
      const transcriptCandidates = [
        candidate.transcript,
        candidate.text,
        candidate.content,
        candidate.description,
        candidate.rawText,
        candidate.message,
      ];
      const transcript = transcriptCandidates.find(
        (item) => typeof item === "string" && item.trim(),
      );
      const objectDraft = buildAiDraftFromObject(candidate);

      if (hasAiDraftData(objectDraft)) {
        return {
          transcript: transcript?.trim() || "",
          draft: objectDraft,
        };
      }

      if (transcript) {
        return {
          transcript: transcript.trim(),
          draft: parseAiLeadDraft(transcript),
        };
      }
    }
  }

  return {
    transcript: "",
    draft: parseAiLeadDraft(""),
  };
}

function getAudioFileExtension(mimeType) {
  const normalized = String(mimeType || "").toLowerCase();
  if (normalized.includes("ogx") || normalized.includes("application/ogg")) {
    return "ogx";
  }
  if (normalized.includes("ogg")) return "ogg";
  if (normalized.includes("mpeg") || normalized.includes("mp3")) return "mp3";
  if (normalized.includes("wav")) return "wav";
  return "webm";
}

const SEARCH_DATE_KEYS = new Set([
  "birthDateFrom",
  "birthDateTo",
  "createdFrom",
  "createdTo",
]);

function toIsoDate(value, endOfDay = false) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return `${raw}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split("-");
    return `${y}-${m}-${d}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`;
  }
  return raw;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("uz-UZ");
}

function orderStatusesByOrder(statusList, order) {
  if (!order || !order.length) return statusList;
  const indexMap = new Map(statusList.map((status) => [status.id, status]));
  const ordered = order.map((id) => indexMap.get(Number(id))).filter(Boolean);
  const remaining = statusList.filter((status) => !order.includes(status.id));
  return [...ordered, ...remaining];
}

function buildStatusMetrics(statuses) {
  return statuses.reduce((acc, status) => {
    acc[status.id] = {
      leadCount: Number(status.leadCount ?? 0),
      leadBudjet: Number(status.leadBudjet ?? 0),
    };
    return acc;
  }, {});
}

function buildSearchQuery(paramsState, projectId) {
  const params = new URLSearchParams();
  Object.entries(paramsState).forEach(([key, value]) => {
    let normalized = String(value ?? "").trim();
    if (!normalized) return;
    if (SEARCH_DATE_KEYS.has(key)) {
      const isTo = key.endsWith("To");
      params.set(key, toIsoDate(normalized, isTo));
      return;
    }
    // Phone number search: strip spaces/dashes/parens so "91 234 56 78" matches "912345678"
    if (key === "search" && /^[+\d\s\-()]+$/.test(normalized)) {
      normalized = normalized.replace(/[\s\-()]/g, "");
    }
    params.set(key, normalized);
  });
  if (projectId) params.set("projectId", String(projectId));
  return params;
}

function normalizeLead(raw) {
  const normalizedTags = Array.isArray(raw?.tag)
    ? raw.tag.map((t) => (typeof t === "string" ? t : t?.name)).filter(Boolean)
    : [];
  return {
    ...raw,
    id: Number(raw?.id),
    statusId: Number(raw?.statusId),
    tag: normalizedTags,
  };
}

// ── Icon button — iconOnly: faqat icon, aks holda icon+text ──────────────────
function IconBtn({
  icon: Icon,
  label,
  onClick,
  className = "",
  disabled = false,
  variant = "default",
  iconOnly = false,
  spin = false,
}) {
  const colors = {
    default:
      "border-[#2a4868] text-gray-300 hover:bg-[#1b3e57] hover:text-white",
    success:
      "border-green-700/50 text-green-400 hover:bg-green-900/30 hover:text-green-300",
    warning:
      "border-yellow-700/50 text-yellow-400 hover:bg-yellow-900/30 hover:text-yellow-300",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors duration-150 disabled:opacity-40 ${colors[variant]} ${className}`}
      style={{ height: "36px" }}
    >
      <Icon size={14} className={`shrink-0 ${spin ? "animate-spin" : ""}`} />
      {!iconOnly && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
}

export default function Pipeline() {
  const navigate = useNavigate();
  const boardRef = useRef(null);
  const isDragging = useRef(false);
  const scrollRAF = useRef(null);
  const searchWrapRef = useRef(null);
  const actionsWrapRef = useRef(null);
  const searchInputRef = useRef(null);

  const [viewedLeadIds] = useState(
    () => new Set(JSON.parse(localStorage.getItem("viewedLeadIds") || "[]")),
  );

  const [appState, setAppState] = useState("loading");
  const [projects, setProjects] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [leadSource, setLeadSource] = useState([]);
  const [statusTotals, setStatusTotals] = useState({
    totalSum: 0,
    totalLeads: 0,
    order: [],
    metrics: {},
  });
  const [currentProject, setCurrentProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiListening, setAiListening] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiTranscript, setAiTranscript] = useState("");
  const [aiDraft, setAiDraft] = useState(parseAiLeadDraft(""));
  const speechRef = useRef(null);
  const recorderControls = useVoiceVisualizer();
  const {
    recordedBlob,
    error: recorderError,
    clearCanvas,
    isRecordingInProgress,
    isProcessingRecordedAudio,
    isAvailableRecordedAudio,
  } = recorderControls;

  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    ...DEFAULT_SEARCH_PARAMS,
  });
  const [searchStatuses, setSearchStatuses] = useState(null);
  const [searchSummary, setSearchSummary] = useState(null);
  const [statusMeta, setStatusMeta] = useState({});
  const [operatorsList, setOperatorsList] = useState([]);
  const [operatorsLoading, setOperatorsLoading] = useState(false);
  const [trashVisible, setTrashVisible] = useState(false);
  const [trashActive, setTrashActive] = useState(false);
  const [pendingDeleteLead, setPendingDeleteLead] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingLead, setDeletingLead] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const role = getCurrentRole();
  const canManageStatuses = MANAGEMENT_ROLES.includes(role);
  const canDeleteLeads = [ROLES.SUPERADMIN, ROLES.ROP].includes(role);
  const showToast = (message, type = "error") =>
    type === "success" ? toast.success(message) : toast.error(message);

  const updateSearchParam = (key, value) => {
    setSearchParams((prev) => ({ ...prev, [key]: value }));
  };

  const hasActiveSearch = Object.values(searchParams).some(
    (v) => String(v ?? "").trim() !== "",
  );

  const initializeStatusMeta = (statusList) => {
    const initial = {};
    statusList.forEach((s) => {
      initial[s.id] = {
        page: 0,
        limit: PAGE_LIMIT,
        total: 0,
        loaded: 0,
        hasMore: true,
        loading: false,
      };
    });
    setStatusMeta(initial);
  };

  const applyStatusTotals = (payload, fallbackStatuses = []) => {
    const payloadStatuses = Array.isArray(payload?.statuses)
      ? payload.statuses
      : [];
    const metricSource = payloadStatuses.length
      ? payloadStatuses
      : fallbackStatuses;
    const order = Array.isArray(payload?.statusOrder)
      ? payload.statusOrder.map((id) => Number(id))
      : [];

    setStatusTotals({
      totalSum: Number(payload?.totalSum ?? 0),
      totalLeads: Number(payload?.totalLeads ?? 0),
      order,
      metrics: buildStatusMetrics(metricSource),
    });

    return { payloadStatuses, order };
  };

  const loadOperatorsForProject = async (projectId) => {
    if (!projectId) {
      setOperatorsList([]);
      return;
    }
    setOperatorsLoading(true);
    try {
      const list = await fetchProjectOperators(projectId);
      setOperatorsList(list);
    } catch (err) {
      console.error("Operatorlar yuklanmadi:", err);
      showToast("Operatorlar yuklanmadi", "error");
      setOperatorsList([]);
    } finally {
      setOperatorsLoading(false);
    }
  };

  const {
    pickImportFile,
    exportCSV,
    loading: workerLoading,
  } = useExcelWorker();

  const fetchLeadsByStatus = async (statusId, page = 1, append = false) => {
    setStatusMeta((prev) => ({
      ...prev,
      [statusId]: {
        ...(prev[statusId] || {}),
        loading: true,
      },
    }));

    try {
      const res = await apiFetch(
        `${API}/leeds/by/${statusId}?page=${page}&limit=${PAGE_LIMIT}`,
      );
      if (!res) return;
      if (!res.ok) {
        const msg = await extractApiMessage(res, "Leadlar yuklanmadi");
        showToast(msg, "error");
        return;
      }

      const json = await res.json();
      const rawLeads = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];
      const leads = rawLeads.map(normalizeLead);
      const meta = json?.meta || {};

      setStatuses((prev) =>
        prev.map((s) => {
          if (Number(s.id) !== Number(statusId)) return s;
          if (!append) return { ...s, leads };
          const existingIds = new Set((s.leads || []).map((l) => Number(l.id)));
          const nextChunk = leads.filter((l) => !existingIds.has(Number(l.id)));
          return { ...s, leads: [...(s.leads || []), ...nextChunk] };
        }),
      );

      setStatusMeta((prev) => {
        const prevMeta = prev[statusId] || {
          page: 0,
          limit: PAGE_LIMIT,
          total: 0,
          loaded: 0,
          hasMore: true,
        };
        const loaded = append ? prevMeta.loaded + leads.length : leads.length;
        const total = Number(meta.total ?? loaded);
        const limit = Number(meta.limit ?? PAGE_LIMIT);
        const currentPage = Number(meta.page ?? page);
        return {
          ...prev,
          [statusId]: {
            ...prevMeta,
            page: currentPage,
            limit,
            total,
            loaded,
            hasMore: loaded < total,
            loading: false,
          },
        };
      });
    } catch {
      showToast("Leadlarni yuklashda xatolik", "error");
      setStatusMeta((prev) => ({
        ...prev,
        [statusId]: {
          ...(prev[statusId] || {}),
          loading: false,
        },
      }));
    }
  };

  const handleLeadOpen = async (leadId, isDraggingCard) => {
    if (isDraggingCard) return;

    // Faqat Sales Manager uchun 403 ni oldindan tutamiz
    if (role === ROLES.SALESMANAGER) {
      try {
        const res = await apiFetch(`${API}/leeds/${leadId}`);
        if (!res) return;
        if (res.status === 403) {
          const msg = await extractApiMessage(
            res,
            "Bu lead tafsilotini ko'rishga ruxsat yo'q",
          );
          showToast(msg, "error");
          return;
        }
        if (!res.ok) {
          const msg = await extractApiMessage(res, "Lead tafsiloti ochilmadi");
          showToast(msg, "error");
          return;
        }
      } catch {
        showToast("Lead tafsilotini tekshirishda xatolik", "error");
        return;
      }
    }

    setStatuses((prev) =>
      prev.map((status) => ({
        ...status,
        leads: status.leads.map((l) =>
          l.id === leadId ? { ...l, isViewed: true } : l,
        ),
      })),
    );

    navigate(`/leadDetails?leadId=${leadId}`);
  };

  const handleImport = async () => {
    await toast.promise(
      (async () => {
        if (!currentProject?.id) {
          throw new Error("Loyiha tanlanmagan");
        }
        const file = await pickImportFile();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", String(currentProject.id));

        const res = await apiFetch(`${API}/leeds/import-excel`, {
          method: "POST",
          body: formData,
        });
        if (!res) {
          throw new Error("Sessiya tugagan");
        }
        if (!res.ok) {
          const msg = await extractApiMessage(res, "Import xatosi");
          throw new Error(msg);
        }

        const payload = await res.json().catch(() => ({}));
        const importedCount = Number(
          payload?.count ??
            payload?.data?.count ??
            payload?.importedCount ??
            payload?.data?.importedCount ??
            payload?.total ??
            payload?.data?.total ??
            (Array.isArray(payload?.data)
              ? payload.data.length
              : Array.isArray(payload)
                ? payload.length
                : 0),
        );

        await loadProject({
          id: currentProject.id,
          name: currentProject.name,
        });

        return importedCount;
      })(),
      {
        loading: "Import qilinmoqda...",
        success: (count) =>
          count > 0
            ? `${count} ta mijoz import qilindi`
            : "Mijozlar muvaffaqiyatli import qilindi",
        error: (err) => {
          if (err?.message === "Fayl tanlanmadi") return "Import bekor qilindi";
          return "Import xatosi: " + (err?.message || "noma'lum xato");
        },
      },
    );
  };

  const fetchHistory = async () => {
    if (!currentProject?.id) return;
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ projectId: String(currentProject.id) });
      const res = await apiFetch(`${API}/Description/owner?${params}`);
      if (!res || !res.ok) return;
      const data = await res.json();
      setHistoryData(Array.isArray(data) ? data : data?.data ?? []);
    } catch {
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleExport = async () => {
    await toast.promise(
      (async () => {
        const date = new Date().toISOString().slice(0, 10);
        await exportCSV(statuses, `leads_${date}.csv`);
      })(),
      {
        loading: "Export qilinmoqda...",
        success: "Export muvaffaqiyatli",
        error: (err) => "Export xatosi: " + (err?.message || "noma'lum xato"),
      },
    );
  };

  useEffect(() => {
    const token = localStorage.getItem("user");
    if (!token) {
      navigate("/login");
      return;
    }
    const savedId = localStorage.getItem("projectId");
    const savedName = localStorage.getItem("projectName");
    const init = async () => {
      try {
        if (savedId) {
          const [projectsRes, statusesRes, sourcesRes, totalsRes] =
            await Promise.all([
              apiFetch(`${API}/projects`),
              apiFetch(`${API}/status/${savedId}`),
              apiFetch(`${API}/lead-source/${savedId}`),
              apiFetch(`${API}/status/all/${savedId}`),
            ]);
          if (!projectsRes || !statusesRes) return;
          if (!projectsRes.ok || !statusesRes.ok) {
            const msg = await extractApiMessage(
              !projectsRes.ok ? projectsRes : statusesRes,
              "Ma'lumotlar yuklanmadi",
            );
            showToast(msg, "error");
            setAppState("no-project");
            return;
          }
          const [projectsData, statusesData, sourcesData, totalsData] =
            await Promise.all([
              parseJsonSafeResponse(projectsRes, []),
              parseJsonSafeResponse(statusesRes, []),
              sourcesRes?.ok
                ? parseJsonSafeResponse(sourcesRes, [])
                : Promise.resolve([]),
              totalsRes?.ok
                ? parseJsonSafeResponse(totalsRes, null)
                : Promise.resolve(null),
            ]);
          const fallbackStatuses = Array.isArray(statusesData)
            ? statusesData
            : [];
          const { payloadStatuses, order } = applyStatusTotals(
            totalsData,
            fallbackStatuses,
          );
          const statusSnapshot = payloadStatuses.length
            ? payloadStatuses
            : fallbackStatuses;
          const normalizedStatuses = orderStatusesByOrder(
            statusSnapshot.map((s) => ({
              ...s,
              id: Number(s.id),
              leads: [],
            })),
            order,
          );
          setProjects(Array.isArray(projectsData) ? projectsData : []);
          setStatuses(normalizedStatuses);
          initializeStatusMeta(normalizedStatuses);
          setLeadSource(Array.isArray(sourcesData) ? sourcesData : []);
          await loadOperatorsForProject(savedId);
          setCurrentProject({ id: savedId, name: savedName });
          setAppState("ready");
          await Promise.all(
            normalizedStatuses.map((s) => fetchLeadsByStatus(s.id, 1, false)),
          );
        } else {
          const res = await apiFetch(`${API}/projects`);
          if (!res) return;
          if (!res.ok) {
            const msg = await extractApiMessage(res, "Loyihalar yuklanmadi");
            showToast(msg, "error");
            setAppState("no-project");
            return;
          }
          const data = await parseJsonSafeResponse(res, []);
          const list = Array.isArray(data) ? data : [];
          setProjects(list);
          if (list.length === 1) await loadProject(list[0]);
          else setAppState("no-project");
        }
      } catch (err) {
        console.error("Init xatosi:", err);
        showToast("Ma\'lumotlar yuklanmadi", "error");
        setAppState("no-project");
      }
    };
    init();
  }, []);

  const loadProject = async (project) => {
    setAppState("loading");
    localStorage.setItem("projectId", project.id);
    localStorage.setItem("projectName", project.name);
    setCurrentProject({ id: project.id, name: project.name });
    try {
      const [statusesRes, sourcesRes, totalsRes] = await Promise.all([
        apiFetch(`${API}/status/${project.id}`),
        apiFetch(`${API}/lead-source/${project.id}`),
        apiFetch(`${API}/status/all/${project.id}`),
      ]);
      if (!statusesRes) return;
      if (!statusesRes.ok) {
        const msg = await extractApiMessage(
          statusesRes,
          "Statuslar yuklanmadi",
        );
        showToast(msg, "error");
        setAppState("no-project");
        return;
      }
      const [statusesData, sourcesData, totalsData] = await Promise.all([
        parseJsonSafeResponse(statusesRes, []),
        sourcesRes?.ok
          ? parseJsonSafeResponse(sourcesRes, [])
          : Promise.resolve([]),
        totalsRes?.ok
          ? parseJsonSafeResponse(totalsRes, null)
          : Promise.resolve(null),
      ]);
      const fallbackStatuses = Array.isArray(statusesData) ? statusesData : [];
      const { payloadStatuses, order } = applyStatusTotals(
        totalsData,
        fallbackStatuses,
      );
      const statusSnapshot = payloadStatuses.length
        ? payloadStatuses
        : fallbackStatuses;
      const normalizedStatuses = orderStatusesByOrder(
        statusSnapshot.map((s) => ({
          ...s,
          id: Number(s.id),
          leads: [],
        })),
        order,
      );
      setStatuses(normalizedStatuses);
      initializeStatusMeta(normalizedStatuses);
      setLeadSource(Array.isArray(sourcesData) ? sourcesData : []);
      await loadOperatorsForProject(project.id);
      setSearchParams({ ...DEFAULT_SEARCH_PARAMS });
      setSearchStatuses(null);
      setSearchSummary(null);
      setAppState("ready");
      await Promise.all(
        normalizedStatuses.map((s) => fetchLeadsByStatus(s.id, 1, false)),
      );
    } catch (err) {
      console.error("Loyiha yuklanmadi:", err);
      showToast("Loyiha ma\'lumotlari yuklanmadi", "error");
      setAppState("no-project");
    }
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      const target = e.target;
      if (
        target instanceof Element &&
        (target.closest('[data-slot="select-content"]') ||
          target.closest('[data-slot="select-item"]') ||
          target.closest('[data-slot="select-trigger"]') ||
          target.closest("[data-radix-popper-content-wrapper]"))
      ) {
        return;
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchPanelOpen(false);
      }
      if (
        actionsWrapRef.current &&
        !actionsWrapRef.current.contains(e.target)
      ) {
        setActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (appState !== "ready" || !currentProject?.id) return;
    if (!hasActiveSearch) {
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
    const params = buildSearchQuery(searchParams, currentProject.id);
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", nextUrl);
  }, [appState, currentProject?.id, hasActiveSearch, searchParams]);

  useEffect(() => {
    if (appState !== "ready" || !currentProject?.id) return;
    if (!hasActiveSearch) {
      setSearchStatuses(null);
      setSearchSummary(null);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const params = buildSearchQuery(searchParams, currentProject.id);

        const res = await apiFetch(
          `${API}/leeds/all/search?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );
        if (!res) return;
        if (!res.ok) {
          const msg = await extractApiMessage(res, "Qidiruvda xatolik");
          showToast(msg, "error");
          setSearchStatuses(null);
          setSearchSummary(null);
          return;
        }

        const data = await res.json();
        const leads = Array.isArray(data?.leads)
          ? data.leads
          : Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
              ? data.data
              : [];
        const normalizedLeads = leads.map(normalizeLead);
        const totalLeads = Number(data?.totalLeads ?? normalizedLeads.length);
        const totalBudjet = Number(
          data?.totalBudjet ??
            normalizedLeads.reduce((sum, l) => sum + Number(l?.budjet || 0), 0),
        );
        setSearchSummary({ totalLeads, totalBudjet });

        const next = statuses.map((status) => ({
          ...status,
          leads: normalizedLeads.filter(
            (lead) => Number(lead.statusId) === Number(status.id),
          ),
        }));
        setSearchStatuses(next);
      } catch (err) {
        if (err.name !== "AbortError") {
          showToast("Qidiruvni yuklashda xatolik", "error");
        }
        setSearchSummary(null);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [appState, currentProject?.id, hasActiveSearch, searchParams, statuses]);

  const startAutoScroll = () => {
    const tick = () => {
      if (!isDragging.current || !boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const x = window.mouseX || 0;
      const edge = 160;
      const speed = 14;
      if (x > rect.right - edge) boardRef.current.scrollLeft += speed;
      else if (x < rect.left + edge) boardRef.current.scrollLeft -= speed;
      scrollRAF.current = requestAnimationFrame(tick);
    };
    scrollRAF.current = requestAnimationFrame(tick);
  };

  const stopAutoScroll = () => {
    isDragging.current = false;
    if (scrollRAF.current) {
      cancelAnimationFrame(scrollRAF.current);
      scrollRAF.current = null;
    }
  };

  useEffect(() => {
    const track = (e) => {
      window.mouseX = e.clientX;
    };
    window.addEventListener("mousemove", track);
    return () => {
      window.removeEventListener("mousemove", track);
      stopAutoScroll();
    };
  }, []);

  const findLeadById = (leadId) =>
    statuses
      .flatMap((status) => status.leads || [])
      .find((lead) => Number(lead.id) === Number(leadId));

  const handleDeleteLeadConfirm = async () => {
    if (!pendingDeleteLead?.id) return;
    if (!canDeleteLeads) {
      showToast("Sizda lead o'chirish huquqi yo'q", "error");
      return;
    }

    setDeletingLead(true);
    try {
      const res = await apiFetch(`${API}/leeds/${pendingDeleteLead.id}`, {
        method: "DELETE",
      });
      if (!res) throw new Error("Serverga ulanishda xatolik");
      if (!res.ok) {
        const message = await extractApiMessage(
          res,
          "Mijozni o'chirib bo'lmadi",
        );
        throw new Error(message);
      }

      setStatuses((prev) =>
        prev.map((status) => ({
          ...status,
          leads: (status.leads || []).filter(
            (lead) => Number(lead.id) !== Number(pendingDeleteLead.id),
          ),
        })),
      );

      setStatusTotals((prev) => {
        const deletedStatusId = Number(pendingDeleteLead.statusId);
        const deletedBudget = Number(pendingDeleteLead.budjet || 0);
        const currentMetrics = prev?.metrics || {};

        return {
          ...prev,
          totalLeads: Math.max(0, Number(prev?.totalLeads || 0) - 1),
          totalSum: Math.max(0, Number(prev?.totalSum || 0) - deletedBudget),
          metrics: Object.fromEntries(
            Object.entries(currentMetrics).map(([statusId, metric]) => {
              if (Number(statusId) !== deletedStatusId) {
                return [statusId, metric];
              }
              return [
                statusId,
                {
                  ...metric,
                  leadCount: Math.max(0, Number(metric?.leadCount || 0) - 1),
                  leadBudjet: Math.max(
                    0,
                    Number(metric?.leadBudjet || 0) - deletedBudget,
                  ),
                },
              ];
            }),
          ),
        };
      });

      setDeleteDialogOpen(false);
      setPendingDeleteLead(null);
      showToast("Mijoz muvaffaqiyatli o'chirildi", "success");
    } catch (err) {
      showToast(err?.message || "O'chirishda xatolik yuz berdi", "error");
    } finally {
      setDeletingLead(false);
    }
  };

  const onDragStart = () => {
    isDragging.current = true;
    if (canDeleteLeads) setTrashVisible(true);
    setTrashActive(false);
    startAutoScroll();
  };

  const onDragUpdate = (update) => {
    if (!canDeleteLeads) return;
    const overTrash = update?.destination?.droppableId === TRASH_DROPPABLE_ID;
    setTrashActive(overTrash);
  };

  const onDragEnd = async (result) => {
    stopAutoScroll();
    setTrashVisible(false);
    setTrashActive(false);
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === TRASH_DROPPABLE_ID) {
      if (!canDeleteLeads) {
        showToast("Sizda lead o'chirish huquqi yo'q", "error");
        return;
      }
      const selectedLead = findLeadById(draggableId);
      if (!selectedLead) {
        showToast("O'chiriladigan mijoz topilmadi", "error");
        return;
      }
      setPendingDeleteLead(selectedLead);
      setDeleteDialogOpen(true);
      return;
    }
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;
    const prev = statuses;
    setStatuses((s) => applyDrag(s, source, destination, draggableId));
    const destId = Number(destination.droppableId);
    try {
      const res = await apiFetch(
        `${API}/leeds/status/${draggableId}?statusId=${destId}`,
        { method: "PATCH" },
      );
      if (res && !res.ok) throw new Error(`PATCH ${res.status}`);
    } catch (err) {
      console.error(err);
      setStatuses(prev);
      showToast("Xatolik: o\'zgarish saqlanmadi", "error");
    }
  };

  const handleColumnScroll = (statusId, e) => {
    if (hasActiveSearch) return;
    const el = e.currentTarget;
    const meta = statusMeta[statusId];
    if (!meta || meta.loading || !meta.hasMore) return;
    const threshold = 180;
    if (el.scrollHeight - el.scrollTop - el.clientHeight <= threshold) {
      fetchLeadsByStatus(statusId, (meta.page || 1) + 1, true);
    }
  };

  const handleAiDraftFieldChange = (field, value) => {
    setAiDraft((prev) => {
      if (field === "phone" || field === "extraPhone") {
        return { ...prev, [field]: normalizeAiPhone(value) };
      }
      if (field === "budjet") {
        return { ...prev, budjet: normalizeBudgetInput(value) };
      }
      if (field === "birthDate") {
        return { ...prev, birthDate: value };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleAiDraftTagsChange = (value) => {
    const tags = String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setAiDraft((prev) => ({ ...prev, tags }));
  };

  const resetLeadForm = () => {
    setAiDialogOpen(false);
    setAiTranscript("");
    setAiDraft(parseAiLeadDraft(""));
    setAiProcessing(false);
    clearCanvas();
    stopAiListening();
  };

  const closeAiDialog = () => {
    resetLeadForm();
  };

  const handleOpenLeadFromAi = () => {
    resetLeadForm();
    setAiDialogOpen(true);
  };

  const mergeAiDraft = (draft) => {
    setAiDraft((prev) => ({
      ...prev,
      firstName: draft.firstName || prev.firstName,
      lastName: draft.lastName || prev.lastName,
      phone: draft.phone || prev.phone,
      extraPhone: draft.extraPhone || prev.extraPhone,
      adress: draft.adress || prev.adress,
      budjet: draft.budjet || prev.budjet,
      birthDate: draft.birthDate || prev.birthDate,
      source: draft.source || prev.source,
      tags:
        Array.isArray(draft.tags) && draft.tags.length
          ? draft.tags
          : Array.isArray(prev.tags)
            ? prev.tags
            : [],
    }));
  };

  const stopAiListening = () => {
    if (speechRef.current) {
      speechRef.current.onend = null;
      speechRef.current.stop();
      speechRef.current = null;
    }
    setAiListening(false);
  };

  const startAiListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Bu brauzerda mikrofon AI qidiruvi qo'llanmaydi", "error");
      return;
    }
    if (aiListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "uz-UZ";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let fullTranscript = "";
      for (let i = 0; i < event.results.length; i += 1) {
        fullTranscript += `${event.results[i][0].transcript} `;
      }
      setAiTranscript(fullTranscript.trim());
    };

    recognition.onerror = () => {
      setAiListening(false);
      showToast("Mikrofon orqali o'qishda xatolik yuz berdi", "error");
    };

    recognition.onend = () => {
      setAiListening(false);
      speechRef.current = null;
    };

    speechRef.current = recognition;
    setAiListening(true);
    recognition.start();
  };

  const createLeadFromData = async (values) => {
    if (!currentProject?.id) {
      throw new Error("Loyiha tanlanmagan");
    }

    const body = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      projectId: Number(currentProject.id),
      ...(values.extraPhone && { extraPhone: values.extraPhone }),
      ...(values.adress && { adress: values.adress }),
      ...(values.budjet && { budjet: Number(values.budjet) }),
      ...(values.leadSourceId && { leadSourceId: Number(values.leadSourceId) }),
      ...(values.birthDate && { birthDate: values.birthDate }),
      tag: (values.tags || []).map((t) => String(t).trim()).filter(Boolean),
    };

    const res = await apiFetch(`${API}/leeds`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res) throw new Error("Sessiya tugagan");
    if (!res.ok) {
      const msg = await extractApiMessage(res, "Lead qo'shishda xatolik");
      throw new Error(msg);
    }

    const newLead = await res.json();
    return normalizeLead(newLead);
  };

  const prependLeadToBoard = (normalizedLead) => {
    setStatuses((prev) =>
      prev.map((s, i) =>
        i === 0 ? { ...s, leads: [normalizedLead, ...s.leads] } : s,
      ),
    );
  };

  const handleApplyAi = async () => {
    if (!hasAiDraftData(aiDraft)) {
      showToast("AI javobidan forma uchun ma'lumot topilmadi", "error");
      return;
    }

    const matchedSource = leadSource.find(
      (item) =>
        String(item?.name || "")
          .trim()
          .toLowerCase() ===
        String(aiDraft?.source || "")
          .trim()
          .toLowerCase(),
    );

    const mergedValues = {
      ...aiDraft,
      tags:
        Array.isArray(aiDraft.tags) && aiDraft.tags.length ? aiDraft.tags : [],
      ...(matchedSource?.id ? { leadSourceId: Number(matchedSource.id) } : {}),
    };

    if (!String(mergedValues.firstName || "").trim()) {
      showToast("Ism kiritilmagan", "error");
      return;
    }
    if (!String(mergedValues.phone || "").trim()) {
      showToast("Telefon kiritilmagan", "error");
      return;
    }

    setSubmitting(true);
    try {
      const normalizedLead = await createLeadFromData(mergedValues);
      prependLeadToBoard(normalizedLead);
      closeAiDialog();
      showToast("Lead qo'shildi!", "success");
    } catch (err) {
      showToast(err?.message || "Lead qo'shishda xatolik", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessAiAudio = async () => {
    if (!currentProject?.id) {
      showToast("Loyiha tanlanmagan", "error");
      return;
    }

    if (!recordedBlob) {
      showToast("Avval audio yozib oling", "error");
      return;
    }

    setAiProcessing(true);
    try {
      const sourceMimeType = recordedBlob.type || "audio/webm";
      const extension = getAudioFileExtension(sourceMimeType);
      const audioFile = new File(
        [recordedBlob],
        `recorded_audio.${extension}`,
        { type: sourceMimeType },
      );
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("projectId", String(currentProject.id));

      const res = await apiFetch(`${API}/leeds/audio`, {
        method: "POST",
        body: formData,
      });
      if (!res) return;
      if (!res.ok) {
        const msg = await extractApiMessage(
          res,
          "AI audio tahlilida xatolik yuz berdi",
        );
        throw new Error(msg);
      }

      const payload = await res.json().catch(() => null);
      const { transcript, draft } = resolveAiAudioPayload(payload);

      setAiTranscript(transcript);

      if (!transcript && !hasAiDraftData(draft)) {
        throw new Error("AI javobidan kerakli ma'lumot olinmadi");
      }

      mergeAiDraft(draft);
      showToast("AI audio orqali maydonlar to'ldirildi", "success");
      clearCanvas();
    } catch (err) {
      showToast(
        err?.message || "AI audio bilan ishlashda xatolik yuz berdi",
        "error",
      );
    } finally {
      setAiProcessing(false);
    }
  };

  useEffect(() => {
    if (!aiListening) return;
    setAiDraft(parseAiLeadDraft(aiTranscript));
  }, [aiTranscript, aiListening]);

  useEffect(() => {
    if (!recorderError) return;
    showToast(recorderError.message || "Audio recorder xatosi", "error");
  }, [recorderError]);

  useEffect(
    () => () => {
      stopAiListening();
    },
    [],
  );

  const isFiltering = hasActiveSearch;
  const visibleStatuses = searchStatuses ?? statuses;
  const fallbackTotalLeads = statuses.reduce((a, s) => a + s.leads.length, 0);
  const totalLeadsBase = Number(statusTotals.totalLeads || fallbackTotalLeads);
  const fallbackTotalSum = statuses.reduce(
    (acc, status) =>
      acc +
      (status.leads || []).reduce(
        (sum, lead) => sum + Number(lead?.budjet || 0),
        0,
      ),
    0,
  );
  const totalSumBase = Number(statusTotals.totalSum || fallbackTotalSum);
  const totalFiltered = isFiltering
    ? Number(
        searchSummary?.totalLeads ??
          visibleStatuses.reduce((a, s) => a + s.leads.length, 0),
      )
    : visibleStatuses.reduce((a, s) => a + s.leads.length, 0);
  const totalAll = totalLeadsBase;
  const totalFilteredBudjet = isFiltering
    ? Number(
        searchSummary?.totalBudjet ??
          visibleStatuses.reduce(
            (a, s) =>
              a + s.leads.reduce((sum, l) => sum + Number(l?.budjet || 0), 0),
            0,
          ),
      )
    : 0;
  const hasRecordedAudio = Boolean(recordedBlob);
  const aiDraftReady = hasAiDraftData(aiDraft);
  const currentVoiceStep =
    aiProcessing || isProcessingRecordedAudio ? 2 : aiDraftReady ? 3 : 1;
  const voiceStatusText = aiProcessing
    ? "AI ga yuborilmoqda..."
    : isProcessingRecordedAudio
      ? "Audio tayyorlanmoqda"
      : isRecordingInProgress
        ? "Audio yozilmoqda"
        : currentVoiceStep === 3
          ? "Maydonlar to'ldirildi"
          : hasRecordedAudio || isAvailableRecordedAudio
            ? "Tahlilga yuborishga tayyor"
            : "Audio kutilmoqda";
  const voiceStatusClass =
    aiProcessing || isProcessingRecordedAudio
      ? "border-yellow-400/30 bg-yellow-500/10 text-yellow-200"
      : isRecordingInProgress
        ? "border-red-400/30 bg-red-500/10 text-red-200"
        : currentVoiceStep === 3
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
          : hasRecordedAudio || isAvailableRecordedAudio
            ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
            : "border-white/10 bg-white/5 text-gray-300";
  const canSendRecordedAudio =
    hasRecordedAudio &&
    !aiProcessing &&
    !isRecordingInProgress &&
    !isProcessingRecordedAudio;
  const matchedAiSource = leadSource.find(
    (item) => normalizeText(item?.name) === normalizeText(aiDraft?.source),
  );
  const selectedAiSourceId = matchedAiSource
    ? String(matchedAiSource.id)
    : undefined;
  const getVoiceStepClass = (step) => {
    if (step < currentVoiceStep) {
      return "rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2 py-1 text-center text-emerald-200";
    }
    if (step === currentVoiceStep) {
      const animation =
        step === 2 && (aiProcessing || isProcessingRecordedAudio)
          ? "animate-pulse"
          : "";
      return `rounded-full border border-cyan-400/35 bg-cyan-500/10 px-2 py-1 text-center text-cyan-200 ${animation}`;
    }
    return "rounded-full border border-white/10 bg-white/5 px-2 py-1 text-center text-gray-300";
  };

  if (appState === "loading") {
    return (
      <KotibamLoader
        minHeight="100%"
        className="h-full rounded-none border-0 bg-[#0d1e35]"
      />
    );
  }

  if (appState === "no-project") {
    return (
      <div className="flex h-full flex-col bg-[#0d1e35]">
        <div className="flex shrink-0 items-center gap-4 border-b border-[#284860] bg-[#0f2231] p-6 text-white">
          <Select
            onValueChange={(name) => {
              const p = projects.find((x) => x.name === name);
              if (p) loadProject(p);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Loyihani tanlang" />
            </SelectTrigger>
            <SelectContent className="mt-10">
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          {projects.length === 0 ? (
            <>
              <AlertCircle className="h-12 w-12 text-yellow-400" />
              <p className="text-lg font-semibold text-white">
                Loyiha topilmadi
              </p>
              <p className="text-sm text-gray-400">
                Avval loyiha yarating yoki admin bilan bog\'laning.
              </p>
              <Link
                to="/projects"
                className="rounded-xl border border-blue-400 px-4 py-2 text-blue-400 hover:bg-blue-400 hover:text-white"
              >
                Projects
              </Link>
            </>
          ) : (
            <>
              <FolderOpen className="h-14 w-14 text-blue-400" />
              <p className="text-xl font-semibold text-white">
                Loyihani tanlang
              </p>
              <div className="flex w-72 flex-col gap-2">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => loadProject(p)}
                    className="rounded-lg border border-[#2a4868] bg-[#11263a] px-4 py-3 text-left text-white transition-colors hover:bg-[#1a3552]"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-[#0d1e35]"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 border-b border-[#284860] bg-[#0f2231] px-6 py-4 text-white">
        {/* Left: project select + search */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Select
            value={currentProject?.name}
            onValueChange={(name) => {
              const p = projects.find((x) => x.name === name);
              if (p) loadProject(p);
            }}
          >
            <SelectTrigger className="w-56" style={{ height: "36px" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="mt-10">
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div ref={searchWrapRef} className="relative min-w-0 flex-1">
            <div className="flex h-10 items-center gap-2 rounded-md bg-[#10263b] px-3">
              <Search size={14} className="shrink-0 text-gray-500" />
              <input
                ref={searchInputRef}
                value={searchParams.search}
                onFocus={() => setSearchPanelOpen(true)}
                onChange={(e) => updateSearchParam("search", e.target.value)}
                placeholder="Qidiruv (ism, familiya, telefon)"
                className="h-full w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
              {searchLoading && (
                <Loader2
                  size={14}
                  className="shrink-0 animate-spin text-blue-400"
                />
              )}
              {searchParams.search && (
                <button
                  onClick={() => updateSearchParam("search", "")}
                  className="text-gray-500 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {searchPanelOpen && (
              <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-md border border-[#21435b] bg-[#0f2236] shadow-2xl">
                <div className="flex flex-col gap-2 p-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Status</label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={searchParams.statusId || undefined}
                        onValueChange={(v) => updateSearchParam("statusId", v)}
                      >
                        <SelectTrigger className="h-9 w-full bg-[#10263b]">
                          <SelectValue placeholder="Status tanlang" />
                        </SelectTrigger>
                        <SelectContent className="mt-10">
                          {statuses.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {searchParams.statusId && (
                        <button
                          type="button"
                          onClick={() => updateSearchParam("statusId", "")}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#2a4868] text-gray-400 transition-colors hover:bg-[#1b3e57] hover:text-white"
                          aria-label="Statusni tozalash"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">
                      Lead manbasi
                    </label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={searchParams.leadSourceId || undefined}
                        onValueChange={(v) =>
                          updateSearchParam("leadSourceId", v)
                        }
                      >
                        <SelectTrigger className="h-9 w-full bg-[#10263b]">
                          <SelectValue placeholder="Manba tanlang" />
                        </SelectTrigger>
                        <SelectContent className="mt-10">
                          {leadSource.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {searchParams.leadSourceId && (
                        <button
                          type="button"
                          onClick={() => updateSearchParam("leadSourceId", "")}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#2a4868] text-gray-400 transition-colors hover:bg-[#1b3e57] hover:text-white"
                          aria-label="Manbani tozalash"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Operator</label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={searchParams.assignedUserId || undefined}
                        onValueChange={(v) =>
                          updateSearchParam("assignedUserId", v)
                        }
                      >
                        <SelectTrigger className="h-9 w-full bg-[#10263b]">
                          <SelectValue
                            placeholder={
                              operatorsLoading
                                ? "Operatorlar yuklanmoqda..."
                                : "Operator tanlang"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="mt-10 max-h-72">
                          {operatorsList.map((operator) => (
                            <SelectItem
                              key={operator.id}
                              value={String(operator.id)}
                            >
                              {operator.fullName ||
                                operator.email ||
                                `#${operator.id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {searchParams.assignedUserId && (
                        <button
                          type="button"
                          onClick={() =>
                            updateSearchParam("assignedUserId", "")
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#2a4868] text-gray-400 transition-colors hover:bg-[#1b3e57] hover:text-white"
                          aria-label="Operatorni tozalash"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">
                      Budjet (dan / gacha)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={searchParams.budjetFrom}
                        onChange={(e) =>
                          updateSearchParam("budjetFrom", e.target.value)
                        }
                        placeholder="Dan"
                        className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-white placeholder-gray-500 outline-none"
                      />
                      <input
                        type="number"
                        value={searchParams.budjetTo}
                        onChange={(e) =>
                          updateSearchParam("budjetTo", e.target.value)
                        }
                        placeholder="Gacha"
                        className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-white placeholder-gray-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">Manzil</label>
                    <input
                      value={searchParams.adress}
                      onChange={(e) =>
                        updateSearchParam("adress", e.target.value)
                      }
                      placeholder="Manzil kiriting"
                      className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">
                      Tug'ilgan sana (dan / gacha)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={searchParams.birthDateFrom}
                        onChange={(e) =>
                          updateSearchParam("birthDateFrom", e.target.value)
                        }
                        className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-gray-300 outline-none"
                        style={{ colorScheme: "dark" }}
                      />
                      <input
                        type="date"
                        value={searchParams.birthDateTo}
                        onChange={(e) =>
                          updateSearchParam("birthDateTo", e.target.value)
                        }
                        className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-gray-300 outline-none"
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">
                      Yaratilgan sana (dan / gacha)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={searchParams.createdFrom}
                        onChange={(e) =>
                          updateSearchParam("createdFrom", e.target.value)
                        }
                        className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-gray-300 outline-none"
                        style={{ colorScheme: "dark" }}
                      />
                      <input
                        type="date"
                        value={searchParams.createdTo}
                        onChange={(e) =>
                          updateSearchParam("createdTo", e.target.value)
                        }
                        className="h-9 w-full rounded-md bg-[#10263b] px-3 text-sm text-gray-300 outline-none"
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end border-t border-[#21435b] px-3 py-2">
                  <button
                    onClick={() =>
                      setSearchParams({ ...DEFAULT_SEARCH_PARAMS })
                    }
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Tozalash
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: stats + action buttons */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Mijoz soni + filter natijasi */}
          <span className="mr-2 text-xs text-gray-500">
            {isFiltering ? (
              <>
                <span className="text-white">{totalFiltered}</span>/{totalAll}{" "}
                mijoz
                <span className="mx-1">•</span>
                <span className="text-green-400">
                  {Number(totalFilteredBudjet).toLocaleString()} so'm
                </span>
                <span className="mx-1 text-gray-600">/</span>
                <span className="text-green-400/80">
                  {Number(totalSumBase).toLocaleString()} so'm
                </span>
              </>
            ) : (
              <>
                <span className="text-white">{totalAll}</span> mijoz
                <span className="mx-1">/</span>
                <span className="text-green-400">
                  {Number(totalSumBase).toLocaleString()} so'm
                </span>
              </>
            )}
          </span>

          <div ref={actionsWrapRef} className="relative">
            <button
              onClick={() => setActionsOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2a4868] text-gray-300 transition-colors hover:bg-[#1b3e57] hover:text-white"
            >
              <MoreHorizontal size={16} />
            </button>
            {actionsOpen && (
              <div className="absolute top-full right-0 z-50 mt-2 w-44 rounded-md border border-[#1e3a52] bg-[#0a1929] p-1 shadow-2xl">
                <button
                  onClick={() => {
                    setActionsOpen(false);
                    handleExport();
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-gray-200 hover:bg-[#11263a]"
                >
                  <Upload size={14} className="text-green-400" />
                  Export
                </button>
                <button
                  onClick={() => {
                    setActionsOpen(false);
                    handleImport();
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-gray-200 hover:bg-[#11263a]"
                >
                  <Download size={14} className="text-yellow-400" />
                  Import
                </button>
              </div>
            )}
          </div>

          {/* Leadlarning tarixi! */}
          <Popover
            open={historyOpen}
            onOpenChange={(open) => {
              setHistoryOpen(open);
              if (open) fetchHistory();
            }}
          >
            <PopoverTrigger asChild>
              <button className="rounded-md border border-gray-700 px-3 py-2.75 text-xs text-gray-300 transition-colors duration-150 hover:bg-[#21435b] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent">
                <History size={14} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="w-96 border border-[#2a4868] bg-[#0b1b29] p-0 text-white"
            >
              <div className="border-b border-[#1e3a52] px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <History size={15} className="text-sky-400" />
                    Leadlar tarixi
                  </p>
                  {!historyLoading && historyData.length > 0 && (
                    <span className="rounded-full border border-sky-700/50 bg-sky-900/40 px-2 py-0.5 text-xs font-semibold text-sky-300">
                      {historyData.length}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-500">
                  Bugungi o'zgarishlar tarixi
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {historyLoading ? (
                  <div className="flex items-center justify-center px-4 py-8">
                    <Loader2 size={18} className="animate-spin text-gray-400" />
                  </div>
                ) : historyData.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    Hozircha ma'lumot yo'q
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2 p-3">
                    {historyData.map((item, i) => {
                      const leadName = [item.leads?.firstName, item.leads?.lastName].filter(Boolean).join(" ") || "—";
                      const phone = item.leads?.phone ?? null;
                      const operator = item.user?.fullName ?? "—";
                      const role = item.user?.role ?? null;
                      const createdAt = item.createdAt
                        ? new Date(item.createdAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
                        : null;
                      return (
                        <li
                          key={item.id ?? i}
                          className="rounded-lg border border-[#1e3f5a] bg-[#0d2236] px-3 py-2.5 transition-colors hover:border-[#2a5a7a] hover:bg-[#0f2a42]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-white">{leadName}</p>
                                {role && (
                                  <span className="shrink-0 rounded-full border border-sky-700/50 bg-sky-900/30 px-1.5 py-0.5 text-[10px] text-sky-400">
                                    {role}
                                  </span>
                                )}
                              </div>
                              {phone && (
                                <p className="mt-0.5 text-xs text-gray-400">{phone}</p>
                              )}
                              {item.text && (
                                <p className="mt-1.5 rounded-md border border-sky-800/30 bg-sky-900/20 px-2 py-1 text-xs text-sky-300">
                                  {item.text}
                                </p>
                              )}
                              <p className="mt-1.5 text-xs text-gray-500">
                                <span className="text-gray-400">{operator}</span>
                              </p>
                            </div>
                            {createdAt && (
                              <span className="shrink-0 rounded bg-[#0a1e30] px-1.5 py-0.5 text-[11px] text-gray-500">
                                {createdAt}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {canManageStatuses && (
            <Link to="/addStatus">
              <IconBtn icon={Settings} label="Sozlamalar" />
            </Link>
          )}

          <IconBtn
            icon={Plus}
            label="Yangi mijoz"
            onClick={handleOpenLeadFromAi}
          />

          <Dialog
            open={aiDialogOpen}
            onOpenChange={(open) => {
              if (open) {
                setAiDialogOpen(true);
                return;
              }
              closeAiDialog();
            }}
          >
            <DialogContent className="!top-4 !right-6 !bottom-4 !left-6 !h-auto !w-auto !max-w-none !translate-x-0 !translate-y-0 overflow-hidden rounded-2xl border border-[#21435b] bg-[#0b1c2d] p-0 text-white">
              <DialogHeader className="border-b border-white/10 bg-[#10273c] px-6 py-4 text-left">
                <DialogTitle className="text-xl">
                  AI audio yordamchisi
                </DialogTitle>
                <DialogDescription className="text-cyan-100/80">
                  Audio yozing, AI tahlil qiladi va o'ng paneldagi maydonlar
                  orqali natijani kuzating.
                </DialogDescription>
              </DialogHeader>

              <div className="grid h-[calc(100%-88px)] grid-cols-1 lg:grid-cols-[13fr_7fr]">
                <div className="min-h-0 p-5 lg:p-6">
                  <div className="rounded-2xl border border-white/10 bg-[#0f2437] p-5">
                    <p className="text-xs font-semibold tracking-wide text-cyan-100 uppercase">
                      AI topgan maydonlar
                    </p>
                    <div className="mt-4 w-full text-white">
                      <FieldGroup>
                        <div className="grid grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel>Ism</FieldLabel>
                            <Input
                              value={aiDraft.firstName || ""}
                              placeholder="Ism"
                              onChange={(e) =>
                                handleAiDraftFieldChange(
                                  "firstName",
                                  e.target.value,
                                )
                              }
                            />
                          </Field>
                          <Field>
                            <FieldLabel>Familiya</FieldLabel>
                            <Input
                              value={aiDraft.lastName || ""}
                              placeholder="Familiya"
                              onChange={(e) =>
                                handleAiDraftFieldChange(
                                  "lastName",
                                  e.target.value,
                                )
                              }
                            />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel>Telefon</FieldLabel>
                            <Input
                              value={formatPhoneDisplay(aiDraft.phone || "")}
                              placeholder="+998 ** *** ** **"
                              onChange={(e) =>
                                handleAiDraftFieldChange(
                                  "phone",
                                  e.target.value,
                                )
                              }
                            />
                          </Field>
                          <Field>
                            <FieldLabel>Qo'shimcha</FieldLabel>
                            <Input
                              value={formatPhoneDisplay(
                                aiDraft.extraPhone || "",
                              )}
                              placeholder="+998 ** *** ** *"
                              onChange={(e) =>
                                handleAiDraftFieldChange(
                                  "extraPhone",
                                  e.target.value,
                                )
                              }
                            />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel>Tug'ilgan sana</FieldLabel>
                            <Input
                              type="date"
                              value={aiDraft.birthDate || ""}
                              max={maxBirthDate}
                              onChange={(e) =>
                                handleAiDraftFieldChange(
                                  "birthDate",
                                  e.target.value,
                                )
                              }
                            />
                          </Field>
                          <Field>
                            <FieldLabel>Budjet</FieldLabel>
                            <Input
                              value={formatBudgetDisplay(aiDraft.budjet || "")}
                              placeholder="120 000 000"
                              onChange={(e) =>
                                handleAiDraftFieldChange(
                                  "budjet",
                                  e.target.value,
                                )
                              }
                            />
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel>Manzil</FieldLabel>
                            <Input
                              value={aiDraft.adress || ""}
                              placeholder="Manzil"
                              onChange={(e) =>
                                handleAiDraftFieldChange(
                                  "adress",
                                  e.target.value,
                                )
                              }
                            />
                          </Field>
                          <Field>
                            <FieldLabel>Manba</FieldLabel>
                            <Select
                              value={selectedAiSourceId}
                              onValueChange={(value) => {
                                const selected = leadSource.find(
                                  (item) => String(item.id) === String(value),
                                );
                                handleAiDraftFieldChange(
                                  "source",
                                  selected?.name || "",
                                );
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Tanlang..." />
                              </SelectTrigger>
                              <SelectContent className="mt-2">
                                {leadSource.length === 0 ? (
                                  <div className="px-2 py-1.5 text-xs text-gray-400">
                                    Manbalar topilmadi
                                  </div>
                                ) : (
                                  leadSource.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                      {s.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                        <Field>
                          <FieldLabel>Teg</FieldLabel>
                          <Input
                            value={
                              Array.isArray(aiDraft.tags) && aiDraft.tags.length
                                ? aiDraft.tags.join(", ")
                                : ""
                            }
                            placeholder="VIP, comfort..."
                            onChange={(e) =>
                              handleAiDraftTagsChange(e.target.value)
                            }
                          />
                        </Field>
                      </FieldGroup>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-[#2a4868] bg-[#11263a] text-white hover:bg-[#1a3552]"
                        onClick={closeAiDialog}
                      >
                        Bekor qilish
                      </Button>
                      <Button
                        type="button"
                        className="border bg-[#07131d]"
                        onClick={handleApplyAi}
                        disabled={!hasAiDraftData(aiDraft) || submitting}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Saqlash"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <aside className="min-h-0 p-5 lg:p-6">
                  <div className="rounded-2xl border border-white/10 bg-[#0f2437] p-5">
                    <div className="rounded-2xl border border-[#2a4868] bg-[#11263a] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold tracking-wide text-cyan-100 uppercase">
                          Voice Yordamchi
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] whitespace-nowrap ${voiceStatusClass}`}
                        >
                          {(aiProcessing || isProcessingRecordedAudio) && (
                            <Loader2 size={11} className="animate-spin" />
                          )}
                          {voiceStatusText}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                        <span className={getVoiceStepClass(1)}>1. Audio</span>
                        <span className={getVoiceStepClass(2)}>2. Tahlil</span>
                        <span className={getVoiceStepClass(3)}>
                          3. To'ldirish
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#2a4868] bg-[#11263a] p-3">
                      <div className="rounded-2xl border border-[#2a4868] bg-[#11263a] p-2 text-black">
                        <VoiceVisualizer
                          controls={recorderControls}
                          isDownloadAudioButtonShown={false}
                        />
                      </div>
                      <div className="mt-4 flex justify-center">
                        <button
                          type="button"
                          onClick={handleProcessAiAudio}
                          disabled={!canSendRecordedAudio}
                          className="inline-flex min-w-44 items-center justify-center rounded-full bg-[#d8d0c4] px-5 py-2.5 text-sm font-medium text-[#1f2f45] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {aiProcessing || isProcessingRecordedAudio
                            ? "Yuborilmoqda..."
                            : hasRecordedAudio
                              ? "Yuborish"
                              : "Avval audio yozing"}
                        </button>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Board ── */}
      <DragDropContext
        onDragStart={onDragStart}
        onDragUpdate={onDragUpdate}
        onDragEnd={onDragEnd}
      >
        <div
          ref={boardRef}
          className="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden p-6"
          style={{ alignItems: "flex-start" }}
        >
          {visibleStatuses.map((col) => (
            <div
              key={col.id}
              className="flex shrink-0 flex-col"
              style={{ width: 300 }}
            >
              {(() => {
                const statusMetric = statusTotals.metrics?.[col.id] || {};
                const totalCount = Number(
                  statusMetric.leadCount ?? col.leads.length ?? 0,
                );
                const totalBudjet = Number(statusMetric.leadBudjet ?? 0);
                const filteredCount = col.leads.length;
                const filteredBudjet = (col.leads || []).reduce(
                  (sum, lead) => sum + Number(lead?.budjet || 0),
                  0,
                );

                return (
                  <div
                    className="mb-3 overflow-hidden rounded-lg border-b-4 bg-[#11263a]"
                    style={{ borderBottomColor: col.color || "#6b7280" }}
                  >
                    <div className="flex items-center justify-between bg-[#153043] px-4 py-3 font-semibold text-white">
                      <span className="truncate text-sm">{col.name}</span>
                      <span className="rounded-full bg-gray-700 px-2.5 py-0.5 text-xs">
                        {isFiltering
                          ? `${filteredCount}/${totalCount}`
                          : totalCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-[#11263a] px-4 py-2 text-[11px] text-gray-300">
                      <span>
                        Lead:{" "}
                        {isFiltering
                          ? `${filteredCount}/${totalCount}`
                          : totalCount}
                      </span>
                      <span className="text-green-400">
                        {isFiltering
                          ? `${Number(filteredBudjet).toLocaleString()}/${Number(totalBudjet).toLocaleString()} so'm`
                          : `${Number(totalBudjet).toLocaleString()} so'm`}
                      </span>
                    </div>
                  </div>
                );
              })()}
              <Droppable
                droppableId={String(col.id)}
                mode="standard"
                renderClone={(provided, _snap, rubric) => {
                  const lead = col.leads[rubric.source.index];
                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`rounded-lg p-3 text-sm text-white shadow-2xl ring-2 ${
                        trashActive
                          ? "border border-red-400/80 bg-red-900/70 ring-red-500/40"
                          : "border border-blue-400/50 bg-[#1a3552] ring-blue-500/30"
                      }`}
                      style={{
                        ...provided.draggableProps.style,
                        opacity: 1,
                        width: 300,
                      }}
                    >
                      <div className="font-medium">
                        {lead?.firstName} {lead?.lastName}
                      </div>
                      <div className="mt-1 text-xs opacity-60">
                        {lead?.phone}
                      </div>
                    </div>
                  );
                }}
              >
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`rounded-lg transition-colors duration-150 ${snapshot.isDraggingOver ? "bg-[#1a3552]/60" : ""}`}
                  >
                    <div
                      onScroll={(e) => handleColumnScroll(col.id, e)}
                      className="flex flex-col gap-2.5 p-2"
                      style={{
                        minHeight: 80,
                        maxHeight: "calc(100vh - 245px)",
                        overflowY: "auto",
                      }}
                    >
                      {col.leads.length === 0 ? (
                        <div
                          className={`rounded-lg border-2 border-dashed p-6 text-center text-xs transition-colors ${snapshot.isDraggingOver ? "border-blue-400/60 bg-blue-900/10 text-blue-400" : "border-[#2a4868]/40 text-gray-500"}`}
                        >
                          {snapshot.isDraggingOver
                            ? "Bu yerga tashlang"
                            : "Bo'sh"}
                        </div>
                      ) : (
                        col.leads.map((lead, index) => (
                          <Draggable
                            key={lead.id}
                            draggableId={String(lead.id)}
                            index={index}
                          >
                            {(provided, snapshot) => {
                              const taskBadge = buildTaskBadgeMeta(
                                lead.taskRemainingDays,
                              );
                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() =>
                                    handleLeadOpen(lead.id, snapshot.isDragging)
                                  }
                                  className={`cursor-pointer rounded-lg border p-3 text-sm text-white shadow-sm transition-all duration-150 ${
                                    lead.comment
                                      ? "border-green-400/40 bg-green-500/10 hover:bg-green-500/15"
                                      : lead.isViewed
                                        ? "border-green-500/30 bg-[#1a3d28] hover:bg-[#1f4a30]"
                                        : "border-[#2a4868]/30 bg-[#1a3552] hover:bg-[#21446a]"
                                  } ${
                                    snapshot.isDragging && trashActive
                                      ? "scale-[1.03] rotate-1 border-red-400/80 bg-red-900/70 shadow-xl ring-2 shadow-black/40 ring-red-500/40"
                                      : snapshot.isDragging
                                        ? "scale-[1.03] rotate-1 border-blue-400/50 shadow-xl ring-2 shadow-black/40 ring-blue-500/30"
                                        : ""
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    opacity: 1,
                                  }}
                                >
                                  {/* Ism + commentDate (top-right) */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="font-medium">
                                      {lead.firstName} {lead.lastName}
                                    </div>
                                    {lead.comment && lead.commentDate !== null && lead.commentDate !== undefined && (
                                      <div className="shrink-0 text-[10px] text-green-400/70">
                                        {formatCommentDate(lead.commentDate)}
                                      </div>
                                    )}
                                  </div>
                                  {/* Telefon */}
                                  <div className="mt-0.5 text-xs opacity-50">
                                    {lead.phone}
                                  </div>

                                  {/* Comment */}
                                  {lead.comment && (
                                    <div className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-green-300/90">
                                      {lead.comment}
                                    </div>
                                  )}

                                  {/* Manba */}
                                  {lead.leadSource?.name && (
                                    <div className="mt-1.5 text-[11px] text-blue-400/80">
                                      {lead.leadSource.name}
                                    </div>
                                  )}

                                  {/* Taglar */}
                                  {Array.isArray(lead.tag) &&
                                    lead.tag.length > 0 && (
                                      <div className="mt-1.5 flex flex-wrap gap-1">
                                        {lead.tag.map((t, i) => (
                                          <span
                                            key={i}
                                            className="rounded border border-[#2a4868]/50 bg-[#0d2a3e] px-1.5 py-0.5 text-[10px] text-gray-300"
                                          >
                                            {t}
                                          </span>
                                        ))}
                                      </div>
                                    )}

                                  {/* Budjet + Tasklar + Task holati */}
                                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-xs">
                                      {lead.budjet > 0 && (
                                        <div className="text-xs text-green-400">
                                          {Number(lead.budjet).toLocaleString()}{" "}
                                          so'm
                                        </div>
                                      )}
                                      {Array.isArray(lead.tasks) &&
                                        lead.tasks.length > 0 && (
                                          <div className="flex items-center gap-1 text-xs text-yellow-400/80">
                                            <CalendarCheck2 className="h-3 w-3" />
                                            <span>
                                              {lead.tasks.length} task
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                    {taskBadge && (
                                      <div
                                        className={`inline-flex max-w-[180px] items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${taskBadge.text} ${taskBadge.border} ${taskBadge.bg}`}
                                      >
                                        <CalendarCheck2 className="h-3 w-3" />
                                        <span className="truncate">
                                          {taskBadge.label}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }}
                          </Draggable>
                        ))
                      )}
                      {!hasActiveSearch && statusMeta[col.id]?.loading && (
                        <div className="flex items-center justify-center py-2 text-xs text-blue-300">
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                          Yuklanmoqda...
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>

        {canDeleteLeads && (
          <Droppable droppableId={TRASH_DROPPABLE_ID}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`fixed bottom-5 left-1/2 z-[120] -translate-x-1/2 ${
                  trashVisible ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div
                  className={`flex h-16 w-24 items-center justify-center rounded-2xl border shadow-2xl backdrop-blur-md ${
                    snapshot.isDraggingOver || trashActive
                      ? "border-red-400/80 bg-red-950/70 text-red-100"
                      : "border-red-400/30 bg-[#11263a]/95 text-red-200"
                  }`}
                >
                  <div className="relative h-9 w-9">
                    <div
                      className="absolute top-[2px] left-1/2 h-[6px] w-7 rounded-sm border border-current bg-current/15 transition-transform duration-200"
                      style={
                        snapshot.isDraggingOver || trashActive
                          ? {
                              transform: "translateX(-50%) rotate(-22deg)",
                              transformOrigin: "50% 100%",
                            }
                          : {
                              transform: "translateX(-50%) rotate(0deg)",
                              transformOrigin: "50% 100%",
                            }
                      }
                    />
                    <div className="absolute top-[8px] left-1/2 h-7 w-6 -translate-x-1/2 rounded-[6px] border-2 border-current bg-current/10" />
                    <div className="absolute top-[10px] left-1/2 h-5 w-[2px] -translate-x-[7px] rounded bg-current/50" />
                    <div className="absolute top-[10px] left-1/2 h-5 w-[2px] -translate-x-[1px] rounded bg-current/50" />
                    <div className="absolute top-[10px] left-1/2 h-5 w-[2px] translate-x-[5px] rounded bg-current/50" />
                  </div>
                </div>
                <div className="sr-only">{provided.placeholder}</div>
              </div>
            )}
          </Droppable>
        )}
      </DragDropContext>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (deletingLead) return;
          setDeleteDialogOpen(open);
          if (!open) setPendingDeleteLead(null);
        }}
      >
        <DialogContent className="border border-[#2a4868] bg-[#0b1b29] text-white">
          <DialogHeader>
            <DialogTitle>Leadni o'chirish</DialogTitle>
            <DialogDescription className="text-gray-300">
              {`${`${pendingDeleteLead?.firstName || ""} ${pendingDeleteLead?.lastName || ""}`.trim() || "Ushbu"} mijozini o'chirasizmi?`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-[#2a4868] bg-[#11263a] text-white hover:bg-[#1a3552]"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPendingDeleteLead(null);
              }}
              disabled={deletingLead}
            >
              Bekor qilish
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="!border-red-500 !bg-red-600 !text-white hover:!bg-red-700"
              onClick={handleDeleteLeadConfirm}
              disabled={deletingLead}
            >
              {deletingLead ? "O'chirilmoqda..." : "O'chirish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
<HorizontalScrollDock targetRef={boardRef} />
    </div>
  );
}
