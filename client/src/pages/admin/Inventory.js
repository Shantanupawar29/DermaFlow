import { useEffect, useState } from "react";
import api from '../../services/api';

export default function Inventory() {
  const [data, setData] = useState({ products: [], stats: {} });
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchInventory = () => {
    api.get('/inventory')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchInventory, []);

  const updateStock = async (id) => {
    const val = editing[id];
    if (val === undefined || val === "") return;
    await api.put(`/inventory/${id}`, { stockQuantity: Number(val) });
    setEditing(e => { const x = { ...e }; delete x[id]; return x; });
    fetchInventory();
  };

  const stockColor = (p) => {
    if (p.stockQuantity === 0) return { bg: "#fef2f2", color: "#dc2626", label: "Out" };
    if (p.stockQuantity <= p.safetyThreshold) return { bg: "#fefce8", color: "#d97706", label: "Low" };
    return { bg: "#f0fdf4", color: "#15803d", label: "OK" };
  };

  if (loading) return <p>Loading inventory...</p>;

  const { products, stats } = data;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Inventory Management</h1>

      {/* Stats */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {[
          { label: "Total Products", value: stats.total, color: "#1f2937" },
          { label: "In Stock", value: stats.inStock, color: "#15803d" },
          { label: "Low Stock", value: stats.low, color: "#d97706" },
          { label: "Out of Stock", value: stats.outOf, color: "#dc2626" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, minWidth: 120, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Product", "Category", "Price", "Stock", "Threshold", "Status", "Update Stock"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const sc = stockColor(p);
              return (
                <tr key={p._id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{
                      background: p.category === "skin" ? "#F5E8EA" : "#E1F5EE",
                      color: p.category === "skin" ? "#7B2D3C" : "#047857",
                      padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem"
                    }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>₹{(p.price).toLocaleString('en-IN')}</td>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: sc.color }}>{p.stockQuantity}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>{p.safetyThreshold}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ background: sc.bg, color: sc.color, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                      {sc.label}
                    </span>
                   </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <input type="number" min="0"
                        value={editing[p._id] !== undefined ? editing[p._id] : p.stockQuantity}
                        onChange={e => setEditing(ed => ({ ...ed, [p._id]: e.target.value }))}
                        style={{ width: 70, border: "1px solid #e5e7eb", borderRadius: "0.4rem", padding: "0.3rem 0.5rem", fontSize: "0.8rem" }} />
                      <button onClick={() => updateStock(p._id)}
                        style={{ background: "#7B2D3C", color: "#fff", border: "none", borderRadius: "0.4rem",
                          padding: "0.3rem 0.75rem", fontSize: "0.8rem", cursor: "pointer" }}>
                        Save
                      </button>
                    </div>
                   </td>
                 </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}