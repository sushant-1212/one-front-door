/**
 * Main Application Bootstrap for Campus OneDoor
 * Microsoft Hackathon - "One Front Door for Everything"
 */

import './styles/main.css';
import { renderHeader } from './components/Header.js';
import { createInspector } from './components/Inspector.js';
import { createAnalyticsModal } from './components/AnalyticsModal.js';
import { createKnowledgeModal } from './components/KnowledgeModal.js';
import { createCitationModal } from './components/CitationModal.js';
import { createHandoffModal } from './components/HandoffModal.js';
import { createChatInterface } from './components/ChatInterface.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // 1. Modals
  const analyticsModal = createAnalyticsModal();
  analyticsModal.render(document.body);

  const knowledgeModal = createKnowledgeModal();
  knowledgeModal.render(document.body);

  const citationModal = createCitationModal();
  citationModal.render(document.body);

  const handoffModal = createHandoffModal();
  handoffModal.render(document.body);

  // 2. Inspector (Under The Hood / Judge Mode)
  const inspector = createInspector();

  // 3. Header
  const headerContainer = document.createElement('div');
  appContainer.appendChild(headerContainer);

  renderHeader(headerContainer, {
    onToggleInspector: () => {
      inspector.toggle();
    },
    onOpenAnalytics: () => {
      analyticsModal.open();
    },
    onOpenKnowledge: (domainId) => {
      knowledgeModal.open(domainId);
    }
  });

  // 4. Main Viewport (Split between Chat & Inspector)
  const viewport = document.createElement('div');
  viewport.className = 'main-viewport';
  appContainer.appendChild(viewport);

  // 5. Chat Interface
  const chat = createChatInterface({
    onRouteUpdate: (routeResult) => {
      inspector.updateTrace(routeResult);
      analyticsModal.updateData();
    },
    onShowCitation: (citation) => {
      citationModal.showCitation(citation);
    },
    onShowHandoff: (ticketData, query) => {
      handoffModal.showTicket(ticketData, query);
    },
    onOpenKnowledge: (domainId) => {
      knowledgeModal.open(domainId);
    }
  });

  chat.render(viewport);

  // 6. Render Inspector in the viewport
  inspector.render(viewport);
});
