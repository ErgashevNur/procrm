import { useEffect, useRef, useState } from "react";
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
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  Eye,
  Sparkles,
  LayoutTemplate,
  Plus,
  ImagePlus,
  GripVertical,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";
import SortableFormField from "@/components/add-status/SortableFormField";
import FormPreviewField from "@/components/add-status/FormPreviewField";

export default function FormBuilderDialog({
  open,
  onOpenChange,
  source,
  initialTemplateId,
  forms,
  formsLoading,
  onSaved,
  onLoadTemplate,
  onDeleteTemplate,
  canDeleteTemplates,
  projectId,
  projectSlug,
  formFieldTypes,
  createField,
  optimizeHeaderImage,
  normalizeFieldOptions,
  getPublicFormUrl,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [fields, setFields] = useState([createField("text")]);
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedLink, setSavedLink] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loadingTemplateId, setLoadingTemplateId] = useState(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState(null);
  const fileInputRef = useRef(null);

  const fieldSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const resetBuilderState = () => {
    setTitle(source ? `${source.name} lead form` : "");
    setDescription("");
    setTelegramUrl("");
    setFields([createField("text")]);
    setHeaderImage(null);
    setImageLoading(false);
    setSaving(false);
    setSavedLink(null);
    setHasChanges(false);
    setCopied(false);
    setEditingTemplate(null);
    setLoadingTemplateId(null);
    setDeletingTemplateId(null);
  };

  useEffect(() => {
    if (!open) return;
    resetBuilderState();
  }, [open, source]);

  useEffect(() => {
    if (!open || !initialTemplateId || !onLoadTemplate) return;
    if (Number(editingTemplate?.id) === Number(initialTemplateId)) return;

    let cancelled = false;
    const targetTemplateId = Number(initialTemplateId);
    setLoadingTemplateId(targetTemplateId);

    (async () => {
      try {
        const fullTemplate = await onLoadTemplate(initialTemplateId);
        if (!cancelled && fullTemplate) {
          hydrateEditorFromTemplate(fullTemplate);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message || "Formani yuklab bo'lmadi");
        }
      } finally {
        if (!cancelled) {
          setLoadingTemplateId((current) =>
            Number(current) === targetTemplateId ? null : current,
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, initialTemplateId, onLoadTemplate, editingTemplate?.id]);

  const hydrateEditorFromTemplate = (template) => {
    if (!template) return;
    const mappedFields =
      Array.isArray(template.fields) && template.fields.length > 0
        ? template.fields.map((field, index) => {
            const rawType = String(
              field?.type || field?.fieldType || "text",
            ).toLowerCase();
            const safeType = formFieldTypes.some((t) => t.value === rawType)
              ? rawType
              : "text";

            return {
              id: `field-${field?.fieldId || field?.id || index + 1}-${Math.random().toString(36).slice(2, 7)}`,
              fieldId: Number(field?.fieldId || field?.id) || undefined,
              label: String(field?.label || "").trim(),
              type: safeType,
              required: Boolean(field?.required ?? field?.isRequired),
              placeholder: String(field?.placeholder || ""),
              options: normalizeFieldOptions(field?.options),
            };
          })
        : [createField("text")];

    setEditingTemplate(template);
    setTitle(template.title || template.name || "");
    setDescription(template.description || "");
    setTelegramUrl(template.telegramUrl || "");
    setFields(mappedFields);
    setHeaderImage(template.headerImage || null);
    setSavedLink(
      template.link || getPublicFormUrl(template.id, { projectSlug }),
    );
    setHasChanges(false);
    setCopied(false);
  };

  const handleStartEdit = async (templateSummary) => {
    if (!templateSummary?.id || !onLoadTemplate) return;

    setLoadingTemplateId(templateSummary.id);
    try {
      const fullTemplate = await onLoadTemplate(templateSummary.id);
      if (fullTemplate) hydrateEditorFromTemplate(fullTemplate);
    } catch (error) {
      toast.error(error.message || "Formani yuklab bo'lmadi");
    } finally {
      setLoadingTemplateId(null);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!onDeleteTemplate || !templateId) return;
    if (!window.confirm("Formani o'chirishni tasdiqlaysizmi?")) return;

    setDeletingTemplateId(templateId);
    try {
      await onDeleteTemplate(templateId);
      if (Number(editingTemplate?.id) === Number(templateId)) {
        resetBuilderState();
      }
    } catch (error) {
      toast.error(error.message || "Formani o'chirib bo'lmadi");
    } finally {
      setDeletingTemplateId(null);
    }
  };

  const markAsChanged = () => {
    setHasChanges(true);
    setCopied(false);
  };

  const updateField = (fieldId, patch) => {
    markAsChanged();
    setFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, ...patch } : field,
      ),
    );
  };

  const addField = (type) => {
    markAsChanged();
    setFields((prev) => [...prev, createField(type)]);
  };

  const removeField = (fieldId) => {
    markAsChanged();
    setFields((prev) =>
      prev.length === 1 ? prev : prev.filter((field) => field.id !== fieldId),
    );
  };

  const handleFieldDragEnd = ({ active, over }) => {
    setActiveFieldId(null);
    if (!over || active.id === over.id) return;

    markAsChanged();
    setFields((prev) => {
      const oldIndex = prev.findIndex((field) => field.id === active.id);
      const newIndex = prev.findIndex((field) => field.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    if (!source) return;
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error("Forma nomini kiriting");
      return;
    }

    if (loadingTemplateId) {
      toast.error("Forma ma'lumotlari yuklanmoqda, biroz kuting");
      return;
    }

    const isEditMode = Boolean(editingTemplate?.id);
    if (initialTemplateId && !isEditMode) {
      toast.error("Tahrirlash uchun forma yuklanmadi. Qayta ochib ko'ring");
      return;
    }

    const normalizedFields = fields
      .map((field, index) => {
        const payloadField = {
          label: field.label.trim() || `Field ${index + 1}`,
          placeholder: field.placeholder.trim(),
          fieldType: field.type.toUpperCase(),
          isRequired: field.required,
          order: index,
          options:
            field.type === "select"
              ? field.options
                  .map((o) => o.trim())
                  .filter(Boolean)
                  .reduce((acc, opt, i) => ({ ...acc, [String(i)]: opt }), {})
              : {},
        };

        const persistedFieldId = Number(field.fieldId);
        if (persistedFieldId > 0) {
          payloadField.id = persistedFieldId;
        }

        return payloadField;
      })
      .filter(
        (field) =>
          field.fieldType !== "SELECT" || Object.keys(field.options).length > 0,
      );

    if (normalizedFields.length === 0) {
      toast.error("Kamida bitta to'g'ri field qo'shing");
      return;
    }

    const currentFieldIds = normalizedFields
      .map((field) => Number(field.id))
      .filter((id) => id > 0);
    const existingFieldIds = (editingTemplate?.fields || [])
      .map((field) => Number(field?.fieldId || field?.id))
      .filter((id) => id > 0);
    const deletedFieldIds = Array.from(
      new Set(existingFieldIds.filter((id) => !currentFieldIds.includes(id))),
    );

    const token = localStorage.getItem("user");
    setSaving(true);

    try {
      const endpoint = isEditMode
        ? apiUrl(`form-template/${editingTemplate.id}`)
        : apiUrl("form-template");

      const imageValue = headerImage
        ? headerImage._persisted
          ? headerImage.name
          : headerImage.dataUrl
        : null;

      const body = {
        projectId: Number(projectId),
        name: cleanTitle,
        description: description.trim(),
        telegramUrl: telegramUrl.trim(),
        image: imageValue,
        isActive: true,
        fields: normalizedFields,
        ...(isEditMode && deletedFieldIds.length > 0
          ? { deletedFieldIds }
          : {}),
      };

      const res = await fetch(endpoint, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        const msg = Array.isArray(e?.message)
          ? e.message.join(", ")
          : e?.message;
        throw new Error(msg || "Saqlashda xatolik");
      }

      const data = await res.json().catch(() => ({}));
      const savedTemplateId = Number(data?.id || editingTemplate?.id || 0);
      const link = getPublicFormUrl(savedTemplateId, { projectSlug });
      setSavedLink(link);
      setHasChanges(false);
      if (onSaved) await onSaved();

      if (isEditMode) {
        const refreshed =
          onLoadTemplate && savedTemplateId
            ? await onLoadTemplate(savedTemplateId)
            : null;
        if (refreshed) {
          hydrateEditorFromTemplate(refreshed);
          setSavedLink(link);
        }
        toast.success("Forma muvaffaqiyatli yangilandi!");
      } else {
        toast.success("Forma muvaffaqiyatli yaratildi!");
      }
    } catch (err) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (!savedLink) return;
    navigator.clipboard.writeText(savedLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleHeaderImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    try {
      const optimizedImage = await optimizeHeaderImage(file);
      markAsChanged();
      setHeaderImage(optimizedImage);
      toast.success("Header rasmi qo'shildi");
    } catch (error) {
      toast.error(error.message || "Rasmni yuklab bo'lmadi");
    } finally {
      setImageLoading(false);
      event.target.value = "";
    }
  };

  const isEditView = Boolean(editingTemplate?.id || initialTemplateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[84vh] overflow-y-auto border-[#1a3a52] bg-[#0f2231] text-white sm:max-w-[68rem]">
        <DialogHeader>
          <DialogTitle>
            {editingTemplate || initialTemplateId
              ? `Edit ${source?.name || "Google Form"}`
              : source
                ? `${source.name} uchun Google Form creator`
                : "Google Form creator"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Google forma yaratish yoki mavjud formani tahrirlash oynasi.
          </DialogDescription>
        </DialogHeader>
        {editingTemplate && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
            <span>
              Tahrirlash rejimi: #{editingTemplate.id} {editingTemplate.title}
            </span>
            <button
              type="button"
              onClick={resetBuilderState}
              className="rounded border border-amber-300/40 px-2 py-1 text-[11px] font-semibold text-amber-100 transition hover:bg-amber-400/20"
            >
              Yangi forma
            </button>
          </div>
        )}
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
                Forma saqlanganidan so'ng public link olib, foydalanuvchilarga
                yuborishingiz mumkin.
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
                onChange={(e) => {
                  markAsChanged();
                  setTitle(e.target.value);
                }}
                placeholder="Masalan, Google Form lead form"
                className="w-full rounded-xl border border-white/10 bg-[#091827] px-3 py-2 text-sm text-white outline-none"
              />
              <label className="mt-4 mb-2 block text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Tavsif
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  markAsChanged();
                  setDescription(e.target.value);
                }}
                placeholder="Forma nimaga ishlatiladi?"
                className="min-h-24 w-full rounded-xl border border-white/10 bg-[#091827] px-3 py-2 text-sm text-white outline-none"
              />
              <label className="mt-4 mb-2 block text-xs font-semibold tracking-widest text-gray-400 uppercase">
                Telegram kanal URL
              </label>
              <div className="relative">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-[#229ED9]"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.12 14.367l-2.95-.924c-.64-.204-.654-.64.136-.953l11.527-4.444c.533-.194 1.001.13.73.201z" />
                </svg>
                <input
                  value={telegramUrl}
                  onChange={(e) => {
                    markAsChanged();
                    setTelegramUrl(e.target.value);
                  }}
                  placeholder="https://t.me/channelname"
                  className="w-full rounded-xl border border-white/10 bg-[#091827] py-2 pr-3 pl-8 text-sm text-white outline-none"
                />
              </div>
              {telegramUrl && !/^https?:\/\//.test(telegramUrl) && (
                <p className="mt-1 text-[11px] text-amber-400">
                  URL to'g'ri formatda bo'lishi kerak (https://...)
                </p>
              )}
              <p className="mt-1 text-[11px] text-gray-500">
                Submit qilingandan so'ng foydalanuvchi shu kanalga
                yo'naltiriladi
              </p>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#091827] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
                      Header rasmi
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Mobilga mos banner. Tavsiya: 1600x600, PNG/JPG/WEBP, 5 MB
                      gacha.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
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
                        onClick={() => {
                          markAsChanged();
                          setHeaderImage(null);
                        }}
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
                      Header rasm yuklansa, form tepasida preview shu yerda
                      ko'rinadi
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
                {formFieldTypes.map((item) => {
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
                        formFieldTypes={formFieldTypes}
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

          <div
            className={`space-y-4 ${
              isEditView ? "lg:sticky lg:top-2 lg:self-start" : ""
            }`}
          >
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
                <div
                  className={`mt-4 space-y-3 ${
                    isEditView
                      ? "max-h-[30vh] overflow-y-auto pr-1 lg:max-h-[34vh]"
                      : ""
                  }`}
                >
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

            {!isEditView ? (
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
                  <span className="text-xs text-gray-500">
                    {formsLoading ? "..." : `${forms.length} ta`}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {formsLoading ? (
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-4 text-sm text-gray-500">
                      Formalar yuklanmoqda...
                    </div>
                  ) : forms.length === 0 ? (
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
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white">
                              {form.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                              <span>
                                {Array.isArray(form.fields)
                                  ? form.fields.length
                                  : 0}{" "}
                                ta field
                              </span>
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
                            {form.link && (
                              <p className="mt-1 truncate text-[11px] text-blue-400">
                                {form.link}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {form.link && (
                              <button
                                type="button"
                                onClick={() =>
                                  window.open(
                                    form.link,
                                    "_blank",
                                    "noopener,noreferrer",
                                  )
                                }
                                className="text-xs font-semibold text-blue-300 transition hover:text-blue-200"
                              >
                                Ochish
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={saving || loadingTemplateId === form.id}
                              onClick={() => handleStartEdit(form)}
                              className="text-xs font-semibold text-amber-300 transition hover:text-amber-200 disabled:opacity-50"
                            >
                              {loadingTemplateId === form.id
                                ? "Yuklanmoqda..."
                                : "Tahrirlash"}
                            </button>
                            {canDeleteTemplates && (
                              <button
                                type="button"
                                disabled={deletingTemplateId === form.id}
                                onClick={() => handleDeleteTemplate(form.id)}
                                className="text-xs font-semibold text-red-300 transition hover:text-red-200 disabled:opacity-50"
                              >
                                {deletingTemplateId === form.id
                                  ? "O'chirilmoqda..."
                                  : "O'chirish"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {savedLink && !hasChanges ? (
              <div className="space-y-2 rounded-xl border border-green-400/20 bg-green-500/10 p-3">
                <p className="text-xs font-semibold text-green-300">
                  {editingTemplate
                    ? "✓ Forma muvaffaqiyatli yangilandi!"
                    : "✓ Forma muvaffaqiyatli yaratildi!"}
                </p>
                <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2">
                  <span className="flex-1 truncate text-[11px] text-gray-300">
                    {savedLink}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 rounded p-1 transition hover:bg-white/10"
                  >
                    {copied ? (
                      <Check size={13} className="text-green-400" />
                    ) : (
                      <Copy size={13} className="text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      window.open(savedLink, "_blank", "noopener,noreferrer")
                    }
                    className="w-full"
                  >
                    Ochish
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setSavedLink(null);
                      setHasChanges(false);
                      onOpenChange(false);
                    }}
                    className="w-full"
                  >
                    Yopish
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving || Boolean(loadingTemplateId)}
                className="w-full"
              >
                {loadingTemplateId
                  ? "Yuklanmoqda..."
                  : saving
                    ? "Saqlanmoqda..."
                    : editingTemplate
                      ? "Formani yangilash"
                      : "Formani saqlash"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
