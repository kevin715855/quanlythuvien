import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../app/auth-context";

const links = [
  { to: "/dashboard", label: "Tổng quan", number: "01", roles: ["admin", "staff"] },
  { to: "/catalog", label: "Catalog", number: "02", roles: ["staff"] },
  { to: "/readers", label: "Độc giả", number: "03", roles: ["staff"] },
  { to: "/circulation", label: "Mượn / trả", number: "04", roles: ["staff"] },
  { to: "/reservations", label: "Đặt chỗ", number: "05", roles: ["staff"] },
  { to: "/billing", label: "Phí phạt", number: "06", roles: ["staff"] },
  { to: "/admin", label: "Quản trị", number: "07", roles: ["admin"] },
] as const;

export function AppShell() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span>DGM</span><strong>Library</strong></div>
        <nav aria-label="Nghiệp vụ thư viện">
          {links.filter((link) => user && (link.roles as readonly string[]).includes(user.role)).map(({ to, label, number }) => <NavLink key={to} to={to}><small aria-hidden="true">{number}</small><span>{label}</span></NavLink>)}
        </nav>
        <div className="sidebar-footer"><span>{user ? `${user.username} · ${user.role}` : "Đang tải…"}</span><button onClick={() => void logout()}>Đăng xuất</button></div>
      </aside>
      <main className="workspace"><Outlet /></main>
    </div>
  );
}
