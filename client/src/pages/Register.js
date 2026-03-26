import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password });
      saveAuth(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", padding: "2rem 1rem" }}>
      <div style={{ background: "#fff", padding: "2.5rem", borderRadius: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #f3f4f6", width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#7B2D3C" }}>✦ Derma Flow</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1f2937", marginTop: "0.5rem" }}>Create your account</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>Start your personalised routine today</p>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "0.5rem", padding: "0.75rem", marginBottom: "1rem", color: "#dc2626", fontSize: "0.875rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.3rem" }}>Full Name</label>
            <input type="text" placeholder="Riya Sharma" style={inputStyle}
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.3rem" }}>Email</label>
            <input type="email" placeholder="riya@example.com" style={inputStyle}
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.3rem" }}>Password</label>
            <input type="password" placeholder="Minimum 6 characters" style={inputStyle}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.3rem" }}>Confirm Password</label>
            <input type="password" placeholder="Repeat password" style={inputStyle}
              value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
          </div>

          <button type="submit" disabled={loading}
            style={{ width: "100%", background: loading ? "#9ca3af" : "#7B2D3C", color: "#fff", padding: "0.75rem", borderRadius: "0.75rem", fontWeight: "600", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.875rem", color: "#6b7280" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#7B2D3C", fontWeight: "600", textDecoration: "none" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}