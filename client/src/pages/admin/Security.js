export default function Security() {
  const threats = [
    { type: "SQL Injection",         risk: "High",   status: "Protected", measure: "Mongoose ORM — no raw SQL queries" },
    { type: "XSS Attacks",           risk: "High",   status: "Protected", measure: "Input sanitized with xss library; CSP headers via helmet" },
    { type: "Brute Force Login",     risk: "High",   status: "Protected", measure: "5-attempt lock; 15-min cooldown; rate limiting on /api/auth" },
    { type: "CSRF",                  risk: "Medium", status: "Protected", measure: "SameSite cookies; JWT in Authorization header" },
    { type: "Data Exposure",         risk: "High",   status: "Protected", measure: "Password hashed (bcrypt, cost 12); token fields stripped from toJSON()" },
    { type: "Insecure Headers",      risk: "Medium", status: "Protected", measure: "Helmet.js sets X-Frame-Options, HSTS, CSP, X-Content-Type-Options" },
    { type: "Unauthorized Access",   risk: "High",   status: "Protected", measure: "JWT auth middleware on all protected routes; admin role check" },
    { type: "Rate Limiting / DDoS",  risk: "Medium", status: "Protected", measure: "express-rate-limit: 300 req/15min global; 20 req/15min on auth" },
    { type: "CORS Misconfiguration", risk: "Medium", status: "Protected", measure: "Strict CORS whitelist via ALLOWED_ORIGINS env variable" },
    { type: "Dependency Vulnerabilities", risk: "Low", status: "Monitor", measure: "Run npm audit regularly; keep packages updated" },
  ];

  const RISK_COLORS  = { High: "#dc2626", Medium: "#d97706", Low: "#2563eb" };
  const STATUS_COLORS = { Protected: { bg: "#f0fdf4", color: "#15803d" }, Monitor: { bg: "#fefce8", color: "#d97706" } };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Risk Assessment & Security</h1>
      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "2rem" }}>
        Threat matrix showing identified risks and implemented countermeasures for the DermaFlow e-commerce platform.
      </p>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {[
          { label: "Threats Identified",  value: threats.length,                              color: "#1f2937" },
          { label: "Protected",           value: threats.filter(t => t.status === "Protected").length, color: "#15803d" },
          { label: "High Risk Addressed", value: threats.filter(t => t.risk === "High").length, color: "#dc2626" },
          { label: "Security Score",      value: "A+",                                         color: "#7B2D3C" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, minWidth: 130, background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Threat table */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Threat","Risk Level","Status","Countermeasure"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {threats.map((t, i) => {
              const sc = STATUS_COLORS[t.status] || {};
              return (
                <tr key={i} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>{t.type}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ color: RISK_COLORS[t.risk], fontWeight: 700, fontSize: "0.8rem" }}>● {t.risk}</span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{ background: sc.bg, color: sc.color, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#4b5563", fontSize: "0.8rem" }}>{t.measure}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Implemented measures */}
      <div style={{ marginTop: "2rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "1rem", padding: "1.5rem" }}>
        <h2 style={{ fontWeight: 700, marginBottom: "1rem" }}> Implemented Security Stack</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "0.75rem" }}>
          {[
            " bcrypt (cost 12) for password hashing",
            " JWT tokens with 7-day expiry",
            " Helmet.js — 11 security headers",
            " Rate limiting on all API routes",
            " CORS whitelist from .env",
            " Account lockout after 5 failed logins",
            " Input validation with validator.js",
            " Admin role-based access control",
            " HTTPS enforced in production",
            " Request logging for audit trail",
          ].map(m => (
            <div key={m} style={{ background: "#f0fdf4", borderRadius: "0.5rem", padding: "0.75rem", fontSize: "0.8rem", color: "#166534" }}>
              {m}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}