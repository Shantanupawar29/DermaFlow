// server/services/sentimentService.js
// Sentiment-Driven QA — pure rule-based NLP (no ESM import issues)

const NEGATIVE_WORDS = [
  'terrible','awful','bad','worse','worst','horrible','disgusting','hate',
  'failed','broken','error','slow','unresponsive','sticky','greasy','stinging',
  'burning','rash','allergic','irritating','disappointing','useless','fake',
  'refund','returned','waste','overpriced','expired','smells','painful',
];

const POSITIVE_WORDS = [
  'amazing','excellent','perfect','love','great','fantastic','smooth','glowing',
  'transformed','best','recommend','brilliant','effective','worth','beautiful',
  'gentle','absorbs','lightweight','hydrating','visible','results','improved',
  'cleared','happy','wonderful','gorgeous','radiant','soft',
];

const QUALITY_ALERT_WORDS = [
  'stinging','burning','rash','hives','allergic','reaction','irritation',
  'swelling','blister','pain','peeling','redness','itching','breakout',
];

async function analyseReview(text = '') {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/).filter(Boolean);

  let score = 0;
  const detectedNeg = [];
  const detectedPos = [];
  const qualityFlags = [];

  words.forEach(w => {
    if (NEGATIVE_WORDS.includes(w)) { score -= 1; detectedNeg.push(w); }
    if (POSITIVE_WORDS.includes(w)) { score += 1; detectedPos.push(w); }
    if (QUALITY_ALERT_WORDS.includes(w)) qualityFlags.push(w);
  });

  const normalised = Math.max(-1, Math.min(1, score / 10));
  return {
    score:           normalised,
    label:           normalised > 0.1 ? 'positive' : normalised < -0.1 ? 'negative' : 'neutral',
    detectedNeg:     [...new Set(detectedNeg)],
    detectedPos:     [...new Set(detectedPos)],
    qualityFlags:    [...new Set(qualityFlags)],
    hasQualityAlert: qualityFlags.length > 0,
  };
}

async function generateVibeSummary(reviews = []) {
  if (reviews.length === 0) {
    return { vibe: 'No reviews yet', score: 0, positiveThemes: [], negativeThemes: [], alertCount: 0 };
  }

  const analyses = [];
  for (const review of reviews) {
    const analysis = await analyseReview(review.comment || review.message || '');
    analyses.push(analysis);
  }

  const avgScore = analyses.reduce((s, a) => s + a.score, 0) / analyses.length;

  const posThemeCounts = {};
  const negThemeCounts = {};
  let alertCount = 0;

  analyses.forEach(a => {
    a.detectedPos.forEach(w => { posThemeCounts[w] = (posThemeCounts[w] || 0) + 1; });
    a.detectedNeg.forEach(w => { negThemeCounts[w] = (negThemeCounts[w] || 0) + 1; });
    if (a.hasQualityAlert) alertCount++;
  });

  const topPos = Object.entries(posThemeCounts).sort((a,b) => b[1]-a[1]).slice(0,5).map(([w,c]) => ({ word: w, count: c }));
  const topNeg = Object.entries(negThemeCounts).sort((a,b) => b[1]-a[1]).slice(0,5).map(([w,c]) => ({ word: w, count: c }));

  const positive = analyses.filter(a => a.label === 'positive').length;
  const negative = analyses.filter(a => a.label === 'negative').length;
  const neutral  = analyses.filter(a => a.label === 'neutral').length;

  let vibe;
  const pct = (positive / reviews.length) * 100;
  if (pct >= 80)      vibe = '🌟 Customers love it — overwhelmingly positive';
  else if (pct >= 60) vibe = '😊 Mostly positive with minor concerns';
  else if (pct >= 40) vibe = '😐 Mixed — quality issues being raised';
  else if (pct >= 20) vibe = '😟 Predominantly negative — action required';
  else                vibe = '🚨 Critical — immediate quality intervention needed';

  const topPosWords = topPos.map(t => t.word).join(', ');
  const topNegWords = topNeg.map(t => t.word).join(', ');
  const aiSummary = [
    `Analysed ${reviews.length} reviews. Overall sentiment: ${vibe}.`,
    topPos.length > 0 ? `Customers frequently mention: ${topPosWords}.` : '',
    topNeg.length > 0 ? `Common complaints include: ${topNegWords}.` : '',
    alertCount > 0 ? `⚠️ ${alertCount} reviews flagged quality concern keywords — batch quality check recommended.` : '',
  ].filter(Boolean).join(' ');

  return {
    vibe,
    aiSummary,
    avgScore,
    positiveThemes: topPos,
    negativeThemes: topNeg,
    distribution:   { positive, negative, neutral },
    alertCount,
    totalReviews:   reviews.length,
    requiresAction: alertCount >= 3 || avgScore < -0.3,
  };
}

async function checkBatchQuality(reviews = [], threshold = 3) {
  const flagged = [];
  for (const review of reviews) {
    const analysis = await analyseReview(review.comment || review.message || '');
    if (analysis.hasQualityAlert) flagged.push(analysis);
  }

  const allKeywords = [...new Set(flagged.flatMap(a => a.qualityFlags))];

  return {
    shouldQuarantine: flagged.length >= threshold,
    count:            flagged.length,
    keywordsFound:    allKeywords,
    reason:           flagged.length >= threshold
      ? `${flagged.length} reviews mention quality alerts: [${allKeywords.join(', ')}]`
      : null,
  };
}

module.exports = { analyseReview, generateVibeSummary, checkBatchQuality };