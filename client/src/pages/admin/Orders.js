import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const token = () => localStorage.getItem("token");

const STATUS_COLORS = {
  pending:    { bg: "#fefce8", color: "#d97706" },
  processing: { bg: "#eff6ff", color: "#1d4ed8" },
  shipped:    { bg: "#f0fdf4", color: "#15803d" },
  delivered:  { bg: "#dcfce7", color: "#166534" },
  cancelled:  { bg: "#fef2f2", color: "#dc2626" },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [total,  setTotal]  = useState(0);
  const [status, setStatus] = useState("");
  const [page,   setPage]   = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (status) params.append("status", status);
    axios.get(`${API}/admin/orders?${params}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => { setOrders(r.data.orders); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrders, [status, page]);

  const updateStatus = async (id, newStatus) => {
    await axios.put(`${API}/orders/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token()}` } });
    fetchOrders();
  };

  const STATUS_LIST = ["pending","processing","shipped","delivered","cancelled"];
  const fmt = v => `₹${(v / 100).toLocaleString("en-IN")}`;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Order Management</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {["", ...STATUS_LIST].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              style={{ padding: "0.4rem 0.875rem", borderRadius: "999px", border: "1px solid",
                borderColor: status === s ? "#7B2D3C" : "#e5e7eb",
                background: status === s ? "#7B2D3C" : "#fff",
                color: status === s ? "#fff" : "#374151",
                fontSize: "0.8rem", cursor: "pointer" }}>
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["Invoice","Customer","Date","Items","Total","Status","Action"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => {
                  const sc = STATUS_COLORS[o.status] || {};
                  return (
                    <tr key={o._id} style={{ borderTop: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 600, fontSize: "0.8rem" }}>{o.invoiceNumber || o._id.slice(-8).toUpperCase()}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <div style={{ fontWeight: 500 }}>{o.user?.name || "—"}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{o.user?.email}</div>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#6b7280" }}>
                        {new Date(o.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem" }}>{o.items?.length || 0} item(s)</td>
                      <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{fmt(o.total || 0)}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{ background: sc.bg, color: sc.color, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                          {o.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)}
                          style={{ border: "1px solid #e5e7eb", borderRadius: "0.4rem", padding: "0.3rem 0.5rem", fontSize: "0.8rem" }}>
                          {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#6b7280" }}>
            <span>Showing {orders.length} of {total} orders</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: "0.3rem 0.75rem", border: "1px solid #e5e7eb", borderRadius: "0.4rem", cursor: "pointer" }}>←</button>
              <span style={{ padding: "0.3rem 0.75rem" }}>Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={orders.length < 15}
                style={{ padding: "0.3rem 0.75rem", border: "1px solid #e5e7eb", borderRadius: "0.4rem", cursor: "pointer" }}>→</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}