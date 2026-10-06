/**
 * Header Component with Live Domain Status & Control Buttons
 */
import { DOMAINS } from '../data/knowledgeBases.js';
import { sound } from '../services/audio.js';

export function renderHeader(container, { onToggleInspector, onOpenAnalytics, onOpenKnowledge }) {
  const domainsList = Object.values(DOMAINS).map(d => `
    <div class="domain-pill ${d.id}" title="${d.role}">
      <span class="dot"></span>
      <span>${d.shortName}</span>
    </div>
  `).join('');

  container.innerHTML = `
    <header class="app-header">
      <div class="header-brand">
        <div class="brand-icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 22h16"/>
            <path d="M4 2v20"/>
            <path d="M20 2v20"/>
            <path d="M4 2h16"/>
            <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
          </svg>
        </div>
        <div class="brand-titles">
          <h1>
            Campus OneDoor
            <span class="brand-badge">Master AI Gateway</span>
          </h1>
          <p>Enterprise Multi-Domain Orchestrator & Grounded Routing Engine</p>
        </div>
      </div>

      <div class="domains-strip" id="domainsStrip">
        ${domainsList}
      </div>

      <div class="header-actions">
        <button id="btnSoundToggle" class="btn btn-icon-only" title="Toggle UI Audio">
          <svg id="soundIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        </button>

        <button id="btnOpenKnowledge" class="btn" title="Explore Domain Knowledge Bases">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>Domain Bots</span>
        </button>

        <button id="btnOpenAnalytics" class="btn" title="Enterprise Accuracy & Resolution Dashboard">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18"/>
            <path d="m19 9-5 5-4-4-3 3"/>
          </svg>
          <span>Enterprise Analytics</span>
        </button>

        <button id="btnToggleInspector" class="btn btn-inspector active" title="Judge Mode: Live Routing & Confidence Pipeline">
          <span class="live-pulse-dot"></span>
          <span>Judge Mode (Inspector)</span>
        </button>
      </div>
    </header>
  `;

  // Event Listeners
  const btnToggleInspector = container.querySelector('#btnToggleInspector');
  btnToggleInspector.addEventListener('click', () => {
    btnToggleInspector.classList.toggle('active');
    onToggleInspector();
  });

  container.querySelector('#btnOpenAnalytics').addEventListener('click', onOpenAnalytics);
  container.querySelector('#btnOpenKnowledge').addEventListener('click', onOpenKnowledge);

  const btnSound = container.querySelector('#btnSoundToggle');
  const soundIcon = container.querySelector('#soundIcon');
  btnSound.addEventListener('click', () => {
    const isMuted = sound.toggleMute();
    if (isMuted) {
      soundIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
      `;
      btnSound.style.opacity = '0.5';
    } else {
      soundIcon.innerHTML = `
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      `;
      btnSound.style.opacity = '1';
      sound.playReceive();
    }
  });
}
