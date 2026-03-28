import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;
const FORM_STORAGE_PREFIX = "prohome:source-forms:";

function normalizeFieldType(field) {
  return String(field?.type || field?.fieldType || "text").toLowerCase();
}

function normalizeFieldRequired(field) {
  return Boolean(field?.required ?? field?.isRequired);
}

function normalizeFieldOptions(field) {
  const raw = field?.options;
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (raw && typeof raw === "object") {
    return Object.entries(raw)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, value]) => value)
      .filter(Boolean);
  }
  return [];
}

function normalizeFieldId(field, index) {
  return field?.id ?? field?.fieldId ?? `${field?.label || "field"}-${index}`;
}

function matchesLabel(field, regex) {
  return regex.test(String(field?.label || field?.placeholder || "").trim());
}

function findFilledField(fields, values, predicate) {
  return (
    fields.find((field) => {
      if (!predicate(field)) return false;
      const value = values[field.id];
      return value !== "" && value !== false && value != null;
    }) || null
  );
}

function inferLeadPayload(fields, values) {
  const phoneField =
    findFilledField(
      fields,
      values,
      (field) =>
        field.type === "phone" ||
        matchesLabel(field, /telefon|phone|raqam/i),
    ) || null;

  const firstNameField =
    findFilledField(
      fields,
      values,
      (field) =>
        matchesLabel(field, /^(ism|name|first ?name)$/i) ||
        matchesLabel(field, /mijoz|klient/i),
    ) ||
    findFilledField(
      fields,
      values,
      (field) => field.type === "text" || field.type === "textarea",
    );

  const lastNameField =
    findFilledField(
      fields,
      values,
      (field) => matchesLabel(field, /familiya|surname|last ?name/i),
    ) || null;

  return {
    firstName: String(firstNameField ? values[firstNameField.id] : "").trim(),
    lastName: String(lastNameField ? values[lastNameField.id] : "").trim(),
    phone: String(phoneField ? values[phoneField.id] : "").trim(),
  };
}

function normalizeUzPhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("998")) return `+${digits.slice(0, 12)}`;
  return `+998${digits.slice(0, 9)}`;
}

function normalizeFormPayload(payload) {
  const rawFields = Array.isArray(payload?.fields)
    ? payload.fields
    : Array.isArray(payload?.formFields)
      ? payload.formFields
      : [];

  const fields = rawFields.map((field, index) => {
        const id = normalizeFieldId(field, index);
        return {
          ...field,
          id,
          type: normalizeFieldType(field),
          required: normalizeFieldRequired(field),
          options: normalizeFieldOptions(field),
          label: field?.label || `Field ${index + 1}`,
          placeholder: field?.placeholder || "",
        };
      });

  return {
    ...payload,
    title: payload?.title || payload?.name || "Forma",
    description: payload?.description || "",
    fields,
  };
}

function findSavedFormMeta(formId) {
  if (typeof window === "undefined") return null;

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(FORM_STORAGE_PREFIX)) continue;

    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "{}");
      const groups = Object.values(parsed);
      for (const group of groups) {
        if (!Array.isArray(group)) continue;
        const found = group.find((item) => String(item?.id) === String(formId));
        if (found) {
          const projectIdFromKey = Number(key.slice(FORM_STORAGE_PREFIX.length));
          return {
            ...found,
            projectId: Number(found?.projectId) || projectIdFromKey || undefined,
          };
        }
      }
    } catch {
      // Ignore malformed local cache and continue searching.
    }
  }

  return null;
}

function mergeFormMeta(form, savedMeta) {
  if (!savedMeta) return form;
  return {
    ...form,
    description: form.description || savedMeta.description || "",
    headerImage: form.headerImage || savedMeta.headerImage || null,
    projectId: Number(form.projectId) || Number(savedMeta.projectId) || undefined,
  };
}

export default function FormPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic field values: { [fieldId]: value }
  const [fieldValues, setFieldValues] = useState({});

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`${API}/form-template/public/${id}`);
        if (!res.ok) throw new Error("Forma topilmadi");
        const data = await res.json();
        const normalized = mergeFormMeta(
          normalizeFormPayload(data),
          findSavedFormMeta(id),
        );
        setForm(normalized);

        // Init field values
        const init = {};
        (normalized.fields || []).forEach((f) => {
          init[f.id] = f.type === "checkbox" ? false : "";
        });
        setFieldValues(init);
      } catch (err) {
        setError(err.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [id]);

  function setFieldValue(fieldId, value) {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Check required custom fields
    const requiredMissing = (form.fields || []).find(
      (f) =>
        f.required &&
        (fieldValues[f.id] === "" ||
          fieldValues[f.id] === false ||
          fieldValues[f.id] == null)
    );
    if (requiredMissing) {
      toast.error(`"${requiredMissing.label}" majburiy field`);
      return;
    }

    const leadPayload = inferLeadPayload(form.fields || [], fieldValues);
    if (!leadPayload.firstName) {
      toast.error("Kamida ism yoki name maydoni to'ldirilishi kerak");
      return;
    }
    const normalizedPhone = normalizeUzPhone(leadPayload.phone);
    if (!normalizedPhone) {
      toast.error("Telefon maydoni to'ldirilishi kerak");
      return;
    }
    if (!form.projectId) {
      toast.error("Forma loyihasi aniqlanmadi");
      return;
    }

    const otherDetails = {};
    (form.fields || []).forEach((f) => {
      otherDetails[f.label || f.id] = fieldValues[f.id];
    });

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/leeds/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: form.projectId,
          firstName: leadPayload.firstName,
          lastName: leadPayload.lastName,
          phone: normalizedPhone,
          otherDetails,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Yuborishda xatolik");
      }

      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  /* ——— Loading ——— */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020711]">
        <div className="text-sm text-[#9ab8cc]">Yuklanmoqda...</div>
      </div>
    );
  }

  /* ——— Error ——— */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020711]">
        <div className="text-center">
          <p className="mb-2 text-lg font-semibold text-white">Xatolik</p>
          <p className="text-sm text-[#9ab8cc]">{error}</p>
        </div>
      </div>
    );
  }

  /* ——— Success ——— */
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020711] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#1a4a2a] bg-[#0a2010] p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1a4a2a]">
            <svg
              className="h-7 w-7 text-[#4ade80]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">
            Muvaffaqiyatli yuborildi!
          </h2>
          <p className="text-sm text-[#9ab8cc]">
            Arizangiz qabul qilindi. Tez orada siz bilan bog'lanamiz.
          </p>
        </div>
      </div>
    );
  }

  /* ——— Form ——— */
  return (
    <div className="min-h-screen bg-[#020711] px-4 py-10">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(circle at top, rgba(106,167,255,0.1), transparent 40%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-lg">
        <div className="mb-6 overflow-hidden rounded-[28px] border border-[#1e3448] bg-[linear-gradient(180deg,rgba(15,34,49,0.94),rgba(9,22,34,0.96))] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          {form.headerImage?.dataUrl && (
            <div className="relative aspect-[8/3] w-full overflow-hidden border-b border-white/10 bg-[#07111d]">
              <img
                src={form.headerImage.dataUrl}
                alt={form.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,7,17,0.04),rgba(2,7,17,0.55))]" />
            </div>
          )}
          <div className="px-6 py-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#7e9bb1]">
              Lead Form
            </p>
            <h1 className="mt-3 text-2xl font-bold text-white">{form.title}</h1>
            {form.description && (
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#9ab8cc]">
                {form.description}
              </p>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-[28px] border border-[#1e3448] bg-[#0d1e2e] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
        >
          {(form.fields || []).map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <Label className="text-sm text-[#9ab8cc]">
                {field.label}
                {field.required && (
                  <span className="ml-1 text-[#e05d5d]">*</span>
                )}
              </Label>

              {field.type === "text" && (
                <Input
                  className="crm-control h-10"
                  placeholder={field.placeholder || field.label}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                />
              )}

              {(field.type === "email" || field.type === "phone") && (
                <Input
                  type={field.type === "phone" ? "tel" : field.type}
                  className="crm-control h-10"
                  placeholder={field.placeholder || field.label}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  className="crm-control resize-none"
                  rows={3}
                  placeholder={field.placeholder || field.label}
                  value={fieldValues[field.id] ?? ""}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                />
              )}

              {field.type === "select" && (
                <Select
                  value={fieldValues[field.id] ?? ""}
                  onValueChange={(val) => setFieldValue(field.id, val)}
                >
                  <SelectTrigger className="crm-control h-10">
                    <SelectValue placeholder="Tanlang..." />
                  </SelectTrigger>
                  <SelectContent className="border-[#1e3448] bg-[#0d1e2e]">
                    {(field.options || []).map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === "checkbox" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`field-${field.id}`}
                    checked={!!fieldValues[field.id]}
                    onChange={(e) => setFieldValue(field.id, e.target.checked)}
                    className="h-4 w-4 rounded accent-[#69a7ff]"
                  />
                  <label
                    htmlFor={`field-${field.id}`}
                    className="cursor-pointer text-sm text-[#9ab8cc]"
                  >
                    {field.label}
                  </label>
                </div>
              )}
            </div>
          ))}

          {(form.fields || []).length === 0 && (
            <div className="rounded-xl border border-dashed border-[#1e3448] px-4 py-6 text-center text-sm text-[#9ab8cc]">
              Bu formada hali maydon yo'q
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-lg bg-[#69a7ff] py-3 text-sm font-semibold text-[#020711] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Yuborilmoqda..." : "Yuborish"}
          </button>
        </form>
      </div>
    </div>
  );
}
