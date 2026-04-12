import { useEffect, useState } from "react";
import api from '../../services/api';

export default function SalesReport() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/analytics/sales?period=${period}`)
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const fmt = v => `₹${(v / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const PERIODS = [{ v: "7", l: "7 Days" }, { v: "30", l: "30 Days" }, { v: "90", l: "90 Days" }];

  const exportToCSV = () => {
    if (!data || !data.revenueByDay) return;
    
    const csvData = data.revenueByDay.map(day => ({
      Date: day._id,
      Orders: day.orders,
      Revenue: (day.revenue / 100).toFixed(2)
    }));
    
    const headers = Object.keys(csvData[0] || {});
    const csvRows = [headers.join(',')];
    
    for (const row of csvData) {
      const values = headers.map(header => `"${row[header]}"`);
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${period}_days.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <p>Loading sales report...</p>;
  if (!data) return <p style={{ color: "red" }}>Failed to load.</p>;

  const totalRevenue = data.totalRevenue || 0;
  const categories = [
    { name: "Skincare", revenue: data.salesByCategory?.find(c => c._id === 'skin')?.revenue || 0, color: "#7B2D3C" },
    { name: "Haircare", revenue: data.salesByCategory?.find(c => c._id === 'hair')?.revenue || 0, color: "#0F6E56" },
    { name: "Other", revenue: data.salesByCategory?.find(c => c._id === 'other')?.revenue || 0, color: "#D4AF37" }
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Sales Report (ERP)</h1>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {PERIODS.map(p => (
            <button key={p.v} onClick={() => setPeriod(p.v)}
              style={{ padding: "0.4rem 0.875rem", borderRadius: "999px", border: "1px solid",
                borderColor: period === p.v ? "#7B2D3C" : "#e5e7eb",
                background: period === p.v ? "#7B2D3C" : "#fff",
                color: period === p.v ? "#fff" : "#374151",
                fontSize: "0.8rem", cursor: "pointer" }}>
              {p.l}
            </button>
          ))}
          <button onClick={exportToCSV}
            style={{ padding: "0.4rem 0.875rem", borderRadius: "999px", border: "1px solid #7B2D3C",
              background: "#fff", color: "#7B2D3C", fontSize: "0.8rem", cursor: "pointer" }}>
            📊 Export CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {[
          { label: "Total Revenue", value: fmt(data.totalRevenue), color: "#7B2D3C" },
          { label: "Total Orders", value: data.totalOrders, color: "#1d4ed8" },
          { label: "Avg Order Value", value: fmt(data.avgOrderValue), color: "#047857" },
        ].map(k => (
          <div key={k.label} style={{ flex: 1, minWidth: 150, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.25rem" }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Top Products */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>🏆 Top Products</h2>
          {data.topProducts?.length === 0
            ? <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No data yet.</p>
            : data.topProducts.map((p, i) => (
              <div key={p._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ width: 24, height: 24, background: "#7B2D3C", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: "0.875rem" }}>{p._id}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "#7B2D3C", fontSize: "0.875rem" }}>{fmt(p.revenue)}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{p.unitsSold} units</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Sales by Category */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem" }}>
          <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>📂 Sales by Category</h2>
          {categories.map(c => {
            const percentage = totalRevenue > 0 ? (c.revenue / totalRevenue) * 100 : 0;
            return (
              <div key={c.name} style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", fontSize: "0.875rem" }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontWeight: 700 }}>{fmt(c.revenue)} ({percentage.toFixed(1)}%)</span>
                </div>
                <div style={{ background: "#f3f4f6", borderRadius: "999px", overflow: "hidden", height: 10 }}>
                  <div style={{
                    height: 10, borderRadius: "999px",
                    background: c.color,
                    width: `${percentage}%`
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Revenue Table */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem" }}>
        <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}>📅 Daily Revenue Breakdown</h2>
        {data.revenueByDay?.length === 0
          ? <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No transactions in this period.</p>
          : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 600 }}>Date</th>
                  <th style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 600 }}>Orders</th>
                  <th style={{ padding: "0.6rem 1rem", textAlign: "right", fontWeight: 600 }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {[...data.revenueByDay].reverse().map(d => (
                  <tr key={d._id} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.6rem 1rem" }}>{d._id}</td>
                    <td style={{ padding: "0.6rem 1rem" }}>{d.orders}</td>
                    <td style={{ padding: "0.6rem 1rem", textAlign: "right", fontWeight: 600, color: "#7B2D3C" }}>{fmt(d.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>
    </div>
  );
}