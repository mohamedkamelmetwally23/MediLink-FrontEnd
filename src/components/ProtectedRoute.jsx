import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const token = localStorage.getItem("medilinkToken") || localStorage.getItem("token");
  const role = localStorage.getItem("medilinkRole");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
