const API = import.meta.env.VITE_VITE_API_KEY_PROHOME;

export const LEAD_FIELD_MAPPINGS = [
  { value: "", label: "— CRM maydonini tanlang —" },
  { value: "FIRST_NAME", label: "Ism (First name)" },
  { value: "LAST_NAME", label: "Familiya (Last name)" },
  { value: "PHONE", label: "Telefon raqam" },
  { value: "EXTRA_PHONE", label: "Qo'shimcha telefon" },
  { value: "ADDRESS", label: "Manzil" },
  { value: "BIRTH_DATE", label: "Tug'ilgan sana" },
  { value: "BUDGET", label: "Byudjet" },
  { value: "OTHER", label: "Boshqa / Qo'shimcha" },
];

export function getImageSource(rawValue) {
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

export function normalizeFieldType(field) {
  return String(field?.type || field?.fieldType || "text").toLowerCase();
}

export function normalizeFieldRequired(field) {
  return Boolean(field?.required ?? field?.isRequired);
}

export function normalizeFieldOptions(field) {
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

export function normalizeFieldId(field, index) {
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

export function inferLeadPayload(fields, values) {
  // Mapping bo'lsa — aniq, yo'q bo'lsa — heuristic
  const mappedPhone = fields.find((f) => f.mapping === "PHONE");
  const mappedFirstName = fields.find((f) => f.mapping === "FIRST_NAME");
  const mappedLastName = fields.find((f) => f.mapping === "LAST_NAME");

  const phoneField =
    mappedPhone ||
    findFilledField(
      fields,
      values,
      (f) => f.type === "phone" || matchesLabel(f, /telefon|phone|raqam/i),
    ) ||
    null;

  const firstNameField =
    mappedFirstName ||
    findFilledField(
      fields,
      values,
      (f) =>
        matchesLabel(f, /^(ism|name|first ?name)$/i) ||
        matchesLabel(f, /mijoz|klient/i),
    ) ||
    findFilledField(
      fields,
      values,
      (f) => f.type === "text" || f.type === "textarea",
    );

  const lastNameField =
    mappedLastName ||
    findFilledField(fields, values, (f) =>
      matchesLabel(f, /familiya|surname|last ?name/i),
    ) ||
    null;

  return {
    firstName: String(firstNameField ? values[firstNameField.id] : "").trim(),
    lastName: String(lastNameField ? values[lastNameField.id] : "").trim(),
    phone: String(phoneField ? values[phoneField.id] : "").trim(),
  };
}

export function normalizeUzPhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("998")) return `+${digits.slice(0, 12)}`;
  return `+998${digits.slice(0, 9)}`;
}

export function normalizeFormPayload(payload) {
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

export function buildSubmitPayload({ form, fields, fieldValues, formId }) {
  const leadPayload = inferLeadPayload(fields, fieldValues);

  const normalizedPhone = normalizeUzPhone(leadPayload.phone);
  const numericPhone = Number(normalizedPhone.replace(/\D/g, ""));

  const values = fields.map((field) => {
    const fieldId =
      Number(field.fieldId) > 0 ? Number(field.fieldId) : field.fieldId;
    const rawValue = fieldValues[field.id];

    if (field.type === "phone") {
      return { fieldId, value: normalizeUzPhone(rawValue) };
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

  const queryProjectId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("projectId")
      : 0;
  const localProjectId =
    typeof window !== "undefined" ? localStorage.getItem("projectId") : 0;
  const projectId = Number(
    form?.projectId || form?.project?.id || queryProjectId || localProjectId || 0,
  );

  const leadSourceId = Number(form?.leadSourceId || form?.leadSource?.id || 0);

  const payload = {
    firstName: leadPayload.firstName,
    lastName: leadPayload.lastName,
    phone: numericPhone,
    values,
  };
  if (projectId > 0) payload.projectId = projectId;
  if (leadSourceId > 0) payload.leadSourceId = leadSourceId;

  return { payload, leadPayload, normalizedPhone, numericPhone };
}
