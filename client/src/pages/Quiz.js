import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, ChevronRight, ChevronLeft, Check, Sun, Moon,
  Droplet, Wind, Flame, Eye, AlertCircle, Shield,
  Activity, Battery, Heart, Zap, Feather, Star, Flower2,
  Leaf, Clock, Coffee, Apple, ShoppingBag
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const M   = '#4A0E2E';

// ── INGREDIENT BENEFIT MAP ────────────────────────────────────────────────────
const INGREDIENT_INFO = {
  'Niacinamide':     { benefit: 'Minimises pores, controls oil, reduces redness', safe: ['oily','combination','sensitive'] },
  'Hyaluronic Acid': { benefit: 'Draws moisture into skin, plumps fine lines',    safe: ['dry','normal','combination','oily','sensitive'] },
  'Retinol':         { benefit: 'Speeds cell turnover, reduces wrinkles & pigmentation', caution: 'Start slow — 2–3 nights per week' },
  'Vitamin C':       { benefit: 'Brightens skin, fades dark spots, protects from UV', caution: 'Use in the AM only; avoid with Retinol' },
  'Salicylic Acid':  { benefit: 'Unclogs pores, treats and prevents acne breakouts', safe: ['oily','combination'] },
  'Glycolic Acid':   { benefit: 'Chemical exfoliant — smooths texture, evens tone', caution: 'Use PM, not with Retinol' },
  'Ceramides':       { benefit: 'Restores the skin barrier, prevents moisture loss',  safe: ['dry','sensitive'] },
  'Caffeine':        { benefit: 'De-puffs under eyes, reduces dark circles',         safe: ['all'] },
  'Peptides':        { benefit: 'Stimulate collagen, firm skin over time',            safe: ['all'] },
  'SPF/Sunscreen':   { benefit: 'Prevents UV damage — the single most anti-aging product', safe: ['all'] },
  'Biotin':          { benefit: 'Strengthens hair follicles, reduces breakage',       safe: ['all'] },
  'Keratin':         { benefit: 'Repairs hair structure, eliminates frizz',           safe: ['all'] },
  'Argan Oil':       { benefit: 'Moisturises and adds shine to dry, damaged hair',    safe: ['all'] },
};

const QUESTIONS = [
  {
    id: 'skinType', question: 'What is your skin type?', description: 'This determines the foundation of your routine',
    options: [
      { value:'oily',        label:'Oily',        icon:Droplet,  desc:'Shiny T-zone, enlarged pores, frequent breakouts' },
      { value:'dry',         label:'Dry',          icon:Wind,     desc:'Tight, flaky, rough texture, sometimes itchy' },
      { value:'combination', label:'Combination',  icon:Activity, desc:'Oily forehead/nose, dry or normal cheeks' },
      { value:'normal',      label:'Normal',        icon:Feather,  desc:'Balanced — not particularly oily or dry' },
      { value:'sensitive',   label:'Sensitive',     icon:Heart,    desc:'Reacts easily, prone to redness or stinging' },
    ]
  },
  {
    id: 'skinConcerns', question: 'What are your main skin concerns?', description: 'Select all that apply — we will prioritise these', multiple: true,
    options: [
      { value:'acne',       label:'Acne & Breakouts',          icon:Zap,          desc:'Active breakouts, cystic or hormonal acne' },
      { value:'aging',      label:'Fine Lines & Wrinkles',     icon:Eye,          desc:'Anti-aging, firming, crow\'s feet' },
      { value:'darkSpots',  label:'Dark Spots & Pigmentation', icon:Star,         desc:'Post-acne marks, sun spots, uneven tone' },
      { value:'dryness',    label:'Dryness & Dehydration',     icon:Droplet,      desc:'Tight, dull, needs more moisture' },
      { value:'dullness',   label:'Dullness & Texture',        icon:Feather,      desc:'Rough texture, lack of glow, congested pores' },
      { value:'redness',    label:'Redness & Sensitivity',     icon:Flame,        desc:'Rosacea, reactive skin, post-procedure' },
    ]
  },
  {
    id: 'lifestyle', question: 'Tell us about your daily lifestyle', description: 'This affects which products will actually work for you', multiple: true,
    options: [
      { value:'outdoor',    label:'Spend time outdoors',       icon:Sun,          desc:'Sun exposure means SPF is non-negotiable' },
      { value:'screen',     label:'Long screen hours',         icon:Eye,          desc:'Blue light affects skin health over time' },
      { value:'stressful',  label:'High-stress schedule',      icon:Zap,          desc:'Stress triggers cortisol, worsening acne' },
      { value:'coffee',     label:'Heavy coffee or tea',       icon:Coffee,       desc:'Caffeine can dehydrate skin' },
      { value:'healthy',    label:'Active & health-conscious', icon:Apple,        desc:'Great — diet and exercise boost skin health' },
    ]
  },
  {
    id: 'hairConcerns', question: 'Any hair concerns?', description: 'Select all that apply — skip if no hair concerns', multiple: true, optional: true,
    options: [
      { value:'hairFall',   label:'Hair Fall',                 icon:Activity,     desc:'Excessive shedding or thinning' },
      { value:'dandruff',   label:'Dandruff / Itchy Scalp',   icon:AlertCircle,  desc:'Flakes, dryness or scalp buildup' },
      { value:'frizz',      label:'Frizz & Dryness',          icon:Wind,         desc:'Rough, frizzy, lacks moisture' },
      { value:'slowGrowth', label:'Slow Growth',               icon:Battery,      desc:'Hair doesn\'t seem to grow fast enough' },
      { value:'damage',     label:'Heat / Color Damage',       icon:Zap,          desc:'Bleached, permed or frequently heat-styled' },
    ]
  },
  {
    id: 'routineTime', question: 'How much time can you give your routine?', description: 'Honest answers lead to routines you will actually stick to',
    options: [
      { value:'minimal',   label:'2–3 minutes',               icon:Clock,        desc:'Cleanser + moisturiser + SPF maximum' },
      { value:'moderate',  label:'5–10 minutes',              icon:Feather,      desc:'A proper routine with actives' },
      { value:'dedicated', label:'15+ minutes',               icon:Sparkles,     desc:'Full routine with serums and treatments' },
    ]
  },
  {
    id: 'allergies', question: 'Any ingredients to avoid?', description: 'We will filter these out of your recommendations', multiple: true, optional: true,
    options: [
      { value:'fragrance',     label:'Fragrance / Parfum',   icon:Flower2,      desc:'Common irritant for sensitive skin' },
      { value:'sulfates',      label:'Sulfates (SLS)',        icon:Droplet,      desc:'Stripping cleansers' },
      { value:'parabens',      label:'Parabens',              icon:Shield,       desc:'Preservatives some prefer to avoid' },
      { value:'alcohol',       label:'Drying Alcohols',      icon:Wind,         desc:'Isopropyl alcohol — drying' },
      { value:'essentialOils', label:'Essential Oils',        icon:Leaf,         desc:'Can irritate reactive skin' },
    ]
  },
];

// ── RESULTS INGREDIENT CARD ───────────────────────────────────────────────────
function IngredientCard({ name }) {
  const info = INGREDIENT_INFO[name];
  if (!info) return null;
  return (
    <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', marginBottom: 8, border: '1px solid #f3f4f6' }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#1f2937', marginBottom: 3 }}>{name}</div>
      <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.5, marginBottom: info.caution ? 6 : 0 }}>{info.benefit}</div>
      {info.caution && (
        <div style={{ fontSize: 11, color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={11}/> {info.caution}
        </div>
      )}
    </div>
  );
}

// ── PRODUCT CARD ──────────────────────────────────────────────────────────────
function ProductCard({ product, index, onAddToCart }) {
  const discounted = product.discountPercentage > 0
    ? Math.round(product.price * (1 - product.discountPercentage / 100))
    : product.price;

  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}>
      <div style={{ position: 'relative' }}>
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: 200, objectFit: 'cover' }}/>
        ) : (
          <div style={{ height: 200, background: '#F5E8EA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: M, fontWeight: 700, fontSize: 14, padding: '1rem', textAlign: 'center' }}>
            {product.name}
          </div>
        )}
        <div style={{ position: 'absolute', top: 10, left: 10, background: M, color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
          {index + 1}
        </div>
        {product.discountPercentage > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: '#dc2626', color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 800 }}>
            {product.discountPercentage}% OFF
          </div>
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ marginBottom: 4 }}>
          {product.routineTime && (
            <span style={{ background: product.routineTime === 'AM' ? '#fef3c7' : product.routineTime === 'PM' ? '#e0e7ff' : '#f0fdf4', color: product.routineTime === 'AM' ? '#d97706' : product.routineTime === 'PM' ? '#6366f1' : '#16a34a', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
              {product.routineTime === 'both' ? 'AM & PM' : product.routineTime}
            </span>
          )}
        </div>
        <h3 style={{ fontWeight: 700, fontSize: 14, color: '#1f2937', marginBottom: 4, lineHeight: 1.3 }}>{product.name}</h3>
        <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 10 }}>{(product.description || '').substring(0, 80)}...</p>

        {/* Why this product */}
        {product.concerns?.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>Good for</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {product.concerns.slice(0, 3).map(c => (
                <span key={c} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 999 }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: M }}>₹{discounted.toLocaleString('en-IN')}</div>
            {product.discountPercentage > 0 && <div style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: 11 }}>₹{product.price.toLocaleString('en-IN')}</div>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Link to={`/product/${product._id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 7, padding: '7px 10px', textDecoration: 'none', fontSize: 11, fontWeight: 600 }}>
              Details
            </Link>
            <button onClick={() => onAddToCart(product)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: M, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
              <ShoppingBag size={12}/> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN QUIZ ─────────────────────────────────────────────────────────────────
const Quiz = () => {
  const navigate = useNavigate();
  const [step, setStep]                       = useState(0);
  const [loading, setLoading]                 = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [quizCompleted, setQuizCompleted]     = useState(false);
  const [addedItems, setAddedItems]           = useState({});
  const [answers, setAnswers] = useState({
    skinType: '', skinConcerns: [], lifestyle: [], hairConcerns: [], routineTime: '', allergies: [],
  });

  const currentQ = QUESTIONS[step];

  const updateAnswer = (qId, value, multiple = false) => {
    if (multiple) {
      const cur = answers[qId] || [];
      setAnswers({ ...answers, [qId]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value] });
    } else {
      setAnswers({ ...answers, [qId]: value });
    }
  };

  const canAdvance = () => {
    if (currentQ.optional) return true;
    const val = answers[currentQ.id];
    return currentQ.multiple ? (val || []).length > 0 : !!val;
  };

  const next = () => {
    if (step < QUESTIONS.length - 1) setStep(s => s + 1);
    else submitQuiz();
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/quiz/submit`, answers, { headers: { Authorization: `Bearer ${token}` } });
      setRecommendations(res.data);
      setQuizCompleted(true);
      localStorage.setItem('quizCompleted', 'true');
    } catch(e) {
      if (e.response?.status === 401) { alert('Please log in to save your routine.'); navigate('/login'); }
      else alert('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const ex = cart.find(i => i.id === product._id);
    if (ex) ex.quantity += 1;
    else cart.push({ id: product._id, name: product.name, price: product.price, quantity: 1, image: product.images?.[0] });
    localStorage.setItem('cart', JSON.stringify(cart));
    setAddedItems(a => ({ ...a, [product._id]: true }));
    setTimeout(() => setAddedItems(a => ({ ...a, [product._id]: false })), 2000);
  };

  // ── Results page ─────────────────────────────────────────────────────────────
  if (quizCompleted) {
    const amProducts = recommendations.filter(p => p.routineTime === 'AM' || p.routineTime === 'both');
    const pmProducts = recommendations.filter(p => p.routineTime === 'PM' || p.routineTime === 'both');

    // Derive key ingredients to look for based on concerns
    const recommendedIngredients = [];
    if ((answers.skinConcerns || []).includes('acne'))      recommendedIngredients.push('Salicylic Acid', 'Niacinamide');
    if ((answers.skinConcerns || []).includes('aging'))     recommendedIngredients.push('Retinol', 'Peptides', 'Vitamin C');
    if ((answers.skinConcerns || []).includes('darkSpots')) recommendedIngredients.push('Vitamin C', 'Glycolic Acid');
    if ((answers.skinConcerns || []).includes('dryness'))   recommendedIngredients.push('Hyaluronic Acid', 'Ceramides');
    if ((answers.skinConcerns || []).includes('dullness'))  recommendedIngredients.push('Glycolic Acid', 'Vitamin C');
    if (answers.skinType === 'sensitive')                   recommendedIngredients.push('Ceramides');
    if ((answers.lifestyle || []).includes('outdoor'))      recommendedIngredients.push('SPF/Sunscreen');
    if ((answers.hairConcerns || []).includes('hairFall'))  recommendedIngredients.push('Biotin');
    if ((answers.hairConcerns || []).includes('damage'))    recommendedIngredients.push('Keratin', 'Argan Oil');
    const uniqueIngredients = [...new Set(recommendedIngredients)];

    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1rem', fontFamily: 'system-ui,sans-serif' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, background: '#f0fdf4', borderRadius: '50%', marginBottom: 16 }}>
            <Sparkles size={32} color="#16a34a" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1f2937', margin: '0 0 8px' }}>Your Personalized Routine</h1>
          <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
            Based on your {answers.skinType} skin · {(answers.skinConcerns || []).join(', ')}
          </p>
          <div style={{ marginTop: 16 }}>
            <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
              +25 Glow Points earned for completing the quiz!
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
          <div>
            {/* AM Routine */}
            {amProducts.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: '#fef3c7', borderRadius: 10, padding: 8 }}><Sun size={20} color="#d97706"/></div>
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: 18, margin: 0, color: '#1f2937' }}>Morning Routine</h2>
                    <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Apply in this order for best results</p>
                  </div>
                  <span style={{ background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, marginLeft: 'auto' }}>AM</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
                  {amProducts.slice(0, 4).map((p, i) => <ProductCard key={p._id} product={p} index={i} onAddToCart={addToCart}/>)}
                </div>
              </div>
            )}

            {/* PM Routine */}
            {pmProducts.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: '#e0e7ff', borderRadius: 10, padding: 8 }}><Moon size={20} color="#6366f1"/></div>
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: 18, margin: 0, color: '#1f2937' }}>Evening Routine</h2>
                    <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>Apply after cleansing, before bed</p>
                  </div>
                  <span style={{ background: '#e0e7ff', color: '#6366f1', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999, marginLeft: 'auto' }}>PM</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
                  {pmProducts.slice(0, 4).map((p, i) => <ProductCard key={p._id} product={p} index={i} onAddToCart={addToCart}/>)}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Ingredient guide */}
          <div>
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: 'sticky', top: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#1f2937', marginBottom: 4 }}>Ingredients to look for</div>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14, lineHeight: 1.6 }}>Based on your skin concerns — understand why each ingredient helps your specific skin issues.</p>
              {uniqueIngredients.slice(0, 6).map(ing => <IngredientCard key={ing} name={ing}/>)}
              <div style={{ marginTop: 16, padding: '12px 14px', background: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#92400e', marginBottom: 4 }}>Tip</div>
                <p style={{ fontSize: 11, color: '#78350f', lineHeight: 1.6, margin: 0 }}>
                  Introduce one new product at a time, every 1–2 weeks. This way, if your skin reacts, you know exactly which product caused it.
                </p>
              </div>
              <Link to="/dashboard" style={{ display: 'block', marginTop: 14, textAlign: 'center', background: M, color: '#fff', borderRadius: 9, padding: '10px', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                View My Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz questions ────────────────────────────────────────────────────────────
  const curVal    = answers[currentQ?.id];
  const isMulti   = currentQ?.multiple;
  const progress  = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#fdf8f4,#fff)', padding: '3rem 1rem', fontFamily: 'system-ui,sans-serif' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: M, fontWeight: 600 }}>Step {step + 1} of {QUESTIONS.length}</span>
            <span style={{ color: '#9ca3af' }}>{Math.round(progress)}% complete</span>
          </div>
          <div style={{ background: '#f3f4f6', borderRadius: 999, height: 6, overflow: 'hidden' }}>
            <div style={{ height: 6, background: `linear-gradient(90deg,${M},#7B2D3C)`, width: `${progress}%`, borderRadius: 999, transition: 'width 0.4s ease' }}/>
          </div>
        </div>

        {/* Question card */}
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 32px rgba(0,0,0,0.08)', padding: '32px 36px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, background: `${M}15`, borderRadius: '50%', marginBottom: 14 }}>
              <Sparkles size={24} color={M}/>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1f2937', margin: '0 0 8px' }}>{currentQ?.question}</h2>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>{currentQ?.description}</p>
            {currentQ?.optional && <span style={{ fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: 999, display: 'inline-block', marginTop: 6 }}>optional — skip if not applicable</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {currentQ?.options.map(opt => {
              const Icon = opt.icon;
              const sel  = isMulti ? (curVal || []).includes(opt.value) : curVal === opt.value;
              return (
                <button key={opt.value} onClick={() => updateAnswer(currentQ.id, opt.value, isMulti)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, textAlign: 'left',
                  border: `2px solid ${sel ? M : '#f0f0f0'}`, background: sel ? `${M}08` : '#fff', cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: sel ? `${M}15` : '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={sel ? M : '#9ca3af'}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: sel ? M : '#1f2937' }}>{opt.label}</div>
                    {opt.desc && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{opt.desc}</div>}
                  </div>
                  {sel && <Check size={18} color={M} style={{ flexShrink: 0 }}/>}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto', border: `2px solid ${M}`, color: M, background: '#fff', borderRadius: 10, padding: '12px 20px', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                <ChevronLeft size={16}/> Back
              </button>
            )}
            <button onClick={next} disabled={!canAdvance() || loading} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: canAdvance() ? M : '#d1d5db', color: '#fff', border: 'none', borderRadius: 10, padding: '14px', cursor: canAdvance() ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14, transition: 'background 0.15s',
            }}>
              {loading ? 'Analysing your skin...' : step === QUESTIONS.length - 1 ? 'Get My Personalized Routine' : (<>Next <ChevronRight size={16}/></>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
