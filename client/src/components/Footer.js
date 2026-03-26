import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #e5e7eb", background: "#f9fafb", padding: "3rem 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2rem" }}>
        <div>
          <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.125rem" }}>✦</span>
            <span style={{ fontWeight: "700", fontSize: "1.125rem", color: "#7B2D3C" }}>Derma Flow</span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Personalized skincare &amp; haircare backed by dermatological science.
          </p>
        </div>

        <div>
          <h4 style={{ marginBottom: "0.75rem", fontWeight: "600", fontSize: "0.875rem" }}>Shop</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link to="/products" style={{ fontSize: "0.875rem", color: "#6b7280", textDecoration: "none" }}>All Products</Link>
            <Link to="/quiz" style={{ fontSize: "0.875rem", color: "#6b7280", textDecoration: "none" }}>AI Diagnostic</Link>
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: "0.75rem", fontWeight: "600", fontSize: "0.875rem" }}>Account</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link to="/login" style={{ fontSize: "0.875rem", color: "#6b7280", textDecoration: "none" }}>Login</Link>
            <Link to="/register" style={{ fontSize: "0.875rem", color: "#6b7280", textDecoration: "none" }}>Register</Link>
            <Link to="/dashboard" style={{ fontSize: "0.875rem", color: "#6b7280", textDecoration: "none" }}>Dashboard</Link>
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: "0.75rem", fontWeight: "600", fontSize: "0.875rem" }}>Support</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>help@dermaflow.com</span>
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>1-800-GLOW</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "2rem auto 0", padding: "1.5rem 1rem 0", borderTop: "1px solid #e5e7eb", textAlign: "center", fontSize: "0.75rem", color: "#9ca3af" }}>
        © 2026 Derma Flow. All rights reserved. Dermatologist Recommended.
      </div>
    </footer>
  );
}