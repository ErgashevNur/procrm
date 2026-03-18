import { BadgeCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ROLE_LABELS, ROLES, getCurrentRole, isSupportedRole } from "@/lib/rbac";
import { NotificationBell } from "./NotificationBell";

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
};

export default function Header() {
  const location = useLocation();
  const role = getCurrentRole();
  const safeRole = isSupportedRole(role) ? role : ROLES.SALESMANAGER;
  const title = TITLES[location.pathname] || "CRM";
  const projectName = localStorage.getItem("projectName");

  return (
    <div className="crm-glass crm-hairline flex w-full items-center justify-between gap-3 rounded-[28px] px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-[0.01em] text-white">
          {title}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-[color:var(--crm-muted)]">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5">
            <BadgeCheck size={12} />
            {ROLE_LABELS[safeRole]}
          </span>
          {projectName && (
            <span className="truncate rounded-full border border-cyan-400/20 bg-cyan-500/8 px-2 py-0.5 text-cyan-200">
              {projectName}
            </span>
          )}
        </div>
      </div>
      <NotificationBell />
    </div>
  );
}
