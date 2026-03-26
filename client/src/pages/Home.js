import { Link } from "react-router-dom";

const FEATURES = [
  { icon: "🧬", title: "AI Skin Analysis", desc: "Our quiz maps your skin concerns to exact formulations." },
  { icon: "🌿", title: "Clean Ingredients", desc: "No parabens, no sulfates. Every ingredient earns its place." },
  { icon: "📦", title: "Subscribe & Save 10%", desc: "Never run out. Pause or cancel anytime." },
  { icon: "💎", title: "Glow Points", desc: "Earn rewards on every purchase and redeem for discounts." },
];

const CATEGORIES = [
  { label: "Skincare", value: "skin", emoji: "✨", desc: "Serums, moisturizers, cleansers" },
  { label: "Haircare", value: "hair", emoji: "💆", desc: "Growth serums, repair masks" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #F5E8EA 0%, #E1F5EE 100%)", padding: "5rem 1rem" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <span style={{ display: "inline-block", background: "#7B2D3C", color: "#fff", fontSize: "0.75rem", fontWeight: "600", padding: "0.25rem 0.75rem", borderRadius: "999px", marginBottom: "1rem", letterSpacing: "0.05em" }}>
            DERMATOLOGIST RECOMMENDED
          </span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: "700", color: "#1f2937", lineHeight: 1.2, marginBottom: "1.25rem" }}>
            Science-backed skincare<br />built for <em style={{ color: "#7B2D3C" }}>you</em>
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#4b5563", marginBottom: "2rem", maxWidth: 520, margin: "0 auto 2rem" }}>
            Take our 2-minute AI quiz to discover your personalised routine. Real ingredients, real results.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/quiz" style={{ background: "#7B2D3C", color: "#fff", padding: "0.875rem 2rem", borderRadius: "9999px", fontWeight: "600", textDecoration: "none", fontSize: "0.95rem" }}>
              Take the AI Quiz →
            </Link>
            <Link to="/products" style={{ background: "#fff", color: "#7B2D3C", padding: "0.875rem 2rem", borderRadius: "9999px", fontWeight: "600", textDecoration: "none", border: "2px solid #7B2D3C", fontSize: "0.95rem" }}>
              Shop All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: "4rem 1rem", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontFamily: "Georgia, serif", fontSize: "1.875rem", fontWeight: "700", marginBottom: "2.5rem" }}>
          Shop by Category
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {CATEGORIES.map((cat) => (
            <Link key={cat.value} to={`/products?category=${cat.value}`}
              style={{ display: "block", background: cat.value === "skin" ? "#F5E8EA" : "#E1F5EE", borderRadius: "1rem", padding: "2.5rem", textDecoration: "none", textAlign: "center", transition: "transform 0.2s" }}
              onMouseOver={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>{cat.emoji}</div>
              <h3 style={{ fontWeight: "700", fontSize: "1.25rem", color: "#1f2937", marginBottom: "0.5rem" }}>{cat.label}</h3>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: "#f9fafb", padding: "4rem 1rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontFamily: "Georgia, serif", fontSize: "1.875rem", fontWeight: "700", marginBottom: "2.5rem" }}>
            Why Derma Flow?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem" }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ background: "#fff", borderRadius: "1rem", padding: "1.75rem", border: "1px solid #f3f4f6" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{f.icon}</div>
                <h3 style={{ fontWeight: "600", fontSize: "1rem", marginBottom: "0.5rem", color: "#1f2937" }}>{f.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: "#7B2D3C", color: "#fff", padding: "4rem 1rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: "700", marginBottom: "1rem" }}>
          Ready to glow?
        </h2>
        <p style={{ fontSize: "1rem", opacity: 0.85, marginBottom: "1.75rem" }}>
          Join 10,000+ customers who've transformed their skin with personalised routines.
        </p>
        <Link to="/register" style={{ background: "#fff", color: "#7B2D3C", padding: "0.875rem 2.5rem", borderRadius: "9999px", fontWeight: "700", textDecoration: "none", fontSize: "1rem" }}>
          Get Started Free
        </Link>
      </section>
    </div>
  );
}