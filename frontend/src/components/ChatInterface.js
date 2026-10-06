/**
 * Chat Interface Component
 * Renders conversation stream, judge presets, telemetry badges,
 * grounded specialist cards, multi-intent split responses, clarification chips, and feedback controls.
 */

import { DEMO_PRESETS, DOMAINS } from '../data/knowledgeBases.js';
import { masterBot } from '../agents/MasterBot.js';
import { analytics } from '../services/analytics.js';
import { sound } from '../services/audio.js';
import confetti from 'canvas-confetti';

export function createChatInterface({ onRouteUpdate, onShowCitation, onShowHandoff, onOpenKnowledge }) {
  let container = null;
  let messagesList = null;
  let inputField = null;
  let isThinking = false;

  function render(parent) {
    container = document.createElement('main');
    container.className = 'chat-container';

    // 1. Judge Presets Bar
    const presetsHtml = DEMO_PRESETS.map(preset => `
      <button class="preset-chip" data-query="${preset.query}">
        <span>${preset.label}</span>
        <span class="preset-tag">${preset.tag}</span>
      </button>
    `).join('');

    container.innerHTML = `
          <!-- Preset Scenarios -->
          <span class="presets-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Quick Scenarios:
          </span>
          ${presetsHtml}
        </div>

        <!-- Active Connected Chatbot Status Banner -->
        <div class="active-bot-banner" id="activeBotBanner">
          <div class="active-bot-info">
            <span style="color:var(--text-muted); font-size:0.75rem;">Current Chatbot:</span>
            <span class="active-bot-pill" id="activeBotPill">
              <span class="dot" style="width:7px; height:7px; border-radius:50%; background:#38BDF8;"></span>
              <span id="activeBotLabel">🚪 Campus Master Front Door</span>
            </span>
          </div>
          <button class="btn-switch-frontdoor" id="btnResetToFrontDoor" style="display:none;" title="Return to Master Front Door Gateway">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
            <span>Return to Master Door</span>
          </button>
        </div>

        <!-- Messages Scroll Area -->
        <div class="messages-scroll" id="messagesScroll">
          <!-- Initial Welcome Hero -->
          <div class="welcome-hero" id="welcomeHero">
            <div class="welcome-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              <span>ALL-IN-ONE CAMPUS AI GATEWAY</span>
            </div>
          <h2>One Front Door for Everything</h2>
          <p>
            No more bouncing between 10 different campus bots. One intelligent orchestrator understands your intent, splits complex multi-topic questions, and routes to grounded specialists with source citations.
          </p>

          <div class="welcome-domains-grid">
            ${Object.values(DOMAINS).map(d => `
              <div class="welcome-domain-card" style="border-top: 3px solid ${d.color}; cursor:pointer;" data-explore="${d.id}">
                <div class="card-head">
                  <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${d.color};"></span>
                  <span>${d.shortName}</span>
                </div>
                <div class="card-desc">${d.role.split(' ')[0]} Specialist</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Chat Input Area -->
      <div class="chat-input-area">
        <form class="input-box-wrapper" id="chatForm">
          <input 
            type="text" 
            class="chat-input" 
            id="chatInput" 
            placeholder="Ask anything about BU-WiFi, CollPoll fees, D5 hostel gate pass, 75% attendance, CDC placements, or LRC library..."
            autocomplete="off"
          />
          <button type="submit" class="btn-send" id="btnSend" title="Send Query">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>

        <div class="input-subtext">
          <span>Enterprise Fallback Active: Direct (>=70%), Clarify (40-69%), Human Handoff (<40%)</span>
          <span>100% Policy Grounded</span>
        </div>
      </div>
    `;

    parent.appendChild(container);

    messagesList = container.querySelector('#messagesScroll');
    inputField = container.querySelector('#chatInput');
    const form = container.querySelector('#chatForm');

    // Handle Form Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = inputField.value.trim();
      if (!val || isThinking) return;
      handleUserQuery(val);
      inputField.value = '';
    });

    // Handle Preset Chips
    container.querySelectorAll('.preset-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        inputField.value = query;
        handleUserQuery(query);
      });
    });

    // Handle Domain Cards Click in Hero
    container.querySelectorAll('.welcome-domain-card').forEach(card => {
      card.addEventListener('click', () => {
        onOpenKnowledge(card.dataset.explore);
      });
    });

    // Handle Return to Master Door Button
    const btnResetToFrontDoor = container.querySelector('#btnResetToFrontDoor');
    btnResetToFrontDoor.addEventListener('click', () => {
      masterBot.resetToFrontDoor();
      const activePill = container.querySelector('#activeBotPill');
      const activeLabel = container.querySelector('#activeBotLabel');
      activePill.style.borderColor = 'rgba(56, 189, 248, 0.4)';
      activePill.style.color = 'var(--status-info)';
      activePill.style.background = 'rgba(56, 189, 248, 0.15)';
      activeLabel.textContent = '🚪 Campus Master Front Door';
      btnResetToFrontDoor.style.display = 'none';

      // Notice bubble in chat
      const noticeRow = document.createElement('div');
      noticeRow.className = 'message-row';
      noticeRow.innerHTML = `
        <div class="assistant-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M4 22h16"/><path d="M4 2v20"/><path d="M20 2v20"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/>
          </svg>
        </div>
        <div class="assistant-payload">
          <div class="front-door-card">
            <div class="front-door-header">
              <div class="front-door-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 22h16"/><path d="M4 2v20"/><path d="M20 2v20"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/></svg>
                <span>Campus Master Front Door Active</span>
              </div>
              <span class="brand-badge">UNIVERSAL GATEWAY</span>
            </div>
            <div class="front-door-body">
              <p>You have returned to the <strong>Campus Master Front Door</strong>. Ask any question across IT, CollPoll fees, D1-D6 hostels, 75% attendance, CDC placements, or LRC library, and I will smartly route you to the intended specialist!</p>
            </div>
          </div>
        </div>
      `;
      messagesList.appendChild(noticeRow);
      scrollToBottom();
      sound.playReceive();
    });
  }

  /**
   * Process incoming user query
   */
  async function handleUserQuery(query) {
    if (isThinking) return;
    isThinking = true;

    // Play subtle audio
    sound.playSend();

    // 1. Append User Message Bubble
    appendUserMessage(query);

    // 2. Hide Hero if still visible
    const hero = container.querySelector('#welcomeHero');
    if (hero) hero.style.display = 'none';

    // 3. Show Typing Indicator
    const typingIndicator = appendTypingIndicator();

    // 4. Run Master Chatbot Orchestrator ("The Final Boss")
    const masterPayload = await masterBot.processQuery(query);
    const routeResult = masterPayload.decision;

    // 5. Update Inspector & Analytics
    onRouteUpdate(routeResult);
    const auditId = analytics.logRoutingEvent(routeResult);

    // Simulate realistic small network latency (350ms - 550ms for smooth demo experience)
    await new Promise(res => setTimeout(res, 450));

    // Remove typing bubble
    typingIndicator.remove();
    isThinking = false;

    // 6. Play Response Audio
    if (routeResult.type === 'CLARIFY') {
      sound.playClarify();
    } else {
      sound.playReceive();
    }

    // 7. Render Bot Payload based on decision type
    renderAssistantResponse(masterPayload, auditId);

    // Scroll to bottom
    scrollToBottom();
  }

  function appendUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'message-row user';
    row.innerHTML = `
      <div class="user-bubble">
        ${escapeHtml(text)}
      </div>
    `;
    messagesList.appendChild(row);
    scrollToBottom();
  }

  function appendTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'message-row';
    row.innerHTML = `
      <div class="assistant-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <circle cx="12" cy="12" r="10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>
      <div class="typing-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    messagesList.appendChild(row);
    scrollToBottom();
    return row;
  }

  function renderAssistantResponse(masterPayload, auditId) {
    const routeResult = masterPayload.decision;
    const row = document.createElement('div');
    row.className = 'message-row';

    // Update Active Bot Banner
    const activePill = container.querySelector('#activeBotPill');
    const activeLabel = container.querySelector('#activeBotLabel');
    const resetBtn = container.querySelector('#btnResetToFrontDoor');

    if (routeResult.type === 'DIRECT') {
      const target = routeResult.targetDomain;
      activePill.style.borderColor = target.color;
      activePill.style.color = target.color;
      activePill.style.background = target.bgLight;
      activeLabel.textContent = `${target.shortName} (Redirected from Front Door)`;
      resetBtn.style.display = 'inline-flex';
    } else if (routeResult.type === 'MULTI') {
      activePill.style.borderColor = '#6366F1';
      activePill.style.color = '#A5B4FC';
      activePill.style.background = 'rgba(99, 102, 241, 0.15)';
      activeLabel.textContent = `Coordinating ${masterPayload.frontDoorIntro.botsInvolved.length} Chatbots`;
      resetBtn.style.display = 'inline-flex';
    }

    // Telemetry badge
    let telemetryHtml = '';
    if (routeResult.type === 'DIRECT') {
      telemetryHtml = `
        <div class="router-telemetry-badge direct">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <span>FRONT DOOR REDIRECTED • ${routeResult.targetDomain.shortName} (${Math.round(routeResult.confidence * 100)}% CONFIDENCE) • ${routeResult.latencyMs || 45}ms</span>
        </div>
      `;
    } else if (routeResult.type === 'MULTI') {
      telemetryHtml = `
        <div class="router-telemetry-badge multi">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M21 3l-7.5 7.5"/><path d="M3 21l7.5-7.5"/></svg>
          <span>FRONT DOOR MULTI-REDIRECT • ${masterPayload.frontDoorIntro.botsInvolved.map(b => b.shortName).join(' + ')} • ${routeResult.latencyMs || 65}ms</span>
        </div>
      `;
    } else if (routeResult.type === 'CLARIFY') {
      telemetryHtml = `
        <div class="router-telemetry-badge clarify">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>FRONT DOOR CLARIFICATION GATE • CONFIDENCE ${Math.round(routeResult.confidence * 100)}% • ${routeResult.latencyMs || 49}ms</span>
        </div>
      `;
    } else if (routeResult.type === 'HANDOFF') {
      telemetryHtml = `
        <div class="router-telemetry-badge handoff">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
          <span>FRONT DOOR SAFETY GATE • LOW CONFIDENCE • DEAN OF STUDENTS HANDOFF</span>
        </div>
      `;
    }

    // Master Front Door Smart Explanation Card
    let frontDoorCardHtml = '';
    if (masterPayload.frontDoorIntro) {
      frontDoorCardHtml = `
        <div class="front-door-card">
          <div class="front-door-header">
            <div class="front-door-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 22h16"/><path d="M4 2v20"/><path d="M20 2v20"/><circle cx="15" cy="12" r="1.5" fill="currentColor"/></svg>
              <span>Campus Master Front Door</span>
            </div>
            <span class="brand-badge">Topic Classifier &amp; Router</span>
          </div>
          <div class="front-door-body">
            <p>${masterPayload.frontDoorIntro.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>
            ${masterPayload.frontDoorIntro.transitionNote ? `
              <div style="margin-top:6px; color:#38BDF8; font-weight:600; font-size:0.8rem; display:flex; align-items:center; gap:6px;">
                <span class="arrow">➔</span>
                <span>${masterPayload.frontDoorIntro.transitionNote}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // Redirection transition divider
    let dividerHtml = '';
    if (routeResult.type === 'DIRECT' && masterPayload.frontDoorIntro?.targetBot) {
      dividerHtml = `
        <div class="redirect-transition-divider">
          <span class="redirect-tag">
            <span>Redirected to ${masterPayload.frontDoorIntro.targetBot.shortName}</span>
            <span class="arrow">➔</span>
          </span>
        </div>
      `;
    } else if (routeResult.type === 'MULTI') {
      dividerHtml = `
        <div class="redirect-transition-divider">
          <span class="redirect-tag">
            <span>Coordinating ${masterPayload.botResponses.length} Specialist Chatbots</span>
            <span class="arrow">➔</span>
          </span>
        </div>
      `;
    }

    // Body content
    let contentHtml = '';

    if (routeResult.type === 'DIRECT') {
      const respItem = masterPayload.botResponses[0];
      contentHtml = renderSingleDomainCard(respItem.domain, respItem.data, respItem.confidence, auditId);
    } else if (routeResult.type === 'MULTI') {
      contentHtml = `
        <div style="display:flex; flex-direction:column; gap:14px; width:100%;">
          ${masterPayload.botResponses.map(item => {
            return renderSingleDomainCard(item.domain, item.data, item.confidence, auditId, item.subQuery);
          }).join('')}
        </div>
      `;
    } else if (routeResult.type === 'CLARIFY') {
      contentHtml = `
        <div class="clarification-card">
          <div class="clarification-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>Clarification Required (Ambiguity Detected)</span>
          </div>
          <p style="font-size:0.88rem; color:#CBD5E1; line-height:1.5;">
            ${routeResult.clarification.prompt}
          </p>
          <div class="clarification-options">
            ${routeResult.clarification.options.map(opt => `
              <button class="clarify-option-btn" data-query="${escapeHtml(opt.query)}" data-audit="${auditId}">
                <span>${opt.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } else if (routeResult.type === 'HANDOFF') {
      contentHtml = `
        <div class="handoff-card">
          <div class="handoff-header">
            <div class="handoff-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Escalated to Human Student Triage</span>
            </div>
            <span class="handoff-ticket-id">${routeResult.ticketData.ticketId}</span>
          </div>
          <p style="font-size:0.86rem; color:#E2E8F0; line-height:1.5;">
            Your request falls outside automated campus policy limits (confidence: ${Math.round(routeResult.confidence * 100)}%). A priority ticket has been generated to ensure you receive verified human assistance from the Dean of Students staff.
          </p>
          <div class="handoff-meta-grid">
            <div class="meta-field">
              <label>Queue</label>
              <span>${routeResult.ticketData.assignedQueue}</span>
            </div>
            <div class="meta-field">
              <label>Estimated SLA</label>
              <span style="color:#34D399;">${routeResult.ticketData.slaHours}</span>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end;">
            <button class="btn btn-primary btn-view-ticket" data-ticket="${routeResult.ticketData.ticketId}" data-query="${escapeHtml(routeResult.originalQuery)}">
              <span>View Ticket & Add Attachments</span>
            </button>
          </div>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="assistant-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M4 22h16"/>
          <path d="M4 2v20"/>
          <path d="M20 2v20"/>
          <path d="M4 2h16"/>
          <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
        </svg>
      </div>
      <div class="assistant-payload">
        ${telemetryHtml}
        ${frontDoorCardHtml}
        ${dividerHtml}
        ${contentHtml}
      </div>
    `;

    messagesList.appendChild(row);

    // Wire up interactive elements in this message row
    attachMessageRowListeners(row, routeResult, auditId);
  }

  function renderSingleDomainCard(domain, response, confidence, auditId, subQueryLabel = null) {
    // Markdown-like bold formatting
    let formattedAnswer = response.answer
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n- /g, '<br/>• ')
      .replace(/\n(\d+)\. /g, '<br/>$1. ');

    return `
      <div class="grounded-response-card" style="border-left: 4px solid ${domain.color};">
        <div class="response-card-header">
          <div class="domain-identity">
            <div class="domain-badge-icon" style="background: ${domain.color};">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 14 14"/>
              </svg>
            </div>
            <div class="domain-info">
              <div class="domain-name">${domain.name}</div>
              <div class="domain-role">${subQueryLabel ? `Sub-task: "${escapeHtml(subQueryLabel)}"` : domain.role}</div>
            </div>
          </div>
          <div class="confidence-indicator" style="color: ${domain.color}; background: ${domain.bgLight};">
            <span>${Math.round(confidence * 100)}% match</span>
          </div>
        </div>

        <div class="response-card-body">
          <p>${formattedAnswer}</p>

          <!-- Official Grounded Citation Box -->
          <div class="citation-box" data-citation='${escapeHtml(JSON.stringify(response.citation))}'>
            <div class="citation-meta">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Cited from: <strong class="citation-tag">${response.citation.citation}</strong></span>
            </div>
            <button class="btn-citation-inspect">
              <span>Inspect Source</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
          </div>

          <!-- Action Chips -->
          ${response.actions && response.actions.length > 0 ? `
            <div class="response-actions-row">
              ${response.actions.map(act => `
                <button class="action-chip" data-label="${act.label}">
                  <span>${act.label}</span>
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- True Resolution Feedback Bar -->
        <div class="resolution-feedback-bar">
          <span>Was your question resolved?</span>
          <div class="feedback-buttons">
            <button class="btn-feedback resolved" data-audit="${auditId}" data-resolved="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Yes, Resolved</span>
            </button>
            <button class="btn-feedback escalate" data-audit="${auditId}" data-resolved="false">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Needs Human Staff</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function attachMessageRowListeners(row, routeResult, auditId) {
    // 1. Citation buttons
    row.querySelectorAll('.btn-citation-inspect, .citation-box').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const box = el.closest('.citation-box');
        if (box) {
          try {
            const citData = JSON.parse(box.dataset.citation);
            onShowCitation(citData);
          } catch (err) {
            console.error('Failed to parse citation data', err);
          }
        }
      });
    });

    // 2. Clarification Option Buttons
    row.querySelectorAll('.clarify-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const clarifiedQuery = btn.dataset.query;
        analytics.recordClarificationResolved();
        analytics.recordResolutionFeedback(auditId, true, 'RESOLVED_AFTER_CLARIFY');
        handleUserQuery(clarifiedQuery);
      });
    });

    // 3. Human Handoff Ticket Button
    row.querySelectorAll('.btn-view-ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        onShowHandoff(routeResult.ticketData || {}, btn.dataset.query);
      });
    });

    // 4. Action chips (e.g. download profile, portal link)
    row.querySelectorAll('.action-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playSuccess();
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
        btn.style.borderColor = 'var(--status-success)';
        btn.style.color = '#34D399';
      });
    });

    // 5. True End-to-End Resolution Feedback
    row.querySelectorAll('.btn-feedback').forEach(btn => {
      btn.addEventListener('click', () => {
        const isResolved = btn.dataset.resolved === 'true';
        analytics.recordResolutionFeedback(auditId, isResolved);

        const parentBar = btn.closest('.resolution-feedback-bar');
        if (isResolved) {
          sound.playSuccess();
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.75 } });
          parentBar.innerHTML = `
            <span style="color:#34D399; font-weight:600; display:flex; align-items:center; gap:6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              Thank you! Marked as 100% Resolved in Enterprise Metrics.
            </span>
          `;
        } else {
          onShowHandoff({
            ticketId: `ESC-${Math.floor(100000 + Math.random() * 900000)}`,
            category: 'Student Feedback Escalation',
            priority: 'High',
            assignedQueue: 'Campus Central Student Help Desk',
            slaHours: '2 Business Hours'
          }, routeResult.originalQuery);

          parentBar.innerHTML = `
            <span style="color:#F87171; font-weight:600; display:flex; align-items:center; gap:6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Escalated to human staff. A priority ticket was created.
            </span>
          `;
        }
      });
    });
  }

  function scrollToBottom() {
    if (messagesList) {
      messagesList.scrollTop = messagesList.scrollHeight;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return { render, handleUserQuery };
}
