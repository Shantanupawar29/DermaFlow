const mongoose = require('mongoose');

// ─── Feedback Model (Exp 6 - CRM: Customer Feedback, Complaints, Reviews) ───
// This model captures ALL customer touchpoints: product reviews, complaints,
// support tickets, quiz feedback, and general surveys.
// The automated flagging system runs on every save to detect patterns.

const feedbackSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email:   String,    // allow anonymous
  name:    String,

  type: {
    type: String,
    enum: ['review', 'complaint', 'suggestion', 'support', 'survey'],
    required: true,
  },

  // For product reviews
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  rating:   { type: Number, min: 1, max: 5 },

  // For complaints / support
  category: {
    type: String,
    enum: ['payment', 'delivery', 'product_quality', 'website', 'customer_service', 'other'],
    default: 'other',
  },

  subject:  String,
  message:  { type: String, required: true },

  // ── Automated CRM Analysis ────────────────────────────────────────────────
  // These fields are auto-populated by the pre-save hook using keyword analysis.
  // This mimics a real NLP pipeline (in production, replace with OpenAI/Claude API).

  sentimentScore: { type: Number, default: 0 }, // -1 (negative) to +1 (positive)
  sentimentLabel: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },

  detectedKeywords: [String],   // e.g. ['payment', 'failed', 'error']
  flagged:          { type: Boolean, default: false },  // auto-flagged if critical
  flagReason:       String,     // why it was flagged
  priority:         { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },

  // Admin resolution
  status:     { type: String, enum: ['open', 'in_review', 'resolved', 'closed'], default: 'open' },
  adminNotes: String,
  resolvedAt: Date,
}, { timestamps: true });

// ── AUTOMATED ANALYSIS ENGINE ─────────────────────────────────────────────────
// Runs on every feedback submission. In production this would call an LLM API.
// Here we use rule-based keyword matching to demonstrate the concept.

const NEGATIVE_KEYWORDS = ['failed','error','broken','crash','slow','wrong','bad','terrible','awful','refund','cancel','fraud','never','unresponsive','stuck','bug','issue','problem','not working','didnt work','doesn\'t work'];
const POSITIVE_KEYWORDS = ['great','love','excellent','amazing','perfect','fast','easy','smooth','happy','thank','wonderful','best','recommend','fantastic'];
const CRITICAL_TOPICS   = {
  payment:          ['payment','pay','razorpay','checkout','transaction','charge','refund'],
  delivery:         ['delivery','shipping','dispatch','courier','late','arrived','tracking'],
  product_quality:  ['quality','fake','expired','damaged','smell','texture','broke','allergic'],
  website:          ['website','app','loading','crash','bug','page','error','login','cart'],
  customer_service: ['support','response','rude','ignored','help','agent','call'],
};

feedbackSchema.pre('save', function () {
  const text = ((this.subject || '') + ' ' + this.message).toLowerCase();
  const words = text.split(/\s+/);

  // Sentiment scoring
  let score = 0;
  const detected = [];

  words.forEach(w => {
    if (NEGATIVE_KEYWORDS.some(k => w.includes(k))) { score -= 1; detected.push(w); }
    if (POSITIVE_KEYWORDS.some(k => w.includes(k))) { score += 1; }
  });

  // Detect topic category from message
  let maxMatch = 0;
  Object.entries(CRITICAL_TOPICS).forEach(([topic, kws]) => {
    const matches = kws.filter(k => text.includes(k)).length;
    if (matches > maxMatch) {
      maxMatch = matches;
      if (!this.category || this.category === 'other') this.category = topic;
    }
  });

  this.detectedKeywords = detected.slice(0, 10);
  this.sentimentScore   = Math.max(-1, Math.min(1, score / 5));
  this.sentimentLabel   = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';

  // Auto-flag critical issues
  if (this.sentimentScore < -0.4 || this.type === 'complaint') {
    this.flagged  = true;
    this.priority = this.sentimentScore < -0.6 ? 'critical' : 'high';
    this.flagReason = `Auto-flagged: ${this.sentimentLabel} sentiment, category: ${this.category}`;
  }

  if (this.rating && this.rating <= 2) {
    this.flagged    = true;
    this.priority   = 'high';
    this.flagReason = `Low rating: ${this.rating}/5`;
  }

  
});

module.exports = mongoose.model('Feedback', feedbackSchema);