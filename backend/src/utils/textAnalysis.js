const POSITIVE_WORD_WEIGHTS = new Map([
  ['good', 1],
  ['great', 1.5],
  ['excellent', 2],
  ['helpful', 1.2],
  ['clear', 1],
  ['love', 1.8],
  ['like', 0.8],
  ['improve', 0.9],
  ['improved', 1.2],
  ['best', 1.8],
  ['fast', 0.8],
  ['easy', 0.9],
  ['supportive', 1.2],
  ['positive', 1.2],
  ['satisfied', 1.4],
  ['smooth', 1.1],
  ['effective', 1.1],
  ['responsive', 1.1],
  ['friendly', 1],
  ['quick', 0.8],
  ['reliable', 1.2],
  ['amazing', 2],
  ['fantastic', 2.2]
]);

const NEGATIVE_WORD_WEIGHTS = new Map([
  ['bad', 1],
  ['poor', 1.3],
  ['terrible', 2],
  ['awful', 2],
  ['slow', 1],
  ['confusing', 1.2],
  ['difficult', 1.2],
  ['broken', 1.7],
  ['issue', 0.9],
  ['problem', 1],
  ['late', 0.9],
  ['frustrating', 1.5],
  ['negative', 1.2],
  ['unsatisfied', 1.5],
  ['incomplete', 1.3],
  ['bug', 1.4],
  ['bugs', 1.4],
  ['delay', 1.1],
  ['delayed', 1.1],
  ['worst', 2.2],
  ['unreliable', 1.5],
  ['annoying', 1.3],
  ['useless', 1.8],
  ['unfair', 1.5]
]);

const POSITIVE_PHRASE_WEIGHTS = new Map([
  ['well done', 1.6],
  ['very helpful', 1.8],
  ['works well', 1.6],
  ['high quality', 1.7],
  ['much better', 1.5],
  ['on time', 1.2]
]);

const NEGATIVE_PHRASE_WEIGHTS = new Map([
  ['not helpful', 1.8],
  ['not clear', 1.3],
  ['too slow', 1.8],
  ['very slow', 1.7],
  ['does not work', 2],
  ['not working', 2],
  ['poor quality', 1.8],
  ['too difficult', 1.8],
  ['not fair', 1.6],
  ['very frustrating', 2]
]);

const NEGATION_WORDS = new Set([
  'not', 'never', 'no', 'none', 'without', 'hardly', 'rarely', 'scarcely', 'neither', 'nor'
]);

const INTENSIFIER_WORDS = new Set([
  'very', 'extremely', 'really', 'highly', 'super', 'too', 'so', 'totally', 'absolutely'
]);

const DOWNTONER_WORDS = new Set([
  'slightly', 'somewhat', 'little', 'bit', 'barely', 'kinda', 'kindof', 'kind', 'sortof', 'sort'
]);

const CONTRAST_MARKERS = new Set(['but', 'however', 'though', 'although', 'yet']);

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'from', 'have', 'were', 'your', 'you', 'our',
  'are', 'not', 'but', 'all', 'can', 'has', 'had', 'was', 'its', 'they', 'their', 'there',
  'about', 'would', 'should', 'could', 'into', 'than', 'then', 'them', 'very', 'more', 'most',
  'also', 'just', 'what', 'when', 'where', 'which', 'who', 'why', 'how', 'please', 'thank'
]);

const ISSUE_GROUPS = [
  {
    name: 'Technology',
    keywords: ['wifi', 'internet', 'app', 'website', 'portal', 'login', 'system', 'software', 'network', 'email', 'password', 'access', 'bug', 'error', 'server']
  },
  {
    name: 'Facilities',
    keywords: ['room', 'classroom', 'building', 'office', 'desk', 'chair', 'ac', 'air', 'water', 'bathroom', 'lighting', 'maintenance', 'elevator', 'parking', 'clean', 'broken']
  },
  {
    name: 'Food & Canteen',
    keywords: ['cafeteria', 'canteen', 'food', 'lunch', 'meal', 'menu', 'drink', 'snack', 'coffee', 'breakfast']
  },
  {
    name: 'Transport',
    keywords: ['bus', 'shuttle', 'transport', 'parking', 'commute', 'road', 'traffic', 'ride', 'campus bus']
  },
  {
    name: 'Academic & Workload',
    keywords: ['course', 'class', 'lecture', 'schedule', 'timetable', 'assignment', 'exam', 'workload', 'deadline', 'curriculum', 'material', 'teacher', 'instructor', 'professor', 'study']
  },
  {
    name: 'Administration',
    keywords: ['registration', 'hr', 'payroll', 'finance', 'fee', 'payment', 'form', 'document', 'approval', 'process', 'office', 'admin', 'record', 'certificate']
  },
  {
    name: 'Safety & Wellbeing',
    keywords: ['safety', 'harassment', 'security', 'health', 'wellbeing', 'stress', 'support', 'incident', 'emergency']
  },
  {
    name: 'Communication',
    keywords: ['announcement', 'email', 'notice', 'update', 'response', 'feedback', 'communication', 'reply', 'contact']
  }
];

const ISSUE_GROUP_WEIGHTS = {
  Technology: 1.2,
  Facilities: 1.1,
  'Food & Canteen': 1,
  Transport: 1,
  'Academic & Workload': 1.3,
  Administration: 1.15,
  'Safety & Wellbeing': 1.4,
  Communication: 0.9,
  General: 0.8
};

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

const scoreClauseSentiment = (tokens, rawClauseText) => {
  let positive = 0;
  let negative = 0;
  const lowerClause = String(rawClauseText || '').toLowerCase();

  for (const [phrase, weight] of POSITIVE_PHRASE_WEIGHTS.entries()) {
    if (lowerClause.includes(phrase)) {
      positive += weight;
    }
  }

  for (const [phrase, weight] of NEGATIVE_PHRASE_WEIGHTS.entries()) {
    if (lowerClause.includes(phrase)) {
      negative += weight;
    }
  }

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const posWeight = POSITIVE_WORD_WEIGHTS.get(token) || 0;
    const negWeight = NEGATIVE_WORD_WEIGHTS.get(token) || 0;

    if (!posWeight && !negWeight) {
      continue;
    }

    let multiplier = 1;
    const prior1 = tokens[index - 1] || '';
    const prior2 = tokens[index - 2] || '';

    if (INTENSIFIER_WORDS.has(prior1) || INTENSIFIER_WORDS.has(prior2)) {
      multiplier *= 1.35;
    }
    if (DOWNTONER_WORDS.has(prior1) || DOWNTONER_WORDS.has(prior2)) {
      multiplier *= 0.7;
    }

    const isNegated = NEGATION_WORDS.has(prior1) || NEGATION_WORDS.has(prior2);

    if (posWeight) {
      if (isNegated) {
        negative += posWeight * multiplier;
      } else {
        positive += posWeight * multiplier;
      }
    }

    if (negWeight) {
      if (isNegated) {
        positive += negWeight * multiplier;
      } else {
        negative += negWeight * multiplier;
      }
    }
  }

  return { positive, negative };
};

const detectSentiment = (text) => {
  const original = String(text || '');
  const clauseParts = original
    .toLowerCase()
    .split(/\b(?:but|however|though|although|yet)\b/g)
    .map((part) => part.trim())
    .filter(Boolean);

  const clauses = clauseParts.length ? clauseParts : [original.toLowerCase()];

  let positive = 0;
  let negative = 0;

  for (let index = 0; index < clauses.length; index += 1) {
    const clauseText = clauses[index];
    const tokens = tokenize(clauseText);
    const clauseScore = scoreClauseSentiment(tokens, clauseText);
    const clauseWeight = index === clauses.length - 1 && clauses.length > 1 ? 1.25 : 1;

    positive += clauseScore.positive * clauseWeight;
    negative += clauseScore.negative * clauseWeight;
  }

  if ((original.match(/!/g) || []).length >= 2) {
    if (positive > negative) {
      positive *= 1.1;
    } else if (negative > positive) {
      negative *= 1.1;
    }
  }

  const delta = positive - negative;
  const minimumConfidence = 0.35;

  if (delta > minimumConfidence) {
    return 'Positive';
  }
  if (delta < -minimumConfidence) {
    return 'Negative';
  }
  return 'Neutral';
};

const detectIssueGroup = (text, extractedKeywords = []) => {
  const normalizedText = String(text || '').toLowerCase();
  const tokens = tokenize(text);
  const keywordSet = new Set([
    ...tokens,
    ...(Array.isArray(extractedKeywords) ? extractedKeywords : [])
  ]);

  let bestGroup = 'General';
  let bestScore = 0;

  for (const group of ISSUE_GROUPS) {
    let score = 0;

    for (const keyword of group.keywords) {
      const normalizedKeyword = String(keyword || '').toLowerCase().trim();
      if (!normalizedKeyword) {
        continue;
      }

      if (normalizedKeyword.includes(' ')) {
        if (normalizedText.includes(normalizedKeyword)) {
          score += 2;
        }
        continue;
      }

      if (keywordSet.has(normalizedKeyword)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestGroup = group.name;
    }
  }

  return bestScore > 0 ? bestGroup : 'General';
};

const getIssueGroupWeight = (issueGroup) => {
  return ISSUE_GROUP_WEIGHTS[String(issueGroup || 'General')] || ISSUE_GROUP_WEIGHTS.General;
};

const analyzeSubmissionText = (text) => {
  const keywords = extractKeywords(text);
  return {
    sentiment: detectSentiment(text),
    keywords,
    issue_group: detectIssueGroup(text, keywords)
  };
};

module.exports = {
  analyzeSubmissionText,
  detectIssueGroup,
  getIssueGroupWeight,
  extractKeywords,
  detectSentiment
};