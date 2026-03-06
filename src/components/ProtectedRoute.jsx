import { Navigate } from "react-router-dom";
import { getCurrentRole, isRoleAllowed, isSupportedRole } from "@/lib/rbac";

export default function ProtectedRoute({ children, allowedRoles }) {
  const raw = localStorage.getItem("userData");

  if (!raw) {
    return <Navigate to="/login" replace />;
  }

  // allowedRoles berilmagan bo'lsa — faqat login tekshiriladi
  if (!allowedRoles) {
    return <>{children}</>;
  }

  try {
    const role = getCurrentRole();
    if (!isSupportedRole(role)) {
      return <Navigate to="/login" replace />;
    }
    if (!isRoleAllowed(allowedRoles, role)) {
      return <Navigate to="/403" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
