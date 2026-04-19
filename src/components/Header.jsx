import { useLocation } from "react-router-dom";
import { ROLE_LABELS, ROLES, getCurrentRole, isSupportedRole } from "@/lib/rbac";

const TITLES = {
  "/dashboard": "Dashboard",
  "/leadlar": "Leadlar",
  "/tasks": "Tasklar",
  "/leadSource": "Lead manbalari",
  "/projects": "Projectlar",
  "/status": "Statuslar",
  "/addStatus": "Status qo'shish",
  "/rassilka": "SMS / Rassilka",
  "/setting": "Sozlamalar",
  "/profile": "Profil",
  "/kanban": "Kanban",
  "/leadDetails": "Lead tafsiloti",
  "/analitika": "Analitika",
  "/companies": "Kompaniyalar",
  "/crm-market": "CRM Market",
};

export default function Header() {
  const location = useLocation();
  const role = getCurrentRole();
  const safeRole = isSupportedRole(role) ? role : ROLES.SALESMANAGER;
  const title = TITLES[location.pathname] || "CRM";
  const projectName = localStorage.getItem("projectName");
  const roleLabel = ROLE_LABELS[safeRole] || safeRole;

  return (
    <div className="crm-glass crm-hairline hidden w-full items-center justify-between gap-4 rounded-[28px] px-5 py-3 md:flex">
      <div className="min-w-0">
        <h1 className="text-sm font-semibold text-white truncate">{title}</h1>
        {projectName && (
          <p className="mt-0.5 text-[11px] text-slate-500 truncate leading-none">
            {projectName}
          </p>
        )}
      </div>
      <div className="shrink-0 rounded-xl border border-white/8 bg-white/4 px-3 py-1.5">
        <span className="text-[11px] font-medium text-slate-400">{roleLabel}</span>
      </div>
    </div>
  );
}
