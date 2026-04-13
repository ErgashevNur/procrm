import { useMemo, useState } from "react";
import { Briefcase, Hash, Pencil, Phone, Users, X } from "lucide-react";

export default function CompanyDetailModal({
  company,
  onClose,
  onEdit,
  getImgUrl,
  initials,
  toTelHref,
  getCompanyStatus,
  permissionLabel,
}) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = useMemo(() => getImgUrl(company?.logo), [company?.logo, getImgUrl]);
  const showLogo = Boolean(logoUrl && !imageError);
  const telHref = toTelHref(company?.phoneNumber);
  const isActive = getCompanyStatus(company, false);

  if (!company) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.72)] p-4 backdrop-blur-[5px]">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl animate-in fade-in zoom-in-95 overflow-hidden rounded-3xl border border-white/[0.08] bg-[linear-gradient(145deg,#0f2438_0%,#071828_100%)] shadow-2xl duration-200">
        <div className="relative h-64 w-full overflow-hidden bg-[#0a1929]">
          {showLogo ? (
            <img
              src={logoUrl}
              alt={company?.name || "Company logo"}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-blue-600/20 bg-blue-600/[0.15] text-3xl font-bold text-blue-300">
                {initials(company?.name || "")}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,24,40,0.98)_0%,rgba(7,24,40,0.4)_40%,transparent_100%)]" />

          <div className="absolute top-5 left-5 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#071828]/80 px-2.5 py-1 backdrop-blur-sm">
              <Hash size={10} className="text-blue-400" />
              <span className="text-xs font-bold text-white">{company.id}</span>
            </div>
            {company?.permissions?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {company.permissions.map((p) => (
                  <span
                    key={`${company.id}-${p}`}
                    className="rounded-lg border border-blue-400/20 bg-blue-500/[0.15] px-2 py-1 text-[10px] font-semibold text-blue-200"
                  >
                    {permissionLabel(p)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="absolute top-5 right-5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(company)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#071828]/80 text-gray-300 backdrop-blur-sm transition-colors hover:text-blue-400"
              aria-label="Tahrirlash"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#071828]/80 text-gray-300 backdrop-blur-sm transition-colors hover:text-white"
              aria-label="Yopish"
            >
              <X size={16} />
            </button>
          </div>

          <div className="absolute right-5 bottom-5 left-5">
            <h2 className="text-2xl font-bold text-white">
              {company?.name || "Noma'lum kompaniya"}
            </h2>
            <p className="mt-1 text-sm text-gray-300">
              {company?.managerName || "Manager ko'rsatilmagan"}
            </p>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              <p className="text-sm font-semibold text-white">
                Asosiy ma'lumotlar
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Kompaniya nomi</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {company?.name || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Manager</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {company?.managerName || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Telefon</p>
                {telHref ? (
                  <a
                    href={telHref}
                    className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300"
                  >
                    <Phone size={14} /> {company.phoneNumber}
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium text-white">-</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">ID</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {company?.id}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-gray-500"}`}
                  />
                  <p
                    className={`text-xs font-semibold ${isActive ? "text-emerald-300" : "text-gray-400"}`}
                  >
                    {isActive ? "Aktiv" : "Nofaol"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-400" />
              <p className="text-sm font-semibold text-white">
                Qo'shimcha ma'lumot
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Tavsif</p>
                <p className="mt-1 text-sm leading-6 text-white">
                  {company?.description || "Tavsif mavjud emas"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ruxsatlar</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {company?.permissions?.length ? (
                    company.permissions.map((p) => (
                      <span
                        key={`p-${company.id}-${p}`}
                        className="rounded-lg border border-blue-400/20 bg-blue-500/[0.12] px-2.5 py-1 text-xs font-medium text-blue-300"
                      >
                        {permissionLabel(p)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      Ruxsatlar mavjud emas
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
          >
            Yopish
          </button>
          <button
            type="button"
            onClick={() => onEdit(company)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white"
          >
            <Pencil size={14} /> Tahrirlash
          </button>
        </div>
      </div>
    </div>
  );
}
