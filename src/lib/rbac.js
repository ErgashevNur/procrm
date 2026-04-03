import {
  ChartLine,
  CalendarCheck2,
  FolderOpenDot,
  LayoutDashboard,
  MessageSquare,
  Share2,
  Users,
  ShoppingBag,
  Building2,
} from "lucide-react";

export const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  ROP: "ROP",
  SALESMANAGER: "SALESMANAGER",
};

export const SUPERADMIN_LIKE_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN];
export const MANAGEMENT_ROLES = [ROLES.ROP, ...SUPERADMIN_LIKE_ROLES];
export const CRM_ROLES = [ROLES.SALESMANAGER, ...MANAGEMENT_ROLES];

export const ROLE_LABELS = {
  [ROLES.SUPERADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.ROP]: "Direktor",
  [ROLES.SALESMANAGER]: "Sales Manager",
};

export const DEFAULT_ROUTE_BY_ROLE = {
  [ROLES.SUPERADMIN]: "/dashboard",
  [ROLES.ADMIN]: "/dashboard",
  [ROLES.ROP]: "/dashboard",
  [ROLES.SALESMANAGER]: "/leadlar",
};

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: CRM_ROLES,
  },
  {
    title: "Leadlar",
    url: "/leadlar",
    icon: Users,
    roles: CRM_ROLES,
  },
  {
    title: "Tasklar",
    url: "/tasks",
    icon: CalendarCheck2,
    roles: CRM_ROLES,
  },
  {
    title: "Analitika",
    url: "/analitika",
    icon: ChartLine,
    roles: CRM_ROLES,
  },
  {
    title: "Sms/Rassilka",
    url: "/rassilka",
    icon: MessageSquare,
    roles: CRM_ROLES,
  },
  {
    title: "Lead manbasi",
    url: "/leadSource",
    icon: Share2,
    roles: CRM_ROLES,
  },
  {
    title: "Projectlar",
    url: "/projects",
    icon: FolderOpenDot,
    roles: MANAGEMENT_ROLES,
  },
  {
    title: "Kompaniyalar",
    url: "/companies",
    icon: Building2,
    roles: MANAGEMENT_ROLES,
  },
  // {
  //   title: "CRM Market",
  //   url: "/crm-market",
  //   icon: ShoppingBag,
  //   roles: [ROLES.SUPERADMIN, ROLES.ROP],
  // },
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

export function isSuperAdminLikeRole(role) {
  return SUPERADMIN_LIKE_ROLES.includes(role);
}

export function canDeleteData(role) {
  if (!isSupportedRole(role)) return false;
  return role !== ROLES.ADMIN;
}
