import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;
const IMAGE_STREAM_BASE = "https://backend-b2b-dev.prohome.uz/api/v1/image";

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
  return `${IMAGE_STREAM_BASE}/${encodeURIComponent(fileName)}`;
}

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
        field.type === "phone" || matchesLabel(field, /telefon|phone|raqam/i),
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
    findFilledField(fields, values, (field) =>
      matchesLabel(field, /familiya|surname|last ?name/i),
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
      fieldId: field?.fieldId ?? field?.id ?? id,
      type: normalizeFieldType(field),
      required: normalizeFieldRequired(field),
      options: normalizeFieldOptions(field),
      label: field?.label || `Field ${index + 1}`,
      placeholder: field?.placeholder || "",
    };
  });

  const headerSource =
    payload?.headerImage?.dataUrl ||
    payload?.headerImage?.name ||
    payload?.image;

  const headerImage = payload?.headerImage
    ? {
        ...payload.headerImage,
        dataUrl: getImageSource(headerSource),
      }
    : headerSource
      ? { dataUrl: getImageSource(headerSource) }
      : null;

  return {
    ...payload,
    title: payload?.title || payload?.name || "Forma",
    description: payload?.description || "",
    headerImage,
    fields,
  };
}

export default function FormPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  // Dynamic field values: { [fieldId]: value }
  const [fieldValues, setFieldValues] = useState({});

  // Telegram redirect countdown after submit
  useEffect(() => {
    if (!submitted || !form?.telegramUrl) return;
    let count = 3;
    setRedirectCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      setRedirectCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        window.location.href = form.telegramUrl;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted, form?.telegramUrl]);

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(apiUrl(`form-template/public/${id}`));
        if (!res.ok) throw new Error("Forma topilmadi");
        const data = await res.json();
        const normalized = normalizeFormPayload(data);
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
          fieldValues[f.id] == null),
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
    const numericPhone = Number(normalizedPhone.replace(/\D/g, ""));
    if (!Number.isFinite(numericPhone)) {
      toast.error("Telefon raqam noto'g'ri");
      return;
    }
    const values = (form.fields || []).map((field) => {
      const fieldId =
        Number(field.fieldId) > 0 ? Number(field.fieldId) : field.fieldId;
      const rawValue = fieldValues[field.id];

      if (field.type === "phone") {
        return {
          fieldId,
          value: normalizeUzPhone(rawValue),
        };
      }

      return {
        fieldId,
        value:
          rawValue == null
            ? ""
            : typeof rawValue === "string"
              ? rawValue
              : String(rawValue),
      };
    });

    const payload = {
      firstName: leadPayload.firstName,
      lastName: leadPayload.lastName,
      phone: numericPhone,
      values,
    };

    const queryProjectId =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("projectId")
        : 0;
    const localProjectId =
      typeof window !== "undefined" ? localStorage.getItem("projectId") : 0;
    const projectId = Number(
      form?.projectId || form?.project?.id || queryProjectId || localProjectId || 0,
    );
    if (projectId > 0) {
      payload.projectId = projectId;
    }

    const leadSourceId = Number(
      form?.leadSourceId || form?.leadSource?.id || 0,
    );
    if (leadSourceId > 0) {
      payload.leadSourceId = leadSourceId;
    }

    setSubmitting(true);
    try {
      const res = await fetch(apiUrl(`form-template/public/${id}/submit`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Yuborishda xatolik");
      }

      setSubmitted(true);
    } catch (err) {
      if (err instanceof TypeError) {
        toast.error("Tarmoq/CORS xatosi: backendga ulanib bo'lmadi");
      } else {
        toast.error(err.message || "Xatolik yuz berdi");
      }
    } finally {
      setSubmitting(false);
    }
  }

  /* ——— Loading ——— */
  if (loading) {
    return <FormPageLoading />;
  }

  /* ——— Error ——— */
  if (error) {
    return <FormPageError error={error} />;
  }

  /* ——— Success ——— */
  if (submitted) {
    return (
      <FormPageSuccess
        form={form}
        redirectCountdown={redirectCountdown}
      />
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
        <FormPageHeader form={form} />

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-[28px] border border-[#1e3448] bg-[#0d1e2e] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
        >
          {(form.fields || []).map((field) => (
            <FormPageField
              key={field.id}
              field={field}
              fieldValues={fieldValues}
              setFieldValue={setFieldValue}
            />
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
