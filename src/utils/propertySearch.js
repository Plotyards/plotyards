import { normalizePropertyType } from './propertyAdapter';

const synonyms = {
  plot: ['plots', 'land', 'parcel', 'site', 'layout'],
  residential: ['home', 'house', 'villa', 'housing'],
  commercial: ['shop', 'shops', 'retail', 'office', 'business'],
  farmland: ['farm', 'farmhouse', 'agriculture', 'agricultural'],
  approved: ['rera', 'verified', 'clear', 'registry', 'title'],
  budget: ['cheap', 'affordable', 'low'],
  highway: ['road', 'frontage', 'expressway', 'nh'],
  airport: ['aero', 'jewar', 'devanahalli']
};

const searchStopWords = new Set([
  'a',
  'an',
  'and',
  'at',
  'below',
  'between',
  'buy',
  'for',
  'from',
  'in',
  'less',
  'near',
  'of',
  'on',
  'or',
  'property',
  'properties',
  'rs',
  'rupee',
  'rupees',
  'sale',
  'than',
  'the',
  'to',
  'under',
  'up',
  'upto',
  'with'
]);

const moneyUnits = new Set(['l', 'lac', 'lacs', 'lakh', 'lakhs', 'cr', 'crore', 'crores', 'k']);

const normalize = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/rs\.?|\u20b9|,/g, ' ')
    .replace(/[^a-z0-9.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const expandToken = (token) => {
  const expanded = new Set([token]);

  Object.entries(synonyms).forEach(([key, values]) => {
    if (token === key || values.includes(token)) {
      expanded.add(key);
      values.forEach((value) => expanded.add(value));
    }
  });

  return [...expanded];
};

const tokenize = (query = '') => {
  const tokens = normalize(query)
    .split(' ')
    .filter((token) => token.length > 1)
    .filter((token) => !searchStopWords.has(token))
    .filter((token) => !moneyUnits.has(token))
    .filter((token) => !/^\d+(?:\.\d+)?$/.test(token));

  return tokens.map(expandToken);
};

const levenshteinDistance = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: b.length + 1 }, (_, row) => [row]);

  for (let column = 0; column <= a.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= b.length; row += 1) {
    for (let column = 1; column <= a.length; column += 1) {
      const cost = b[row - 1] === a[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
};

const soundex = (s) => {
  if (!s) return '';
  const a = s.toLowerCase().split('');
  const f = a.shift();
  const codes = {
          a: '', e: '', i: '', o: '', u: '', y: '', h: '', w: '',
          b: 1, f: 1, p: 1, v: 1,
          c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
          d: 3, t: 3,
          l: 4,
          m: 5, n: 5,
          r: 6
  };

  const r = f +
      a
      .map(v => codes[v])
      .filter((v, i, a) => ((i === 0) ? v !== codes[f] : v !== a[i - 1]))
      .filter(v => v !== undefined && v !== '')
      .join('');

  return (r + '000').slice(0, 4).toUpperCase();
};

const fuzzyIncludes = (field, token) => {
  const normalizedField = normalize(field);
  if (!token || !normalizedField) return false;
  if (normalizedField.includes(token)) return true;

  if (token.length < 3) {
    return false;
  }

  const maxDist = token.length < 5 ? 1 : 2;
  const tokenSoundex = soundex(token);

  return normalizedField
    .split(' ')
    .some((word) => {
      if (word.length < 3) return false;
      if (word.length >= 5 && tokenSoundex === soundex(word)) return true;
      return levenshteinDistance(word, token) <= maxDist;
    });
};

const getFieldScore = (listing, token) => {
  const weightedFields = [
    [listing.title, 18],
    [listing.locality, 16],
    [listing.city, 14],
    [listing.location, 12],
    [listing.corridor, 10],
    [listing.type, 9],
    [listing.tags?.join(' '), 8],
    [listing.price, 4],
    [listing.size, 4],
    [listing.rate, 3]
  ];

  return weightedFields.reduce((score, [field, weight]) => {
    if (fuzzyIncludes(field, token)) {
      return score + weight;
    }
    return score;
  }, 0);
};

const toAmount = (value, unit = '') => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;

  if (['cr', 'crore', 'crores'].includes(unit)) return amount * 10000000;
  if (['l', 'lac', 'lacs', 'lakh', 'lakhs'].includes(unit)) return amount * 100000;
  if (unit === 'k') return amount * 1000;
  if (amount >= 100000) return amount;
  return amount * 100000;
};

const parseBudgetIntent = (query) => {
  const normalizedQuery = normalize(query);
  const matches = [...normalizedQuery.matchAll(/(\d+(?:\.\d+)?)\s*(cr|crore|crores|l|lac|lacs|lakh|lakhs|k)?/g)]
    .map((match) => ({
      amount: toAmount(match[1], match[2] || ''),
      unit: match[2] || ''
    }))
    .filter((match) => match.amount !== null);

  if (!matches.length) return null;

  if (/\b(between|from)\b/.test(normalizedQuery) && /\b(to|and|-)\b/.test(normalizedQuery) && matches[1]) {
    return {
      min: Math.min(matches[0].amount, matches[1].amount),
      max: Math.max(matches[0].amount, matches[1].amount)
    };
  }

  if (/\b(under|below|upto|up to|less than|within|max|maximum|budget)\b/.test(normalizedQuery)) {
    return { max: matches[0].amount };
  }

  if (/\b(above|over|more than|min|minimum|from)\b/.test(normalizedQuery)) {
    return { min: matches[0].amount };
  }

  if (matches[0].unit || /\b(lakh|lac|crore|cr)\b/.test(normalizedQuery)) {
    return { max: matches[0].amount };
  }

  return null;
};

const parseQueryIntent = (query = '') => {
  const normalizedQuery = normalize(query);
  const budgetIntent = parseBudgetIntent(query);
  const filters = {};

  if (budgetIntent?.min !== undefined) filters.minPrice = budgetIntent.min;
  if (budgetIntent?.max !== undefined) filters.maxPrice = budgetIntent.max;

  if (/\b(commercial|shop|shops|retail|office|business)\b/.test(normalizedQuery)) {
    filters.type = 'commercial';
  } else if (/\b(farm|farmland|farm land|agriculture|agricultural)\b/.test(normalizedQuery)) {
    filters.type = 'farmland';
  } else if (/\b(residential|housing|villa|home)\b/.test(normalizedQuery)) {
    filters.type = 'plot';
  }

  if (/\b(rera|approved|verified|clear title|registry)\b/.test(normalizedQuery)) {
    filters.approvedOnly = true;
  }

  const termGroups = tokenize(query)
    .filter((group) => !group.some((token) => ['rera', 'approved', 'verified', 'clear', 'title', 'registry', 'budget'].includes(token)))
    .filter((group) => !group.some((token) => ['commercial', 'shop', 'shops', 'retail', 'office', 'business', 'farm', 'farmland', 'agriculture', 'agricultural', 'residential', 'housing', 'villa', 'home'].includes(token)));

  return { filters, termGroups };
};

const matchesFilters = (listing, filters = {}) => {
  const approvedOnly = filters.approvedOnly === true || filters.approvedOnly === 'true' || filters.approvedOnly === '1';
  const minPrice = Number(filters.minPrice);
  const maxPrice = Number(filters.maxPrice);
  const minSize = Number(filters.minSize);
  const maxSize = Number(filters.maxSize);

  if (filters.city && normalize(listing.city) !== normalize(filters.city)) return false;
  if (filters.type && normalizePropertyType(listing.propertyType || listing.type) !== normalizePropertyType(filters.type)) return false;
  if (approvedOnly && !listing.approved) return false;
  if (Number.isFinite(minPrice) && listing.priceValue < minPrice) return false;
  if (Number.isFinite(maxPrice) && listing.priceValue > maxPrice) return false;
  if (Number.isFinite(minSize) && listing.sizeValue < minSize) return false;
  if (Number.isFinite(maxSize) && listing.sizeValue > maxSize) return false;

  return true;
};

export const advancedPropertySearch = (listings, query = '', filters = {}) => {
  const queryIntent = parseQueryIntent(query);
  const combinedFilters = {
    ...filters,
    type: filters.type || queryIntent.filters.type,
    approvedOnly: filters.approvedOnly || queryIntent.filters.approvedOnly,
    minPrice: filters.minPrice ?? queryIntent.filters.minPrice,
    maxPrice: filters.maxPrice ?? queryIntent.filters.maxPrice
  };

  return listings
    .filter((listing) => matchesFilters(listing, combinedFilters))
    .map((listing) => {
      const tokenScore = queryIntent.termGroups.reduce((score, group) => (
        score + Math.max(...group.map((token) => getFieldScore(listing, token)), 0)
      ), 0);
      const qualityBoost = (listing.featured ? 7 : 0) + (listing.approved ? 5 : 0);
      const normalizedQuery = normalize(query);
      const exactBoost = normalizedQuery && (
        normalize(listing.title).includes(normalizedQuery)
        || normalize(listing.locality).includes(normalizedQuery)
        || normalize(listing.city).includes(normalizedQuery)
      ) ? 12 : 0;
      const budgetBoost = queryIntent.filters.minPrice || queryIntent.filters.maxPrice ? 10 : 0;
      const matchScore = tokenScore + exactBoost + budgetBoost;

      return {
        ...listing,
        matchScore,
        searchScore: matchScore + qualityBoost
      };
    })
    .filter((listing) => !queryIntent.termGroups.length || listing.matchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore || b.priceValue - a.priceValue);
};

export const buildListingsSearchUrl = (query, filters = {}) => {
  const searchParams = new URLSearchParams();
  const trimmedQuery = query.trim();

  if (trimmedQuery) {
    searchParams.set('q', trimmedQuery);
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  return `/listings${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
};
