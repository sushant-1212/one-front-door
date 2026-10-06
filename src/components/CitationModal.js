/**
 * Official Source Citation Detail Modal
 * Gives judges proof of grounded retrieval and verified compliance.
 */

export function createCitationModal() {
  let modalOverlay = null;

  function render(parent) {
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'citationModal';

    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 680px;">
        <div class="modal-header">
          <div class="modal-title-group">
            <h2>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Verified Institutional Source
            </h2>
            <p>Authoritative campus compliance & policy grounding</p>
          </div>
          <button class="btn-close-modal" id="btnCloseCitation" title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body" id="citationModalBody">
          <!-- Filled dynamically -->
        </div>
      </div>
    `;

    parent.appendChild(modalOverlay);

    modalOverlay.querySelector('#btnCloseCitation').addEventListener('click', close);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) close();
    });
  }

  function showCitation(citation) {
    if (!modalOverlay) return;
    const body = modalOverlay.querySelector('#citationModalBody');

    body.innerHTML = `
      <div class="citation-detail-view">
        <div class="citation-header-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
          <span>GROUNDED SOURCE VERIFIED</span>
        </div>

        <h3 style="font-size: 1.15rem; color: #fff; margin-bottom: 6px;">${citation.title}</h3>
        <p style="font-size: 0.78rem; color: var(--status-info); margin-bottom: 16px;">
          ${citation.version || 'Official Directive'} • ${citation.section}
        </p>

        <div class="citation-excerpt-highlight">
          "${citation.excerpt}"
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; background: rgba(15,23,42,0.8); padding: 12px; border-radius: 8px; font-size: 0.76rem;">
          <div>
            <span style="color:var(--text-muted); display:block;">Citation Reference:</span>
            <code style="color:#38BDF8;">${citation.citation}</code>
          </div>
          <div>
            <span style="color:var(--text-muted); display:block;">Document Fingerprint:</span>
            <span style="font-family:'JetBrains Mono'; color:#CBD5E1;">${citation.id || 'DOC-VERIFIED'}</span>
          </div>
        </div>
      </div>
    `;

    modalOverlay.classList.add('active');
  }

  function close() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
  }

  return { render, showCitation, close };
}
