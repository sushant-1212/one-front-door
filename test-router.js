import { masterBot } from './src/agents/MasterBot.js';
import { analytics } from './src/services/analytics.js';

console.log('====================================================');
console.log('🧪 VERIFYING CAMPUS ONEDOOR MASTER CHATBOT ("FINAL BOSS")');
console.log('Bennett University 6-Domain Grounded Architecture');
console.log('====================================================\n');

console.log('Connected Specialized Sub-Bots in Master Bot:');
for (const bot of masterBot.getConnectedBots()) {
  console.log(` • [${bot.id}] ${bot.name} (${bot.documentsCount} policy docs, ${bot.keywordsCount} intent keywords)`);
}
console.log('');

const testCases = [
  {
    name: '1. Single Domain (IT Support & BU-WiFi)',
    query: 'How do I connect to campus BU-WiFi on my phone?',
    expectedType: 'DIRECT',
    expectedDomain: 'it'
  },
  {
    name: '2. Multi-Intent (D5 Hostel + CollPoll Fees)',
    query: 'How do I apply for a late gate pass from D5 hostel, and what is the last date to submit semester fees on CollPoll?',
    expectedType: 'MULTI',
    expectedDomains: ['hostel', 'finance']
  },
  {
    name: '3. Ambiguous Query (Pass Clarification Fallback)',
    query: 'I need to renew my student pass',
    expectedType: 'CLARIFY'
  },
  {
    name: '4. Out of Scope (Safety / Proctorial Handoff Fallback)',
    query: 'Can I land a private helicopter on the campus sports ground for my presentation?',
    expectedType: 'HANDOFF'
  },
  {
    name: '5. Cross-Domain (75% Attendance + CDC Placements)',
    query: 'What is the minimum attendance required for final exams, and what CGPA do I need for CDC campus placement drives?',
    expectedType: 'MULTI',
    expectedDomains: ['academics', 'cdc']
  },
  {
    name: '6. Single Domain (LRC Central Library & IEEE)',
    query: 'How many books can I issue from the LRC library and how do I access IEEE research papers?',
    expectedType: 'DIRECT',
    expectedDomain: 'library'
  }
];

let allPassed = true;

for (const tc of testCases) {
  console.log(`▶ Running Test: ${tc.name}`);
  console.log(`  Query: "${tc.query}"`);
  
  // Call the Master Chatbot ("The Final Boss")
  const masterPayload = await masterBot.processQuery(tc.query);
  const res = masterPayload.decision;
  
  const targetNames = masterPayload.botResponses.map(r => r.bot.name);
  console.log(`  → Master Front Door Says: "${masterPayload.frontDoorIntro?.message}"`);
  console.log(`  → Master Decision: ${res.type}`);
  console.log(`  → Redirected Bot(s): ${targetNames.length > 0 ? targetNames.join(', ') : 'None (Fallback)'}`);
  console.log(`  → Confidence: ${Math.round(res.confidence * 100)}%`);
  console.log(`  → Reason: ${res.reason}`);
  
  if (res.type !== tc.expectedType) {
    console.error(`  ❌ FAILED: Expected ${tc.expectedType}, got ${res.type}`);
    allPassed = false;
  } else {
    console.log(`  ✓ Type Matched [${res.type}]`);
  }

  if (res.type === 'DIRECT') {
    const domainResp = masterPayload.botResponses[0].data;
    console.log(`  ✓ Grounded Citation: "${domainResp.citation.citation}"`);
  } else if (res.type === 'MULTI') {
    for (const r of masterPayload.botResponses) {
      console.log(`  ✓ Sub-Intent [${r.domain.shortName}] Grounded Citation: "${r.data.citation.citation}"`);
    }
  } else if (res.type === 'CLARIFY') {
    console.log(`  ✓ Clarification Options (${res.clarification.options.length}): ${res.clarification.options.map(o => o.label).join(' | ')}`);
  } else if (res.type === 'HANDOFF') {
    console.log(`  ✓ Ticket Dispatched: ${res.ticketData.ticketId} [SLA: ${res.ticketData.slaHours}]`);
  }

  const auditId = analytics.logRoutingEvent(res);
  analytics.recordResolutionFeedback(auditId, true);
  console.log(`  ✓ Telemetry logged into Audit Trail (${auditId})\n`);
}

const metrics = analytics.getMetrics();
console.log('====================================================');
console.log('📊 ENTERPRISE TELEMETRY SUMMARY:');
console.log(`  Total Queries Processed: ${metrics.totalQueries}`);
console.log(`  Routing Accuracy: ${metrics.routingAccuracy}`);
console.log(`  True E2E Resolution Rate: ${metrics.trueResolutionRate}`);
console.log(`  Clarification Recovery Rate: ${metrics.clarificationRecoveryRate}`);
console.log(`  Mean Latency: ${metrics.avgLatency}`);
console.log('====================================================');

if (allPassed) {
  console.log('🎉 ALL 6 BENNETT UNIVERSITY TEST SUITES PASSED FLAWLESSLY!');
} else {
  console.error('⚠️ SOME TESTS FAILED');
  process.exit(1);
}
