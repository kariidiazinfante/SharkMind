/**
 * Core type definitions for SHARKMIND startup validation platform.
 */

export type DimensionStatus = 'KNOWN' | 'INFERRED' | 'UNKNOWN';

export interface DimensionItem {
  id: string;
  name: string;
  status: DimensionStatus;
  userStatement?: string;
  inferredDetails?: string;
  uncertaintyOrGap?: string;
}

export interface DiscoveryAnalysis {
  dimensions: DimensionItem[];
  knownSummary: string[];
  inferredSummary: string[];
  unknownGaps: string[];
  initialClarityScore: number;
}

export interface InterviewQuestion {
  id: string;
  dimensionId: string;
  dimensionName: string;
  question: string;
  whyItMatters: string;
  suggestedAnswers: string[];
  allowCustom: boolean;
}

export interface ConfirmedSummary {
  businessConcept: string;
  problem: string;
  targetCustomer: string;
  solution: string;
  potentialBusinessModel: string;
  mainAssumptions: string[];
  unknownInformation: string[];
}

export interface ScoreCriterion {
  id: string;
  name: string;
  weight: number; // e.g. 0.20
  score: number;  // 0 - 100
  explanation: string;
  supportingInfo: string;
  mainUncertainty: string;
  recommendedImprovement: string;
}

export type ConfidenceLevel = 'High' | 'Medium' | 'Low' | 'Alta' | 'Media' | 'Baja';

export interface ViabilityAssessment {
  overallScore: number; // Mathematically calculated
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number; // 0 - 100
  confidenceExplanation: string;
  criteria: ScoreCriterion[];
  disclaimer: string;
}

export interface ValidationExperiment {
  id: string;
  name: string;
  type: string;
  hypothesis: string;
  steps: string[];
  targetParticipants: string;
  estimatedDuration: string;
  estimatedCost: string;
  successMetric: string;
  suggestedThreshold: string;
  decisionRule: string;
}

export type RiskSeverity = 'High' | 'Medium' | 'Low' | 'Alta' | 'Media' | 'Baja';

export interface RiskItem {
  title: string;
  severity: RiskSeverity;
  mitigation: string;
}

export type StrategicCategory =
  | 'Explore further'
  | 'Validate key assumptions'
  | 'Refine business model'
  | 'Run small pilot'
  | 'Reconsider approach'
  | string;

export interface ValidationReport {
  id: string;
  createdAt: string;
  ideaTitle: string;
  executiveSummary: string;
  viability: ViabilityAssessment;
  problemAndCustomer: {
    problemUrgency: string;
    customerPersona: string;
    currentAlternatives: string;
    painPoints: string[];
  };
  marketOpportunity: {
    marketDynamics: string;
    marketHypothesis: string;
    whatToInvestigate: string[];
  };
  competitorAnalysis: {
    directAndIndirectCompetitors: string[];
    unfairAdvantageOrMoat: string;
    positioningNote: string;
  };
  valueProposition: {
    coreValue: string;
    whyNow: string;
    keyBenefits: string[];
  };
  businessModel: {
    revenueStreams: string[];
    costDrivers: string[];
    pricingHypothesis: string;
  };
  risksAndWeaknesses: RiskItem[];
  validationExperiments: ValidationExperiment[];
  actionPlan: {
    first48Hours: string[];
    first7Days: string[];
    first30Days: string[];
  };
  finalRecommendation: {
    category: StrategicCategory;
    rationale: string;
    nextCriticalStep: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type AppScreen =
  | 'HOME'
  | 'DISCOVERY_LOADING'
  | 'INTERVIEW'
  | 'CONFIRMATION'
  | 'REPORT_LOADING'
  | 'REPORT'
  | 'ADVISOR';
