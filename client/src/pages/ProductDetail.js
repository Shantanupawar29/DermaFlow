import React, { useState, useEffect, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingBag, Star, Check, ChevronDown, ChevronUp, ThumbsUp, AlertTriangle, Package, Box } from 'lucide-react';

const API = 'http://localhost:5000/api';
const M = '#4A0E2E';
const tok = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// Lazy load ModelViewer to avoid Three.js issues
const ModelViewer = React.lazy(() => import('../components/ModelViewer'));

function StarRating({ value, onChange, size = 18, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size}
          fill={(readonly ? value : (hover || value)) >= n ? '#f59e0b' : 'none'}
          color={(readonly ? value : (hover || value)) >= n ? '#f59e0b' : '#d1d5db'}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)} />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: '#6b7280', width: 14, textAlign: 'right', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 999, height: 6, overflow: 'hidden' }}>
        <div style={{ height: 6, background: '#f59e0b', width: `${pct}%`, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 11, color: '#9ca3af', width: 26, flexShrink: 0 }}>{count}</span>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSort, setReviewSort] = useState('newest');
  const [reviewPage, setReviewPage] = useState(1);
  const [totalReviews, setTotal] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expandedIngredients, setExpandedIng] = useState(false);
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          axios.get(`${API}/products/${id}`),
          axios.get(`${API}/reviews/product/${id}?sort=${reviewSort}&page=${reviewPage}`),
        ]);
        setProduct(pRes.data);
        setReviews(rRes.data.reviews || []);
        setStats(rRes.data.stats || {});
        setTotal(rRes.data.total || 0);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetch();
  }, [id, reviewSort, reviewPage]);

  useEffect(() => {
    if (user) {
      axios.get(`${API}/auth/me`, tok()).then(r => {
        setWishlisted((r.data.wishlist || []).some(p => (p._id || p) === id));
      }).catch(() => { });
    }
  }, [id, user]);

  const toggleWishlist = async () => {
    if (!user) { alert('Please login to add to wishlist'); return; }
    try {
      const r = await axios.post(`${API}/auth/wishlist/${id}`, {}, tok());
      setWishlisted(prev => !prev);
    } catch (e) { alert('Failed'); }
  };

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const submitReview = async () => {
    if (!user) { alert('Please login to review'); return; }
    if (!newReview.comment.trim()) { alert('Please write a review comment'); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/reviews`, { productId: id, ...newReview }, tok());
      setShowReviewForm(false);
      setNewReview({ rating: 5, title: '', comment: '' });
      const r = await axios.get(`${API}/reviews/product/${id}?sort=${reviewSort}`);
      setReviews(r.data.reviews || []);
      setStats(r.data.stats || {});
      setTotal(r.data.total || 0);
      alert('Review submitted! +25 Glow Points added to your account.');
    } catch (e) { alert(e.response?.data?.message || 'Failed to submit review'); }
    setSubmitting(false);
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>;
  if (!product) return <div style={{ padding: '4rem', textAlign: 'center' }}><Link to="/products" style={{ color: M }}>← Back</Link></div>;

  const inStock = product.stockQuantity > 0;
  const discountedPrice = product.discountPercentage > 0
    ? Math.round(product.price * (1 - product.discountPercentage / 100))
    : product.price;

  const hasBatchConcern = reviews.some(r => r.batchConcern || !r.isAuthentic);
  const hasQualityAlerts = reviews.filter(r => r.hasQualityAlert).length >= 2;
  const has3DModel = product.has3D && product.modelPath;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1rem', fontFamily: 'system-ui,sans-serif' }}>
      <Link to="/products" style={{ color: M, textDecoration: 'none', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
        ← Back to Products
      </Link>

      {(hasBatchConcern || hasQualityAlerts) && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
            <strong>Quality Notice:</strong> Some recent customers have reported concerns about this product.
            {hasBatchConcern && ' Some reviews mention it feels different from previous purchases.'} Our team is reviewing this feedback.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start', marginBottom: 48 }}>
        {/* Image / 3D Model Section */}
        <div>
          {has3DModel && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                onClick={() => setShow3D(false)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  background: !show3D ? M : '#f3f4f6',
                  color: !show3D ? '#fff' : '#6b7280'
                }}
              >
                📷 2D Image
              </button>
              <button
                onClick={() => setShow3D(true)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: show3D ? M : '#f3f4f6',
                  color: show3D ? '#fff' : '#6b7280'
                }}
              >
                <Box size={16} /> 3D View
              </button>
            </div>
          )}

          {show3D && has3DModel ? (
            <Suspense fallback={<div style={{ height: 400, background: '#f5f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading 3D Model...</div>}>
              <div style={{ background: '#f5f0eb', borderRadius: 16, overflow: 'hidden', height: 400 }}>
                <ModelViewer modelPath={product.modelPath} />
              </div>
            </Suspense>
          ) : (
            <div style={{ position: 'relative' }}>
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} style={{ width: '100%', borderRadius: 16, objectFit: 'cover', aspectRatio: '1/1', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} />
              ) : (
                <div style={{ background: '#F5E8EA', borderRadius: 16, aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: M, fontWeight: 700, fontSize: '1.25rem', textAlign: 'center', padding: '2rem' }}>
                  {product.name}
                </div>
              )}
              {product.discountPercentage > 0 && (
                <div style={{ position: 'absolute', top: 16, left: 16, background: '#dc2626', color: '#fff', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 800 }}>
                  {product.discountPercentage}% OFF
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {[
              { label: product.category === 'skin' ? 'Skincare' : 'Haircare', color: '#0F6E56' },
              product.routineTime && { label: product.routineTime === 'both' ? 'AM & PM' : product.routineTime + ' Routine', color: M },
              has3DModel && { label: '3D View Available', color: '#7c3aed' },
            ].filter(Boolean).map(b => (
              <span key={b.label} style={{ background: b.color, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>{b.label}</span>
            ))}
            {!inStock && <span style={{ background: '#f3f4f6', color: '#6b7280', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>Out of Stock</span>}
          </div>

          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.9rem', fontWeight: 700, color: '#1f2937', marginBottom: 8, lineHeight: 1.2 }}>
            {product.name}
          </h1>

          {reviewStats.count > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <StarRating value={Math.round(reviewStats.avg || 0)} readonly size={16} />
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>{(reviewStats.avg || 0).toFixed(1)}</span>
              <span style={{ color: '#9ca3af', fontSize: 12 }}>({reviewStats.count} reviews)</span>
            </div>
          )}

          <p style={{ color: '#6b7280', lineHeight: 1.8, fontSize: 14, marginBottom: 20 }}>{product.description}</p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: M }}>₹{discountedPrice.toLocaleString('en-IN')}</span>
            {product.discountPercentage > 0 && (
              <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: 14 }}>₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 12 }}>
            <Package size={14} color={inStock ? '#16a34a' : '#dc2626'} />
            <span style={{ color: inStock ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
              {inStock ? `In stock (${product.stockQuantity} units)` : 'Out of stock'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <button onClick={handleAddToCart} disabled={!inStock} style={{ flex: 1, background: inStock ? M : '#d1d5db', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', fontWeight: 700, cursor: inStock ? 'pointer' : 'not-allowed', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {added ? <><Check size={16} /> Added!</> : <><ShoppingBag size={16} /> {inStock ? 'Add to Cart' : 'Out of Stock'}</>}
            </button>
            <button onClick={toggleWishlist} style={{ width: 50, height: 50, background: wishlisted ? '#fef2f2' : '#f3f4f6', border: `1.5px solid ${wishlisted ? '#fca5a5' : '#e5e7eb'}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Heart size={18} fill={wishlisted ? '#dc2626' : 'none'} color={wishlisted ? '#dc2626' : '#9ca3af'} />
            </button>
          </div>

          {product.ingredients?.length > 0 && (
            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
              <button onClick={() => setExpandedIng(v => !v)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#1f2937' }}>Key Ingredients</span>
                {expandedIngredients ? <ChevronUp size={16} color="#6b7280" /> : <ChevronDown size={16} color="#6b7280" />}
              </button>
              {expandedIngredients && (
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {product.ingredients.map(ing => (
                    <span key={ing} style={{ background: '#e0e7ff', color: '#4338ca', fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 999 }}>{ing}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {product.concerns?.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {product.concerns.map(c => (
                <span key={c} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999 }}>{c}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: '#1f2937', margin: 0 }}>Customer Reviews</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <select value={reviewSort} onChange={e => setReviewSort(e.target.value)} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
              <option value="newest">Newest First</option>
              <option value="helpful">Most Helpful</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
            {user && (
              <button onClick={() => setShowReviewForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: M, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                <Star size={13} /> Write a Review
              </button>
            )}
          </div>
        </div>

        {/* Rating overview */}
        {reviewStats.count > 0 && (
          <div style={{ display: 'flex', gap: 32, background: '#f9fafb', borderRadius: 14, padding: '20px 24px', marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#1f2937', lineHeight: 1 }}>{(reviewStats.avg || 0).toFixed(1)}</div>
              <StarRating value={Math.round(reviewStats.avg || 0)} readonly size={20} />
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{reviewStats.count} reviews</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              {[5, 4, 3, 2, 1].map(n => (
                <RatingBar key={n} label={n} count={reviewStats[`r${n}`] || 0} total={reviewStats.count || 1} />
              ))}
            </div>
          </div>
        )}

        {/* Review form */}
        {showReviewForm && (
          <div style={{ background: '#fff', border: `1.5px solid ${M}30`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: M }}>Write Your Review — Earn 25 Glow Points</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Your Rating *</label>
              <StarRating value={newReview.rating} onChange={r => setNewReview(p => ({ ...p, rating: r }))} size={28} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Title (optional)</label>
              <input value={newReview.title} onChange={e => setNewReview(p => ({ ...p, title: e.target.value }))} placeholder="Summarize your experience" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Your Review *</label>
              <textarea value={newReview.comment} onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))} rows={4} placeholder="How did it work for your skin? What did you like or dislike?" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 13, boxSizing: 'border-box', outline: 'none', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={submitReview} disabled={submitting} style={{ flex: 1, background: M, color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                {submitting ? 'Submitting...' : 'Submit Review (+25 Glow Points)'}
              </button>
              <button onClick={() => setShowReviewForm(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Review cards */}
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: 14, color: '#9ca3af' }}>
            <Star size={32} color="#e5e7eb" style={{ margin: '0 auto 10px', display: 'block' }} />
            <p style={{ fontSize: 13 }}>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reviews.map(rev => (
              <div key={rev._id} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{rev.name}</span>
                      {rev.verifiedPurchase && (
                        <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Check size={9} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <StarRating value={rev.rating} readonly size={14} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
                {rev.title && <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#1f2937' }}>{rev.title}</div>}
                <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.7, margin: '0 0 10px' }}>{rev.comment}</p>
                {rev.adminReply && (
                  <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', borderLeft: `3px solid ${M}`, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: M, marginBottom: 4 }}>Response from DermaFlow</div>
                    <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.6 }}>{rev.adminReply}</div>
                  </div>
                )}
                {rev.hasQualityAlert && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#d97706' }}>
                    <AlertTriangle size={12} /> Quality concern flagged — under review
                  </div>
                )}
                <div style={{ display: 'flex', justify: 'flex-end', marginTop: 8 }}>
                  <button onClick={async () => { await axios.post(`${API}/reviews/${rev._id}/helpful`, {}, tok()); }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 11, color: '#6b7280' }}>
                    <ThumbsUp size={12} /> Helpful ({rev.helpful || 0})
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalReviews > 10 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                <button onClick={() => setReviewPage(p => Math.max(1, p - 1))} disabled={reviewPage === 1} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Previous</button>
                <button onClick={() => setReviewPage(p => p + 1)} disabled={reviews.length < 10} style={{ background: M, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}