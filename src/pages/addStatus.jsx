import { useState, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  Plus,
  Trash2,
  Pen,
  RefreshCcw,
  X,
  Lock,
  LockKeyholeIcon,
  Instagram,
  Facebook,
  Youtube,
  Send,
  Type,
  Mail,
  Phone,
  ListChecks,
  SquareCheckBig,
  FileText,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "../components/ui/skeleton";
import { ROLES, canDeleteData, getCurrentRole } from "@/lib/rbac";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../components/ui/button";
import HorizontalScrollDock from "@/components/HorizontalScrollDock";
import { getProjectSlugFromStorage, getPublicFormUrl } from "@/lib/formLinks";
import FormBuilderDialog from "@/components/add-status/FormBuilderDialog";
import InsertModal from "@/components/add-status/InsertModal";
import SortableColumn from "@/components/add-status/SortableColumn";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

const COLORS = [
  "#4B0082",
  "#CC7722",
  "#006400",
  "#0D1B2A",
  "#8b5cf6",
  "#800000",
  "#2F4F4F",
  "#5C4033",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];
// salom

const SOURCE_CARDS = [
  {
    variant: "template",
    template: {
      id: "google-form",
      name: "Google Form",
      color: "#3b82f6",
    },
  },
];

const SOCIAL_CHANNELS = [
  {
    id: "instagram",
    name: "Instagram",
    hint: "@company",
    icon: Instagram,
    color: "#E4405F",
    bg: "rgba(228,64,95,0.14)",
  },
  {
    id: "facebook",
    name: "Facebook",
    hint: "Business Page",
    icon: Facebook,
    color: "#1877F2",
    bg: "rgba(24,119,242,0.14)",
  },
  {
    id: "telegram",
    name: "Telegram",
    hint: "@username",
    icon: Send,
    color: "#229ED9",
    bg: "rgba(34,158,217,0.14)",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    hint: "@username",
    icon: Send,
    color: "#25D366",
    bg: "rgba(37,211,102,0.14)",
  },
];

const CANCELED_TYPES = ["CANCELED", "CANCELLED"];
const PROTECTED_TYPES = ["NEW", "SUCCESS", ...CANCELED_TYPES];

const normalizeType = (type) => String(type || "").toUpperCase();
const FORM_FIELD_TYPES = [
  { value: "text", label: "Text", icon: Type },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "textarea", label: "Textarea", icon: FileText },
  { value: "select", label: "Select", icon: ListChecks },
  { value: "checkbox", label: "Checkbox", icon: SquareCheckBig },
];

const createField = (type = "text") => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  label: "",
  type,
  required: false,
  placeholder: "",
  options: type === "select" ? ["Variant 1", "Variant 2"] : [],
});

const HEADER_IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";
const HEADER_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const HEADER_IMAGE_MAX_WIDTH = 1600;
const HEADER_IMAGE_MAX_HEIGHT = 600;
function getImageSource(rawValue) {
  const raw = String(rawValue || "").trim();
  if (!raw) return null;
  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;

  let cleaned = raw;
  if (/^https?:\/\//i.test(cleaned)) {
    try {
      cleaned = new URL(cleaned).pathname || "";
    } catch {
      // keep as-is
    }
  }

  cleaned = cleaned.split("?")[0].split("#")[0].replace(/\\/g, "/");
  const fileName =
    cleaned
      .split("/")
      .map((item) => item.trim())
      .filter(Boolean)
      .pop() || "";

  if (!fileName) return null;
  return `${API}/image/${encodeURIComponent(fileName)}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Rasmni yuklab bo'lmadi"));
    img.src = src;
  });
}

async function optimizeHeaderImage(file) {
  if (!file) return null;
  if (
    !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)
  ) {
    throw new Error("Faqat PNG, JPG yoki WEBP formatlari qo'llanadi");
  }
  if (file.size > HEADER_IMAGE_MAX_SIZE) {
    throw new Error("Rasm hajmi 5 MB dan oshmasligi kerak");
  }

  const src = await readFileAsDataUrl(file);
  const img = await loadImage(src);
  const scale = Math.min(
    1,
    HEADER_IMAGE_MAX_WIDTH / img.width,
    HEADER_IMAGE_MAX_HEIGHT / img.height,
  );
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/webp", 0.86);

  return {
    name: file.name,
    type: "image/webp",
    dataUrl,
    width,
    height,
  };
}

function normalizeFormListResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function normalizeFieldOptions(rawOptions) {
  if (Array.isArray(rawOptions)) return rawOptions.filter(Boolean);
  if (rawOptions && typeof rawOptions === "object") {
    return Object.entries(rawOptions)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, value]) => value)
      .filter(Boolean);
  }
  return [];
}

function normalizeTemplateFields(template) {
  const rawFields = Array.isArray(template?.fields)
    ? template.fields
    : Array.isArray(template?.formFields)
      ? template.formFields
      : [];

  return rawFields.map((field, index) => ({
    ...field,
    fieldId: Number(field?.fieldId || field?.id) || undefined,
    id: `field-${field?.fieldId || field?.id || index + 1}-${Math.random().toString(36).slice(2, 7)}`,
    label: field?.label || `Field ${index + 1}`,
    type: String(field?.fieldType || field?.type || "text").toLowerCase(),
    required: Boolean(field?.required ?? field?.isRequired),
    placeholder: field?.placeholder || "",
    options: normalizeFieldOptions(field?.options),
  }));
}

function normalizeTemplateItem(template, projectSlug) {
  const id = Number(template?.id || template?.formTemplateId);
  if (!id) return null;

  const headerSource =
    template?.headerImage?.dataUrl ||
    template?.headerImage?.name ||
    template?.image;

  const headerImage = template?.headerImage
    ? {
        ...template.headerImage,
        dataUrl: getImageSource(headerSource),
      }
    : headerSource
      ? {
          dataUrl: getImageSource(headerSource),
          name: headerSource,
          _persisted: true,
        }
      : null;

  return {
    ...template,
    id,
    title: template?.name || template?.title || `Forma #${id}`,
    description: template?.description || "",
    telegramUrl: template?.telegramUrl || "",
    fields: normalizeTemplateFields(template),
    createdAt:
      template?.createdAt || template?.created_at || new Date().toISOString(),
    headerImage,
    sourceId: "google-form",
    link: getPublicFormUrl(id, { projectSlug }),
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const isProtected = (col) =>
  col && PROTECTED_TYPES.includes(normalizeType(col.type));

function getRestrictedRanges(cols) {
  const protectedIndexes = cols.reduce((acc, col, index) => {
    if (isProtected(col)) acc.push(index);
    return acc;
  }, []);

  const ranges = [];
  for (let i = 0; i < protectedIndexes.length - 1; i += 1) {
    const start = protectedIndexes[i] + 1;
    const end = protectedIndexes[i + 1] - 1;
    if (start <= end) ranges.push([start, end]);
  }

  return ranges;
}

function isInRestrictedRange(index, ranges) {
  return ranges.some(([start, end]) => index >= start && index <= end);
}

// ── Sortable column wrapper ──────────────────────────────────────────────────

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AddStatus() {
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");
  const projectSlug = getProjectSlugFromStorage();
  const role = getCurrentRole();
  const canDeleteStatuses = canDeleteData(role);
  const canDeleteTemplates = [
    ROLES.SUPERADMIN,
    ROLES.ROP,
    ROLES.ADMIN,
  ].includes(role);

  const boardScrollRef = useRef(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insertAfterId, setInsertAfterId] = useState(null);
  const insertBtnRefs = useRef({});
  const [editId, setEditId] = useState(null);
  const [updateName, setUpdateName] = useState("");
  const [updateColor, setUpdateColor] = useState("#3b82f6");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [templateModal, setTemplateModal] = useState(null);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [formBuilderSource, setFormBuilderSource] = useState(null);
  const [formBuilderTemplateId, setFormBuilderTemplateId] = useState(null);
  const [editBuilderOpen, setEditBuilderOpen] = useState(false);
  const [editBuilderTemplateId, setEditBuilderTemplateId] = useState(null);
  const [formTemplates, setFormTemplates] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const formClickTimerRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const openTemplateModal = (template) => {
    if (!template) return;
    setTemplateModal({
      template,
      afterId: 0,
    });
  };

  const closeTemplateModal = () => setTemplateModal(null);

  const clearFormClickTimer = () => {
    if (formClickTimerRef.current) {
      clearTimeout(formClickTimerRef.current);
      formClickTimerRef.current = null;
    }
  };

  const openFormBuilder = (template, templateId = null) => {
    if (!template) return;
    setEditBuilderOpen(false);
    setEditBuilderTemplateId(null);
    setSourceModalOpen(false);
    setFormBuilderTemplateId(templateId ? Number(templateId) : null);
    setFormBuilderSource(template);
  };

  const openEditBuilder = (form) => {
    const sourceTemplate = SOURCE_CARDS.find(
      (card) => card.variant === "template",
    )?.template;
    const formId = Number(form?.id || 0);
    if (!sourceTemplate || !formId) {
      toast.error("Tahrirlanadigan forma topilmadi");
      return;
    }

    setFormBuilderSource(null);
    setFormBuilderTemplateId(null);
    setSourceModalOpen(false);
    setEditBuilderTemplateId(formId);
    setEditBuilderOpen(true);
  };

  const handleFormCardClick = (form) => {
    clearFormClickTimer();
    formClickTimerRef.current = setTimeout(() => {
      closeContextMenu();
      if (!form?.link) return;
      window.open(form.link, "_blank", "noopener,noreferrer");
      formClickTimerRef.current = null;
    }, 220);
  };

  const handleFormCardDoubleClick = (form) => {
    clearFormClickTimer();
    closeContextMenu();
    openEditBuilder(form);
  };

  const handleFormContextMenu = (e, form) => {
    e.preventDefault();
    e.stopPropagation();
    clearFormClickTimer();
    setContextMenu({ x: e.clientX, y: e.clientY, form });
  };

  const closeContextMenu = () => setContextMenu(null);

  useEffect(() => () => clearFormClickTimer(), []);

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    if (!projectId) {
      setLoading(false);
      return;
    }
    fetchColumns();
    fetchFormTemplates();
  }, []);

  const fetchColumns = async () => {
    try {
      const res = await fetch(`${API}/status/${projectId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setColumns(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Ustunlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  const fetchFormTemplates = async () => {
    if (!projectId) {
      setFormTemplates([]);
      return;
    }

    setFormsLoading(true);
    try {
      const res = await fetch(`${API}/form-template/by/${projectId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error();

      const data = await res.json();
      const normalized = normalizeFormListResponse(data)
        .map((template) => normalizeTemplateItem(template, projectSlug))
        .filter(Boolean);

      setFormTemplates(normalized);
    } catch {
      setFormTemplates([]);
      toast.error("Formalarni yuklab bo'lmadi");
    } finally {
      setFormsLoading(false);
    }
  };

  const fetchFormTemplateById = async (templateId) => {
    const res = await fetch(`${API}/form-template/${templateId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      return null;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Formani yuklab bo'lmadi");
    }

    const data = await res.json();
    return normalizeTemplateItem(data, projectSlug);
  };

  const deleteFormTemplate = async (templateId) => {
    if (!canDeleteTemplates) {
      toast.error("Sizda formani o'chirish uchun ruxsat yo'q");
      return;
    }

    const res = await fetch(`${API}/form-template/${templateId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || "Formani o'chirib bo'lmadi");
    }

    await fetchFormTemplates();
    toast.success("Forma o'chirildi");
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeCol = columns.find((c) => c.id === active.id);
    if (isProtected(activeCol)) {
      toast.error(`"${activeCol.name}" statusini ko'chirish mumkin emas ❌`);
      return;
    }

    const oldIndex = columns.findIndex((c) => c.id === active.id);
    const newIndex = columns.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const prevColumns = columns;
    const reordered = arrayMove(columns, oldIndex, newIndex);
    const movedIndex = reordered.findIndex((c) => c.id === active.id);

    const sourceInRestricted = isInRestrictedRange(
      oldIndex,
      getRestrictedRanges(columns),
    );
    const targetInRestricted = isInRestrictedRange(
      movedIndex,
      getRestrictedRanges(reordered),
    );

    if (!sourceInRestricted && targetInRestricted) {
      toast.error("Bu oraliqqa boshqa joydan ko'chirib bo'lmaydi ❌");
      return;
    }

    setColumns(reordered);

    const afterId = movedIndex === 0 ? 0 : reordered[movedIndex - 1].id;
    try {
      const res = await fetch(`${API}/status/update/order`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: Number(projectId),
          statusId: Number(active.id),
          after: Number(afterId),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Tartib saqlandi ✅");
    } catch (err) {
      setColumns(prevColumns);
      toast.error("Saqlashda xato: " + err.message);
    }
  };

  const handleInsertSubmit = async (payload) => {
    const tempId = Date.now();
    const tempCol = {
      id: tempId,
      name: payload.name,
      color: payload.color,
      _temp: true,
    };

    setColumns((prev) => {
      let next;
      if (!payload.after) next = [tempCol, ...prev];
      else {
        const idx = prev.findIndex((c) => c.id === payload.after);
        next =
          idx === -1
            ? [...prev, tempCol]
            : [...prev.slice(0, idx + 1), tempCol, ...prev.slice(idx + 1)];
      }
      return next;
    });

    try {
      const res = await fetch(`${API}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setColumns((prev) =>
        prev.map((c) => (c.id === tempId ? { ...data } : c)),
      );
      toast.success("Status qo'shildi ✅");
    } catch (err) {
      setColumns((prev) => prev.filter((c) => c.id !== tempId));
      toast.error("Qo'shishda xato: " + err.message);
    }
  };

  const deleteColumn = async (columnId) => {
    if (!canDeleteStatuses) {
      toast.error("Sizda statusni o'chirish uchun ruxsat yo'q");
      return;
    }
    const prev = columns;
    setColumns((c) => c.filter((col) => col.id !== columnId));
    try {
      const res = await fetch(`${API}/status/${columnId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Xato");
      }
      toast.success("Status o'chirildi ✅");
    } catch (err) {
      setColumns(prev);
      toast.error(err.message || "O'chirishda xato ❌");
    }
  };

  const updateColumn = async (columnId) => {
    if (!updateName.trim()) return;
    setUpdateLoading(true);
    const body = { name: updateName.trim(), color: updateColor };
    const prev = columns;
    setColumns((c) =>
      c.map((col) => (col.id === columnId ? { ...col, ...body } : col)),
    );
    setEditId(null);
    try {
      const res = await fetch(`${API}/status/${columnId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success("Status yangilandi ✅");
    } catch {
      setColumns(prev);
      toast.error("Yangilashda xato ❌");
    } finally {
      setUpdateLoading(false);
    }
  };

  const googleForms = formTemplates;

  if (loading) {
    return (
      <div className="flex gap-0 overflow-x-auto bg-[#0a1929] p-6">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="w-72 shrink-0">
              <Skeleton className="mb-3 h-12 w-full rounded-lg bg-[#1c2b3a]" />
              <Skeleton className="h-48 w-full rounded-lg bg-[#1c2b3a]" />
            </div>
          ))}
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#0a1929] text-gray-400">
        Pipeline sahifasidan loyihani tanlang
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a1929]">
      <div className="flex flex-1 overflow-hidden">
        <div
          ref={boardScrollRef}
          className="scrollbar-hide flex flex-1 gap-0 overflow-x-auto"
        >
          <div
            className="relative flex h-full shrink-0 flex-col border-r border-[#1a3a52] px-4 py-6"
            style={{ width: "280px" }}
          >
            <div>
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Google Form va boshqa kanallar
              </p>
              <p className="mt-5 text-xs text-gray-500">
                Sizning yasagan formalaringiz royhati.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {SOURCE_CARDS.map((card, index) => (
                <div
                  key={index}
                  className="rounded-2xl p-3 text-sm text-gray-200"
                >
                  <div className="flex items-center justify-between">
                    {card.variant === "toggle" ? (
                      <span
                        className={`h-3 w-3 rounded-full ${
                          card.active ? "bg-blue-400" : "bg-gray-600"
                        }`}
                      />
                    ) : null}
                  </div>

                  {card.variant === "link" && (
                    <button
                      type="button"
                      className="mt-2 text-[11px] font-semibold text-blue-400 underline"
                    >
                      {card.linkText}
                    </button>
                  )}
                  {card.variant === "template" && (
                    <>
                      <div className="mt-3 rounded-xl border border-blue-400/15 bg-blue-500/10 p-3">
                        <div className="space-y-2">
                          {googleForms.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.04] px-3 py-3 text-[11px] text-blue-100/70">
                              Hali Google Form yaratilmagan
                            </div>
                          ) : (
                            googleForms.slice(0, 3).map((form) => (
                              <div
                                key={form.id}
                                onClick={() => handleFormCardClick(form)}
                                onDoubleClick={() =>
                                  handleFormCardDoubleClick(form)
                                }
                                onContextMenu={(e) =>
                                  handleFormContextMenu(e, form)
                                }
                                className="flex cursor-pointer gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"
                              >
                                <FileText />

                                <span
                                  className="block w-full truncate text-left text-[12px] font-semibold text-blue-200 underline decoration-blue-300/60 underline-offset-3 transition hover:text-blue-100"
                                  title={form.title}
                                >
                                  {form.title}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <button
                type="button"
                onClick={() => setSourceModalOpen(true)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-[#0f1d3a]/70 px-4 py-3 text-xs font-semibold tracking-widest text-white uppercase transition hover:border-white/70 hover:bg-white/10"
              >
                <Plus size={14} />
                Qo'shish
              </button>
            </div>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => setActiveId(active.id)}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext
              items={columns.map((c) => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column, index) => {
                const locked = isProtected(column);
                return (
                  <SortableColumn
                    key={column.id}
                    id={column.id}
                    disabled={locked}
                  >
                    {({ listeners, attributes }) => (
                      <div
                        className="relative flex h-full shrink-0 flex-col border-r border-[#1a3a52]"
                        style={{ width: "280px" }}
                      >
                        <div
                          className="relative shrink-0 bg-[#0f2942]"
                          style={{
                            borderBottom: `3px solid ${column.color || "#6b7280"}`,
                          }}
                        >
                          <div className="flex items-center justify-between px-4 py-3">
                            <h2 className="text-xs font-semibold tracking-widest text-white uppercase">
                              {column.name}
                              {column._temp && (
                                <span className="ml-2 text-[10px] font-normal text-gray-500 normal-case">
                                  saqlanmoqda...
                                </span>
                              )}
                              {/* Lock belgisi protected columnlar uchun */}
                              {locked && (
                                <span className="ml-2 text-[10px] font-normal text-gray-500 normal-case">
                                  <LockKeyholeIcon
                                    size={11}
                                    className="inline-block"
                                  />
                                </span>
                              )}
                            </h2>

                            <div className="flex items-center gap-2">
                              {locked ? (
                                <span
                                  className="group relative inline-flex cursor-not-allowed items-center justify-center text-[#3a5570]/30 select-none"
                                  title="Bu statusni drag & drop qilib bo'lmaydi"
                                >
                                  <span className="transition-opacity duration-150 group-hover:opacity-0">
                                    ⠿
                                  </span>
                                  <Lock
                                    size={11}
                                    className="pointer-events-none absolute text-[#94a3b8] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                                  />
                                </span>
                              ) : (
                                <span
                                  {...listeners}
                                  {...attributes}
                                  className="cursor-grab text-[#3a5570] select-none active:cursor-grabbing"
                                >
                                  ⠿
                                </span>
                              )}

                              {canDeleteStatuses ? (
                                <button
                                  onClick={() => deleteColumn(column.id)}
                                  disabled={!!column._temp}
                                  className="text-gray-500 transition-colors hover:text-red-500 disabled:opacity-30"
                                >
                                  <Trash2 size={14} />
                                </button>
                              ) : null}

                              <Dialog
                                open={editId === column.id}
                                onOpenChange={(open) => {
                                  if (open) {
                                    setEditId(column.id);
                                    setUpdateName(column.name);
                                    setUpdateColor(column.color || "#3b82f6");
                                  } else setEditId(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <button
                                    disabled={!!column._temp}
                                    className="text-gray-500 transition-colors hover:text-blue-400 disabled:opacity-30"
                                  >
                                    <Pen size={14} />
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#0f2231] text-white">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Statusni tahrirlash
                                    </DialogTitle>
                                    <DialogDescription className="sr-only">
                                      Status nomi va rangini tahrirlash oynasi.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      updateColumn(column.id);
                                    }}
                                    className="space-y-4 pt-2"
                                  >
                                    <input
                                      type="text"
                                      value={updateName}
                                      onChange={(e) =>
                                        setUpdateName(e.target.value)
                                      }
                                      placeholder="Nom kiriting..."
                                      className="w-full rounded-lg border border-[#2a4a62] bg-[#1a3a52] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                      autoFocus
                                    />
                                    <div>
                                      <p className="mb-2 text-xs text-gray-400">
                                        Rang
                                      </p>
                                      <div className="grid grid-cols-8 gap-2">
                                        {COLORS.map((c) => (
                                          <button
                                            type="button"
                                            key={c}
                                            onClick={() => setUpdateColor(c)}
                                            className={`h-7 w-7 rounded-full transition-all ${updateColor === c ? "ring-2 ring-white ring-offset-1 ring-offset-[#0f2231]" : "hover:scale-110"}`}
                                            style={{ backgroundColor: c }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <Button
                                      type="submit"
                                      className="w-full"
                                      disabled={
                                        updateLoading || !updateName.trim()
                                      }
                                    >
                                      <RefreshCcw
                                        size={14}
                                        className={
                                          updateLoading ? "animate-spin" : ""
                                        }
                                      />
                                      {updateLoading
                                        ? "Yangilanmoqda..."
                                        : "Yangilash"}
                                    </Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>

                          {/* + insert button — har qanday qo'shni status oralig'ida */}
                          {index < columns.length - 1 && (
                            <button
                              ref={(el) =>
                                (insertBtnRefs.current[column.id] = el)
                              }
                              onClick={() =>
                                setInsertAfterId((prev) =>
                                  prev === column.id ? null : column.id,
                                )
                              }
                              className={`absolute -right-3 -bottom-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
                                insertAfterId === column.id
                                  ? "border-blue-500 bg-blue-600 text-white"
                                  : "border-[#2a4a62] bg-[#0a1929] text-gray-400 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                              }`}
                            >
                              <Plus size={12} />
                            </button>
                          )}
                        </div>

                        <div className="scrollbar-hide flex-1 overflow-y-auto bg-[#0f2942]" />
                      </div>
                    )}
                  </SortableColumn>
                );
              })}
            </SortableContext>

            <DragOverlay>
              {activeId
                ? (() => {
                    const col = columns.find((c) => c.id === activeId);
                    return col ? (
                      <div
                        className="flex h-20 shrink-0 flex-col rounded-lg border border-blue-500/50 bg-[#0f2942] shadow-2xl shadow-blue-500/20"
                        style={{
                          width: "280px",
                          borderBottom: `3px solid ${col.color || "#6b7280"}`,
                        }}
                      >
                        <div className="flex items-center px-4 py-3">
                          <span className="text-xs font-semibold tracking-widest text-white uppercase">
                            {col.name}
                          </span>
                        </div>
                      </div>
                    ) : null;
                  })()
                : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
      <HorizontalScrollDock targetRef={boardScrollRef} />

      {/* <div className="flex h-full w-64 shrink-0 flex-col border-r border-[#1a3a52] bg-[#0a1929] p-4">
        <button
          ref={(el) => (insertBtnRefs.current["end"] = el)}
          onClick={() =>
            setInsertAfterId((prev) => (prev === "end" ? null : "end"))
          }
          className={`flex items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm transition-colors ${
            insertAfterId === "end"
              ? "border-blue-500 bg-[#0f2942] text-white"
              : "border-[#2a4a62] text-gray-400 hover:border-blue-500/50 hover:bg-[#0f2942] hover:text-white"
          }`}
        >
          <Plus size={16} />
          Yangi status qo'shish
        </button>
      </div> */}

      {insertAfterId !== null && (
        <InsertModal
          anchorRef={{ current: insertBtnRefs.current[insertAfterId] }}
          afterId={
            insertAfterId === "end"
              ? (columns[columns.length - 1]?.id ?? 0)
              : insertAfterId
          }
          projectId={projectId}
          onClose={() => setInsertAfterId(null)}
          onSubmit={handleInsertSubmit}
          colors={COLORS}
        />
      )}
      {templateModal && (
        <InsertModal
          anchorRef={null}
          afterId={templateModal.afterId}
          projectId={projectId}
          onClose={closeTemplateModal}
          onSubmit={handleInsertSubmit}
          template={templateModal.template}
          colors={COLORS}
        />
      )}

      <Dialog open={sourceModalOpen} onOpenChange={setSourceModalOpen}>
        <DialogContent className="border-[#1a3a52] bg-[#0f2231] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ijtimoiy tarmoqlarni ulash</DialogTitle>
            <DialogDescription className="sr-only">
              Ijtimoiy tarmoq kanalini tanlash oynasi.
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-gray-400">
            Kanalni tanlang va keyin ulash sozlamalarini davom ettiring.
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SOCIAL_CHANNELS.map((channel) => {
              const Icon = channel.icon;
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() =>
                    toast.info(
                      `${channel.name} integratsiyasi backend bilan ulanadi`,
                    )
                  }
                  className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-left transition hover:border-white/30 hover:bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: channel.bg, color: channel.color }}
                    >
                      <Icon size={15} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {channel.name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {channel.hint}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-400">
                    Ulanish
                  </span>
                </button>
              );
            })}
            <button
              title="Lead yig'ish uchun Google Form uslubida savollar tuzing"
              type="button"
              onClick={() => {
                openFormBuilder(
                  SOURCE_CARDS.find((card) => card.variant === "template")
                    ?.template || null,
                  null,
                );
              }}
              className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-blue-400/30 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(14,27,42,0.9))] p-4 text-left transition hover:border-blue-300/50 hover:bg-[linear-gradient(135deg,rgba(59,130,246,0.22),rgba(14,27,42,0.95))] sm:col-span-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                    <FileText size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Google Form
                    </p>
                    <p className="text-[11px] text-blue-100/70">
                      Dynamic forma yaratish
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-blue-300 transition group-hover:text-blue-200">
                  Yaratish
                </span>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <FormBuilderDialog
        open={!!formBuilderSource}
        onOpenChange={(open) => {
          if (!open) {
            setFormBuilderSource(null);
            setFormBuilderTemplateId(null);
          }
        }}
        source={formBuilderSource}
        initialTemplateId={formBuilderTemplateId}
        forms={formBuilderSource ? googleForms : []}
        formsLoading={formsLoading}
        onSaved={fetchFormTemplates}
        onLoadTemplate={fetchFormTemplateById}
        onDeleteTemplate={deleteFormTemplate}
        canDeleteTemplates={canDeleteTemplates}
        projectId={projectId}
        projectSlug={projectSlug}
        formFieldTypes={FORM_FIELD_TYPES}
        createField={createField}
        optimizeHeaderImage={optimizeHeaderImage}
        normalizeFieldOptions={normalizeFieldOptions}
        getPublicFormUrl={getPublicFormUrl}
      />

      <FormBuilderDialog
        open={editBuilderOpen}
        onOpenChange={(open) => {
          setEditBuilderOpen(open);
          if (!open) {
            setEditBuilderTemplateId(null);
          }
        }}
        source={
          SOURCE_CARDS.find((card) => card.variant === "template")?.template ||
          null
        }
        initialTemplateId={editBuilderTemplateId}
        forms={googleForms}
        formsLoading={formsLoading}
        onSaved={fetchFormTemplates}
        onLoadTemplate={fetchFormTemplateById}
        onDeleteTemplate={deleteFormTemplate}
        canDeleteTemplates={canDeleteTemplates}
        projectId={projectId}
        projectSlug={projectSlug}
        formFieldTypes={FORM_FIELD_TYPES}
        createField={createField}
        optimizeHeaderImage={optimizeHeaderImage}
        normalizeFieldOptions={normalizeFieldOptions}
        getPublicFormUrl={getPublicFormUrl}
      />

      {/* Form card right-click context menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
            onContextMenu={(e) => {
              e.preventDefault();
              closeContextMenu();
            }}
          />
          <div
            className="fixed z-50 min-w-[160px] overflow-hidden rounded-xl border border-[#1a3a52] bg-[#0f2942] shadow-2xl"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              type="button"
              onClick={() => {
                closeContextMenu();
                if (contextMenu.form?.link) {
                  window.open(
                    contextMenu.form.link,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#9ab8cc] transition-colors hover:bg-[#1a3a52] hover:text-white"
            >
              <Eye size={14} className="shrink-0 text-blue-400" />
              Ko'rish
            </button>
            <button
              type="button"
              onClick={() => {
                const selectedForm = contextMenu.form;
                closeContextMenu();
                openEditBuilder(selectedForm);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#9ab8cc] transition-colors hover:bg-[#1a3a52] hover:text-white"
            >
              <Pen size={14} className="shrink-0 text-amber-400" />
              Tahrirlash
            </button>
            {canDeleteTemplates && (
              <button
                type="button"
                onClick={() => {
                  closeContextMenu();
                  deleteFormTemplate(contextMenu.form?.id);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#9ab8cc] transition-colors hover:bg-[#e05d5d1a] hover:text-red-300"
              >
                <Trash2 size={14} className="shrink-0 text-red-400" />
                O'chirish
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
