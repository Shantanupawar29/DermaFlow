import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { formatPrice, getRupees, toPaise } from "../utils/price";

const API_URL = 'http://localhost:5000/api';

const badge = (text, color) => (
  <span style={{ display: "inline-block", background: color, color: "#fff", fontSize: "0.7rem", fontWeight: "600", padding: "0.2rem 0.6rem", borderRadius: "999px", marginRight: "0.4rem", marginBottom: "0.4rem" }}>
    {text}
  </span>
);

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubscription, setIsSubscription] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, isSubscription);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "#6b7280" }}>Loading...</div>;
  if (error || !product) return (
    <div style={{ padding: "4rem", textAlign: "center" }}>
      <p style={{ color: "#ef4444", marginBottom: "1rem" }}>{error || "Product not found."}</p>
      <Link to="/products" style={{ color: "#7B2D3C" }}>← Back to Products</Link>
    </div>
  );

  // Price is in paise from backend
  const originalPrice = product.price;
  const subscriptionPrice = originalPrice * 0.9;
  const displayPrice = isSubscription ? subscriptionPrice : originalPrice;
  const inStock = product.stockQuantity > 0;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2.5rem 1rem" }}>
      <Link to="/products" style={{ color: "#7B2D3C", textDecoration: "none", fontSize: "0.875rem", display: "inline-block", marginBottom: "1.5rem" }}>
        ← Back to Products
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
        {/* Image */}
        <div>
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} style={{ width: "100%", borderRadius: "1rem", objectFit: "cover", aspectRatio: "1/1" }} />
          ) : (
            <div style={{ background: "#F5E8EA", borderRadius: "1rem", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", color: "#7B2D3C", fontWeight: "600", fontSize: "1.25rem", textAlign: "center", padding: "2rem" }}>
              {product.name}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ marginBottom: "0.5rem" }}>
            {badge(product.category === "skin" ? "Skincare" : "Haircare", "#0F6E56")}
            {product.routineTime && badge(product.routineTime === "both" ? "AM & PM" : product.routineTime + " Routine", "#7B2D3C")}
          </div>

          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: "700", color: "#1f2937", marginBottom: "0.75rem" }}>
            {product.name}
          </h1>

          <p style={{ color: "#6b7280", lineHeight: 1.7, marginBottom: "1.5rem" }}>
            {product.description}
          </p>

          {/* Price - Now using formatPrice */}
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#7B2D3C" }}>
              {formatPrice(displayPrice)}
            </div>
            {isSubscription && (
              <span style={{ textDecoration: "line-through", color: "#9ca3af", fontSize: "0.875rem" }}>
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Subscription toggle */}
          {product.subscriptionAvailable && (
            <div style={{ background: "#E1F5EE", border: "1px solid #0F6E56", borderRadius: "0.75rem", padding: "0.75rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}
              onClick={() => setIsSubscription(!isSubscription)}>
              <input type="checkbox" checked={isSubscription} onChange={() => {}} style={{ width: 16, height: 16, accentColor: "#0F6E56" }} />
              <div>
                <div style={{ fontWeight: "600", fontSize: "0.875rem", color: "#0F6E56" }}>Subscribe & Save 10%</div>
                <div style={{ fontSize: "0.75rem", color: "#4b5563" }}>Auto-delivery every 30 days. Cancel anytime.</div>
              </div>
            </div>
          )}

          {/* Stock */}
          {!inStock && (
            <div style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "1rem" }}>⚠️ Out of stock</div>
          )}
          {inStock && product.stockQuantity <= product.safetyThreshold && (
            <div style={{ color: "#f59e0b", fontSize: "0.875rem", marginBottom: "1rem" }}>⚡ Only {product.stockQuantity} left!</div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            style={{ width: "100%", background: inStock ? (added ? "#0F6E56" : "#7B2D3C") : "#d1d5db", color: "#fff", padding: "0.875rem", borderRadius: "0.75rem", fontWeight: "600", border: "none", cursor: inStock ? "pointer" : "not-allowed", fontSize: "1rem", transition: "background 0.2s" }}
          >
            {added ? "✓ Added to Cart!" : inStock ? "Add to Cart" : "Out of Stock"}
          </button>

          {/* Ingredients */}
          {product.ingredients && product.ingredients.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ fontWeight: "600", fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Key Ingredients
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {product.ingredients.map((ing) => (
                  <span key={ing} style={{ background: "#f3f4f6", borderRadius: "999px", padding: "0.25rem 0.75rem", fontSize: "0.8rem", color: "#374151" }}>
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Concerns */}
          {product.concerns && product.concerns.length > 0 && (
            <div style={{ marginTop: "1.25rem" }}>
              <h3 style={{ fontWeight: "600", fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Targets
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {product.concerns.map((c) => (
                  <span key={c} style={{ background: "#F5E8EA", borderRadius: "999px", padding: "0.25rem 0.75rem", fontSize: "0.8rem", color: "#7B2D3C" }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}