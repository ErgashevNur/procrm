import { useMemo, useState } from "react";
import { Eye, Hash, Pencil, Phone, Trash2 } from "lucide-react";

export default function CompanyCard({
  company,
  onEdit,
  onDelete,
  onView,
  lockDelete = false,
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

  return (
    <div
      onClick={() => onView(company)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/6 bg-[linear-gradient(145deg,#0f2438_0%,#0a1929_100%)] transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 hover:-translate-y-0.5 hover:border-white/12"
    >
      <div className="relative h-36 w-full overflow-hidden bg-[#0a1929]">
        {showLogo ? (
          <img
            src={logoUrl}
            alt={company?.name || "Company logo"}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-600/20 bg-blue-600/[0.15] text-xl font-bold text-blue-300">
              {initials(company?.name || "")}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(7,24,40,0.95)_0%,transparent_55%)]" />

        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#071828]/80 px-2 py-0.5 backdrop-blur-sm">
            <Hash size={9} className="text-blue-400" />
            <span className="text-[10px] font-bold text-white">
              {company?.id}
            </span>
          </div>
        </div>

        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView(company);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.12] bg-[#071828]/80 text-gray-400 backdrop-blur-sm transition-colors hover:text-white"
            aria-label="Ko'rish"
          >
            <Eye size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(company);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.12] bg-[#071828]/80 text-gray-400 backdrop-blur-sm transition-colors hover:text-blue-400"
            aria-label="Tahrirlash"
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!lockDelete) onDelete(company);
            }}
            disabled={lockDelete}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.12] bg-[#071828]/80 text-gray-400 backdrop-blur-sm transition-colors hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="O'chirish"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <div className="absolute right-3 bottom-3 left-3">
          <p className="truncate text-sm font-semibold text-white">
            {company?.name}
          </p>
          {company?.managerName ? (
            <p className="truncate text-[11px] text-gray-300">
              {company.managerName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        {company?.description ? (
          <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-gray-700">
            {company.description}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {telHref ? (
            <a
              href={telHref}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.04] bg-white/[0.02] px-2.5 py-1 transition-colors hover:border-green-500/20 hover:bg-green-500/5"
            >
              <Phone size={9} className="text-green-400" />
              <span className="text-[10px] text-gray-500">
                {company.phoneNumber}
              </span>
            </a>
          ) : null}
          {company?.permissions?.length ? (
            <div className="flex flex-wrap gap-1">
              {company.permissions.map((p) => (
                <span
                  key={`${company.id}-${p}`}
                  className="rounded-md border border-blue-600/20 bg-blue-600/[0.12] px-2 py-0.5 text-[10px] font-medium text-blue-300"
                >
                  {permissionLabel(p)}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 flex items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-2"
        >
          <span
            className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-400" : "bg-gray-500"}`}
          />
          <span
            className={`text-[11px] font-medium ${isActive ? "text-emerald-300" : "text-gray-400"}`}
          >
            {isActive ? "Aktiv" : "Nofaol"}
          </span>
        </div>
      </div>
    </div>
  );
}
