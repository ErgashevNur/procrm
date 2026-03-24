import { useLocation } from "react-router-dom";
import {
  ROLE_LABELS,
  ROLES,
  getCurrentRole,
  isSupportedRole,
} from "@/lib/rbac";

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

  return <div className="crm-glass crm-hairline w-full rounded-[28px] px-4 py-3" />;
}
