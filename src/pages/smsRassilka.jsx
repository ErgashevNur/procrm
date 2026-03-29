import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BarChart2,
  CheckCheck,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Filter,
  Loader2,
  MessageSquare,
  PenSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Trash2,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentRole, ROLES } from "@/lib/rbac";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;
const IMAGE_BASE = "https://back.prohome.uz/api/v1/image";
const TEMPLATE_TOKENS = ["{{fullname}}", "{{firstName}}", "{{lastName}}"];

function getToken() {
  return localStorage.getItem("user") || "";
}

function getProjectId() {
  return localStorage.getItem("projectId") || "";
}

function getCompanyId() {
  try {
    const raw = localStorage.getItem("userData");
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Number(parsed?.user?.companyId || parsed?.companyId || 0);
  } catch {
    return 0;
  }
}

function hdr(json = true) {
  const h = { Authorization: `Bearer ${getToken()}` };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }

  return response;
}

function pickList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
}

function pickLeads(payload) {
  const candidates = [
    payload,
    payload?.data,
    payload?.items,
    payload?.result,
    payload?.results,
    payload?.leads,
    payload?.lead,
    payload?.data?.items,
    payload?.data?.results,
    payload?.data?.leads,
    payload?.result?.items,
    payload?.result?.results,
    payload?.result?.leads,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function pickItem(payload) {
  if (!payload || Array.isArray(payload)) return payload;
  return payload.data || payload.item || payload.result || payload;
}

async function extractApiMessage(response, fallback) {
  try {
    const text = await response.text();
    if (!text) return fallback;

    try {
      const parsed = JSON.parse(text);
      if (typeof parsed?.message === "string" && parsed.message.trim()) {
        return parsed.message;
      }
      if (typeof parsed?.error === "string" && parsed.error.trim()) {
        return parsed.error;
      }
      return fallback;
    } catch {
      return text.trim() || fallback;
    }
  } catch {
    return fallback;
  }
}

function imgUrl(src) {
  if (!src) return null;
  if (src.startsWith("http") || src.startsWith("blob:")) return src;
  return `${IMAGE_BASE}/${src}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveTemplateContent(template) {
  return template?.content || template?.message || template?.text || "";
}

function getLeadName(lead) {
  return `${lead?.firstName || ""} ${lead?.lastName || ""}`.trim() || "Noma'lum";
}

function personalizeMessage(text, lead) {
  const fullname = getLeadName(lead);
  return (text || "")
    .replaceAll("{{fullname}}", fullname)
    .replaceAll("{{firstName}}", lead?.firstName || fullname)
    .replaceAll("{{lastName}}", lead?.lastName || "");
}

function StatCard({ icon: Icon, label, value, color }) {
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

function LeadRow({ lead, checked, onToggle }) {
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

function HistoryRow({ item }) {
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
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#111827]"
        >
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

function TemplateCard({
  template,
  active,
  canManage,
  onUse,
  onEdit,
  onDelete,
  onDuplicate,
}) {
  const content = resolveTemplateContent(template);
  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        active
          ? "border-white/20 bg-[#111827]"
          : "border-white/10 bg-[#0b1220] hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#111827]">
              <FileText size={16} className="text-white/70" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {template?.name || "Nomlanmagan template"}
              </p>
              <p className="text-[11px] text-white/40">{content.length} belgi</p>
            </div>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/65">{content}</p>
        </div>
        {active ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-white/70">
            Tanlangan
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="xs" onClick={() => onUse(template)}>
          <Zap />
          Qo'llash
        </Button>
        {canManage ? (
          <>
            <Button size="xs" variant="outline" onClick={() => onEdit(template)}>
              <PenSquare />
              Tahrirlash
            </Button>
            <Button size="xs" variant="ghost" onClick={() => onDuplicate(template)}>
              <Copy />
              Nusxa
            </Button>
            <Button size="xs" variant="ghost" onClick={() => onDelete(template)}>
              <Trash2 />
              O'chirish
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function TemplateDialog({
  open,
  mode,
  form,
  saving,
  onOpenChange,
  onChange,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-white/10 bg-[#08131e] text-white">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Template tahrirlash" : "Yangi template"}</DialogTitle>
          <DialogDescription className="text-white/55">
            SMS uchun qayta ishlatiladigan matnlarni shu yerda saqlaysiz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Template nomi</label>
            <Input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Masalan, Welcome message"
              className="border-white/10 bg-white/[0.04] text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Xabar matni</label>
            <textarea
              value={form.content}
              onChange={(e) => onChange("content", e.target.value)}
              rows={8}
              placeholder="Hurmatli {{fullname}}, siz uchun yangi taklif tayyor."
              className="min-h-44 w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-cyan-400/50"
            />
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Qo'llab-quvvatlanadigan tokenlar
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TEMPLATE_TOKENS.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => onChange("content", `${form.content}${form.content ? " " : ""}${token}`)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-cyan-300 transition-colors hover:border-cyan-400/40"
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {mode === "edit" ? "Saqlash" : "Template yaratish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SmsRassilka() {
  const projectId = getProjectId();
  const companyId = getCompanyId();
  const role = getCurrentRole();
  const canManageTemplates = [ROLES.SUPERADMIN, ROLES.ROP].includes(role);

  const [leads, setLeads] = useState([]);
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState(null);
  const [templatePermissionDenied, setTemplatePermissionDenied] = useState(false);

  const [tab, setTab] = useState("compose");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [templateSearch, setTemplateSearch] = useState("");
  const [activeTemplateId, setActiveTemplateId] = useState(null);

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateMode, setTemplateMode] = useState("create");
  const [templateForm, setTemplateForm] = useState({ id: null, name: "", content: "" });

  const textRef = useRef(null);

  const fetchAll = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const [leadRes, historyRes, templateRes] = await Promise.all([
        apiFetch(`${API}/leeds?projectId=${projectId}`, { headers: hdr(false) }),
        apiFetch(`${API}/sms/history?projectId=${projectId}`, { headers: hdr(false) }),
        apiFetch(`${API}/sms-template`, { headers: hdr(false) }),
      ]);

      if (leadRes?.ok) {
        const data = await leadRes.json();
        setLeads(pickLeads(data));
      }

      if (historyRes?.ok) {
        const data = await historyRes.json();
        const list = pickList(data);
        setHistory(list);
        setStats({
          total: list.length,
          sent: list.filter((item) => ["SENT", "SUCCESS"].includes(item?.status)).length,
          pending: list.filter((item) => item?.status === "PENDING").length,
          failed: list.filter((item) => item?.status === "FAILED").length,
        });
      } else {
        setHistory([]);
        setStats({ total: 0, sent: 0, pending: 0, failed: 0 });
      }

      if (templateRes?.ok) {
        const data = await templateRes.json();
        const list = pickList(data).filter((item) => {
          if (!companyId) return true;
          return !item?.companyId || Number(item.companyId) === Number(companyId);
        });
        setTemplates(list);
        setTemplatePermissionDenied(false);
      } else if (templateRes?.status === 403) {
        setTemplates([]);
        setTemplatePermissionDenied(true);
      } else {
        setTemplates([]);
        setTemplatePermissionDenied(false);
      }
    } catch (error) {
      console.error(error);
      if (!silent) toast.error("SMS bo'limi ma'lumotlari yuklanmadi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [message]);

  const uniqueStatuses = useMemo(
    () => [...new Set(leads.map((lead) => lead?.status?.name).filter(Boolean))],
    [leads],
  );

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const query = search.trim().toLowerCase();
      const name = getLeadName(lead).toLowerCase();

      if (query && !name.includes(query) && !lead?.phone?.includes(search.trim())) {
        return false;
      }

      if (filterStatus !== "all" && lead?.status?.name !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [filterStatus, leads, search]);

  useEffect(() => {
    if (selectAll) setSelected(new Set(filteredLeads.map((lead) => lead.id)));
    else setSelected(new Set());
  }, [selectAll, filteredLeads]);

  const filteredTemplates = useMemo(() => {
    const query = templateSearch.trim().toLowerCase();
    return templates.filter((template) => {
      if (!query) return true;
      return [template?.name, resolveTemplateContent(template)]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [templateSearch, templates]);

  const selectedLead = useMemo(() => {
    if (selected.size === 0) return leads[0] || null;
    return leads.find((lead) => selected.has(lead.id)) || leads[0] || null;
  }, [leads, selected]);

  const charCount = message.length;
  const smsCount = Math.max(1, Math.ceil(charCount / 160));
  const selectionCount = selected.size;
  const estimatedMessages = selectionCount * smsCount;
  const personalizedPreview = personalizeMessage(message, selectedLead);

  const toggleLead = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreateTemplate = () => {
    if (!canManageTemplates) {
      toast.error("Sizda template yaratish uchun ruxsat yo'q");
      return;
    }
    setTemplateMode("create");
    setTemplateForm({ id: null, name: "", content: "" });
    setTemplateDialogOpen(true);
  };

  const openEditTemplate = (template) => {
    if (!canManageTemplates) {
      toast.error("Sizda template tahrirlash uchun ruxsat yo'q");
      return;
    }
    setTemplateMode("edit");
    setTemplateForm({
      id: template?.id || null,
      name: template?.name || "",
      content: resolveTemplateContent(template),
    });
    setTemplateDialogOpen(true);
  };

  const applyTemplate = (template) => {
    setMessage(resolveTemplateContent(template));
    setActiveTemplateId(template?.id || null);
    setTab("compose");
    toast.success(`"${template?.name || "Template"}" qo'llandi`);
  };

  const duplicateTemplate = (template) => {
    setTemplateMode("create");
    setTemplateForm({
      id: null,
      name: `${template?.name || "Template"} copy`,
      content: resolveTemplateContent(template),
    });
    setTemplateDialogOpen(true);
  };

  const saveTemplate = async () => {
    if (!canManageTemplates) {
      toast.error("Sizda template boshqarish uchun ruxsat yo'q");
      return;
    }
    if (!templateForm.name.trim()) {
      toast.error("Template nomi kiritilmagan");
      return;
    }
    if (!templateForm.content.trim()) {
      toast.error("Template matni kiritilmagan");
      return;
    }
    if (!companyId) {
      toast.error("Company ID topilmadi");
      return;
    }

    setSavingTemplate(true);
    try {
      const isEdit = templateMode === "edit" && templateForm.id;
      const url = isEdit ? `${API}/sms-template/${templateForm.id}` : `${API}/sms-template`;
      const payload = {
        companyId: Number(companyId),
        name: templateForm.name.trim(),
        content: templateForm.content.trim(),
      };

      const response = await apiFetch(url, {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      if (!response?.ok) {
        const message =
          response?.status === 403
            ? "Sizda template saqlash uchun ruxsat yo'q"
            : await extractApiMessage(response, "Template saqlashda xato yuz berdi");
        throw new Error(message);
      }

      const data = await response.json().catch(() => null);
      const saved = pickItem(data) || payload;

      setTemplates((prev) => {
        if (isEdit) {
          return prev.map((item) =>
            item.id === templateForm.id ? { ...item, ...saved, ...payload } : item,
          );
        }
        return [saved, ...prev];
      });

      setTemplateDialogOpen(false);
      setActiveTemplateId(saved?.id || templateForm.id || null);
      toast.success(isEdit ? "Template yangilandi" : "Template yaratildi");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Template saqlashda xato yuz berdi");
    } finally {
      setSavingTemplate(false);
    }
  };

  const removeTemplate = async (template) => {
    if (!canManageTemplates) {
      toast.error("Sizda template o'chirish uchun ruxsat yo'q");
      return;
    }
    if (!template?.id) return;

    const confirmed = window.confirm(`"${template.name}" templatega o'chirish berilsinmi?`);
    if (!confirmed) return;

    setDeletingTemplateId(template.id);
    try {
      const response = await apiFetch(`${API}/sms-template/${template.id}`, {
        method: "DELETE",
        headers: hdr(false),
      });

      if (!response?.ok) {
        const message =
          response?.status === 403
            ? "Sizda template o'chirish uchun ruxsat yo'q"
            : await extractApiMessage(response, "Template o'chirishda xato yuz berdi");
        throw new Error(message);
      }

      setTemplates((prev) => prev.filter((item) => item.id !== template.id));
      if (activeTemplateId === template.id) setActiveTemplateId(null);
      toast.success("Template o'chirildi");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Template o'chirishda xato yuz berdi");
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Xabar matni kiritilmagan");
      return;
    }
    if (selected.size === 0) {
      toast.error("Hech bo'lmasa bitta qabulchi tanlang");
      return;
    }

    setSending(true);
    try {
      const response = await apiFetch(`${API}/sms/send`, {
        method: "POST",
        body: JSON.stringify({
          projectId: Number(projectId),
          message: message.trim(),
          leadIds: [...selected],
        }),
      });

      if (!response?.ok) {
        const message =
          response?.status === 403
            ? "Sizda SMS yuborish uchun ruxsat yo'q"
            : await extractApiMessage(response, "SMS yuborishda xato yuz berdi");
        throw new Error(message);
      }

      toast.success(`${selected.size} ta mijozga SMS yuborildi`);
      setMessage("");
      setSelected(new Set());
      setSelectAll(false);
      setTab("history");
      await fetchAll(true);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "SMS yuborishda xato yuz berdi");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 bg-[#0b1220] p-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="h-[640px] rounded-2xl" />
          <Skeleton className="h-[640px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#071828] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/8 bg-[#0a1b2d] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563eb] shadow-[0_8px_24px_rgba(37,99,235,0.35)]">
              <MessageSquare size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold">SMS Rassilka</h1>
              <p className="text-xs text-white/40">{leads.length} ta mijoz mavjud</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManageTemplates ? (
              <Button size="sm" variant="outline" onClick={openCreateTemplate}>
                <Plus />
                Template
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => fetchAll(true)} disabled={refreshing}>
              {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Yangilash
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0a1b2d]">
            <div className="flex border-b border-white/6">
              {[
                ["compose", "Yuborish", Send],
                ["history", "Tarix", BarChart2],
              ].map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className="flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors"
                  style={{
                    borderBottomColor: tab === key ? "#2563eb" : "transparent",
                    color: tab === key ? "#60a5fa" : "rgba(255,255,255,0.35)",
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {tab === "compose" ? (
              <div className="flex h-[calc(100vh-180px)] flex-col">
                <div className="border-b border-white/6 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                      Xabar matni
                    </p>
                    <span className="text-[11px] text-white/35">
                      {charCount} belgi · {smsCount} SMS
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[#1d4ed8]/40 bg-[#081726] p-3 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08)]">
                    <textarea
                      ref={textRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="SMS xabar matnini kiriting..."
                      rows={4}
                      className="min-h-28 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/22"
                    />
                    <div className="mt-3 h-[2px] overflow-hidden rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min((charCount / 160) * 100, 100)}%`,
                          background: charCount > 140 ? "#f59e0b" : "#2563eb",
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {templates.slice(0, 3).map((template) => (
                      <button
                        key={template?.id || template?.name}
                        onClick={() => applyTemplate(template)}
                        className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[11px] text-white/50 transition-colors hover:text-white"
                      >
                        <Zap size={10} className="mr-1 inline" />
                        {template?.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-b border-white/6 px-4 py-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-xs text-white/55">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => setSelectAll(e.target.checked)}
                        className="h-4 w-4 rounded accent-blue-500"
                      />
                      Barchasi
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[10px] font-semibold text-blue-300">
                        {selectionCount} ta
                      </span>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/55 outline-none"
                      >
                        <option value="all">Barcha status</option>
                        {uniqueStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                    <Search size={14} className="text-white/25" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Mijoz ismi yoki telefon..."
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/22"
                    />
                    {search ? (
                      <button onClick={() => setSearch("")} className="text-white/30 hover:text-white">
                        <X size={14} />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  {filteredLeads.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <Users size={28} className="text-white/15" />
                      <p className="mt-3 text-sm text-white/40">Mijozlar topilmadi</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredLeads.map((lead) => (
                        <LeadRow
                          key={lead.id}
                          lead={lead}
                          checked={selected.has(lead.id)}
                          onToggle={toggleLead}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/6 p-4">
                  <Button
                    className="w-full"
                    onClick={handleSend}
                    disabled={sending || !message.trim() || selectionCount === 0}
                  >
                    {sending ? <Loader2 className="animate-spin" /> : <Send />}
                    {sending ? "Yuborilmoqda..." : "Yuborish"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[calc(100vh-180px)] overflow-y-auto p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Yuborish tarixi</p>
                    <p className="text-xs text-white/35">{history.length} ta yozuv</p>
                  </div>
                </div>
                {history.length === 0 ? (
                  <div className="flex h-[320px] flex-col items-center justify-center text-center">
                    <Clock size={30} className="text-white/15" />
                    <p className="mt-3 text-sm text-white/40">Tarix bo'sh</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, index) => (
                      <HistoryRow key={item?.id || index} item={item} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-[#0a1b2d] p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                Statistika
              </p>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard icon={Send} label="Jami" value={stats?.total ?? 0} color="#3b82f6" />
                <StatCard icon={CheckCheck} label="Yuborildi" value={stats?.sent ?? 0} color="#10b981" />
                <StatCard icon={Clock} label="Kutilmoqda" value={stats?.pending ?? 0} color="#f59e0b" />
                <StatCard icon={XCircle} label="Xato" value={stats?.failed ?? 0} color="#ef4444" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_320px]">
              <div className="rounded-2xl border border-white/8 bg-[#0a1b2d] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                      Template
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">SMS shablonlari</p>
                  </div>
                  {canManageTemplates ? (
                    <Button size="sm" variant="outline" onClick={openCreateTemplate}>
                      <Plus />
                      Qo'shish
                    </Button>
                  ) : null}
                </div>

                <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                  <Search size={14} className="text-white/25" />
                  <input
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Template qidirish..."
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/22"
                  />
                </div>

                {templatePermissionDenied ? (
                  <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-white/8 bg-white/[0.02] px-6 text-center">
                    <AlertCircle size={26} className="text-amber-300/80" />
                    <p className="mt-3 text-sm text-white/70">
                      Template bo'limiga kirish uchun ruxsat yetarli emas
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      Template yaratish va tahrirlash faqat ruxsatli rollarga ochiq.
                    </p>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-white/8 bg-white/[0.02] text-center">
                    <FileText size={26} className="text-white/15" />
                    <p className="mt-3 text-sm text-white/40">Template topilmadi</p>
                  </div>
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {filteredTemplates.map((template) => (
                      <div key={template?.id || template?.name} className="relative">
                        <TemplateCard
                          template={template}
                          active={activeTemplateId === template?.id}
                          canManage={canManageTemplates}
                          onUse={applyTemplate}
                          onEdit={openEditTemplate}
                          onDelete={removeTemplate}
                          onDuplicate={duplicateTemplate}
                        />
                        {deletingTemplateId === template?.id ? (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#08131e]/70">
                            <Loader2 className="animate-spin text-white" />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/8 bg-[#0a1b2d] p-5">
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
                  SMS ko'rinishi
                </p>

                <div className="mx-auto w-[250px] rounded-[34px] border-4 border-white/10 bg-[#081726] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
                  <div className="mb-4 flex justify-center">
                    <div className="h-1.5 w-20 rounded-full bg-white/10" />
                  </div>

                  <div className="rounded-[24px] bg-[#071828] p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-bold">
                        P
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-white">ProHome</p>
                        <p className="text-[9px] text-white/35">SMS</p>
                      </div>
                    </div>

                    {message.trim() ? (
                      <div className="rounded-[18px] rounded-tl-sm bg-[#2563eb] px-3.5 py-2.5 text-xs leading-6 text-white">
                        {personalizedPreview}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-[11px] text-white/30">
                        Xabar matni kiritilganda preview shu yerda ko'rinadi
                      </div>
                    )}

                    <div className="mt-2 text-right text-[9px] text-white/25">
                      {new Date().toLocaleTimeString("uz-UZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-center">
                    <div className="h-1 w-24 rounded-full bg-white/10" />
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/65">
                  <div className="mb-2 flex items-center justify-between">
                    <span>Qabulchilar</span>
                    <span className="font-semibold text-white">{selectionCount} ta</span>
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <span>Bir qabulchiga</span>
                    <span className="font-semibold text-white">{smsCount} SMS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Jami taxmin</span>
                    <span className="font-semibold text-white">{estimatedMessages} SMS</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.03] p-4 text-sm text-white/55">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p>
                      Template tokenlari preview'da tanlangan birinchi mijoz bilan ko'rsatiladi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TemplateDialog
        open={templateDialogOpen}
        mode={templateMode}
        form={templateForm}
        saving={savingTemplate}
        onOpenChange={setTemplateDialogOpen}
        onChange={(field, value) => setTemplateForm((prev) => ({ ...prev, [field]: value }))}
        onSubmit={saveTemplate}
      />
    </div>
  );
}
