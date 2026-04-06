import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const token = () => localStorage.getItem("token");

function StatCard({ label, value, color, emoji }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", flex: 1 }}>
      <div style={{ fontSize: "1.75rem", marginBottom: "0.4rem" }}>{emoji}</div>
      <div style={{ fontSize: "1.75rem", fontWeight: 700, color: color || "#1f2937" }}>{value}</div>
      <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.25rem" }}>{label}</div>
    </div>
  );
}

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/admin/dashboard`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!data)   return <p style={{ color: "red" }}>Failed to load data.</p>;

  const fmt = v => `₹${(v / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Dashboard Overview</h1>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <StatCard emoji="💰" label="Total Revenue" value={fmt(data.totalRevenue)} color="#7B2D3C" />
        <StatCard emoji="📦" label="Total Orders"  value={data.totalOrders}  color="#1d4ed8" />
        <StatCard emoji="👥" label="Customers"     value={data.totalUsers}   color="#047857" />
        <StatCard emoji="🧴" label="Products"      value={data.totalProducts} color="#b45309" />
      </div>

      {/* Low stock alerts */}
      {data.lowStock?.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem", marginBottom: "2rem" }}>
          <h2 style={{ fontWeight: 700, marginBottom: "1rem", color: "#dc2626" }}>⚠️ Low Stock Alerts ({data.lowStock.length})</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Product", "Stock", "Threshold", "Status"].map(h => (
                  <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.lowStock.map(p => (
                <tr key={p._id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.6rem 1rem" }}>{p.name}</td>
                  <td style={{ padding: "0.6rem 1rem", fontWeight: 700, color: p.stockQuantity === 0 ? "#dc2626" : "#d97706" }}>
                    {p.stockQuantity}
                  </td>
                  <td style={{ padding: "0.6rem 1rem" }}>{p.safetyThreshold}</td>
                  <td style={{ padding: "0.6rem 1rem" }}>
                    <span style={{ background: p.stockQuantity === 0 ? "#fef2f2" : "#fefce8",
                      color: p.stockQuantity === 0 ? "#dc2626" : "#d97706",
                      padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                      {p.stockQuantity === 0 ? "OUT OF STOCK" : "LOW STOCK"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Daily Revenue Chart (text-based) */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem" }}>
        <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>📈 Revenue Last 7 Days</h2>
        {data.dailyRevenue?.length === 0
          ? <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No revenue data yet.</p>
          : data.dailyRevenue?.map(d => (
            <div key={d._id} style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <span style={{ width: 90, fontSize: "0.8rem", color: "#6b7280" }}>{d._id}</span>
              <div style={{ flex: 1, background: "#f3f4f6", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: 20, borderRadius: "999px", background: "#7B2D3C",
                  width: `${Math.min((d.revenue / Math.max(...data.dailyRevenue.map(x => x.revenue))) * 100, 100)}%`
                }} />
              </div>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#7B2D3C", width: 80, textAlign: "right" }}>
                {fmt(d.revenue)}
              </span>
            </div>
          ))
        }
      </div>
    </div>
  );
}