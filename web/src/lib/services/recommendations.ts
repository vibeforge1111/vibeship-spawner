/**
 * Intelligent Recommendation Engine
 * Analyzes project description and discovery answers to recommend agents, MCPs, and behaviors
 */

export interface RecommendationRule {
  keywords: string[];
  recommendAgents?: string[];
  recommendMcps?: string[];
  recommendBehaviors?: string[];
  flagCustomSkill?: string;
  reason?: string;
}

export interface Recommendation {
  type: 'agent' | 'mcp' | 'behavior' | 'custom_skill';
  id: string;
  reason: string;
  priority: 'required' | 'recommended' | 'optional';
}

export interface RecommendationResult {
  agents: Recommendation[];
  mcps: Recommendation[];
  behaviors: Recommendation[];
  customSkills: Recommendation[];
}

// Pattern matching rules for recommendations
const rules: RecommendationRule[] = [
  // Marketplace patterns
  {
    keywords: ['marketplace', 'buy', 'sell', 'listing', 'listings', 'auction', 'bidding'],
    recommendAgents: ['payments', 'search'],
    recommendMcps: ['stripe', 'algolia'],
    recommendBehaviors: ['tdd-mode'],
    reason: 'Marketplaces need payments and search'
  },
  // E-commerce patterns
  {
    keywords: ['ecommerce', 'e-commerce', 'shop', 'store', 'cart', 'checkout', 'products'],
    recommendAgents: ['payments', 'email'],
    recommendMcps: ['stripe', 'resend'],
    recommendBehaviors: ['tdd-mode'],
    reason: 'E-commerce requires payment processing and order emails'
  },
  // SaaS patterns
  {
    keywords: ['saas', 'subscription', 'billing', 'plan', 'pricing', 'tier'],
    recommendAgents: ['payments', 'email'],
    recommendMcps: ['stripe', 'resend'],
    recommendBehaviors: ['tdd-mode'],
    reason: 'SaaS apps need subscription billing'
  },
  // AI/LLM patterns
  {
    keywords: ['ai', 'llm', 'gpt', 'claude', 'chatbot', 'assistant', 'embeddings', 'rag'],
    recommendAgents: ['ai'],
    recommendMcps: ['anthropic'],
    reason: 'AI features require LLM integration'
  },
  // Search patterns
  {
    keywords: ['search', 'filter', 'find', 'discover', 'browse', 'catalog'],
    recommendAgents: ['search'],
    recommendMcps: ['algolia'],
    reason: 'Full-text search improves discoverability'
  },
  // Payment patterns
  {
    keywords: ['payment', 'pay', 'charge', 'money', 'transaction', 'purchase'],
    recommendAgents: ['payments'],
    recommendMcps: ['stripe'],
    recommendBehaviors: ['tdd-mode'],
    reason: 'Payment handling requires secure implementation'
  },
  // Email patterns
  {
    keywords: ['email', 'notification', 'notify', 'alert', 'welcome', 'receipt', 'invoice'],
    recommendAgents: ['email'],
    recommendMcps: ['resend'],
    reason: 'Transactional emails keep users informed'
  },
  // Auth patterns
  {
    keywords: ['auth', 'login', 'signup', 'register', 'user', 'account', 'password'],
    recommendAgents: ['backend'],
    recommendMcps: ['supabase'],
    reason: 'User authentication is a core feature'
  },
  // Database patterns
  {
    keywords: ['database', 'data', 'store', 'save', 'persist', 'record', 'crud'],
    recommendAgents: ['database'],
    recommendMcps: ['supabase'],
    reason: 'Data persistence requires a database'
  },
  // Real-time patterns
  {
    keywords: ['real-time', 'realtime', 'live', 'websocket', 'socket', 'streaming', 'push'],
    flagCustomSkill: 'realtime',
    reason: 'Real-time features need WebSocket handling'
  },
  // Blockchain/Web3 patterns
  {
    keywords: ['blockchain', 'web3', 'crypto', 'nft', 'token', 'wallet', 'ethereum', 'solidity', 'smart contract'],
    recommendAgents: ['smart-contracts'],
    recommendMcps: ['foundry'],
    reason: 'Web3 apps need smart contract development'
  },
  // DevOps patterns
  {
    keywords: ['deploy', 'ci', 'cd', 'pipeline', 'docker', 'kubernetes', 'infrastructure'],
    recommendAgents: ['devops'],
    recommendMcps: ['vercel', 'git'],
    reason: 'Deployment automation saves time'
  },
  // Testing patterns
  {
    keywords: ['test', 'testing', 'tdd', 'quality', 'reliable', 'production'],
    recommendAgents: ['testing'],
    recommendBehaviors: ['tdd-mode'],
    reason: 'Testing ensures code quality'
  },
  // Dashboard/Analytics patterns
  {
    keywords: ['dashboard', 'analytics', 'metrics', 'chart', 'graph', 'report', 'visualization'],
    recommendAgents: ['frontend', 'database'],
    reason: 'Dashboards need data visualization'
  },
  // API patterns
  {
    keywords: ['api', 'rest', 'graphql', 'endpoint', 'integration', 'webhook'],
    recommendAgents: ['backend'],
    reason: 'APIs require backend development'
  },
  // Mobile/PWA patterns
  {
    keywords: ['mobile', 'pwa', 'app', 'ios', 'android', 'responsive', 'offline'],
    recommendAgents: ['frontend', 'devops'],
    reason: 'Mobile-first design is important'
  },
  // Game patterns
  {
    keywords: ['game', 'gaming', 'player', 'score', 'level', 'multiplayer'],
    recommendAgents: ['frontend', 'testing'],
    recommendMcps: ['browser-tools'],
    flagCustomSkill: 'game-engine',
    reason: 'Games need specialized handling'
  },
  // Social features
  {
    keywords: ['social', 'friend', 'follow', 'share', 'post', 'feed', 'community'],
    recommendAgents: ['backend', 'database'],
    flagCustomSkill: 'social-features',
    reason: 'Social features need custom implementation'
  },
  // Media patterns
  {
    keywords: ['image', 'photo', 'video', 'media', 'upload', 'gallery', 'cdn'],
    recommendMcps: ['supabase'],
    flagCustomSkill: 'media-handling',
    reason: 'Media handling needs storage integration'
  },
  // Scheduling patterns
  {
    keywords: ['schedule', 'booking', 'appointment', 'calendar', 'availability', 'reservation'],
    recommendAgents: ['backend', 'email'],
    flagCustomSkill: 'scheduling',
    reason: 'Scheduling requires calendar logic'
  }
];

// Project type detection
const projectTypes = [
  { type: 'marketplace', keywords: ['marketplace', 'buy', 'sell', 'auction'] },
  { type: 'saas', keywords: ['saas', 'subscription', 'dashboard', 'billing'] },
  { type: 'ai-app', keywords: ['ai', 'llm', 'chatbot', 'assistant'] },
  { type: 'ecommerce', keywords: ['shop', 'store', 'cart', 'products'] },
  { type: 'web3', keywords: ['blockchain', 'web3', 'nft', 'crypto'] },
  { type: 'social', keywords: ['social', 'community', 'feed', 'friend'] },
  { type: 'game', keywords: ['game', 'player', 'score', 'level'] },
  { type: 'tool', keywords: ['tool', 'utility', 'cli', 'automation'] }
];

/**
 * Analyze text and return recommendations
 */
export function analyzeProject(
  description: string,
  discoveryAnswers: Record<string, string> = {}
): RecommendationResult {
  const result: RecommendationResult = {
    agents: [],
    mcps: [],
    behaviors: [],
    customSkills: []
  };

  // Combine all text for analysis
  const allText = [
    description,
    ...Object.values(discoveryAnswers)
  ].join(' ').toLowerCase();

  // Track what we've already recommended to avoid duplicates
  const recommendedAgents = new Set<string>();
  const recommendedMcps = new Set<string>();
  const recommendedBehaviors = new Set<string>();
  const flaggedSkills = new Set<string>();

  // Apply rules
  for (const rule of rules) {
    const matchedKeywords = rule.keywords.filter(kw => allText.includes(kw));

    if (matchedKeywords.length > 0) {
      const reason = rule.reason || `Detected: ${matchedKeywords.join(', ')}`;

      // Add agent recommendations
      if (rule.recommendAgents) {
        for (const agent of rule.recommendAgents) {
          if (!recommendedAgents.has(agent)) {
            recommendedAgents.add(agent);
            result.agents.push({
              type: 'agent',
              id: agent,
              reason,
              priority: 'recommended'
            });
          }
        }
      }

      // Add MCP recommendations
      if (rule.recommendMcps) {
        for (const mcp of rule.recommendMcps) {
          if (!recommendedMcps.has(mcp)) {
            recommendedMcps.add(mcp);
            result.mcps.push({
              type: 'mcp',
              id: mcp,
              reason,
              priority: 'recommended'
            });
          }
        }
      }

      // Add behavior recommendations
      if (rule.recommendBehaviors) {
        for (const behavior of rule.recommendBehaviors) {
          if (!recommendedBehaviors.has(behavior)) {
            recommendedBehaviors.add(behavior);
            result.behaviors.push({
              type: 'behavior',
              id: behavior,
              reason,
              priority: 'recommended'
            });
          }
        }
      }

      // Flag custom skills
      if (rule.flagCustomSkill && !flaggedSkills.has(rule.flagCustomSkill)) {
        flaggedSkills.add(rule.flagCustomSkill);
        result.customSkills.push({
          type: 'custom_skill',
          id: rule.flagCustomSkill,
          reason,
          priority: 'optional'
        });
      }
    }
  }

  // Detect project type and add contextual recommendations
  const detectedType = detectProjectType(allText);
  if (detectedType) {
    // Add commit-per-task for complex projects
    if (['marketplace', 'saas', 'ecommerce'].includes(detectedType)) {
      if (!recommendedBehaviors.has('commit-per-task')) {
        result.behaviors.push({
          type: 'behavior',
          id: 'commit-per-task',
          reason: 'Recommended for complex projects with many features',
          priority: 'recommended'
        });
      }
    }
  }

  return result;
}

/**
 * Detect the primary project type
 */
export function detectProjectType(text: string): string | null {
  const lowerText = text.toLowerCase();

  for (const pt of projectTypes) {
    const matches = pt.keywords.filter(kw => lowerText.includes(kw));
    if (matches.length >= 2) {
      return pt.type;
    }
  }

  // Single keyword match with lower confidence
  for (const pt of projectTypes) {
    if (pt.keywords.some(kw => lowerText.includes(kw))) {
      return pt.type;
    }
  }

  return null;
}

/**
 * Get a human-readable label for a project type
 */
export function getProjectTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'marketplace': 'Marketplace',
    'saas': 'SaaS Application',
    'ai-app': 'AI-Powered App',
    'ecommerce': 'E-Commerce',
    'web3': 'Web3 dApp',
    'social': 'Social Platform',
    'game': 'Game',
    'tool': 'Tool / Utility'
  };
  return labels[type] || type;
}
