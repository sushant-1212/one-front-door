/**
 * Domain Knowledge Explorer Modal
 * Displays the 5 specialized domain bots, their groundings, documents, and keyword vectors.
 */

import { DOMAINS } from '../data/knowledgeBases.js';

export function createKnowledgeModal() {
  let modalOverlay = null;
  let activeDomainId = 'it';

  function render(parent) {
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'knowledgeModal';

    modalOverlay.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title-group">
            <h2>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              Siloed Domain Specialists & Grounded Knowledge
            </h2>
            <p>Each specialist operates its own verified policies, citation rules, and training embeddings</p>
          </div>
          <button class="btn-close-modal" id="btnCloseKnowledge" title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Domain Switcher Tabs -->
          <div class="domain-tabs-nav" id="domainTabs">
            ${Object.values(DOMAINS).map(d => `
              <button class="domain-tab-btn ${d.id === activeDomainId ? 'active' : ''}" data-domain="${d.id}">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${d.color};"></span>
                <span>${d.name}</span>
              </button>
            `).join('')}
          </div>

          <!-- Dynamic Domain Content Area -->
          <div id="domainDetailsContainer">
            <!-- Rendered by updateDomainView() -->
          </div>
        </div>
      </div>
    `;

    parent.appendChild(modalOverlay);

    // Event listeners
    modalOverlay.querySelector('#btnCloseKnowledge').addEventListener('click', close);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) close();
    });

    const tabBtns = modalOverlay.querySelectorAll('.domain-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeDomainId = btn.dataset.domain;
        updateDomainView();
      });
    });

    updateDomainView();
  }

  function updateDomainView() {
    if (!modalOverlay) return;
    const container = modalOverlay.querySelector('#domainDetailsContainer');
    const domain = DOMAINS[activeDomainId];

    container.innerHTML = `
      <div style="background: rgba(18,26,44,0.6); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 20px; margin-bottom: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
          <div>
            <h3 style="font-size: 1.2rem; color: #fff; display: flex; align-items: center; gap: 8px;">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${domain.color};"></span>
              ${domain.name}
            </h3>
            <span style="font-size: 0.76rem; color: var(--text-muted);">${domain.role}</span>
          </div>
          <span class="brand-badge" style="background: ${domain.bgLight}; border-color: ${domain.border}; color: ${domain.color};">
            ACTIVE SPECIALIST
          </span>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 14px;">
          ${domain.description}
        </p>

        <!-- Keywords Vector Cloud -->
        <div style="margin-top: 10px;">
          <span style="font-size: 0.72rem; font-weight:700; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 6px;">
            Recognized Intent Keywords (${domain.keywords.length})
          </span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${domain.keywords.map(kw => `
              <span style="font-size: 0.72rem; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; color: #CBD5E1;">
                ${kw}
              </span>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Grounded Source Documents -->
      <h4 style="font-size: 0.92rem; color: #fff; margin-bottom: 12px; display:flex; align-items:center; gap:6px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>Grounded Knowledge Base & Policy Citations (${domain.documents.length})</span>
      </h4>

      <div class="kb-documents-list">
        ${domain.documents.map(doc => `
          <div class="kb-document-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div class="kb-doc-title">${doc.title}</div>
              <span style="font-family:'JetBrains Mono'; font-size:0.7rem; padding:2px 6px; background:rgba(56,189,248,0.15); color:#38BDF8; border-radius:4px;">
                ${doc.id}
              </span>
            </div>
            <div class="kb-doc-meta">${doc.version} • ${doc.section}</div>
            <div class="kb-doc-excerpt">
              "${doc.excerpt}"
            </div>
            <div style="margin-top: 8px; font-size: 0.74rem; color: var(--text-muted);">
              <strong>Official Citation:</strong> <code>${doc.citation}</code>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function open(domainId) {
    if (!modalOverlay) return;
    if (domainId) {
      activeDomainId = domainId;
      const tabBtns = modalOverlay.querySelectorAll('.domain-tab-btn');
      tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.domain === domainId);
      });
      updateDomainView();
    }
    modalOverlay.classList.add('active');
  }

  function close() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
  }

  return { render, open, close };
}
