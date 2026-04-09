import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Copy, Check, Link, Trash2, ExternalLink, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FieldEditor from "@/components/form-builder/FieldEditor";
import FormPreview from "@/components/form-builder/FormPreview";
import { getProjectSlugFromStorage, getPublicFormUrl } from "@/lib/formLinks";
import { canDeleteData, getCurrentRole } from "@/lib/rbac";
import { API } from "@/lib/api";

function createEmptyField() {
  return {
    id: crypto.randomUUID(),
    type: "text",
    label: "",
    placeholder: "",
    required: false,
    options: [],
  };
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

function normalizeFormListResponse(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export default function FormBuilder() {
  const token = localStorage.getItem("user");
  const projectId = Number(localStorage.getItem("projectId")) || 0;
  const projectSlug = getProjectSlugFromStorage();
  const role = getCurrentRole();
  const canDelete = canDeleteData(role);

  // Form list
  const [forms, setForms] = useState([]);
  const [formsLoading, setFormsLoading] = useState(false);

  // Editor state
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [fields, setFields] = useState([createEmptyField()]);
  const [saving, setSaving] = useState(false);
  const [loadingFormId, setLoadingFormId] = useState(null);
  const [formLink, setFormLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const clickTimerRef = useRef(null);

  const fetchForms = useCallback(async () => {
    if (!projectId) return;
    setFormsLoading(true);
    try {
      const res = await fetch(`${API}/form-template/by/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      const items = normalizeFormListResponse(data)
        .map((t) => {
          const id = Number(t?.id || t?.formTemplateId);
          if (!id) return null;
          return {
            id,
            title: t?.name || t?.title || `Forma #${id}`,
            description: t?.description || "",
            telegramUrl: t?.telegramUrl || "",
            fieldCount: Array.isArray(t?.fields)
              ? t.fields.length
              : Array.isArray(t?.formFields)
              ? t.formFields.length
              : 0,
            createdAt: t?.createdAt || t?.created_at || "",
            link: getPublicFormUrl(id, { projectSlug }),
          };
        })
        .filter(Boolean);
      setForms(items);
    } catch {
      toast.error("Formalarni yuklab bo'lmadi");
    } finally {
      setFormsLoading(false);
    }
  }, [projectId, projectSlug, token]);

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchForms();
  }, [fetchForms, token]);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  function resetEditor() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setTelegramUrl("");
    setFields([createEmptyField()]);
    setFormLink(null);
    setCopied(false);
    setExistingImage(null);
  }

  async function loadFormForEdit(formId) {
    if (loadingFormId) return;
    setLoadingFormId(formId);
    try {
      const res = await fetch(`${API}/form-template/${formId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Formani yuklab bo'lmadi");
      const data = await res.json();

      const rawFields = Array.isArray(data?.fields)
        ? data.fields
        : Array.isArray(data?.formFields)
        ? data.formFields
        : [];

      const mappedFields =
        rawFields.length > 0
          ? rawFields.map((f, index) => ({
              id: `field-${f?.fieldId || f?.id || index}-${Math.random()
                .toString(36)
                .slice(2, 6)}`,
              fieldId: Number(f?.fieldId || f?.id) || undefined,
              label: f?.label || "",
              type: String(f?.fieldType || f?.type || "text").toLowerCase(),
              placeholder: f?.placeholder || "",
              required: Boolean(f?.required ?? f?.isRequired),
              options: normalizeFieldOptions(f?.options),
            }))
          : [createEmptyField()];

      setEditingId(Number(data.id));
      setTitle(data?.name || data?.title || "");
      setDescription(data?.description || "");
      setTelegramUrl(data?.telegramUrl || "");
      setFields(mappedFields);
      setFormLink(getPublicFormUrl(Number(data.id), { projectSlug }));
      setCopied(false);
      // keep existing image name so it's not overwritten on save
      setExistingImage(data?.image || null);
    } catch (err) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setLoadingFormId(null);
    }
  }

  // Single click → edit, double click → open public URL
  function handleFormCardClick(form) {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      if (form.link) {
        window.open(form.link, "_blank", "noopener,noreferrer");
      }
      return;
    }
    clickTimerRef.current = setTimeout(() => {
      clickTimerRef.current = null;
      loadFormForEdit(form.id);
    }, 250);
  }

  async function handleDelete(formId, e) {
    e.stopPropagation();
    if (!canDelete) {
      toast.error("Sizda formani o'chirish huquqi yo'q");
      return;
    }
    if (!window.confirm("Formani o'chirishni tasdiqlaysizmi?")) return;

    setDeletingId(formId);
    try {
      const res = await fetch(`${API}/form-template/${formId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "O'chirib bo'lmadi");
      }
      if (editingId === formId) resetEditor();
      await fetchForms();
      toast.success("Forma o'chirildi");
    } catch (err) {
      toast.error(err.message || "Xatolik");
    } finally {
      setDeletingId(null);
    }
  }

  function addField() {
    setFields((prev) => [...prev, createEmptyField()]);
  }

  function updateField(id, changes) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...changes } : f)),
    );
  }

  function removeField(id) {
    setFields((prev) =>
      prev.length > 1 ? prev.filter((f) => f.id !== id) : prev,
    );
  }

  async function handleSave() {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error("Forma nomini kiriting");
      return;
    }
    if (fields.length === 0) {
      toast.error("Kamida bitta field qo'shing");
      return;
    }
    const emptyLabel = fields.find((f) => !f.label.trim());
    if (emptyLabel) {
      toast.error("Barcha fieldlarga label kiriting");
      return;
    }

    const normalizedFields = fields.map((f, index) => {
      const payloadField = {
        label: f.label.trim(),
        placeholder: (f.placeholder || "").trim(),
        fieldType: f.type.toUpperCase(),
        isRequired: f.required,
        order: index,
        options:
          f.type === "select"
            ? (f.options || [])
                .map((o) => o.trim())
                .filter(Boolean)
                .reduce((acc, opt, i) => ({ ...acc, [String(i)]: opt }), {})
            : {},
      };
      const persistedId = Number(f.fieldId);
      if (persistedId > 0) payloadField.id = persistedId;
      return payloadField;
    });

    const isEdit = Boolean(editingId);

    // Deleted field IDs (only for update)
    let deletedFieldIds = [];
    if (isEdit) {
      const currentIds = normalizedFields
        .map((f) => Number(f.id))
        .filter((id) => id > 0);
      const existingIds = fields
        .map((f) => Number(f.fieldId))
        .filter((id) => id > 0);
      deletedFieldIds = existingIds.filter((id) => !currentIds.includes(id));
    }

    setSaving(true);
    try {
      const endpoint = isEdit
        ? `${API}/form-template/${editingId}`
        : `${API}/form-template`;

      const body = {
        projectId,
        name: cleanTitle,
        description: description.trim(),
        telegramUrl: telegramUrl.trim(),
        image: existingImage || null,
        isActive: true,
        fields: normalizedFields,
        ...(isEdit && deletedFieldIds.length > 0 ? { deletedFieldIds } : {}),
      };

      const res = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
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
        const errData = await res.json().catch(() => ({}));
        const msg = Array.isArray(errData?.message)
          ? errData.message.join(", ")
          : errData?.message;
        throw new Error(msg || "Saqlashda xatolik");
      }

      const savedData = await res.json().catch(() => ({}));
      const savedId = Number(savedData?.id || editingId || 0);
      const link = getPublicFormUrl(savedId, { projectSlug });

      setFormLink(link);
      setEditingId(savedId);
      setExistingImage(savedData?.image || existingImage || null);
      await fetchForms();
      toast.success(isEdit ? "Forma yangilandi!" : "Forma yaratildi!");
    } catch (err) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    if (!formLink) return;
    navigator.clipboard.writeText(formLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="crm-page">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="crm-kicker">Admin</p>
          <h1 className="crm-title">Form Builder</h1>
          <p className="crm-subtitle">
            Formalar yarating, tahrirlang va boshqaring
          </p>
        </div>
        {editingId && (
          <button
            onClick={resetEditor}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-[#1e3448] bg-[#0d1e2e] px-4 py-2 text-sm text-[#9ab8cc] transition-colors hover:border-[#69a7ff] hover:text-[#69a7ff]"
          >
            <Plus size={15} />
            Yangi forma
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* ——— LEFT: Forms list ——— */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#456070]">
            Formalar{" "}
            {!formsLoading && (
              <span className="text-[#6a8090]">({forms.length})</span>
            )}
          </p>

          {/* UX hint */}
          <div className="rounded-xl border border-[#1e3448] bg-[#091827] px-3 py-2.5">
            <div className="flex items-center gap-2 text-[11px] text-[#6a8090]">
              <Edit3 size={11} className="shrink-0 text-[#9ab8cc]" />
              <span>
                <span className="font-semibold text-[#9ab8cc]">1x klik</span>{" "}
                — tahrirlashga yuklaydi
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-[#6a8090]">
              <ExternalLink size={11} className="shrink-0 text-[#9ab8cc]" />
              <span>
                <span className="font-semibold text-[#9ab8cc]">2x klik</span>{" "}
                — formani yangi tabda ochadi
              </span>
            </div>
          </div>

          {/* Form cards */}
          {formsLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-[#0d1e2e]"
                />
              ))}
            </div>
          ) : forms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#1e3448] px-4 py-6 text-center text-sm text-[#456070]">
              Hali forma yaratilmagan
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {forms.map((form) => {
                const isActive = editingId === form.id;
                const isLoading = loadingFormId === form.id;
                return (
                  <div
                    key={form.id}
                    onClick={() => !isLoading && handleFormCardClick(form)}
                    className={`group relative cursor-pointer select-none rounded-xl border p-3 transition-all ${
                      isActive
                        ? "border-[#69a7ff]/60 bg-[#0d1e3a] ring-1 ring-[#69a7ff]/20"
                        : "border-[#1e3448] bg-[#0d1e2e] hover:border-[#2a4a6a] hover:bg-[#0f2030]"
                    } ${isLoading ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {isLoading ? "Yuklanmoqda..." : form.title}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[#6a8090]">
                          <span>{form.fieldCount} ta field</span>
                          {form.telegramUrl && (
                            <>
                              <span className="h-1 w-1 rounded-full bg-[#456070]" />
                              <span className="text-[#229ED9]">Telegram ✓</span>
                            </>
                          )}
                        </div>
                      </div>
                      {canDelete && (
                        <button
                          onClick={(e) => handleDelete(form.id, e)}
                          disabled={deletingId === form.id}
                          className="shrink-0 rounded p-1 text-[#e05d5d] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#e05d5d1a] disabled:opacity-40"
                          title="O'chirish"
                        >
                          {deletingId === form.id ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border border-[#e05d5d] border-t-transparent" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      )}
                    </div>

                    {isActive && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-[#69a7ff]">
                        <Edit3 size={9} />
                        Tahrirlash rejimi
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ——— RIGHT: Editor + Preview ——— */}
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          {/* Editor */}
          <div className="flex flex-col gap-4">
            {/* Form info card */}
            <div className="crm-card p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#456070]">
                {editingId ? `Tahrirlash — #${editingId}` : "Yangi forma"}
              </p>
              <div className="flex flex-col gap-3">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-[#9ab8cc]">
                    Forma nomi{" "}
                    <span className="text-[#e05d5d]">*</span>
                  </Label>
                  <Input
                    className="crm-control h-10"
                    placeholder="Masalan: Konsultatsiya uchun ariza"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-[#9ab8cc]">Tavsif</Label>
                  <Textarea
                    className="crm-control resize-none"
                    rows={2}
                    placeholder="Forma nimaga ishlatiladi?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Telegram URL */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-[#9ab8cc]">
                    Telegram kanal URL{" "}
                    <span className="text-[#456070]">
                      — submit qilingandan so'ng yo'naltiriladi
                    </span>
                  </Label>
                  <div className="relative">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#229ED9]"
                    >
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.12 14.367l-2.95-.924c-.64-.204-.654-.64.136-.953l11.527-4.444c.533-.194 1.001.13.73.201z" />
                    </svg>
                    <Input
                      className="crm-control h-10 pl-8"
                      placeholder="https://t.me/channelname"
                      value={telegramUrl}
                      onChange={(e) => setTelegramUrl(e.target.value)}
                    />
                  </div>
                  {telegramUrl && !/^https?:\/\//.test(telegramUrl) && (
                    <p className="text-[11px] text-amber-400">
                      URL to'g'ri formatda bo'lishi kerak (https://...)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-3">
              {fields.map((field) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  onChange={(changes) => updateField(field.id, changes)}
                  onRemove={() => removeField(field.id)}
                />
              ))}
            </div>

            {/* Add field + Save */}
            <div className="flex gap-3">
              <button
                onClick={addField}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-[#1e3448] py-3 text-sm text-[#9ab8cc] transition-colors hover:border-[#69a7ff] hover:text-[#69a7ff]"
              >
                <Plus size={16} />
                Field qo'shish
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-[#69a7ff] px-6 py-3 text-sm font-semibold text-[#020711] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saqlanmoqda..."
                  : editingId
                  ? "Yangilash"
                  : "Saqlash"}
              </button>
            </div>

            {/* Saved link card */}
            {formLink && (
              <div className="crm-card flex flex-col gap-3 border-[#1a4a2a] bg-[#0a2010] p-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#4ade80]" />
                  <span className="text-sm font-medium text-[#4ade80]">
                    {editingId
                      ? "Forma muvaffaqiyatli yangilandi!"
                      : "Forma muvaffaqiyatli yaratildi!"}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-[#1a4a2a] bg-[#051008] px-3 py-2">
                  <Link size={14} className="shrink-0 text-[#6a8090]" />
                  <span className="flex-1 truncate text-xs text-[#9ab8cc]">
                    {formLink}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors hover:bg-[#1a4a2a]"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-[#4ade80]" />
                        <span className="text-[#4ade80]">Nusxalandi</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} className="text-[#9ab8cc]" />
                        <span className="text-[#9ab8cc]">Nusxalash</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() =>
                    window.open(formLink, "_blank", "noopener,noreferrer")
                  }
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#1a4a2a] py-2 text-xs text-[#9ab8cc] transition-colors hover:border-[#4ade80]/40 hover:text-white"
                >
                  <ExternalLink size={12} />
                  Formani ochib ko'rish
                </button>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="crm-card h-fit p-4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#456070]">
              Preview
            </p>

            {/* Telegram badge in preview */}
            {telegramUrl && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#1a3a4a] bg-[#091827] px-3 py-2">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="shrink-0 text-[#229ED9]"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.12 14.367l-2.95-.924c-.64-.204-.654-.64.136-.953l11.527-4.444c.533-.194 1.001.13.73.201z" />
                </svg>
                <span className="truncate text-[11px] text-[#9ab8cc]">
                  Submit → Telegram'ga yo'naltiriladi
                </span>
              </div>
            )}

            {title && (
              <h2 className="mb-2 text-base font-semibold text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="mb-4 text-xs leading-5 text-[#9ab8cc]">
                {description}
              </p>
            )}
            <FormPreview fields={fields} />
          </div>
        </div>
      </div>
    </div>
  );
}
