export function useAuth() {
  try {
    const raw = localStorage.getItem("userData");
    if (raw) {
      const { user = {}, permission = {} } = JSON.parse(raw);
      return {
        user,
        role: user.role || "USER", // "SUPERADMIN" | "ADMIN" | "ROP"
        permission,
        isAuthenticated: !!user.email,
      };
    }
    return {
      user: { email: localStorage.getItem("email") },
      role: localStorage.getItem("role") || "USER",
      permission: {},
      isAuthenticated: !!localStorage.getItem("email"),
    };
  } catch {
    return { user: {}, role: "USER", permission: {}, isAuthenticated: false };
  }
}
