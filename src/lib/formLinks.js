function slugifyPathSegment(value, fallback = "project") {
  const normalized = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

export function getProjectSlugFromStorage(fallback = "project") {
  if (typeof window === "undefined") return fallback;
  const projectName = localStorage.getItem("projectName") || "";
  return slugifyPathSegment(projectName, fallback);
}

export function getPublicFormPath(formId, options = {}) {
  const projectSlug = slugifyPathSegment(
    options.projectSlug || getProjectSlugFromStorage(),
  );
  return `/${projectSlug}/form/${formId}`;
}

export function getPublicFormUrl(formId, options = {}) {
  const origin =
    options.origin ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${origin}${getPublicFormPath(formId, options)}`;
}
