import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Building2,
  Check,
  Loader2,
  Phone,
  Users,
  X,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import FormField from "@/components/company/FormField";
import ImageDropZone from "@/components/company/ImageDropZone";
import TInput from "@/components/company/TInput";

export default function CompanyDrawer({
  company,
  onClose,
  onSaved,
  getInitialForm,
  getImgUrl,
  validateLogoFile,
  sanitizeText,
  sanitizeDescription,
  cleanPhone,
  sanitizeEmail,
  normalizePermissions,
  isValidUzPhone,
  permissionLabel,
  ALL_PERMISSIONS,
  getCompanyStatus,
  updateCompany,
  createCompany,
}) {
  const isEdit = Boolean(company);
  const [form, setForm] = useState(() => getInitialForm(company));
  const [preview, setPreview] = useState(() =>
    company?.logo ? getImgUrl(company.logo) : null,
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    setForm(getInitialForm(company));
    setPreview(company?.logo ? getImgUrl(company.logo) : null);
    setErrors({});
  }, [company, getInitialForm, getImgUrl]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const setField = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const togglePermission = (permission) => {
    setForm((prev) => {
      const next = prev.permissions.includes(permission)
        ? prev.permissions.filter((item) => item !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions: normalizePermissions(next) };
    });
  };

  const handleImage = (file) => {
    const validation = validateLogoFile(file);
    if (!validation.ok) {
      setErrors((prev) => ({ ...prev, logo: validation.message }));
      toast.error(validation.message);
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setErrors((prev) => ({ ...prev, logo: undefined }));
    setForm((prev) => ({ ...prev, logo: file }));
    setPreview(url);
  };

  const validate = () => {
    const nextErrors = {};
    const name = sanitizeText(form.name, 120);
    const managerName = sanitizeText(form.managerName, 120);
    const description = sanitizeDescription(form.description, 600);
    const phoneNumber = cleanPhone(form.phoneNumber);
    const email = sanitizeEmail(form.email);
    const password = String(form.password || "");
    const permissions = normalizePermissions(form.permissions);

    if (!name) nextErrors.name = "Nom majburiy";
    if (!managerName) nextErrors.managerName = "Menejer ismi majburiy";
    if (!phoneNumber) nextErrors.phoneNumber = "Telefon majburiy";
    else if (!isValidUzPhone(phoneNumber))
      nextErrors.phoneNumber =
        "Telefon raqami +998XXXXXXXXX formatida bo'lishi kerak";
    if (description.length > 600)
      nextErrors.description = "Tavsif 600 belgidan oshmasligi kerak";
    if (!isEdit) {
      if (!email) nextErrors.email = "Email majburiy";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        nextErrors.email = "Email noto'g'ri";
      if (!password.trim()) nextErrors.password = "Parol majburiy";
    }
    if (!permissions.length)
      nextErrors.permissions = "Kamida bitta ruxsat tanlanishi kerak";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;
    return {
      name,
      managerName,
      description,
      phoneNumber,
      email,
      password,
      permissions,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalized = validate();
    if (!normalized || submitting) return;

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateCompany({
          companyId: company.id,
          name: normalized.name,
          phoneNumber: normalized.phoneNumber,
          permissions: normalized.permissions,
          managerName: normalized.managerName,
          description: normalized.description,
          logoFile: form.logo instanceof File ? form.logo : null,
          status: Boolean(form.status),
          previousStatus: getCompanyStatus(company, true),
        });
      } else {
        await createCompany({
          name: normalized.name,
          phoneNumber: normalized.phoneNumber,
          email: normalized.email,
          password: normalized.password,
          permissions: normalized.permissions,
          managerName: normalized.managerName,
          description: normalized.description,
          logoFile: form.logo instanceof File ? form.logo : null,
          status: Boolean(form.status),
        });
      }

      toast.success(isEdit ? "Kompaniya yangilandi" : "Kompaniya qo'shildi");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error?.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-[4px]">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md animate-in slide-in-from-right flex-col border-l border-white/6 bg-[#071828] shadow-2xl duration-200">
        <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              {isEdit ? "Kompaniyani tahrirlash" : "Yangi kompaniya"}
            </h2>
            <p className="mt-0.5 text-xs text-gray-600">
              {isEdit ? `#${company.id}` : "Ma'lumotlarni to'ldiring"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] text-gray-500 transition-colors hover:text-white"
            aria-label="Yopish"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <FormField label="Nomi" required icon={Building2} error={errors.name}>
              <TInput
                value={form.name}
                onChange={setField("name")}
                placeholder="Kompaniya nomi"
                maxLength={120}
              />
            </FormField>

            <FormField
              label="Menejer ismi"
              required
              icon={Users}
              error={errors.managerName}
            >
              <TInput
                value={form.managerName}
                onChange={setField("managerName")}
                placeholder="To'liq ism sharif"
                maxLength={120}
              />
            </FormField>

            <FormField
              label="Telefon raqam"
              required
              icon={Phone}
              error={errors.phoneNumber}
            >
              <TInput
                value={form.phoneNumber}
                onChange={setField("phoneNumber")}
                placeholder="+998 90 000 00 00"
                type="tel"
                maxLength={17}
              />
            </FormField>

            {!isEdit ? (
              <FormField label="Email" required error={errors.email}>
                <TInput
                  value={form.email}
                  onChange={setField("email")}
                  placeholder="company@mail.com"
                  type="email"
                  maxLength={254}
                />
              </FormField>
            ) : null}

            {!isEdit ? (
              <FormField label="Parol" required error={errors.password}>
                <TInput
                  value={form.password}
                  onChange={setField("password")}
                  placeholder="Parol kiriting"
                  type="password"
                  maxLength={128}
                />
              </FormField>
            ) : null}

            <FormField label="Tavsif" icon={Briefcase} error={errors.description}>
              <textarea
                value={form.description}
                onChange={(e) => setField("description")(e.target.value)}
                placeholder="Kompaniya haqida qisqacha..."
                rows={3}
                maxLength={600}
                className="w-full resize-none rounded-xl border border-white/[0.07] bg-[#0a1929] px-3 py-2.5 text-sm text-white transition-all outline-none placeholder:text-gray-600 focus:border-[#3b82f6]"
              />
            </FormField>

            <div>
              <p className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase">
                Ruxsatlar
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_PERMISSIONS.map((permission) => {
                  const isActive = form.permissions.includes(permission);
                  return (
                    <button
                      key={permission}
                      type="button"
                      onClick={() => togglePermission(permission)}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                        isActive
                          ? "border-blue-500/40 bg-blue-600/[0.15] text-blue-300"
                          : "border-white/10 text-gray-500"
                      }`}
                    >
                      <div
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                          isActive
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-500 bg-transparent"
                        }`}
                      >
                        {isActive ? <Check size={9} className="text-white" /> : null}
                      </div>
                      {permissionLabel(permission)}
                    </button>
                  );
                })}
              </div>
              {errors.permissions ? (
                <p className="mt-1 text-[11px] text-red-400">
                  {errors.permissions}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0a1929] px-3 py-2.5">
              <div>
                <p className="text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Status
                </p>
                <p
                  className={`mt-1 text-xs font-semibold ${form.status ? "text-emerald-300" : "text-gray-400"}`}
                >
                  {form.status ? "Aktiv" : "Nofaol"}
                </p>
              </div>
              <Switch
                checked={Boolean(form.status)}
                onCheckedChange={(v) => setField("status")(v)}
              />
            </div>

            <ImageDropZone
              fileName={form.logo?.name}
              preview={preview}
              onChange={handleImage}
              error={errors.logo}
            />
          </div>

          <div className="flex gap-3 border-t border-white/[0.06] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/[0.08] py-2.5 text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              Bekor
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <Check size={15} /> {isEdit ? "Saqlash" : "Qo'shish"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
