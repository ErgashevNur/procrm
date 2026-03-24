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
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  Sparkles,
  LayoutTemplate,
  Eye,
  GripVertical,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../components/ui/button";
import HorizontalScrollDock from "@/components/HorizontalScrollDock";

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

const getFormStorageKey = (projectId) => `prohome:source-forms:${projectId}`;
const HEADER_IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";
const HEADER_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const HEADER_IMAGE_MAX_WIDTH = 1600;
const HEADER_IMAGE_MAX_HEIGHT = 600;

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
  if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
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

function FormPreviewField({ field }) {
  if (field.type === "textarea") {
    return (
      <textarea
        disabled
        placeholder={field.placeholder || "Javob..."}
        className="min-h-20 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 outline-none"
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        disabled
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 outline-none"
      >
        <option>Tanlang</option>
        {field.options.map((option, index) => (
          <option key={`${field.id}-${index}`}>{option}</option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300">
        <input type="checkbox" disabled className="accent-blue-500" />
        <span>{field.placeholder || "Tasdiqlash"}</span>
      </label>
    );
  }

  return (
    <input
      disabled
      type={field.type === "phone" ? "tel" : field.type}
      placeholder={field.placeholder || "Javob..."}
      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 outline-none"
    />
  );
}

function SortableFormField({
  field,
  index,
  onUpdate,
  onRemove,
  totalFields,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border border-white/10 bg-[#091827] p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="inline-flex h-9 w-9 cursor-grab items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition hover:border-white/20 hover:text-white active:cursor-grabbing"
            aria-label={`Field ${index + 1} ni ko'chirish`}
          >
            <GripVertical size={15} />
          </button>
          <p className="text-sm font-semibold text-white">Field {index + 1}</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(field.id)}
          className="text-xs font-semibold text-red-300 transition hover:text-red-200"
        >
          O'chirish
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={field.label}
          onChange={(e) => onUpdate(field.id, { label: e.target.value })}
          placeholder="Label"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        />
        <select
          value={field.type}
          onChange={(e) =>
            onUpdate(field.id, {
              type: e.target.value,
              options:
                e.target.value === "select"
                  ? field.options.length
                    ? field.options
                    : ["Variant 1", "Variant 2"]
                  : [],
            })
          }
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        >
          {FORM_FIELD_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={field.placeholder}
          onChange={(e) =>
            onUpdate(field.id, { placeholder: e.target.value })
          }
          placeholder="Placeholder"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        />
        <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) =>
              onUpdate(field.id, {
                required: e.target.checked,
              })
            }
          />
          Majburiy
        </label>
      </div>

      {field.type === "select" && (
        <textarea
          value={field.options.join("\n")}
          onChange={(e) =>
            onUpdate(field.id, {
              options: e.target.value
                .split("\n")
                .map((option) => option.trim()),
            })
          }
          placeholder="Har bir variantni yangi qatordan yozing"
          className="mt-3 min-h-24 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        />
      )}

      {totalFields > 1 && (
        <p className="mt-3 text-[11px] text-gray-500">
          Drag & drop qilib field tartibini o'zgartirishingiz mumkin
        </p>
      )}
    </div>
  );
}

function FormBuilderDialog({
  open,
  onOpenChange,
  source,
  forms,
  onSave,
  onDelete,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([createField("text")]);
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fieldSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  useEffect(() => {
    if (!open) return;
    setTitle(source ? `${source.name} lead form` : "");
    setDescription("");
    setFields([createField("text")]);
    setHeaderImage(null);
    setImageLoading(false);
  }, [open, source]);

  const updateField = (fieldId, patch) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, ...patch } : field,
      ),
    );
  };

  const addField = (type) => {
    setFields((prev) => [...prev, createField(type)]);
  };

  const removeField = (fieldId) => {
    setFields((prev) =>
      prev.length === 1 ? prev : prev.filter((field) => field.id !== fieldId),
    );
  };

  const handleFieldDragEnd = ({ active, over }) => {
    setActiveFieldId(null);
    if (!over || active.id === over.id) return;

    setFields((prev) => {
      const oldIndex = prev.findIndex((field) => field.id === active.id);
      const newIndex = prev.findIndex((field) => field.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSave = () => {
    if (!source) return;
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error("Forma nomini kiriting");
      return;
    }

    const normalizedFields = fields
      .map((field, index) => ({
        ...field,
        label: field.label.trim() || `Field ${index + 1}`,
        placeholder: field.placeholder.trim(),
        options:
          field.type === "select"
            ? field.options.map((option) => option.trim()).filter(Boolean)
            : [],
      }))
      .filter((field) => field.type !== "select" || field.options.length > 0);

    onSave({
      id: `${Date.now()}`,
      sourceId: source.id,
      sourceName: source.name,
      title: cleanTitle,
      description: description.trim(),
      headerImage,
      fields: normalizedFields,
      createdAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  const handleHeaderImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    try {
      const optimizedImage = await optimizeHeaderImage(file);
      setHeaderImage(optimizedImage);
      toast.success("Header rasmi qo'shildi");
    } catch (error) {
      toast.error(error.message || "Rasmni yuklab bo'lmadi");
    } finally {
      setImageLoading(false);
      event.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#1a3a52] bg-[#0f2231] text-white sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {source
              ? `${source.name} uchun Google Form creator`
              : "Google Form creator"}
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-2xl border border-blue-400/20 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(15,34,49,0.7))] p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                Tezkor oqim: nom bering, field qo'shing, preview ko'ring,
                saqlang
              </p>
              <p className="mt-1 text-sm text-blue-100/80">
                Bu vaqtinchalik frontend saqlash. Backend ulanganda shu formalar
                API bilan almashtiriladi.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                  <LayoutTemplate size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    1. Forma haqida ma'lumot
                  </p>
                  <p className="text-xs text-gray-400">
                    Foydalanuvchi ko'radigan sarlavha va qisqa izoh
                  </p>
                </div>
              </div>
              <label className="mb-2 block text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Forma nomi
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan, Google Form lead form"
                className="w-full rounded-xl border border-white/10 bg-[#091827] px-3 py-2 text-sm text-white outline-none"
              />
              <label className="mt-4 mb-2 block text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Tavsif
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Forma nimaga ishlatiladi?"
                className="min-h-24 w-full rounded-xl border border-white/10 bg-[#091827] px-3 py-2 text-sm text-white outline-none"
              />
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#091827] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                      Header rasmi
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Mobilga mos banner. Tavsiya: 1600x600, PNG/JPG/WEBP, 5 MB gacha.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={HEADER_IMAGE_ACCEPT}
                    onChange={handleHeaderImageChange}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:border-white/30 disabled:opacity-50"
                    >
                      <ImagePlus size={14} />
                      {imageLoading ? "Yuklanmoqda..." : "Rasm tanlash"}
                    </button>
                    {headerImage && (
                      <button
                        type="button"
                        onClick={() => setHeaderImage(null)}
                        className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:border-red-400/40 hover:bg-red-500/15"
                      >
                        Olib tashlash
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3 overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/[0.03]">
                  {headerImage ? (
                    <div className="relative aspect-[8/3] w-full bg-[#07111d]">
                      <img
                        src={headerImage.dataUrl}
                        alt="Form header preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[8/3] w-full items-center justify-center px-4 text-center text-xs text-gray-500">
                      Header rasm yuklansa, form tepasida preview shu yerda ko'rinadi
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                  <Plus size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    2. Savollarni yig'ing
                  </p>
                  <p className="text-xs text-gray-400">
                    Tepadagi tugmalardan field type tanlab qo'shing
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {FORM_FIELD_TYPES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => addField(item.value)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#091827] px-3 py-2 text-xs font-semibold text-white transition hover:border-white/30"
                    >
                      <Icon size={13} />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <DndContext
                sensors={fieldSensors}
                collisionDetection={closestCenter}
                onDragStart={({ active }) => setActiveFieldId(active.id)}
                onDragEnd={handleFieldDragEnd}
                onDragCancel={() => setActiveFieldId(null)}
              >
                <SortableContext
                  items={fields.map((field) => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="mt-4 space-y-3">
                    {fields.map((field, index) => (
                      <SortableFormField
                        key={field.id}
                        field={field}
                        index={index}
                        onUpdate={updateField}
                        onRemove={removeField}
                        totalFields={fields.length}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeFieldId ? (
                    <div className="rounded-2xl border border-blue-400/40 bg-[#102235] p-4 shadow-2xl">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300">
                          <GripVertical size={15} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {fields.find((field) => field.id === activeFieldId)
                              ?.label || "Field"}
                          </p>
                          <p className="text-xs text-gray-400">
                            Joyini o'zgartirish
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#091827] p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                  <Eye size={15} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">3. Preview</p>
                  <p className="text-xs text-gray-400">
                    Forma foydalanuvchiga taxminan qanday ko'rinishini
                    tekshiring
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                {headerImage && (
                  <div className="mb-4 overflow-hidden rounded-2xl border border-white/10">
                    <div className="aspect-[8/3] w-full bg-[#07111d]">
                      <img
                        src={headerImage.dataUrl}
                        alt="Header preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
                <p className="text-lg font-semibold text-white">
                  {title || "Forma nomi"}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  {description || "Forma tavsifi shu yerda ko'rinadi"}
                </p>
                <div className="mt-4 space-y-3">
                  {fields.map((field) => (
                    <div key={`preview-${field.id}`}>
                      <div className="mb-1 flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {field.label || "Field label"}
                        </p>
                        {field.required && (
                          <span className="text-[10px] font-semibold tracking-widest text-blue-300 uppercase">
                            Required
                          </span>
                        )}
                      </div>
                      <FormPreviewField field={field} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#091827] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Saqlangan formalar
                  </p>
                  <p className="text-xs text-gray-400">
                    Shu loyiha uchun yaratilgan Google Form variantlari
                  </p>
                </div>
                <span className="text-xs text-gray-500">{forms.length} ta</span>
              </div>
              <div className="mt-3 space-y-2">
                {forms.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-4 text-sm text-gray-500">
                    Hali forma yaratilmagan
                  </div>
                ) : (
                  forms.map((form) => (
                    <div
                      key={form.id}
                      className="rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      {form.headerImage?.dataUrl && (
                        <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
                          <div className="aspect-[8/3] w-full bg-[#07111d]">
                            <img
                              src={form.headerImage.dataUrl}
                              alt={form.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {form.title}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                            <span>{form.fields.length} ta field</span>
                            {form.headerImage?.dataUrl && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-gray-500" />
                                <span>Header rasm bor</span>
                              </>
                            )}
                            <span className="h-1 w-1 rounded-full bg-gray-500" />
                            <span>
                              {new Date(form.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onDelete(form.id)}
                          className="text-xs font-semibold text-red-300 transition hover:text-red-200"
                        >
                          O'chirish
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button type="button" onClick={handleSave} className="w-full">
              Formani saqlash
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
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
function SortableColumn({ id, children, disabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({
        listeners: disabled ? undefined : listeners,
        attributes: disabled ? undefined : attributes,
      })}
    </div>
  );
}

// ── Insert modal ─────────────────────────────────────────────────────────────
function InsertModal({
  anchorRef,
  afterId,
  projectId,
  onClose,
  onSubmit,
  template,
}) {
  const modalRef = useRef();
  const [name, setName] = useState(template?.name || "");
  const [color, setColor] = useState(template?.color || "#3b82f6");
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX - 180,
      });
    }
  }, [anchorRef]);

  useEffect(() => {
    const h = (e) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target)
      )
        onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [anchorRef, onClose]);

  useEffect(() => {
    if (template) {
      setName(template.name || "");
      setColor(template.color || "#3b82f6");
    } else {
      setName("");
      setColor("#3b82f6");
    }
  }, [template]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim().toUpperCase(),
      projectId: Number(projectId),
      color,
      after: afterId ?? 0,
    });
    onClose();
  };

  const floating = !anchorRef?.current;
  const style = floating
    ? undefined
    : { top: pos.top, left: Math.max(8, pos.left) };

  return (
    <div
      ref={modalRef}
      className={`fixed z-50 w-64 rounded-xl border border-[#1a3a52] bg-[#0f2942] p-4 shadow-2xl ${
        floating ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : ""
      }`}
      style={style}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Yangi status</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={15} />
        </button>
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Nom kiriting..."
        autoFocus
        className="mb-3 w-full rounded-lg border border-[#2a4a62] bg-[#1a3a52] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
      />
      <p className="mb-2 text-xs text-gray-400">Rang</p>
      <div className="mb-3 grid grid-cols-6 gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={`h-6 w-6 rounded-full transition-all ${
              color === c
                ? "ring-2 ring-white ring-offset-1 ring-offset-[#0f2942]"
                : "hover:scale-110"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div
        className="mb-3 h-1 w-full rounded-full"
        style={{ background: color }}
      />
      <button
        onClick={handleSubmit}
        disabled={!name.trim()}
        className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Qo'shish
      </button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AddStatus() {
  const token = localStorage.getItem("user");
  const projectId = localStorage.getItem("projectId");

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
  const [channelForms, setChannelForms] = useState({});

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
  }, []);

  useEffect(() => {
    if (!projectId) return;
    try {
      const raw = localStorage.getItem(getFormStorageKey(projectId));
      setChannelForms(raw ? JSON.parse(raw) : {});
    } catch {
      setChannelForms({});
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    localStorage.setItem(
      getFormStorageKey(projectId),
      JSON.stringify(channelForms),
    );
  }, [channelForms, projectId]);

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

    console.log(
      `[Drag] "${columns.find((c) => c.id === active.id)?.name}" (id: ${active.id}) → after id: ${afterId}`,
      afterId === 0 ? "(birinchi o'ringa)" : `(id ${afterId} dan keyin)`,
    );

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

  const saveChannelForm = (form) => {
    setChannelForms((prev) => {
      const current = Array.isArray(prev[form.sourceId])
        ? prev[form.sourceId]
        : [];
      return {
        ...prev,
        [form.sourceId]: [form, ...current],
      };
    });
    toast.success("Google Form saqlandi");
  };

  const googleForms = channelForms["google-form"] || [];

  const deleteChannelForm = (channelId, formId) => {
    setChannelForms((prev) => ({
      ...prev,
      [channelId]: (prev[channelId] || []).filter((form) => form.id !== formId),
    }));
  };

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
                Yangi mijozlar ushbu kanallardan kelishi mumkin
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
                                className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2"
                              >
                                <FileText />

                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormBuilderSource(card.template)
                                  }
                                  className="block w-full truncate text-left text-[12px] font-semibold text-blue-200 underline decoration-blue-300/60 underline-offset-3 transition hover:text-blue-100"
                                  title={form.title}
                                >
                                  {form.title}
                                </button>
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

                              <button
                                onClick={() => deleteColumn(column.id)}
                                disabled={!!column._temp}
                                className="text-gray-500 transition-colors hover:text-red-500 disabled:opacity-30"
                              >
                                <Trash2 size={14} />
                              </button>

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
        />
      )}

      <Dialog open={sourceModalOpen} onOpenChange={setSourceModalOpen}>
        <DialogContent className="border-[#1a3a52] bg-[#0f2231] text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ijtimoiy tarmoqlarni ulash</DialogTitle>
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
                setSourceModalOpen(false);
                setFormBuilderSource(
                  SOURCE_CARDS.find((card) => card.variant === "template")
                    ?.template || null,
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
          if (!open) setFormBuilderSource(null);
        }}
        source={formBuilderSource}
        forms={
          formBuilderSource ? channelForms[formBuilderSource.id] || [] : []
        }
        onSave={saveChannelForm}
        onDelete={(formId) => {
          if (!formBuilderSource) return;
          deleteChannelForm(formBuilderSource.id, formId);
        }}
      />
    </div>
  );
}
