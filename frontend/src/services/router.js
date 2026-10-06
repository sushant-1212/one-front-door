/**
 * Master Router ("One Front Door" Core Gateway)
 * Performs:
 * 1. Intent classification & N-gram/keyword analysis across 6 Bennett University campus domains
 * 2. Multi-intent decomposition (splitting compound queries into parallel sub-tasks)
 * 3. Normalized confidence scoring & Threshold enforcement
 * 4. Three-tier routing decision:
 *    - DIRECT_ROUTING (>= 68% confidence)
 *    - MULTI_ROUTING (multi-topic detected with >= 55% in each)
 *    - CLARIFY_REQUIRED (38% - 67% confidence or ambiguous domain tie)
 *    - HUMAN_HANDOFF (< 38% confidence or out-of-scope)
 */

import { DOMAINS } from '../data/knowledgeBases.js';

// Specific multi-topic connectors
const SPLIT_PATTERNS = [
  /\s+and\s+(?:what|how|where|when|can|do|my|is|also)\s+/i,
  /\s*[,;]\s*(?:also|and|in addition|plus)\s+/i,
  /\s+as well as\s+/i,
  /\s+plus\s+/i,
  /\?\s+[A-Z]/, // Question mark followed by another capitalized question
  /\n+/
];

// Specific known ambiguous query mappings for rich interactive clarification demos
const KNOWN_AMBIGUOUS_MAP = {
  pass: {
    prompt: 'You asked about a "pass". Different campus departments manage different passes. Which one do you need?',
    options: [
      { domain: 'hostel', label: 'Hostel Gate Pass / Outpass (CollPoll 10 PM Curfew)', query: 'How do I apply for a residential hostel outpass on CollPoll?' },
      { domain: 'library', label: 'LRC Library RFID Access Card & Turnstile Pass', query: 'How do I activate my student card for LRC library turnstiles?' },
      { domain: 'hostel', label: 'Campus Gym & Sports Complex Pass', query: 'How do I get access to the campus sports complex and gym?' },
      { domain: 'it', label: 'Digital Student ID / Smart Turnstile Badge', query: 'How do I get a replacement RFID student access card from IT?' }
    ]
  },
  card: {
    prompt: 'You mentioned a "card". To route you to the correct department, please select what you need:',
    options: [
      { domain: 'academics', label: 'Exam Admit Card / Hall Ticket (CollPoll)', query: 'Where do I download my semester exam admit card from CollPoll?' },
      { domain: 'library', label: 'LRC Library Smart Card (Book Borrowing)', query: 'How do I issue books with my library smart card?' },
      { domain: 'it', label: 'Campus Student RFID Identity Card', query: 'Where do I report a damaged or lost student smart ID card?' }
    ]
  },
  attendance: {
    prompt: 'Attendance is monitored across different campus operations. Which one are you asking about?',
    options: [
      { domain: 'academics', label: 'Mandatory 75% Biometric Attendance (Exam Eligibility)', query: 'What happens if my course attendance falls below 75%?' },
      { domain: 'hostel', label: 'Hostel Night Biometric Check & Curfew Roll-Call', query: 'What are the biometric attendance rules for residential hostels at 10 PM?' },
      { domain: 'cdc', label: 'Bennett Finishing School (BFS) Training Attendance', query: 'Is attendance in Bennett Finishing School compulsory for placements?' }
    ]
  },
  fee: {
    prompt: 'Different departments handle various fees and payments. Which fee do you need help with?',
    options: [
      { domain: 'finance', label: 'Semester Tuition & Hostel Fee (CollPoll Gateway)', query: 'What is the last date to pay semester fees on CollPoll?' },
      { domain: 'finance', label: 'Late Payment Fine & Penalty Schedule', query: 'What is the fine for paying tuition fees after the deadline?' },
      { domain: 'library', label: 'LRC Library Overdue Book Fine', query: 'What is the fine for returning library books late?' },
      { domain: 'academics', label: 'Answer Script Re-evaluation Fee', query: 'How much is the fee for semester exam re-evaluation?' }
    ]
  },
  refund: {
    prompt: 'Which type of refund are you inquiring about?',
    options: [
      { domain: 'finance', label: 'UGC Program Withdrawal Tuition Fee Refund', query: 'What is the refund timeline if I withdraw my admission?' },
      { domain: 'finance', label: 'Hostel Caution Money & Security Deposit Refund', query: 'When will the hostel security deposit be refunded to my bank account?' }
    ]
  }
};

/**
 * Score text against a single domain
 */
function scoreDomain(text, domain) {
  const clean = text.toLowerCase();
  let score = 0;
  let matchedKeywords = [];

  // 1. Direct keyword occurrences
  for (const kw of domain.keywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(clean)) {
      score += kw.length > 5 ? 2.5 : 1.8;
      matchedKeywords.push(kw);
    } else if (clean.includes(kw) && kw.length > 3) {
      score += 1.0;
      matchedKeywords.push(kw);
    }
  }

  // 2. High-value bigrams and phrases specific to Bennett University
  const highValuePhrases = {
    it: [
      'bu-wifi', 'eduroam wifi', 'connect to wifi', 'collpoll login', 'icampus login', 'password reset',
      'office 365', 'microsoft 365', 'matlab license', 'it helpdesk', 'room 004', 'fiber network'
    ],
    finance: [
      'tuition fee', 'pay tuition', 'collpoll payment', 'late fee', 'merit scholarship', 'single girl child',
      'ugc refund', 'program withdrawal', 'security deposit', 'fee challan', 'finance office'
    ],
    hostel: [
      'd5 hostel', 'd-block hostel', 'hostel room', 'gate pass', 'collpoll gate pass', 'outpass', '10 pm curfew',
      'hostel warden', 'rangeela lounge', 'mess food', 'mess timings', 'dorm ac', 'heater leaking', 'maintenance repair'
    ],
    academics: [
      '75% attendance', '75 percent', 'biometric attendance', 'debarment', 'debarred', 'add drop', 'drop course',
      'official transcript', 'grade appeal', 're-evaluation', 'cgpa requirement', 'admit card', 'hall ticket', 'end sem exam'
    ],
    cdc: [
      'campus placement', 'cdc placement', 'dream offer', 'super dream', 'placement drive', 'summer internship',
      'winter internship', 'noc clearance', 'bennett finishing school', 'bfs training', 'coding assessment'
    ],
    library: [
      'lrc library', 'koha library', 'borrow book', 'issue book', 'm-opac', 'book renewal', 'library fine',
      'ieee xplore', 'sciencedirect', 'springerlink', 'turnitin plagiarism', 'discussion room'
    ]
  };

  if (highValuePhrases[domain.id]) {
    for (const phrase of highValuePhrases[domain.id]) {
      if (clean.includes(phrase)) {
        score += 4.5;
        matchedKeywords.push(`[phrase: ${phrase}]`);
      }
    }
  }

  return { rawScore: score, matchedKeywords: [...new Set(matchedKeywords)] };
}

/**
 * Compute normalized confidence scores for all 6 domains
 */
export function scoreAllDomains(query) {
  const domainKeys = Object.keys(DOMAINS);
  const results = {};
  let totalScore = 0;

  for (const key of domainKeys) {
    const scored = scoreDomain(query, DOMAINS[key]);
    results[key] = {
      domainId: key,
      name: DOMAINS[key].name,
      shortName: DOMAINS[key].shortName,
      color: DOMAINS[key].color,
      icon: DOMAINS[key].icon,
      rawScore: scored.rawScore,
      matchedKeywords: scored.matchedKeywords
    };
    totalScore += scored.rawScore;
  }

  // Normalize into percentages with evidence calibration
  if (totalScore < 1.5) {
    // Negligible or zero matches across the board
    for (const key of domainKeys) {
      results[key].confidence = 0.05;
      results[key].percentage = '5%';
    }
  } else {
    // Evidence scale factor ensures multiple keywords/phrases are needed for top confidence
    const evidenceScale = Math.min(1.0, totalScore / 3.5);
    for (const key of domainKeys) {
      const share = results[key].rawScore / (totalScore + 0.1);
      const normalized = Math.min(0.99, Math.round(share * evidenceScale * 100) / 100);
      results[key].confidence = normalized;
      results[key].percentage = `${Math.round(normalized * 100)}%`;
    }
  }

  // Sort descending by confidence
  const sorted = Object.values(results).sort((a, b) => b.confidence - a.confidence);
  return { breakdown: results, ranked: sorted, totalRawScore: totalScore };
}

/**
 * Check if the query is a multi-intent compound question
 */
export function detectMultiIntent(query) {
  const clean = query.trim();

  // Try splitting by known conjunction patterns
  let parts = [];
  for (const pattern of SPLIT_PATTERNS) {
    if (pattern.test(clean)) {
      parts = clean.split(pattern).map(p => p.trim()).filter(p => p.length > 5);
      if (parts.length >= 2) break;
    }
  }

  // If simple split failed, try punctuation splits
  if (parts.length < 2 && (clean.includes('?') || clean.includes(' and '))) {
    const rawParts = clean.split(/(?<=[?.!])\s+|\s+and\s+/i);
    if (rawParts.length >= 2) {
      parts = rawParts.map(p => p.trim()).filter(p => p.length > 8);
    }
  }

  if (parts.length >= 2) {
    // Check if parts map to distinct domains
    const subIntents = [];
    const usedDomains = new Set();

    for (const part of parts) {
      const scored = scoreAllDomains(part);
      const top = scored.ranked[0];

      if (top.confidence >= 0.45 && top.rawScore >= 1.5 && !usedDomains.has(top.domainId)) {
        usedDomains.add(top.domainId);
        subIntents.push({
          subQuery: part,
          domainId: top.domainId,
          domain: DOMAINS[top.domainId],
          confidence: top.confidence,
          matchedKeywords: top.matchedKeywords
        });
      }
    }

    if (subIntents.length >= 2) {
      return { isMulti: true, subIntents };
    }
  }

  return { isMulti: false, subIntents: [] };
}

/**
 * Main Routing Decision Engine ("One Front Door" Core)
 */
export function routeQuery(query) {
  const startTime = performance.now();
  const trimmed = query.trim();

  // 1. Check for multi-intent decomposition
  const multiCheck = detectMultiIntent(trimmed);
  if (multiCheck.isMulti) {
    const latency = Math.round(performance.now() - startTime);
    return {
      type: 'MULTI',
      action: 'PARALLEL_DISPATCH',
      originalQuery: trimmed,
      subIntents: multiCheck.subIntents,
      confidence: Math.round(
        (multiCheck.subIntents.reduce((acc, curr) => acc + curr.confidence, 0) / multiCheck.subIntents.length) * 100
      ) / 100,
      domainsInvolved: multiCheck.subIntents.map(s => s.domainId),
      reason: `Detected compound question across ${multiCheck.subIntents.length} distinct domains: ${multiCheck.subIntents.map(s => DOMAINS[s.domainId].shortName).join(' & ')}. Splitting into specialized parallel agents.`,
      latencyMs: latency
    };
  }

  // 2. Score query against all 6 domains
  const scoring = scoreAllDomains(trimmed);
  const top1 = scoring.ranked[0];
  const top2 = scoring.ranked[1];
  const latency = Math.round(performance.now() - startTime);

  // 3. Check for specific known ambiguous trigger keywords
  const lower = trimmed.toLowerCase();
  for (const [trigger, ambiguousConfig] of Object.entries(KNOWN_AMBIGUOUS_MAP)) {
    if (new RegExp(`\\b${trigger}\\b`, 'i').test(lower)) {
      return {
        type: 'CLARIFY',
        action: 'PROMPT_CLARIFICATION',
        originalQuery: trimmed,
        confidence: top1.confidence,
        suggestedDomain: top1.domainId,
        clarification: ambiguousConfig,
        scoringBreakdown: scoring.breakdown,
        ranked: scoring.ranked,
        reason: `Query contains ambiguous keyword "${trigger}". Clarifying across campus departments to avoid misrouting.`,
        latencyMs: latency
      };
    }
  }

  // 4. Decision Rule: Direct Routing (Confidence >= 60%, rawScore >= 2.5, and clear margin >= 0.12)
  if (top1.confidence >= 0.60 && top1.rawScore >= 2.5 && (top1.confidence - top2.confidence >= 0.12)) {
    return {
      type: 'DIRECT',
      action: 'DIRECT_DISPATCH',
      originalQuery: trimmed,
      targetDomain: DOMAINS[top1.domainId],
      confidence: top1.confidence,
      scoringBreakdown: scoring.breakdown,
      ranked: scoring.ranked,
      matchedKeywords: top1.matchedKeywords,
      reason: `High confidence match (${top1.percentage}) for ${DOMAINS[top1.domainId].name}. Routed directly to domain specialist with source grounding.`,
      latencyMs: latency
    };
  }

  // 5. Decision Rule: Close Tie / Medium Confidence (Clarify Fallback)
  if (top1.rawScore > 0 && top1.confidence >= 0.38) {
    const candidateDomains = scoring.ranked.slice(0, 3).filter(d => d.confidence >= 0.20);
    const dynamicOptions = candidateDomains.map(d => ({
      domain: d.domainId,
      label: `${DOMAINS[d.domainId].name} (${d.percentage} match)`,
      query: `${trimmed} (re-directed to ${DOMAINS[d.domainId].name})`
    }));

    return {
      type: 'CLARIFY',
      action: 'PROMPT_CLARIFICATION',
      originalQuery: trimmed,
      confidence: top1.confidence,
      suggestedDomain: top1.domainId,
      clarification: {
        prompt: `Your request touches upon multiple campus domains (${candidateDomains.map(d => DOMAINS[d.domainId].shortName).join(' vs ')}). Which department can best help you?`,
        options: dynamicOptions
      },
      scoringBreakdown: scoring.breakdown,
      ranked: scoring.ranked,
      reason: `Moderate confidence (${top1.percentage}) with close domain scores. Clarifying to guarantee accurate resolution.`,
      latencyMs: latency
    };
  }

  // 6. Decision Rule: Low Confidence or Out-of-Scope (Human Handoff Fallback)
  return {
    type: 'HANDOFF',
    action: 'HUMAN_SUPPORT_TICKET',
    originalQuery: trimmed,
    confidence: top1.confidence,
    scoringBreakdown: scoring.breakdown,
    ranked: scoring.ranked,
    reason: `Confidence is below safety threshold (${top1.percentage} < 38%). Out of campus specialist domain scope. Escaping to Dean of Students & Proctorial Triage.`,
    ticketData: {
      ticketId: `ESC-${Math.floor(100000 + Math.random() * 900000)}`,
      category: 'Unclassified / Special Case',
      priority: 'Standard Tier-2',
      assignedQueue: 'Dean of Students & Proctorial Board Triage',
      slaHours: '4 Business Hours'
    },
    latencyMs: latency
  };
}
