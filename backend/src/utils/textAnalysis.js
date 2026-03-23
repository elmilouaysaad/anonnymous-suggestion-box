const POSITIVE_WORDS = new Set([
  'good',
  'great',
  'excellent',
  'helpful',
  'clear',
  'love',
  'like',
  'improve',
  'improved',
  'best',
  'fast',
  'easy',
  'supportive',
  'positive',
  'satisfied',
  'smooth',
  'effective',
  'responsive'
]);

const NEGATIVE_WORDS = new Set([
  'bad',
  'poor',
  'terrible',
  'awful',
  'slow',
  'confusing',
  'difficult',
  'broken',
  'issue',
  'problem',
  'late',
  'frustrating',
  'negative',
  'unsatisfied',
  'incomplete',
  'bug',
  'bugs',
  'delay',
  'delayed'
]);

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'from', 'have', 'were', 'your', 'you', 'our',
  'are', 'not', 'but', 'all', 'can', 'has', 'had', 'was', 'its', 'they', 'their', 'there',
  'about', 'would', 'should', 'could', 'into', 'than', 'then', 'them', 'very', 'more', 'most',
  'also', 'just', 'what', 'when', 'where', 'which', 'who', 'why', 'how', 'please', 'thank'
]);

const tokenize = (text) => {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
};

const extractKeywords = (text, maxKeywords = 10) => {
  const frequencies = new Map();
  const tokens = tokenize(text);

  for (const token of tokens) {
    if (token.length < 3 || STOP_WORDS.has(token) || /^\d+$/.test(token)) {
      continue;
    }
    frequencies.set(token, (frequencies.get(token) || 0) + 1);
  }

  return Array.from(frequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([keyword]) => keyword);
};

const detectSentiment = (text) => {
  const tokens = tokenize(text);
  let positive = 0;
  let negative = 0;

  for (const token of tokens) {
    if (POSITIVE_WORDS.has(token)) {
      positive += 1;
    }
    if (NEGATIVE_WORDS.has(token)) {
      negative += 1;
    }
  }

  if (positive > negative) {
    return 'Positive';
  }
  if (negative > positive) {
    return 'Negative';
  }
  return 'Neutral';
};

const analyzeSubmissionText = (text) => {
  return {
    sentiment: detectSentiment(text),
    keywords: extractKeywords(text)
  };
};

module.exports = {
  analyzeSubmissionText
};