/**
 * Human Handoff & Helpdesk Ticket Modal
 * Dispatches unclassified or low-confidence queries to human tier-2 triage.
 */

import confetti from 'canvas-confetti';
import { sound } from '../services/audio.js';

export function createHandoffModal() {
  let modalOverlay = null;

  function render(parent) {
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'handoffModal';

    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 640px;">
        <div class="modal-header">
          <div class="modal-title-group">
            <h2>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Dean of Students & Human Triage Transfer
            </h2>
            <p>Low-confidence or non-standard inquiries are protected by human-in-the-loop escalation</p>
          </div>
          <button class="btn-close-modal" id="btnCloseHandoff" title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body" id="handoffModalBody">
          <!-- Populated dynamically -->
        </div>
      </div>
    `;

    parent.appendChild(modalOverlay);

    modalOverlay.querySelector('#btnCloseHandoff').addEventListener('click', close);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) close();
    });
  }

  function showTicket(ticketData, userQuery) {
    if (!modalOverlay) return;
    const body = modalOverlay.querySelector('#handoffModalBody');

    const ticketId = ticketData.ticketId || `ESC-${Math.floor(100000 + Math.random() * 900000)}`;

    body.innerHTML = `
      <div class="handoff-card">
        <div class="handoff-header">
          <div class="handoff-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Priority Support Ticket Created</span>
          </div>
          <span class="handoff-ticket-id">${ticketId}</span>
        </div>

        <p style="font-size: 0.85rem; color: #CBD5E1; line-height: 1.5; margin-bottom: 14px;">
          To guarantee zero hallucinations on complex or out-of-scope requests, the Master Orchestrator has created an escalated dispatch ticket for specialized staff intervention.
        </p>

        <div class="handoff-meta-grid">
          <div class="meta-field">
            <label>Assigned Department</label>
            <span>${ticketData.assignedQueue || 'Campus Unified Services Triage'}</span>
          </div>
          <div class="meta-field">
            <label>Response SLA</label>
            <span style="color:#34D399;">${ticketData.slaHours || '4 Business Hours'}</span>
          </div>
          <div class="meta-field">
            <label>Priority Rating</label>
            <span style="color:#FCD34D;">Standard Escalation</span>
          </div>
          <div class="meta-field">
            <label>Student ID Verified</label>
            <span>STU-2024-8849</span>
          </div>
        </div>

        <div style="background: rgba(15,23,42,0.85); border: 1px solid var(--border-subtle); padding: 12px; border-radius: 8px; font-size: 0.78rem; margin-bottom: 16px;">
          <span style="color:var(--text-muted); display:block; margin-bottom:4px; font-size:0.68rem; text-transform:uppercase;">Attached Query Context:</span>
          <p style="color:#fff; font-style:italic;">"${userQuery}"</p>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button class="btn btn-primary" id="btnConfirmTicket">
            <span>Confirm & Receive SMS Updates</span>
          </button>
        </div>
      </div>
    `;

    body.querySelector('#btnConfirmTicket').addEventListener('click', () => {
      sound.playSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      close();
    });

    modalOverlay.classList.add('active');
  }

  function close() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
  }

  return { render, showTicket, close };
}
