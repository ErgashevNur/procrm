import { Navigate } from "react-router-dom";

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
    const { user = {} } = JSON.parse(raw);
    const role = user.role || "USER";

    if (!allowedRoles.includes(role)) {
      return <Navigate to="/403" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
