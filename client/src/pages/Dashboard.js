import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../services/api";

const TAB_STYLE = (active) => ({
  padding: "0.5rem 1.25rem",
  borderRadius: "9999px",
  border: "none",
  cursor: "pointer",
  fontSize: "0.875rem",
  fontWeight: "600",
  background: active ? "#7B2D3C" : "transparent",
  color: active ? "#fff" : "#6b7280",
  transition: "all 0.15s",
});

function StatCard({ label, value, emoji }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: "1rem", padding: "1.25rem", textAlign: "center" }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>{emoji}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#7B2D3C" }}>{value}</div>
      <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.2rem" }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    getMyOrders()
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, [user, navigate]);

  const handleLogout = () => { logout(); navigate("/"); };

  if (!user) return null;

  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#1f2937" }}>
            Welcome back, {user.name.split(" ")[0]} ✨
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{user.email}</p>
        </div>
        <button onClick={handleLogout}
          style={{ background: "transparent", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "0.5rem 1rem", color: "#6b7280", cursor: "pointer", fontSize: "0.875rem" }}>
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard label="Glow Points" value={user.glowPoints || 0} emoji="💎" />
        <StatCard label="Orders Placed" value={orders.length} emoji="📦" />
        <StatCard label="Total Spent" value={`₹${(totalSpent / 100).toFixed(0)}`} emoji="💰" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", background: "#f3f4f6", borderRadius: "9999px", padding: "0.3rem", width: "fit-content" }}>
        {["overview", "orders", "routine"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={TAB_STYLE(tab === t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "#F5E8EA", borderRadius: "1rem", padding: "1.5rem" }}>
            <h3 style={{ fontWeight: "600", marginBottom: "0.5rem", color: "#7B2D3C" }}>🌟 Glow Rewards</h3>
            <p style={{ fontSize: "0.875rem", color: "#4b5563", marginBottom: "1rem" }}>
              You have <strong>{user.glowPoints || 0} Glow Points</strong>. Earn more by shopping!
            </p>
            <div style={{ background: "#fff", borderRadius: "0.5rem", padding: "0.75rem", fontSize: "0.8rem", color: "#6b7280" }}>
              500 pts = ₹50 off your next order
            </div>
          </div>
          <div style={{ background: "#E1F5EE", borderRadius: "1rem", padding: "1.5rem" }}>
            <h3 style={{ fontWeight: "600", marginBottom: "0.5rem", color: "#0F6E56" }}>🧴 Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link to="/products" style={{ display: "block", background: "#fff", borderRadius: "0.5rem", padding: "0.6rem 0.875rem", textDecoration: "none", color: "#1f2937", fontSize: "0.875rem", fontWeight: "500" }}>
                → Browse All Products
              </Link>
              <Link to="/quiz" style={{ display: "block", background: "#fff", borderRadius: "0.5rem", padding: "0.6rem 0.875rem", textDecoration: "none", color: "#1f2937", fontSize: "0.875rem", fontWeight: "500" }}>
                → Take AI Skin Quiz
              </Link>
              <Link to="/cart" style={{ display: "block", background: "#fff", borderRadius: "0.5rem", padding: "0.6rem 0.875rem", textDecoration: "none", color: "#1f2937", fontSize: "0.875rem", fontWeight: "500" }}>
                → View Cart
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Orders */}
      {tab === "orders" && (
        <div>
          {loadingOrders ? (
            <p style={{ color: "#6b7280" }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📦</div>
              <p>No orders yet.</p>
              <Link to="/products" style={{ display: "inline-block", marginTop: "1rem", background: "#7B2D3C", color: "#fff", padding: "0.6rem 1.5rem", borderRadius: "9999px", textDecoration: "none", fontSize: "0.875rem" }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {orders.map(order => (
                <div key={order._id} style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: "1rem", padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <div>
                      <p style={{ fontWeight: "600", fontSize: "0.875rem", color: "#1f2937" }}>Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ background: order.status === "paid" || order.status === "delivered" ? "#dcfce7" : "#fef3c7", color: order.status === "paid" || order.status === "delivered" ? "#166534" : "#92400e", fontSize: "0.75rem", fontWeight: "600", padding: "0.2rem 0.65rem", borderRadius: "999px" }}>
                        {order.status.toUpperCase()}
                      </span>
                      <span style={{ fontWeight: "700", color: "#7B2D3C" }}>₹{(order.total / 100).toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    {order.items.map(i => i.name).join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Routine */}
      {tab === "routine" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {["AM", "PM"].map(time => (
            <div key={time} style={{ background: "#fff", border: "1px solid #f3f4f6", borderRadius: "1rem", padding: "1.5rem" }}>
              <h3 style={{ fontWeight: "600", marginBottom: "1rem", color: time === "AM" ? "#d97706" : "#7B2D3C" }}>
                {time === "AM" ? "☀️" : "🌙"} {time} Routine
              </h3>
              {(user[time === "AM" ? "amRoutine" : "pmRoutine"] || []).length === 0 ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0", color: "#9ca3af", fontSize: "0.875rem" }}>
                  <p>No products added yet.</p>
                  <Link to="/quiz" style={{ color: "#7B2D3C", fontSize: "0.8rem" }}>Take AI quiz to build your routine →</Link>
                </div>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {user[time === "AM" ? "amRoutine" : "pmRoutine"].map((p, i) => (
                    <li key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid #f9fafb", fontSize: "0.875rem", color: "#374151" }}>
                      {i + 1}. {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}