/**
 * Domain-Specific Specialist Chatbots for Bennett University
 * Each chatbot is an independent, decoupled micro-agent grounded in a specific department's policies.
 */

import { DOMAINS } from '../data/knowledgeBases.js';
import { generateDomainResponse } from '../services/domainBots.js';

export class BaseSpecialistBot {
  constructor(domainConfig) {
    this.id = domainConfig.id;
    this.name = domainConfig.name;
    this.shortName = domainConfig.shortName;
    this.role = domainConfig.role;
    this.color = domainConfig.color;
    this.icon = domainConfig.icon;
    this.knowledgeBase = domainConfig.documents;
    this.keywords = domainConfig.keywords;
  }

  /**
   * Specialist bot evaluates if a query falls into its domain
   */
  canHandle(query) {
    const q = query.toLowerCase();
    return this.keywords.some(kw => q.includes(kw));
  }

  /**
   * Specialist bot consults its grounded knowledge base and generates an authoritative answer
   */
  async generateResponse(query) {
    return generateDomainResponse(this.id, query);
  }
}

// 1. IT & Digital Infrastructure Specialist Bot
export class ITBot extends BaseSpecialistBot {
  constructor() {
    super(DOMAINS.it);
  }
}

// 2. Fees, Accounts & Scholarships Specialist Bot
export class FinanceBot extends BaseSpecialistBot {
  constructor() {
    super(DOMAINS.finance);
  }
}

// 3. Hostel & Residential Life Specialist Bot (D1-D6 Hostels, Gate Pass)
export class HostelBot extends BaseSpecialistBot {
  constructor() {
    super(DOMAINS.hostel);
  }
}

// 4. Academics & Examination Specialist Bot (75% Attendance, Exams, Grades)
export class AcademicsBot extends BaseSpecialistBot {
  constructor() {
    super(DOMAINS.academics);
  }
}

// 5. Career Development Centre (CDC) & Placements Specialist Bot
export class CDCBot extends BaseSpecialistBot {
  constructor() {
    super(DOMAINS.cdc);
  }
}

// 6. Learning Resource Centre (LRC) Library Specialist Bot (KOHA, IEEE)
export class LibraryBot extends BaseSpecialistBot {
  constructor() {
    super(DOMAINS.library);
  }
}

// Export pre-instantiated domain bots (with legacy aliases facilities & hr for backwards safety)
const itBot = new ITBot();
const financeBot = new FinanceBot();
const hostelBot = new HostelBot();
const academicsBot = new AcademicsBot();
const cdcBot = new CDCBot();
const libraryBot = new LibraryBot();

export const domainBots = {
  it: itBot,
  finance: financeBot,
  hostel: hostelBot,
  facilities: hostelBot, // Backwards-compatible alias
  academics: academicsBot,
  cdc: cdcBot,
  hr: cdcBot, // Backwards-compatible alias
  library: libraryBot
};
