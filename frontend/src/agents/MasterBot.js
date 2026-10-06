/**
 * Campus Front Door Master Chatbot ("The Final Boss" Orchestrator)
 * 
 * 1. User asks any question to the Master Front Door Bot.
 * 2. Master Bot analyzes the intent & confidence across the 6 campus departments.
 * 3. Master Bot smartly informs the student which specialized chatbot handles this topic.
 * 4. Master Bot redirects/hands off the student to the intended chatbot (or parallel bots for multi-topic).
 * 5. Student receives official grounded policy answers with source citations.
 */

import { domainBots } from './DomainSpecialistBots.js';
import { routeQuery } from '../services/router.js';

export class MasterCampusBot {
  constructor() {
    this.name = 'Campus Front Door';
    this.role = 'Universal Master Concierge & Smart Redirection Gateway';
    this.activeBot = 'frontdoor';
    
    // Connected specialized domain chatbots across Bennett University
    this.subBots = {
      it: domainBots.it,
      finance: domainBots.finance,
      hostel: domainBots.hostel,
      facilities: domainBots.hostel, // alias
      academics: domainBots.academics,
      cdc: domainBots.cdc,
      hr: domainBots.cdc, // alias
      library: domainBots.library
    };
  }

  getActiveBot() {
    return this.activeBot;
  }

  setActiveBot(botId) {
    this.activeBot = botId;
  }

  resetToFrontDoor() {
    this.activeBot = 'frontdoor';
  }

  /**
   * Process a student query at the Front Door
   */
  async processQuery(userQuery) {
    const startTime = performance.now();
    
    // 1. Analyze intent & score confidence
    const routingDecision = routeQuery(userQuery);
    const latency = Math.round(performance.now() - startTime);

    const payload = {
      query: userQuery,
      decision: routingDecision,
      latencyMs: latency,
      activeBotBefore: this.activeBot,
      frontDoorIntro: null,
      redirectedTo: null,
      botResponses: []
    };

    if (routingDecision.type === 'DIRECT') {
      const targetDomain = routingDecision.targetDomain;
      const targetBot = this.subBots[targetDomain.id];
      this.activeBot = targetDomain.id;

      // Smart explanation & redirection from the Master Front Door
      payload.frontDoorIntro = {
        message: `I analyzed your request about "${userQuery}". This is handled by our **${targetBot.name}** (${Math.round(routingDecision.confidence * 100)}% confidence).`,
        transitionNote: `Redirecting you to the ${targetBot.shortName}...`,
        targetBot: {
          id: targetBot.id,
          name: targetBot.name,
          shortName: targetBot.shortName,
          color: targetBot.color,
          role: targetBot.role
        }
      };

      // Generate the specialized bot's response
      const botResponse = await targetBot.generateResponse(userQuery);
      payload.redirectedTo = targetBot.id;
      payload.botResponses.push({
        bot: targetBot,
        domain: targetDomain,
        data: botResponse,
        confidence: routingDecision.confidence
      });
    }
    else if (routingDecision.type === 'MULTI') {
      // Compound question requiring redirection to multiple bots
      const botNames = routingDecision.subIntents.map(s => this.subBots[s.domainId].name);

      payload.frontDoorIntro = {
        message: `Your question spans **${routingDecision.subIntents.length} different campus departments**: ${botNames.join(' and ')}.`,
        transitionNote: `I have coordinated with both specialist bots and brought together their grounded guidance below:`,
        isMulti: true,
        botsInvolved: routingDecision.subIntents.map(s => this.subBots[s.domainId])
      };

      for (const sub of routingDecision.subIntents) {
        const subBot = this.subBots[sub.domainId];
        const botResp = await subBot.generateResponse(sub.subQuery);
        payload.botResponses.push({
          bot: subBot,
          domain: sub.domain,
          subQuery: sub.subQuery,
          data: botResp,
          confidence: sub.confidence
        });
      }
    }
    else if (routingDecision.type === 'CLARIFY') {
      payload.frontDoorIntro = {
        message: `I noticed your question could relate to multiple campus chatbots. To redirect you to the right one, please choose which department you need:`,
        isClarify: true
      };
      payload.clarification = routingDecision.clarification;
    }
    else if (routingDecision.type === 'HANDOFF') {
      payload.frontDoorIntro = {
        message: `I checked with all 6 campus chatbots, but this request falls outside automated policy guidelines (confidence: ${Math.round(routingDecision.confidence * 100)}%).`,
        transitionNote: `Redirecting you to the Dean of Students & Proctorial Triage Desk...`,
        isHandoff: true
      };
      payload.ticketData = routingDecision.ticketData;
    }

    return payload;
  }

  /**
   * Get metadata of all 6 connected sub-bots
   */
  getConnectedBots() {
    const uniqueIds = ['it', 'finance', 'hostel', 'academics', 'cdc', 'library'];
    return uniqueIds.map(id => {
      const bot = this.subBots[id];
      return {
        id: bot.id,
        name: bot.name,
        shortName: bot.shortName,
        role: bot.role,
        color: bot.color,
        documentsCount: bot.knowledgeBase.length,
        keywordsCount: bot.keywords.length
      };
    });
  }
}

export const masterBot = new MasterCampusBot();
