import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

const links = [
  { to: "/admin", label: "📊 Overview", end: true },
  { to: "/admin/orders", label: "📦 Orders" },
  { to: "/admin/inventory", label: "🗃️ Inventory" },
  { to: "/admin/customers", label: "👥 Customers" },
  { to: "/admin/sales", label: "📈 Sales Report" },
  { to: "/admin/security", label: "🔒 Security" },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "admin") navigate("/login");
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  const sideStyle = {
    width: 220, background: "#1f2937", minHeight: "100vh",
    padding: "1.5rem 0", position: "fixed", top: 64, left: 0, bottom: 0,
  };
  const linkStyle = (active) => ({
    display: "block", padding: "0.65rem 1.5rem", fontSize: "0.875rem",
    color: active ? "#fff" : "#9ca3af",
    background: active ? "#7B2D3C" : "transparent",
    textDecoration: "none", fontWeight: active ? 600 : 400,
    borderLeft: active ? "3px solid #f87171" : "3px solid transparent",
  });

  return (
    <div style={{ display: "flex" }}>
      <aside style={sideStyle}>
        <div style={{ padding: "0 1.5rem 1.5rem", borderBottom: "1px solid #374151", marginBottom: "0.75rem" }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>✦ Admin Panel</p>
          <p style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{user.email}</p>
        </div>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            style={({ isActive }) => linkStyle(isActive)}>
            {l.label}
          </NavLink>
        ))}
      </aside>
      <main style={{ marginLeft: 220, flex: 1, padding: "2rem", background: "#f9fafb", minHeight: "calc(100vh - 64px)" }}>
        <Outlet />
      </main>
    </div>
  );
}