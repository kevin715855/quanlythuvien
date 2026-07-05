import { Navigate, Outlet } from "react-router-dom";
import type { UserRole } from "../../domain/auth";
import { useAuth } from "./auth-context";

export function RoleRoute({ roles, fallback = "/dashboard" }: { roles: UserRole[]; fallback?: string }) {
  const { user } = useAuth();
  return user && roles.includes(user.role) ? <Outlet /> : <Navigate to={fallback} replace />;
}
