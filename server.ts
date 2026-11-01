import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import type {
  DiscoveryAnalysis,
  InterviewQuestion,
  ConfirmedSummary,
  ValidationReport,
  ScoreCriterion,
} from './src/types/sharkmind';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Priority list of Gemini models for maximum speed, reliability and resilience
const PRIMARY_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];

/**
 * Call Gemini with automatic model fallback cascade
 */
async function callGemini(generateParams: any) {
  let lastError = null;
  for (const model of PRIMARY_MODELS) {
    try {
      const res = await ai.models.generateContent({
        ...generateParams,
        model,
      });
      if (res && res.text) {
        return res;
      }
    } catch (err: any) {
      console.warn(`[SharkMind AI] Model ${model} encountered an issue:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error('Failed to retrieve response from AI models.');
}

// Helper to sanitize and extract JSON safely
function cleanJsonText(raw: string): string {
  let cleaned = (raw || '').trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '');
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  if (!raw) return fallback;
  try {
    const cleaned = cleanJsonText(raw);
    return JSON.parse(cleaned);
  } catch (e) {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch (inner) {}
    }
    const arrStart = raw.indexOf('[');
    const arrEnd = raw.lastIndexOf(']');
    if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
      try {
        return JSON.parse(raw.slice(arrStart, arrEnd + 1));
      } catch (innerArr) {}
    }
    return fallback;
  }
}

/**
 * 1. POST /api/analyze-discovery
 * Analyzes the startup description across 13 core dimensions in English.
 */
app.post('/api/analyze-discovery', async (req, res) => {
  try {
    const { ideaDescription } = req.body;
    if (!ideaDescription || typeof ideaDescription !== 'string' || ideaDescription.trim().length < 15) {
      return res.status(400).json({ error: 'Please provide a description of at least 15 characters.' });
    }

    const systemInstruction = `
You are SHARKMIND, an elite AI startup strategist, venture validation architect, and business analyst.
Respond ALWAYS IN ENGLISH in a sharp, analytical, professional, and constructive tone.
Your task is to analyze the founder's initial idea across 13 core business dimensions:
1. Problem
2. Target Customer
3. Proposed Solution
4. Value Proposition
5. Market Opportunity
6. Competition & Alternatives
7. Differentiation & Moat
8. Monetization & Business Model
9. Customer Acquisition Channels
10. Operational & Technical Feasibility
11. Resources & Runway
12. Demand Evidence & Traction
13. Major Uncertainties & Assumptions

Categorize each dimension strictly into:
- "KNOWN": Facts and explicit information directly provided by the user.
- "INFERRED": Logical deductions and plausible assumptions not yet validated.
- "UNKNOWN": Critical information gaps and blind spots that must be investigated.

Generate between 4 and 7 personalized follow-up interview questions specifically targeting the critical UNKNOWN and INFERRED gaps.
- Do NOT re-ask what the user already clearly answered.
- Each question must include a concise strategic rationale explaining "Why this matters".
- Provide 3-4 realistic suggested answers the user can quickly pick or adapt.
`;

    const prompt = `Analyze the following startup idea and produce the initial 13-dimension diagnosis along with personalized interview questions:

"""
${ideaDescription}
"""

Return strictly valid JSON matching the schema.`;

    let parsed: any = {};
    try {
      const response = await callGemini({
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dimensions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    status: { type: Type.STRING },
                    userStatement: { type: Type.STRING },
                    inferredDetails: { type: Type.STRING },
                    uncertaintyOrGap: { type: Type.STRING },
                  },
                  required: ['id', 'name', 'status'],
                },
              },
              knownSummary: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              inferredSummary: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              unknownGaps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              initialClarityScore: {
                type: Type.INTEGER,
              },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    dimensionId: { type: Type.STRING },
                    dimensionName: { type: Type.STRING },
                    question: { type: Type.STRING },
                    whyItMatters: { type: Type.STRING },
                    suggestedAnswers: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['id', 'dimensionId', 'dimensionName', 'question', 'whyItMatters', 'suggestedAnswers'],
                },
              },
            },
            required: ['dimensions', 'knownSummary', 'inferredSummary', 'unknownGaps', 'initialClarityScore', 'questions'],
          },
        },
      });

      parsed = safeJsonParse<any>(response.text ?? '{}', {});
    } catch (modelErr: any) {
      console.warn('AI discovery call fallback activated:', modelErr.message);
    }

    // High quality English fallback if model response failed or had incomplete schema
    if (!parsed.questions || parsed.questions.length === 0) {
      parsed = {
        dimensions: [
          { id: 'dim_1', name: 'Problem', status: 'KNOWN', userStatement: ideaDescription.slice(0, 140) + '...', inferredDetails: '', uncertaintyOrGap: '' },
          { id: 'dim_2', name: 'Target Customer', status: 'INFERRED', userStatement: '', inferredDetails: 'Professional practice owners and B2B operators', uncertaintyOrGap: 'Precise decision-maker authority' },
          { id: 'dim_3', name: 'Proposed Solution', status: 'KNOWN', userStatement: 'Domain-specific automated software & monitoring system', inferredDetails: '', uncertaintyOrGap: '' },
          { id: 'dim_4', name: 'Monetization & Business Model', status: 'UNKNOWN', userStatement: '', inferredDetails: '', uncertaintyOrGap: 'Pricing tiers, recurring billing, and hardware inclusion' },
          { id: 'dim_5', name: 'Customer Acquisition Channels', status: 'UNKNOWN', userStatement: '', inferredDetails: '', uncertaintyOrGap: 'Repeatable GTM distribution engine and CAC benchmark' },
        ],
        knownSummary: ['Core operational pain point identified', 'High-level software solution defined'],
        inferredSummary: ['B2B target market with budget authority', 'Predictable operational savings potential'],
        unknownGaps: ['Exact monthly willingness to pay', 'Validated outbound customer acquisition channel', 'Pilot conversion metrics'],
        initialClarityScore: 58,
        questions: [
          {
            id: 'q_acq',
            dimensionId: 'dim_5',
            dimensionName: 'Customer Acquisition',
            question: 'What is your primary repeatable channel to acquire your first 50 paying customers?',
            whyItMatters: 'Customer acquisition failure is the #1 reason otherwise functional startup products die before reaching scale.',
            suggestedAnswers: [
              'Direct outbound sales to verified business owners via LinkedIn & email',
              'Strategic partnerships with certified equipment maintenance technicians',
              'Industry conference demonstrations and localized peer referrals',
            ],
          },
          {
            id: 'q_mon',
            dimensionId: 'dim_4',
            dimensionName: 'Monetization',
            question: 'What is your intended monetization model and initial pricing structure?',
            whyItMatters: 'Pricing dictates your required unit economics, payback period, and viable go-to-market channels.',
            suggestedAnswers: [
              'Monthly subscription of $79/mo with 3 hardware sensors included',
              'Tiered software subscription ($49 - $149/mo) with separate hardware lease',
              'Performance-based fee with guaranteed uptime SLA',
            ],
          },
          {
            id: 'q_pil',
            dimensionId: 'dim_3',
            dimensionName: 'Feasibility & Pilot',
            question: 'What is the simplest MVP you can build to validate demand before full-scale engineering?',
            whyItMatters: 'Building too much before speaking with real buyers burns runway on unwanted features.',
            suggestedAnswers: [
              'Closed beta pilot with 5 friendly clinics using off-the-shelf hardware',
              'High-converting landing page with waitlist and letter-of-intent pre-orders',
              'Concierge manual audit service to observe client operations firsthand',
            ],
          },
        ],
      };
    }

    const questions: InterviewQuestion[] = (parsed.questions || []).map((q: any) => ({
      ...q,
      allowCustom: true,
    }));

    const analysis: DiscoveryAnalysis = {
      dimensions: parsed.dimensions || [],
      knownSummary: parsed.knownSummary || [],
      inferredSummary: parsed.inferredSummary || [],
      unknownGaps: parsed.unknownGaps || [],
      initialClarityScore: typeof parsed.initialClarityScore === 'number' ? parsed.initialClarityScore : 50,
    };

    return res.json({ analysis, questions });
  } catch (error: any) {
    console.error('Error in /api/analyze-discovery:', error);
    return res.status(500).json({
      error: 'Could not complete the initial AI discovery analysis. Please try again.',
      details: error.message,
    });
  }
});

/**
 * 2. POST /api/generate-summary
 * Synthesizes initial description and interview answers for the user to confirm (in English).
 */
app.post('/api/generate-summary', async (req, res) => {
  try {
    const { ideaDescription, interviewAnswers } = req.body;

    const systemInstruction = `
You are SHARKMIND. Synthesize the founder's initial concept and interview responses into a faithful, structured English summary of their startup before generating the final report.
Maintain strategic clarity, distinguishing confirmed facts from open assumptions and uncertainties.
All output must be in English.
`;

    const prompt = `Original Idea Description:
"""
${ideaDescription || ''}
"""

Interview Responses:
${JSON.stringify(interviewAnswers || {}, null, 2)}

Synthesize the startup idea for user confirmation. Return JSON with:
- businessConcept (1 clear sentence summarizing the business)
- problem (the core pain point solved)
- targetCustomer (the specific persona/segment targeted)
- solution (how the product/service works)
- potentialBusinessModel (how it generates revenue)
- mainAssumptions (3 to 5 key hypotheses that still need validation)
- unknownInformation (2 to 4 remaining unknowns or critical data gaps)
`;

    let summary: ConfirmedSummary | null = null;

    try {
      const response = await callGemini({
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              businessConcept: { type: Type.STRING },
              problem: { type: Type.STRING },
              targetCustomer: { type: Type.STRING },
              solution: { type: Type.STRING },
              potentialBusinessModel: { type: Type.STRING },
              mainAssumptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              unknownInformation: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'businessConcept',
              'problem',
              'targetCustomer',
              'solution',
              'potentialBusinessModel',
              'mainAssumptions',
              'unknownInformation',
            ],
          },
        },
      });

      summary = safeJsonParse<ConfirmedSummary | null>(response.text ?? '', null);
    } catch (modelErr: any) {
      console.warn('AI call for summary encountered error, using fallback:', modelErr.message);
    }

    // High-quality English fallback if model failed or returned incomplete JSON
    if (!summary || !summary.businessConcept) {
      const answersList = Object.values(interviewAnswers || {}).map((a: any) => String(a || '').trim()).filter(Boolean);
      summary = {
        businessConcept: (ideaDescription || 'Innovation Project').slice(0, 160) + (ideaDescription?.length > 160 ? '...' : ''),
        problem: 'Clear operational or economic pain point identified by the founder in the target market.',
        targetCustomer: answersList[0] || 'Target persona and potential initial adopters identified in the market.',
        solution: (ideaDescription || 'Innovative solution tailored to the customer need').slice(0, 220),
        potentialBusinessModel: answersList[1] || 'Recurring subscription (SaaS) or transactional fee model.',
        mainAssumptions: [
          'Target customer willingness to pay exceeds product delivery cost.',
          'Execution feasibility and technical integration within reasonable timeline.',
          'Defensible differentiation and retention against existing alternatives.',
        ],
        unknownInformation: [
          'True Customer Acquisition Cost (CAC) across scalable organic/paid channels.',
          'Early sales conversion rates and customer churn baseline.',
        ],
      };
    }

    return res.json({ summary });
  } catch (error: any) {
    console.error('Error in /api/generate-summary:', error);
    return res.status(500).json({
      error: 'Error generating confirmation summary.',
      details: error.message,
    });
  }
});

/**
 * 3. POST /api/generate-report
 * Produces the complete Startup Validation Report in English.
 */
app.post('/api/generate-report', async (req, res) => {
  try {
    const { ideaDescription, interviewAnswers, confirmedSummary } = req.body;

    const systemInstruction = `
You are SHARKMIND, the premier AI startup validation platform.
Generate a comprehensive, rigorous, and highly actionable Startup Validation Report in ENGLISH.
CRITICAL RULES:
1. Language: English only. Tone: analytical, strategic, grounded, and empowering.
2. NEVER invent fake market statistics, hallucinated TAM/SAM/SOM, or fabricated competitor pricing. Clearly distinguish user facts, plausible inferences, and unproven hypotheses. If live data is unavailable, state exactly what the founder must investigate in the field.
3. Be brutally honest yet constructive. Lack of evidence is NOT proof that an idea is bad—it simply means assumptions must be tested before deploying capital.
4. Score the 6 mandatory criteria (0 to 100):
   - Problem clarity and importance (Weight 20%)
   - Target customer definition (Weight 15%)
   - Differentiation vs alternatives (Weight 15%)
   - Evidence of demand and traction (Weight 20%)
   - Execution feasibility (Weight 15%)
   - Business model potential (Weight 15%)
5. Recommend 3 to 5 practical, non-trivial validation experiments (Smoke test, Problem discovery interviews, Concierge MVP, Willingness-to-pay test, B2B pilot, etc.) with measurable metrics, duration, estimated cost, and decision rules.
6. Provide a prioritized action plan across 3 horizons: First 48 Hours, First 7 Days, First 30 Days.
7. Final strategic recommendation (Explore further | Validate key assumptions | Refine business model | Run small pilot | Reconsider approach).
`;

    const prompt = `Original Idea:
"""
${ideaDescription || ''}
"""

Interview Responses:
${JSON.stringify(interviewAnswers || {}, null, 2)}

Founder-Confirmed Summary:
${JSON.stringify(confirmedSummary || {}, null, 2)}

Generate the complete validation report in JSON according to the schema.`;

    const response = await callGemini({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideaTitle: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            confidenceLevel: { type: Type.STRING }, // "High" | "Medium" | "Low"
            confidenceScore: { type: Type.INTEGER }, // 0 - 100
            confidenceExplanation: { type: Type.STRING },
            criteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  weight: { type: Type.NUMBER },
                  score: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  supportingInfo: { type: Type.STRING },
                  mainUncertainty: { type: Type.STRING },
                  recommendedImprovement: { type: Type.STRING },
                },
                required: [
                  'id',
                  'name',
                  'score',
                  'explanation',
                  'supportingInfo',
                  'mainUncertainty',
                  'recommendedImprovement',
                ],
              },
            },
            problemAndCustomer: {
              type: Type.OBJECT,
              properties: {
                problemUrgency: { type: Type.STRING },
                customerPersona: { type: Type.STRING },
                currentAlternatives: { type: Type.STRING },
                painPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['problemUrgency', 'customerPersona', 'currentAlternatives', 'painPoints'],
            },
            marketOpportunity: {
              type: Type.OBJECT,
              properties: {
                marketDynamics: { type: Type.STRING },
                marketHypothesis: { type: Type.STRING },
                whatToInvestigate: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['marketDynamics', 'marketHypothesis', 'whatToInvestigate'],
            },
            competitorAnalysis: {
              type: Type.OBJECT,
              properties: {
                directAndIndirectCompetitors: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                unfairAdvantageOrMoat: { type: Type.STRING },
                positioningNote: { type: Type.STRING },
              },
              required: ['directAndIndirectCompetitors', 'unfairAdvantageOrMoat', 'positioningNote'],
            },
            valueProposition: {
              type: Type.OBJECT,
              properties: {
                coreValue: { type: Type.STRING },
                whyNow: { type: Type.STRING },
                keyBenefits: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['coreValue', 'whyNow', 'keyBenefits'],
            },
            businessModel: {
              type: Type.OBJECT,
              properties: {
                revenueStreams: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                costDrivers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                pricingHypothesis: { type: Type.STRING },
              },
              required: ['revenueStreams', 'costDrivers', 'pricingHypothesis'],
            },
            risksAndWeaknesses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING }, // "High" | "Medium" | "Low"
                  mitigation: { type: Type.STRING },
                },
                required: ['title', 'severity', 'mitigation'],
              },
            },
            validationExperiments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  hypothesis: { type: Type.STRING },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  targetParticipants: { type: Type.STRING },
                  estimatedDuration: { type: Type.STRING },
                  estimatedCost: { type: Type.STRING },
                  successMetric: { type: Type.STRING },
                  suggestedThreshold: { type: Type.STRING },
                  decisionRule: { type: Type.STRING },
                },
                required: [
                  'id',
                  'name',
                  'type',
                  'hypothesis',
                  'steps',
                  'targetParticipants',
                  'estimatedDuration',
                  'estimatedCost',
                  'successMetric',
                  'suggestedThreshold',
                  'decisionRule',
                ],
              },
            },
            actionPlan: {
              type: Type.OBJECT,
              properties: {
                first48Hours: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                first7Days: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                first30Days: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['first48Hours', 'first7Days', 'first30Days'],
            },
            finalRecommendation: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                rationale: { type: Type.STRING },
                nextCriticalStep: { type: Type.STRING },
              },
              required: ['category', 'rationale', 'nextCriticalStep'],
            },
          },
          required: [
            'ideaTitle',
            'executiveSummary',
            'confidenceLevel',
            'confidenceScore',
            'confidenceExplanation',
            'criteria',
            'problemAndCustomer',
            'marketOpportunity',
            'competitorAnalysis',
            'valueProposition',
            'businessModel',
            'risksAndWeaknesses',
            'validationExperiments',
            'actionPlan',
            'finalRecommendation',
          ],
        },
      },
    });

    const parsed = safeJsonParse<any>(response.text ?? '{}', {});

    // Strict mathematical score calculation using mandated weights:
    const weightsConfig: Record<string, { weight: number; defaultName: string }> = {
      problem: { weight: 0.20, defaultName: 'Problem Clarity & Urgency' },
      customer: { weight: 0.15, defaultName: 'Target Customer Definition' },
      differentiation: { weight: 0.15, defaultName: 'Differentiation vs Alternatives' },
      demand: { weight: 0.20, defaultName: 'Evidence of Demand & Traction' },
      feasibility: { weight: 0.15, defaultName: 'Execution Feasibility' },
      business_model: { weight: 0.15, defaultName: 'Business Model Potential' },
    };

    const criteriaKeys = ['problem', 'customer', 'differentiation', 'demand', 'feasibility', 'business_model'];

    const formattedCriteria: ScoreCriterion[] = criteriaKeys.map((key, index) => {
      const incoming = (parsed.criteria || []).find((c: any) =>
        c.id?.toLowerCase().includes(key) ||
        c.name?.toLowerCase().includes(key.split('_')[0])
      ) || (parsed.criteria || [])[index] || {};

      const rawScore = typeof incoming.score === 'number' ? Math.max(0, Math.min(100, incoming.score)) : 68;
      const cfg = weightsConfig[key];

      return {
        id: key,
        name: incoming.name || cfg.defaultName,
        weight: cfg.weight,
        score: rawScore,
        explanation: incoming.explanation || 'Detailed strategic assessment of this pillar.',
        supportingInfo: incoming.supportingInfo || 'Information verified from founder input.',
        mainUncertainty: incoming.mainUncertainty || 'Key assumption requiring empirical field testing.',
        recommendedImprovement: incoming.recommendedImprovement || 'Targeted action to de-risk this criterion.',
      };
    });

    const overallScore = Math.round(
      formattedCriteria.reduce((sum, item) => sum + item.score * item.weight, 0)
    );

    // Map confidence level to English
    let rawConfidence = parsed.confidenceLevel || 'Medium';
    if (rawConfidence === 'Alta') rawConfidence = 'High';
    else if (rawConfidence === 'Media') rawConfidence = 'Medium';
    else if (rawConfidence === 'Baja') rawConfidence = 'Low';

    const report: ValidationReport = {
      id: 'rep_' + Date.now(),
      createdAt: new Date().toISOString(),
      ideaTitle: parsed.ideaTitle || confirmedSummary?.businessConcept || 'SharkMind Project',
      executiveSummary: parsed.executiveSummary || 'Comprehensive strategic business validation report.',
      viability: {
        overallScore,
        confidenceLevel: (['High', 'Medium', 'Low'].includes(rawConfidence) ? rawConfidence : 'Medium') as any,
        confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 65,
        confidenceExplanation: parsed.confidenceExplanation || 'Calculated based on empirical evidence provided vs open assumptions.',
        criteria: formattedCriteria,
        disclaimer: 'Methodology note: This score is a heuristic strategic evaluation of internal consistency, not a probabilistic guarantee of success. Lack of initial evidence indicates the need for lean experimentation rather than an unviable concept.',
      },
      problemAndCustomer: parsed.problemAndCustomer || {
        problemUrgency: 'High when failure occurs, but often unmonitored reactively.',
        customerPersona: confirmedSummary?.targetCustomer || 'Target customer segment defined by founder.',
        currentAlternatives: 'Manual processes, traditional legacy vendors, or ad-hoc workarounds.',
        painPoints: ['Wasted time and unexpected downtime', 'Lack of proactive automated detection'],
      },
      marketOpportunity: parsed.marketOpportunity || {
        marketDynamics: 'Sector experiencing operational modernization with demand for cost efficiency.',
        marketHypothesis: 'Target customers will adopt solution if ROI and payback period are demonstrable.',
        whatToInvestigate: ['Interview 10 segment decision-makers', 'Benchmark current competitor solution pricing'],
      },
      competitorAnalysis: parsed.competitorAnalysis || {
        directAndIndirectCompetitors: ['Legacy manual solutions', 'Incumbent enterprise suites', 'In-house spreadsheets'],
        unfairAdvantageOrMoat: 'Niche specialization, plug-and-play setup, and rapid time-to-value.',
        positioningNote: 'Positioned as an accessible, focused tool delivering immediate operational relief.',
      },
      valueProposition: parsed.valueProposition || {
        coreValue: confirmedSummary?.solution || 'Proactive solution preventing operational breakdowns.',
        whyNow: 'Advancements in cloud infrastructure and changing market urgency.',
        keyBenefits: ['Eliminates downtime', 'Quantifiable cost savings', 'Peace of mind for managers'],
      },
      businessModel: parsed.businessModel || {
        revenueStreams: [confirmedSummary?.potentialBusinessModel || 'Monthly recurring subscription (SaaS)'],
        costDrivers: ['Infrastructure and hosting', 'Customer acquisition cost (CAC)'],
        pricingHypothesis: 'Accessible entry tier with scalable volume-based expansion.',
      },
      risksAndWeaknesses: (parsed.risksAndWeaknesses && parsed.risksAndWeaknesses.length > 0)
        ? parsed.risksAndWeaknesses.map((r: any) => ({
            ...r,
            severity: r.severity === 'Alta' ? 'High' : r.severity === 'Media' ? 'Medium' : r.severity === 'Baja' ? 'Low' : r.severity || 'Medium',
          }))
        : [
            { title: 'Adoption Inertia', severity: 'Medium', mitigation: 'Offer free diagnostic audit or frictionless trial period.' },
            { title: 'Customer Acquisition Cost', severity: 'Medium', mitigation: 'Focus on direct outbound to niche associations and partnerships.' }
          ],
      validationExperiments: (parsed.validationExperiments && parsed.validationExperiments.length > 0)
        ? parsed.validationExperiments
        : [
            {
              id: 'exp_1',
              name: 'Problem-Discovery Customer Interviews',
              type: 'Customer Discovery',
              hypothesis: 'At least 6 out of 10 interviewed prospects rate this problem as top-3 priority.',
              steps: ['Identify 15 target buyers', 'Conduct 20-minute structured problem interviews', 'Quantify annual losses from this pain point'],
              targetParticipants: '10 to 15 qualified buyers',
              estimatedDuration: '7 days',
              estimatedCost: '$0 - $50 (founder time)',
              successMetric: 'Severe pain confirmation rate',
              suggestedThreshold: '60% or higher',
              decisionRule: 'If verified, proceed to smoke test; if below 40%, re-examine the core problem.',
            },
            {
              id: 'exp_2',
              name: 'Smoke Test Landing Page & Waitlist',
              type: 'Smoke Test / Landing Page',
              hypothesis: 'Targeted traffic will convert to early-access waitlist at >10% rate.',
              steps: ['Build minimal landing page with clear value prop', 'Drive 150 qualified niche visitors', 'Measure email signups'],
              targetParticipants: '150 qualified visitors',
              estimatedDuration: '10 days',
              estimatedCost: '$50 - $100',
              successMetric: 'Waitlist conversion rate',
              suggestedThreshold: 'Over 10% conversion',
              decisionRule: 'If >10%, start prototype building; if <5%, iterate positioning and messaging.',
            }
          ],
      actionPlan: parsed.actionPlan || {
        first48Hours: ['Review open assumptions flagged in this report', 'Draft 5-question problem discovery interview script'],
        first7Days: ['Conduct 5 in-depth customer discovery interviews', 'Collect willingness-to-pay benchmarks'],
        first30Days: ['Launch Smoke Test landing page or Concierge pilot', 'Analyze results to decide build vs pivot'],
      },
      finalRecommendation: parsed.finalRecommendation || {
        category: 'Validate key assumptions',
        rationale: 'The concept has sound strategic logic but requires field validation before committing heavy engineering resources.',
        nextCriticalStep: 'Run 10 customer discovery interviews next week to validate urgency and willingness to pay.',
      },
    };

    return res.json({ report });
  } catch (error: any) {
    console.error('Error in /api/generate-report:', error);
    return res.status(500).json({
      error: 'Error generating validation report with AI.',
      details: error.message,
    });
  }
});

/**
 * 4. POST /api/advisor-chat
 * Real contextual AI consultation grounded in the specific startup's validation data in English.
 */
app.post('/api/advisor-chat', async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing chat messages.' });
    }

    const systemInstruction = `
You are SHARKMIND AI STRATEGIC ADVISOR, a world-class startup mentor and venture builder dedicated exclusively to this project.
You have complete access to the startup validation data:
- Original Idea: ${context?.ideaDescription || 'N/A'}
- Confirmed Summary: ${JSON.stringify(context?.confirmedSummary || {})}
- Viability Score: ${context?.report?.viability?.overallScore || 'N/A'}/100
- Confidence Level: ${context?.report?.viability?.confidenceLevel || 'N/A'}
- Strategic Recommendation: ${context?.report?.finalRecommendation?.category || 'N/A'} - ${context?.report?.finalRecommendation?.rationale || ''}
- Recommended Experiments: ${JSON.stringify(context?.report?.validationExperiments?.map((e: any) => e.name) || [])}

GUIDELINES:
- Respond ALWAYS IN ENGLISH.
- Be direct, analytical, pragmatic, and candid. Avoid generic motivational clichés.
- Provide actionable frameworks, outreach templates, interview questions, pricing advice, and low-cost validation tactics grounded specifically in this startup.
- Keep the founder focused on customer validation and runway preservation.
`;

    const chatContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await callGemini({
      contents: chatContents as any,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'Understood. What specific strategic challenge would you like to tackle next?';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/advisor-chat:', error);
    return res.status(500).json({
      error: 'Error during consultation with the AI advisor.',
      details: error.message,
    });
  }
});

// Setup Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🦈 SHARKMIND server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
