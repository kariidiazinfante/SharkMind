import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Download,
  FileDown,
  Loader2,
  Check,
  MessageSquareCode,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  HelpCircle,
  Target,
  FlaskConical,
  Calendar,
  Layers,
  ArrowRight,
  Printer,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { ValidationReport, ScoreCriterion } from '../types/sharkmind';
import { generateValidationReportPdf } from '../utils/generatePdf';

interface ReportDashboardProps {
  report: ValidationReport;
  onOpenAdvisor: () => void;
  onOpenExport: () => void;
  onBackToInterview: () => void;
  onResetToNewIdea: () => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  report,
  onOpenAdvisor,
  onOpenExport,
  onBackToInterview,
  onResetToNewIdea,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'criteria' | 'market' | 'experiments' | 'action_plan'
  >('overview');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const { viability } = report;
  const overallScore = viability.overallScore;

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      await generateValidationReportPdf(report);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const getScoreBadgeBg = (score: number) => {
    if (score >= 75) return 'bg-emerald-950/80 text-emerald-300 border border-emerald-800';
    if (score >= 50) return 'bg-[#173B63] text-[#DCEBFA] border border-[#31577D]';
    return 'bg-amber-950/80 text-amber-300 border border-amber-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return 'High Consistency';
    if (score >= 55) return 'Moderate Viability';
    return 'Significant Risk';
  };

  return (
    <div className="min-h-screen bg-[#071A33] text-[#F7FAFE] pb-24">
      {/* Top Banner & Control Bar */}
      <div className="bg-[#0B2545] border-b border-[#173B63] sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-[#3B82F6] font-semibold">
                  Validation Report
                </span>
                <span className="text-[#31577D]" aria-hidden="true">·</span>
                <span className="text-xs text-[#94A9C3] font-mono">
                  {new Date(report.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-[#F7FAFE] tracking-tight truncate max-w-md sm:max-w-xl">
                {report.ideaTitle}
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-2 rounded-lg bg-linear-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#3B82F6] hover:to-[#2563EB] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-70 border border-[#60A5FA]/30"
              title="Download formatted executive PDF report"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#93C5FD]" />
              ) : pdfDownloaded ? (
                <Check className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <FileDown className="w-3.5 h-3.5 text-[#93C5FD]" />
              )}
              <span>
                {isDownloadingPdf
                  ? 'Generating PDF...'
                  : pdfDownloaded
                  ? 'PDF Downloaded!'
                  : 'Download PDF'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenAdvisor}
              className="px-3.5 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquareCode className="w-3.5 h-3.5" />
              <span>Consult SharkMind AI</span>
            </button>

            <button
              type="button"
              onClick={onOpenExport}
              className="px-3.5 py-2 rounded-lg border border-[#31577D] bg-[#071A33] hover:bg-[#173B63] text-xs font-semibold text-[#DCEBFA] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={onBackToInterview}
              className="px-3 py-2 rounded-lg text-xs font-medium text-[#94A9C3] hover:text-[#F7FAFE] transition-colors cursor-pointer"
            >
              Edit answers
            </button>

            <button
              type="button"
              onClick={onResetToNewIdea}
              className="px-3 py-2 rounded-lg text-xs font-medium text-[#94A9C3] hover:text-[#F7FAFE] transition-colors cursor-pointer"
            >
              New idea
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 sm:gap-6 border-t border-[#173B63] overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#94A9C3] hover:text-[#F7FAFE]'
            }`}
          >
            Overview & Viability
          </button>
          <button
            onClick={() => setActiveTab('criteria')}
            className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'criteria'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#94A9C3] hover:text-[#F7FAFE]'
            }`}
          >
            Criteria Breakdown (6)
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'market'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#94A9C3] hover:text-[#F7FAFE]'
            }`}
          >
            Market, Customer & Risks
          </button>
          <button
            onClick={() => setActiveTab('experiments')}
            className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'experiments'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#94A9C3] hover:text-[#F7FAFE]'
            }`}
          >
            Validation Experiments ({report.validationExperiments.length})
          </button>
          <button
            onClick={() => setActiveTab('action_plan')}
            className={`py-3 px-1 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'action_plan'
                ? 'border-[#3B82F6] text-[#3B82F6]'
                : 'border-transparent text-[#94A9C3] hover:text-[#F7FAFE]'
            }`}
          >
            Action Plan & Recommendation
          </button>
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: OVERVIEW & SCORE */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top KPIs: Overall Viability + Confidence + Strategic Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Viability Gauge Card */}
              <div className="md:col-span-5 bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#94A9C3] mb-4">
                    <span className="font-semibold uppercase tracking-wider text-[#3B82F6]">
                      SharkMind Viability Index
                    </span>
                    <span className="font-mono">Mathematical Weights</span>
                  </div>

                  <div className="flex items-baseline gap-3 my-2">
                    <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight tabular-nums text-[#F7FAFE]">
                      {overallScore}
                    </div>
                    <div className="text-base text-[#94A9C3] font-mono">/100</div>
                    <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ml-auto ${getScoreBadgeBg(overallScore)}`}>
                      {getScoreLabel(overallScore)}
                    </span>
                  </div>

                  <div className="w-full bg-[#071A33] h-2.5 rounded-full overflow-hidden my-4 border border-[#173B63]">
                    <div
                      className="bg-gradient-to-r from-[#1E4A7D] via-[#38BDF8] to-[#3B82F6] h-full rounded-full transition-all duration-700"
                      style={{ width: `${overallScore}%` }}
                    />
                  </div>

                  <p className="text-xs text-[#94A9C3] leading-relaxed">
                    Calculated mathematically through the weighted sum of 6 core validation pillars.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#173B63] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#94A9C3]">Confidence Level: </span>
                    <span className="font-bold text-[#F7FAFE]">
                      {viability.confidenceLevel} ({viability.confidenceScore}%)
                    </span>
                  </div>
                  <span className="text-[11px] text-[#627D98]">Calibrated against empirical evidence</span>
                </div>
              </div>

              {/* Strategic Recommendation Spotlight Card */}
              <div className="md:col-span-7 bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
                      Primary Strategic Verdict
                    </span>
                    <span className="text-[#31577D]" aria-hidden="true">·</span>
                    <span className="text-xs text-amber-300 font-medium">Grounded Recommendation</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#F7FAFE] mt-1">
                    {report.finalRecommendation.category}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-[#DCEBFA] leading-relaxed">
                    {report.finalRecommendation.rationale}
                  </p>

                  <div className="mt-4 p-3.5 rounded-xl bg-[#071A33] border border-[#173B63] flex items-start gap-2.5">
                    <Target className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#F7FAFE]">
                      <span className="font-bold text-[#38BDF8]">Next critical step: </span>
                      {report.finalRecommendation.nextCriticalStep}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#173B63] flex items-center justify-between">
                  <span className="text-[11px] text-[#94A9C3]">
                    Questions regarding this strategic verdict?
                  </span>
                  <button
                    onClick={onOpenAdvisor}
                    className="text-xs font-semibold text-[#38BDF8] hover:text-[#60A5FA] flex items-center gap-1 cursor-pointer"
                  >
                    Ask AI Advisor <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Executive Summary Card */}
            <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 sm:p-8 shadow-xl">
              <h3 className="text-base font-bold text-[#F7FAFE] mb-3">
                Strategic Executive Summary
              </h3>
              <p className="text-xs sm:text-sm text-[#DCEBFA] leading-relaxed whitespace-pre-line">
                {report.executiveSummary}
              </p>
              <div className="mt-4 p-3 rounded-lg bg-[#071A33] text-[11px] text-[#94A9C3] border border-[#173B63] leading-relaxed">
                {viability.disclaimer}
              </div>
            </div>

            {/* 6 Criteria Quick Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#F7FAFE]">
                  6 Core Viability Pillars Breakdown
                </h3>
                <button
                  onClick={() => setActiveTab('criteria')}
                  className="text-xs text-[#38BDF8] font-semibold hover:underline cursor-pointer"
                >
                  View in-depth pillar analysis →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {viability.criteria.map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#0B2545] rounded-xl border border-[#173B63] p-4.5 shadow-sm hover:border-[#31577D] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-[#F7FAFE] line-clamp-1">
                        {c.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#38BDF8] shrink-0">
                        {c.score}<span className="text-[10px] text-[#94A9C3]">/100</span>
                      </span>
                    </div>

                    <div className="w-full bg-[#071A33] h-1.5 rounded-full overflow-hidden mb-2.5 border border-[#173B63]/60">
                      <div
                        className="bg-[#3B82F6] h-full rounded-full"
                        style={{ width: `${c.score}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#94A9C3] line-clamp-2 leading-relaxed">
                      {c.explanation}
                    </p>

                    <div className="mt-3 pt-2 border-t border-[#173B63]/80 flex items-center justify-between text-[10px] text-[#94A9C3]">
                      <span>Weight: {Math.round(c.weight * 100)}%</span>
                      <span className="text-[#38BDF8] font-medium truncate max-w-[150px]">
                        {c.mainUncertainty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Teaser for Recommended Experiments */}
            <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#F7FAFE]">
                    Priority Lean Validation Experiments
                  </h3>
                  <p className="text-xs text-[#94A9C3] mt-0.5">
                    Engineered to de-risk assumptions before engineering code or committing capital.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('experiments')}
                  className="text-xs font-semibold text-[#F7FAFE] bg-[#173B63] hover:bg-[#1E4A7D] border border-[#31577D] px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  View full protocols
                </button>
              </div>

              <div className="space-y-3">
                {report.validationExperiments.slice(0, 3).map((exp, idx) => (
                  <div
                    key={exp.id || idx}
                    className="p-3.5 rounded-xl bg-[#071A33] border border-[#173B63] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#38BDF8] font-bold">EXP 0{idx + 1}</span>
                        <span className="font-bold text-[#F7FAFE]">{exp.name}</span>
                        <span className="text-[11px] text-[#94A9C3] hidden md:inline">({exp.type})</span>
                      </div>
                      <p className="text-[#94A9C3] mt-1 line-clamp-1">
                        <span className="font-medium text-[#DCEBFA]">Hypothesis: </span>
                        {exp.hypothesis}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-[11px]">
                      <span className="text-[#F7FAFE] font-semibold bg-[#0B2545] px-2 py-1 rounded border border-[#173B63]">
                        Target: {exp.suggestedThreshold}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED CRITERIA BREAKDOWN */}
        {activeTab === 'criteria' && (
          <div className="space-y-6">
            <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl">
              <h2 className="text-lg font-bold text-[#F7FAFE]">
                Detailed Analysis of the 6 Viability Pillars
              </h2>
              <p className="text-xs text-[#94A9C3] mt-1">
                The overall score ({overallScore}/100) is mathematically calculated by multiplying each individual pillar by its predefined weight.
              </p>
            </div>

            <div className="space-y-4">
              {viability.criteria.map((criterion, idx) => (
                <div
                  key={criterion.id || idx}
                  className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#173B63]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#3B82F6] font-bold">
                          PILLAR 0{idx + 1}
                        </span>
                        <span className="text-xs text-[#94A9C3]">· Weight: {Math.round(criterion.weight * 100)}%</span>
                      </div>
                      <h3 className="text-base font-bold text-[#F7FAFE] mt-1">
                        {criterion.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-black font-mono text-[#F7FAFE] tabular-nums">
                          {criterion.score}<span className="text-xs text-[#94A9C3]">/100</span>
                        </div>
                        <div className="text-[10px] text-[#94A9C3]">
                          Contribution: {(criterion.score * criterion.weight).toFixed(1)} pts
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Criteria details grid */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-semibold text-white">Diagnosis & Assessment:</span>
                      <p className="text-[#94A9C3] mt-1 leading-relaxed">
                        {criterion.explanation}
                      </p>

                      <div className="mt-3">
                        <span className="font-semibold text-white">Supporting Evidence:</span>
                        <p className="text-[#94A9C3] mt-1 leading-relaxed">
                          {criterion.supportingInfo}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#071A33] p-4 rounded-xl border border-[#173B63] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Primary Uncertainty / Assumption:</span>
                        </div>
                        <p className="text-[#94A9C3] leading-relaxed">
                          {criterion.mainUncertainty}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#173B63]">
                        <div className="flex items-center gap-1.5 text-[#38BDF8] font-semibold mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Recommended Action:</span>
                        </div>
                        <p className="text-[#94A9C3] leading-relaxed">
                          {criterion.recommendedImprovement}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MARKET, CUSTOMER & RISKS */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            {/* Problem & Customer */}
            <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl">
              <h3 className="text-base font-bold text-[#F7FAFE] mb-4">
                Problem & Target Customer Persona
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="font-semibold text-white">Problem Urgency & Gravity:</span>
                  <p className="text-[#94A9C3] mt-1 leading-relaxed">
                    {report.problemAndCustomer.problemUrgency}
                  </p>

                  <div className="mt-4">
                    <span className="font-semibold text-white">Target Persona Profile:</span>
                    <p className="text-[#94A9C3] mt-1 leading-relaxed">
                      {report.problemAndCustomer.customerPersona}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-white">Current Alternatives in Use:</span>
                  <p className="text-[#94A9C3] mt-1 leading-relaxed">
                    {report.problemAndCustomer.currentAlternatives}
                  </p>

                  <div className="mt-4">
                    <span className="font-semibold text-white">Critical Pain Points:</span>
                    <ul className="mt-1 space-y-1 text-[#94A9C3]">
                      {report.problemAndCustomer.painPoints.map((pain, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#3B82F6] font-bold">·</span>
                          <span>{pain}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Market & Competitors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl">
                <h3 className="text-base font-bold text-[#F7FAFE] mb-3">
                  Market Opportunity
                </h3>
                <p className="text-xs text-[#94A9C3] leading-relaxed">
                  {report.marketOpportunity.marketDynamics}
                </p>

                <div className="mt-4 p-3.5 rounded-xl bg-[#071A33] border border-[#173B63] text-xs">
                  <span className="font-semibold text-white">Core Market Hypothesis:</span>
                  <p className="text-[#94A9C3] mt-1">
                    {report.marketOpportunity.marketHypothesis}
                  </p>
                </div>

                <div className="mt-4">
                  <span className="text-xs font-semibold text-white">What to Investigate in the Field:</span>
                  <ul className="mt-1 space-y-1.5 text-xs text-[#94A9C3]">
                    {report.marketOpportunity.whatToInvestigate.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#38BDF8] font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl">
                <h3 className="text-base font-bold text-[#F7FAFE] mb-3">
                  Competitors & Defensible Moat
                </h3>

                <div className="text-xs">
                  <span className="font-semibold text-white">Direct & Indirect Competitors:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {report.competitorAnalysis.directAndIndirectCompetitors.map((comp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-[#071A33] border border-[#173B63] text-[#DCEBFA] text-[11px]"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-xs">
                  <span className="font-semibold text-white">Unfair Advantage / Defensible Moat:</span>
                  <p className="text-[#94A9C3] mt-1 leading-relaxed">
                    {report.competitorAnalysis.unfairAdvantageOrMoat}
                  </p>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-[#071A33] border border-[#173B63] text-xs">
                  <span className="font-semibold text-white">Positioning Strategy:</span>
                  <p className="text-[#94A9C3] mt-1">
                    {report.competitorAnalysis.positioningNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Model & Value Proposition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl">
                <h3 className="text-base font-bold text-[#F7FAFE] mb-3">
                  Value Proposition & Core Benefits
                </h3>
                <p className="text-xs text-[#DCEBFA] font-medium leading-relaxed">
                  {report.valueProposition.coreValue}
                </p>

                <div className="mt-4 text-xs">
                  <span className="font-semibold text-white">Why Now:</span>
                  <p className="text-[#94A9C3] mt-1">
                    {report.valueProposition.whyNow}
                  </p>
                </div>

                <div className="mt-4">
                  <span className="text-xs font-semibold text-white">Tangible Customer Benefits:</span>
                  <ul className="mt-1 space-y-1 text-xs text-[#94A9C3]">
                    {report.valueProposition.keyBenefits.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl">
                <h3 className="text-base font-bold text-[#F7FAFE] mb-3">
                  Business Model & Monetization
                </h3>

                <div className="text-xs">
                  <span className="font-semibold text-white">Revenue Streams:</span>
                  <ul className="mt-1 space-y-1 text-[#94A9C3]">
                    {report.businessModel.revenueStreams.map((stream, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#3B82F6] font-bold">·</span>
                        <span>{stream}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 text-xs">
                  <span className="font-semibold text-white">Primary Cost Drivers:</span>
                  <ul className="mt-1 space-y-1 text-[#94A9C3]">
                    {report.businessModel.costDrivers.map((cost, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">·</span>
                        <span>{cost}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-[#071A33] border border-[#173B63] text-xs">
                  <span className="font-semibold text-white">Pricing Hypothesis:</span>
                  <p className="text-[#94A9C3] mt-1">
                    {report.businessModel.pricingHypothesis}
                  </p>
                </div>
              </div>
            </div>

            {/* Risks & Weaknesses */}
            <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl">
              <h3 className="text-base font-bold text-[#F7FAFE] mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Identified Venture Risks & Mitigation Strategies</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {report.risksAndWeaknesses.map((risk, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#173B63] bg-[#071A33] text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[#F7FAFE]">{risk.title}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          risk.severity === 'High' || risk.severity === 'Alta'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : risk.severity === 'Medium' || risk.severity === 'Media'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-900 text-slate-300 border border-slate-700'
                        }`}
                      >
                        Severity: {risk.severity}
                      </span>
                    </div>
                    <p className="text-[#94A9C3] leading-relaxed">
                      <span className="font-medium text-white">Mitigation plan: </span>
                      {risk.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VALIDATION EXPERIMENTS */}
        {activeTab === 'experiments' && (
          <div className="space-y-6">
            <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#F7FAFE]">
                    Tailored Lean Validation Experiment Protocols
                  </h2>
                  <p className="text-xs text-[#94A9C3] mt-1">
                    Each experiment tests a foundational hypothesis with objective success metrics and predefined decision thresholds.
                  </p>
                </div>
                <div className="text-xs font-mono bg-[#071A33] border border-[#173B63] px-3 py-1.5 rounded-lg text-[#38BDF8]">
                  Total: {report.validationExperiments.length} ready experiments
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {report.validationExperiments.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl"
                >
                  {/* Top Bar of Experiment */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#173B63]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#3B82F6]">
                          EXPERIMENT 0{idx + 1}
                        </span>
                        <span className="text-[#31577D]">·</span>
                        <span className="text-xs font-medium text-[#94A9C3]">{exp.type}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#F7FAFE] mt-1">
                        {exp.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-[#F7FAFE] bg-[#071A33] border border-[#173B63] px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#3B82F6]" />
                        {exp.estimatedDuration}
                      </span>
                      <span className="text-xs font-medium text-[#F7FAFE] bg-[#071A33] border border-[#173B63] px-2.5 py-1 rounded-md flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        {exp.estimatedCost}
                      </span>
                    </div>
                  </div>

                  {/* Core Hypothesis & Audience */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#071A33] border border-[#173B63]">
                      <span className="font-semibold text-white">Core Hypothesis:</span>
                      <p className="text-[#38BDF8] mt-1 font-medium leading-relaxed">
                        "{exp.hypothesis}"
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#071A33] border border-[#173B63]">
                      <span className="font-semibold text-white">Target Participants:</span>
                      <p className="text-[#94A9C3] mt-1 leading-relaxed">
                        {exp.targetParticipants}
                      </p>
                    </div>
                  </div>

                  {/* Execution Steps */}
                  <div className="mt-5 text-xs">
                    <span className="font-semibold text-white block mb-2">
                      Step-by-step execution protocol:
                    </span>
                    <ol className="space-y-1.5 list-decimal list-inside text-[#94A9C3] pl-1">
                      {exp.steps.map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          <span className="text-[#F7FAFE]">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Metrics and Decision Rule */}
                  <div className="mt-5 pt-4 border-t border-[#173B63] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[#94A9C3] block">Success Metric</span>
                      <span className="font-semibold text-[#F7FAFE] mt-0.5 block">
                        {exp.successMetric}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#94A9C3] block">Passing Threshold</span>
                      <span className="font-semibold text-[#38BDF8] font-mono mt-0.5 block">
                        {exp.suggestedThreshold}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#94A9C3] block">Decision Rule</span>
                      <span className="font-medium text-[#F7FAFE] mt-0.5 block">
                        {exp.decisionRule}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ACTION PLAN & FINAL RECOMMENDATION */}
        {activeTab === 'action_plan' && (
          <div className="space-y-6">
            {/* Recommendation banner */}
            <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 sm:p-8 shadow-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
                Strategic Direction
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F7FAFE] mt-1">
                {report.finalRecommendation.category}
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-[#DCEBFA] leading-relaxed">
                {report.finalRecommendation.rationale}
              </p>

              <div className="mt-5 p-4 rounded-xl bg-[#071A33] border border-[#173B63]">
                <div className="text-xs font-bold text-[#38BDF8] mb-1">
                  Immediate recommended shock action:
                </div>
                <p className="text-xs text-[#94A9C3] leading-relaxed">
                  {report.finalRecommendation.nextCriticalStep}
                </p>
              </div>
            </div>

            {/* Time Horizons Action Plan */}
            <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl">
              <h3 className="text-base font-bold text-[#F7FAFE] mb-6">
                Prioritized Action Plan Across Time Horizons
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 48 Hours */}
                <div className="p-5 rounded-xl border border-[#173B63] bg-[#071A33]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-md bg-[#3B82F6] text-white flex items-center justify-center text-xs font-mono font-bold">
                      1
                    </span>
                    <span className="font-bold text-xs text-[#F7FAFE] uppercase tracking-wide">
                      First 48 Hours
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#94A9C3]">
                    {report.actionPlan.first48Hours.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#38BDF8] font-bold shrink-0">→</span>
                        <span className="leading-relaxed">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 7 Days */}
                <div className="p-5 rounded-xl border border-[#173B63] bg-[#071A33]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-md bg-[#1E4A7D] text-[#38BDF8] border border-[#31577D] flex items-center justify-center text-xs font-mono font-bold">
                      2
                    </span>
                    <span className="font-bold text-xs text-[#F7FAFE] uppercase tracking-wide">
                      First 7 Days
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#94A9C3]">
                    {report.actionPlan.first7Days.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#38BDF8] font-bold shrink-0">→</span>
                        <span className="leading-relaxed">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 30 Days */}
                <div className="p-5 rounded-xl border border-[#173B63] bg-[#071A33]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-md bg-[#173B63] text-white flex items-center justify-center text-xs font-mono font-bold">
                      3
                    </span>
                    <span className="font-bold text-xs text-[#F7FAFE] uppercase tracking-wide">
                      First 30 Days
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-[#94A9C3]">
                    {report.actionPlan.first30Days.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#38BDF8] font-bold shrink-0">→</span>
                        <span className="leading-relaxed">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Floating Bar to Advisor */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B2545] via-[#173B63] to-[#0B2545] border border-[#31577D] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <h4 className="text-base font-bold">
                  Need tactical assistance executing this action plan?
                </h4>
                <p className="text-xs text-[#DCEBFA] mt-0.5">
                  SharkMind AI Strategic Advisor is loaded with your report data and can draft outreach copy, customer interview scripts, and pricing calculations.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenAdvisor}
                className="px-5 py-2.5 rounded-lg bg-[#3B82F6] text-white text-xs font-bold hover:bg-[#2563EB] transition-colors whitespace-nowrap shrink-0 shadow-md cursor-pointer"
              >
                Open SharkMind Advisor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
