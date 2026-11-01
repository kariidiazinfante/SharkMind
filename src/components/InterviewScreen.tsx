import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Check,
  Sparkles,
  Globe,
} from 'lucide-react';
import type { InterviewQuestion, DiscoveryAnalysis } from '../types/sharkmind';

interface InterviewScreenProps {
  questions: InterviewQuestion[];
  discoveryAnalysis: DiscoveryAnalysis | null;
  answers: Record<string, string>;
  onUpdateAnswer: (questionId: string, answer: string) => void;
  onFinishInterview: () => void;
  onBackToHome: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

// Fallback strategic questions in English if legacy Spanish questions are detected
const ENGLISH_QUESTION_FALLBACKS: Record<string, { question: string; why: string; suggestions: string[] }> = {
  default_problem: {
    question: 'What specific, quantifiable problem does your customer experience, and how painful is it today?',
    why: 'If the pain point is only a mild inconvenience rather than an urgent bottleneck, willingness to pay will remain low.',
    suggestions: [
      'Critical downtime or financial loss exceeding thousands of dollars per incident',
      'Manual repetitive workflows consuming more than 15 hours per week per staff member',
      'Regulatory compliance risk resulting in potential fines or audit failure',
    ],
  },
  default_customer: {
    question: 'Who is the exact decision-maker with budget authority who will pay for this solution?',
    why: 'Targeting an ill-defined user persona leads to high CAC and protracted sales cycles.',
    suggestions: [
      'Small to mid-sized business owners and managing directors directly',
      'Operations managers and technical facility supervisors',
      'High-income individual professionals purchasing with personal credit cards',
    ],
  },
  default_monetization: {
    question: 'What is your intended monetization model and initial pricing structure?',
    why: 'Pricing dictates your required unit economics, payback period, and viable go-to-market channels.',
    suggestions: [
      'Monthly recurring SaaS subscription ($49 - $149/month per location)',
      'Tiered enterprise license based on usage volume with an annual contract',
      'Transaction fee / take-rate (10% - 15%) per completed order or processed volume',
    ],
  },
  default_acquisition: {
    question: 'What is your primary repeatable channel to acquire your first 50 paying customers?',
    why: 'Customer acquisition failure is the #1 reason otherwise functional startup products die.',
    suggestions: [
      'Targeted direct outreach (Cold LinkedIn + Email) to verified decision-makers',
      'Partnerships and integrations with existing distributors or industry trade associations',
      'High-intent search engine SEO and localized professional community referrals',
    ],
  },
  default_mvp: {
    question: 'What is the simplest MVP you can build to validate demand before full-scale engineering?',
    why: 'Building too much before speaking with real buyers burns runway on unwanted features.',
    suggestions: [
      'A concierge manual pilot with 5-10 friendly beta customers using off-the-shelf tools',
      'A high-converting landing page with a waitlist and pricing pre-commitment deposit',
      'A lightweight prototype with 1 core automation delivered in under 2 weeks',
    ],
  },
};

const hasSpanishIndicators = (str: string): boolean => {
  if (!str) return false;
  return (
    /[¿¡áéíóúÁÉÍÓÚñÑ]/.test(str) ||
    /\b(clínica|mantenimiento|sensores|precio|modelo|problema|solución|mercado|equipo|clientes|validación|suscripción|cobro|mensual|coste|costo|competencia|adquisición|cómo|cuál|quién|dónde|por qué|todavía|canal|canales)\b/i.test(str)
  );
};

const translateSpanishToEnglish = (text: string): string => {
  if (!text) return '';
  let translated = text;

  const phraseMap: [RegExp, string][] = [
    [/suscripci[oó]n mensual de \$?79 con sensores incluidos/gi, 'Monthly subscription of $79 with 3 hardware sensors included'],
    [/suscripci[oó]n mensual/gi, 'Monthly recurring subscription'],
    [/ventas directas b2b a cl[ií]nicas dentales/gi, 'Direct B2B outbound sales to private dental clinics'],
    [/ventas directas/gi, 'Direct outbound sales'],
    [/contactar cl[ií]nicas por linkedin/gi, 'Direct outreach to dental practice owners via LinkedIn'],
    [/no lo s[eé] todav[ií]a/gi, "I don't know yet (marked as open unknown)"],
    [/piloto con 5 cl[ií]nicas/gi, 'Closed pilot with 5 friendly clinics before commercial rollout'],
    [/comisi[oó]n del 10%/gi, '10% transaction fee per completed order'],
    [/desarrollo de software/gi, 'Software development handled in-house by technical founders'],
  ];

  for (const [pattern, replacement] of phraseMap) {
    translated = translated.replace(pattern, replacement);
  }

  translated = translated.replace(/[¿¡]/g, '');
  return translated;
};

export const InterviewScreen: React.FC<InterviewScreenProps> = ({
  questions,
  discoveryAnalysis,
  answers,
  onUpdateAnswer,
  onFinishInterview,
  onBackToHome,
  isLoading = false,
  errorMessage = null,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize questions to English if any were persisted from older runs
  const sanitizedQuestions = useMemo(() => {
    return questions.map((q, idx) => {
      const isSpanish = hasSpanishIndicators(q.question) || hasSpanishIndicators(q.whyItMatters || '');
      if (!isSpanish) return q;

      const fallbackKeys = Object.keys(ENGLISH_QUESTION_FALLBACKS);
      const fallback = ENGLISH_QUESTION_FALLBACKS[fallbackKeys[idx % fallbackKeys.length]];

      return {
        ...q,
        dimensionName: q.dimensionName
          ? q.dimensionName.replace(/Monetizaci[oó]n/i, 'Monetization').replace(/Adquisici[oó]n/i, 'Customer Acquisition').replace(/Diferenciaci[oó]n/i, 'Differentiation & Moat')
          : 'Strategic Dimension',
        question: fallback.question,
        whyItMatters: fallback.why,
        suggestedAnswers: fallback.suggestions,
      };
    });
  }, [questions]);

  if (!sanitizedQuestions || sanitizedQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[#071A33] flex items-center justify-center p-4">
        <div className="bg-[#0B2545] p-8 rounded-2xl border border-[#173B63] text-center max-w-md text-[#F7FAFE]">
          <p className="text-sm text-[#94A9C3]">No interview questions generated for this idea.</p>
          <button
            onClick={onBackToHome}
            className="mt-4 px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-xs font-semibold hover:bg-[#2563EB] transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQ = sanitizedQuestions[currentIndex] || sanitizedQuestions[0];
  const currentAnswer = answers[currentQ.id] || '';
  const isAnswerInSpanish = hasSpanishIndicators(currentAnswer);

  const totalQuestions = sanitizedQuestions.length;
  const answeredCount = Object.keys(answers).filter((k) => (answers[k] || '').trim().length > 0).length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelectSuggested = (suggestion: string) => {
    onUpdateAnswer(currentQ.id, suggestion);
  };

  const handleTranslateToEnglish = () => {
    const translated = translateSpanishToEnglish(currentAnswer);
    onUpdateAnswer(currentQ.id, translated);
  };

  const handleDontKnowYet = () => {
    onUpdateAnswer(
      currentQ.id,
      "I don't know for certain yet; this is an open assumption that requires empirical field validation."
    );
  };

  const handleApplyEnglishPreset = (text: string) => {
    onUpdateAnswer(currentQ.id, text);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinishInterview();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onBackToHome();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#071A33] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-[#F7FAFE]">
      <div className="max-w-3xl mx-auto">
        {/* Navigation Bar & Progress Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A9C3] hover:text-[#F7FAFE] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{currentIndex === 0 ? 'Back to idea' : 'Previous question'}</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#94A9C3] tabular-nums">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-[#31577D] hidden sm:inline">·</span>
            <span className="text-xs text-[#3B82F6] font-medium hidden sm:inline">
              {answeredCount} answered
            </span>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full bg-[#173B63] h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="bg-[#3B82F6] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold">Notice:</span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={onFinishInterview}
              className="px-3 py-1 bg-red-900/80 hover:bg-red-800 text-white rounded-lg font-semibold shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Question Card (Dark Navy Surface, Crisp Typography, Clean Spatial Math) */}
        <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 sm:p-10 shadow-xl transition-all">
          {/* Dimension Tag */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
              {currentQ.dimensionName || 'Strategic Dimension'}
            </span>
            <span className="text-[#31577D]" aria-hidden="true">·</span>
            <span className="text-xs text-[#94A9C3]">SharkMind Interview</span>
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-mono text-[#38BDF8] bg-[#071A33] border border-[#173B63] px-2 py-0.5 rounded-md">
              <Globe className="w-3 h-3 text-[#3B82F6]" />
              English
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl sm:text-2xl font-bold text-[#F7FAFE] tracking-tight leading-snug">
            {currentQ.question}
          </h2>

          {/* Why it matters box */}
          {currentQ.whyItMatters && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#071A33] border border-[#173B63] flex items-start gap-3">
              <Lightbulb className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
              <div className="text-xs text-[#DCEBFA] leading-relaxed">
                <span className="font-semibold text-white">Why this matters: </span>
                {currentQ.whyItMatters}
              </div>
            </div>
          )}

          {/* Suggested Quick Options */}
          {currentQ.suggestedAnswers && currentQ.suggestedAnswers.length > 0 && (
            <div className="mt-6">
              <div className="text-xs font-semibold text-[#DCEBFA] mb-2 flex items-center justify-between">
                <span>Suggested options (click to select or adapt):</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {currentQ.suggestedAnswers.map((suggestion, idx) => {
                  const isSelected = currentAnswer === suggestion;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggested(suggestion)}
                      className={`text-left p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-start justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#3B82F6] bg-[#173B63] text-white font-medium shadow-sm'
                          : 'border-[#173B63] bg-[#071A33] text-[#DCEBFA] hover:bg-[#122A48] hover:border-[#31577D]'
                      }`}
                    >
                      <span>{suggestion}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom text response input - Target Focus Element */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="interview-custom-answer"
                  className="block text-xs font-semibold text-[#DCEBFA]"
                >
                  Your detailed answer (in English):
                </label>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8] bg-[#071A33] border border-[#173B63] px-2 py-0.5 rounded">
                  English Only
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isAnswerInSpanish && (
                  <button
                    type="button"
                    onClick={handleTranslateToEnglish}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-950/80 border border-amber-700/80 px-2.5 py-1 rounded-md shadow-sm transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Convert to English</span>
                  </button>
                )}
                {currentAnswer && (
                  <button
                    type="button"
                    onClick={() => onUpdateAnswer(currentQ.id, '')}
                    className="text-[11px] text-[#94A9C3] hover:text-[#38BDF8] transition-colors cursor-pointer"
                  >
                    Clear response
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="interview-custom-answer"
              rows={4}
              value={currentAnswer}
              onChange={(e) => onUpdateAnswer(currentQ.id, e.target.value)}
              placeholder="Write your answer in English (e.g., target customer, revenue model, pilot traction, or key hypotheses)..."
              className="w-full p-3.5 rounded-xl border border-[#173B63] bg-[#071A33] text-[#F7FAFE] placeholder-[#627D98] text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all resize-y"
            />

            {/* Quick English Presets for Immediate Selection */}
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-[#94A9C3]">Quick English presets:</span>
              <button
                type="button"
                onClick={() => handleApplyEnglishPreset('Direct B2B outbound outreach to verified decision-makers via LinkedIn and email.')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#071A33] border border-[#173B63] text-[#DCEBFA] hover:border-[#3B82F6] hover:text-white transition-colors cursor-pointer"
              >
                + B2B Outbound
              </button>
              <button
                type="button"
                onClick={() => handleApplyEnglishPreset('Monthly recurring SaaS subscription of $79/mo with 3 hardware sensors included.')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#071A33] border border-[#173B63] text-[#DCEBFA] hover:border-[#3B82F6] hover:text-white transition-colors cursor-pointer"
              >
                + $79/mo SaaS Model
              </button>
              <button
                type="button"
                onClick={() => handleApplyEnglishPreset('Closed beta pilot with 5 friendly clinics before full public commercial launch.')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#071A33] border border-[#173B63] text-[#DCEBFA] hover:border-[#3B82F6] hover:text-white transition-colors cursor-pointer"
              >
                + 5-Clinic Beta Pilot
              </button>
            </div>
          </div>

          {/* Quick "I don't know yet" button */}
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDontKnowYet}
              className="text-xs text-[#94A9C3] hover:text-[#38BDF8] underline decoration-[#31577D] hover:decoration-[#38BDF8] transition-colors cursor-pointer"
            >
              I don't know yet (record as an open strategic unknown)
            </button>
            <span className="text-[11px] text-[#627D98] font-mono">
              {currentAnswer.length} chars
            </span>
          </div>

          {/* Card Action Footer */}
          <div className="mt-8 pt-6 border-t border-[#173B63] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Question jumping dots */}
              <div className="flex items-center gap-1.5">
                {sanitizedQuestions.map((q, idx) => {
                  const hasAnswer = (answers[q.id] || '').trim().length > 0;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      title={`Question ${idx + 1}`}
                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#3B82F6] w-5'
                          : hasAnswer
                          ? 'bg-[#38BDF8]'
                          : 'bg-[#173B63]'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {answeredCount >= 2 && currentIndex < totalQuestions - 1 && (
                <button
                  type="button"
                  onClick={onFinishInterview}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-semibold text-[#DCEBFA] bg-[#173B63] hover:bg-[#1E4A7D] border border-[#31577D] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Synthesizing...' : 'Generate summary now'}
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing answers...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {currentIndex === totalQuestions - 1
                        ? 'Complete & review synthesis'
                        : 'Next question'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
