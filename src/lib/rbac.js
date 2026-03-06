import {
  CalendarCheck2,
  FolderOpenDot,
  LayoutDashboard,
  MessageSquare,
  Share2,
  Users,
} from "lucide-react";

export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ROP: "ROP",
  SALESMANAGER: "SALESMANAGER",
};

export const ROLE_LABELS = {
  [ROLES.SUPERADMIN]: "Super Admin",
  [ROLES.ROP]: "Direktor",
  [ROLES.SALESMANAGER]: "Sales Manager",
};

export const DEFAULT_ROUTE_BY_ROLE = {
  [ROLES.SUPERADMIN]: "/dashboard",
  [ROLES.ROP]: "/dashboard",
  [ROLES.SALESMANAGER]: "/leadlar",
};

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.SUPERADMIN, ROLES.ROP],
  },
  {
    title: "Leadlar",
    url: "/leadlar",
    icon: Users,
    roles: [ROLES.SUPERADMIN, ROLES.ROP, ROLES.SALESMANAGER],
  },
  {
    title: "Tasklar",
    url: "/tasks",
    icon: CalendarCheck2,
    roles: [ROLES.SUPERADMIN, ROLES.ROP, ROLES.SALESMANAGER],
  },
  {
    title: "Lead manbasi",
    url: "/leadSource",
    icon: Share2,
    roles: [ROLES.SUPERADMIN, ROLES.ROP, ROLES.SALESMANAGER],
  },
  {
    title: "Projectlar",
    url: "/projects",
    icon: FolderOpenDot,
    roles: [ROLES.SUPERADMIN, ROLES.ROP],
  },
  {
    title: "Sms/Rassilka",
    url: "/rassilka",
    icon: MessageSquare,
    roles: [ROLES.SUPERADMIN, ROLES.ROP],
  },
];

export function getCurrentRole() {
  try {
    const raw = localStorage.getItem("userData");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user?.role || null;
  } catch {
    return null;
  }
}

export function getDefaultRouteByRole(role) {
  return DEFAULT_ROUTE_BY_ROLE[role] || "/login";
}

export function isRoleAllowed(allowedRoles, role) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return true;
  return allowedRoles.includes(role);
}

export function isSupportedRole(role) {
  return Object.values(ROLES).includes(role);
}
