import { isSupportedRole, ROLES } from "@/lib/rbac";

export function useAuth() {
  try {
    const raw = localStorage.getItem("userData");
    if (!raw) {
      return {
        user: {},
        role: null,
        permission: {},
        isAuthenticated: false,
      };
    }
    const { user = {}, permission = {} } = JSON.parse(raw);
    const role = user.role || null;
    return {
      user,
      role,
      permission,
      isAuthenticated: !!user.email && isSupportedRole(role),
      isManager: [ROLES.ROP, ROLES.SUPERADMIN].includes(role),
      isSales: role === ROLES.SALESMANAGER,
    };
  } catch {
    return { user: {}, role: null, permission: {}, isAuthenticated: false };
  }
}
