import { useEffect, useState } from "react";
import api from '../../services/api';

const TIER_COLORS = {
  bronze: { bg: "#fdf4e7", color: "#d97706" },
  silver: { bg: "#f3f4f6", color: "#6b7280" },
  gold: { bg: "#fefce8", color: "#d97706" },
  platinum: { bg: "#ede9fe", color: "#7c3aed" },
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (tier) params.append("tier", tier);
    api.get(`/customers?${params}`)
      .then(r => { setCustomers(r.data.customers); setTotal(r.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, tier]);

  const fmt = v => `₹${(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Customer Management (CRM)</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "0.5rem 0.875rem", fontSize: "0.875rem" }} />
        <select value={tier} onChange={e => setTier(e.target.value)}
          style={{ border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "0.5rem 0.875rem", fontSize: "0.875rem" }}>
          <option value="">All Tiers</option>
          {["bronze", "silver", "gold", "platinum"].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>{total} customers found</p>

      {loading ? <p>Loading...</p> : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Customer", "Skin Type", "Orders", "Total Spent", "Glow Points", "Tier", "Member Since"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151" }}>{h}</th>
                ))}
               </tr>
            </thead>
            <tbody>
              {customers.map(c => {
                const tc = TIER_COLORS[c.loyaltyTier] || {};
                return (
                  <tr key={c._id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{c.email}</div>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#6b7280" }}>{c.skinType || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>{c.orderCount}</td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{fmt(c.totalSpent)}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>💎 {c.glowPoints}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ background: tc.bg, color: tc.color, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize" }}>
                        {c.loyaltyTier}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#6b7280" }}>
                      {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}