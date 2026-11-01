import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface HomeScreenProps {
  ideaDescription: string;
  setIdeaDescription: (val: string) => void;
  onSubmitIdea: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

const SAMPLE_IDEAS = [
  {
    title: 'Dental Clinic Predictive IoT & SaaS',
    tag: 'Dental IoT',
    text: 'We want to build an IoT + SaaS predictive maintenance platform for dental practices that monitors the real-time condition, vibration, and thermal load of dental chairs, air compressors, and autoclave sterilizers. The problem is that when a compressor breaks down on a Tuesday morning, a dental clinic loses up to $3,500 in canceled patient appointments on that single day. Our plug-and-play smart sensors attach to the power line of the equipment, detect acoustic and thermal anomalies before failure, and dispatch proactive alerts to certified local maintenance technicians. We would charge a monthly subscription of $79 per clinic with 3 sensors included.',
  },
  {
    title: 'B2B Surplus Produce Marketplace',
    tag: 'Agro Surplus',
    text: 'A digital B2B marketplace connecting local agricultural cooperatives directly with nearby commercial kitchens, restaurants, and bakeries to sell seasonal grade-2 produce (aesthetically imperfect but nutritionally top-tier). Farmers currently discard up to 25% of their yield because it does not meet supermarket cosmetic specs, losing revenue and margins. We provide 24-hour pooled logistics, consolidated invoicing, and a real-time daily surplus inventory feed. We monetize with a 12% transaction fee on completed orders.',
  },
  {
    title: 'ESG Compliance Automation for Industrial SMBs',
    tag: 'SaaS ESG',
    text: 'A web software tailored for mid-sized industrial manufacturers (25 to 150 employees) that must report European sustainability directives (CSRD) and supply chain footprints. Traditional auditing consultants charge $15,000 to $30,000 per annual audit, which is prohibitive for small factories. Our software connects to their existing ERP, ingests utility bills, freight logs, and employee commutes, and automatically generates audit-ready carbon footprint metrics and disclosure packets for banks and regulators for $249/month.',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  ideaDescription,
  setIdeaDescription,
  onSubmitIdea,
  isLoading,
  errorMessage,
}) => {
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number | null>(null);
  const minLength = 30;
  const maxLength = 4000;
  const charCount = ideaDescription.length;
  const isValidLength = charCount >= minLength && charCount <= maxLength;

  const handleLoadSample = (index: number) => {
    setSelectedSampleIndex(index);
    setIdeaDescription(SAMPLE_IDEAS[index].text);
  };

  return (
    <div className="min-h-screen bg-[#071A33] text-[#F7FAFE]">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Subtle unboxed metadata kicker */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
            AI-Powered Startup Validation
          </span>
          <span className="text-[#31577D]" aria-hidden="true">·</span>
          <span className="text-xs font-medium text-[#94A9C3]">
            Strategy · Viability Scoring · Lean Experiments
          </span>
        </div>

        {/* Main Headline in English */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F7FAFE] max-w-4xl mx-auto leading-tight text-balance">
          Turn your idea into a real opportunity.
        </h1>

        {/* Supporting text */}
        <p className="mt-5 text-base sm:text-lg text-[#94A9C3] max-w-2xl mx-auto leading-relaxed">
          Discover your venture's true potential with AI. Analyze, question, and validate your next business before investing significant time or money.
        </p>

        {/* Primary Interactive Idea Input Card */}
        <div
          id="idea-form"
          className="mt-10 max-w-3xl mx-auto bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 sm:p-8 shadow-xl text-left transition-all"
        >
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <label
                htmlFor="idea-input"
                className="block text-base font-bold text-[#F7FAFE]"
              >
                Tell us about your idea
              </label>
              <p className="text-xs text-[#94A9C3] mt-0.5">
                Explain the problem you solve, who your customer is, and how your solution creates value.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs tabular-nums font-mono ${
                  charCount < minLength
                    ? 'text-amber-400'
                    : charCount > maxLength
                    ? 'text-red-400'
                    : 'text-[#94A9C3]'
                }`}
              >
                {charCount} / {maxLength}
              </span>
            </div>
          </div>

          <div className="relative">
            <textarea
              id="idea-input"
              rows={6}
              value={ideaDescription}
              onChange={(e) => setIdeaDescription(e.target.value)}
              placeholder="Describe what you want to build, what problem you solve, who would use it, how it would work, and any other details you consider important..."
              className="w-full p-4 rounded-xl border border-[#173B63] bg-[#071A33]/80 text-[#F7FAFE] placeholder-[#627D98] text-sm leading-relaxed focus:bg-[#071A33] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all resize-y min-h-[140px]"
            />
          </div>

          {/* Validation & Feedback */}
          {charCount > 0 && charCount < minLength && (
            <p className="mt-2 text-xs text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Please write at least {minLength - charCount} more characters to enable a thorough strategic evaluation.
            </p>
          )}

          {errorMessage && (
            <div className="mt-3 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#173B63]">
            {/* Quick Sample Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-[#94A9C3] mr-1">Or test a sample startup:</span>
              {SAMPLE_IDEAS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(idx)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    selectedSampleIndex === idx && ideaDescription === sample.text
                      ? 'bg-[#3B82F6] text-white font-medium shadow-xs'
                      : 'bg-[#173B63]/70 text-[#DCEBFA] hover:bg-[#1E4A7D] hover:text-white'
                  }`}
                >
                  {sample.tag}
                </button>
              ))}
            </div>

            {/* Primary Action Button */}
            <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
              {charCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIdeaDescription('');
                    setSelectedSampleIndex(null);
                  }}
                  className="px-3 py-2 text-xs text-[#94A9C3] hover:text-[#F7FAFE] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={onSubmitIdea}
                disabled={!isValidLength || isLoading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing idea...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze my idea</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-center text-[#94A9C3]">
            You don't need all the answers upfront. SharkMind will help you discover and structure them step by step.
          </p>
        </div>
      </section>

      {/* Philosophy banner */}
      <section className="border-y border-[#173B63] bg-[#0B2545]/60 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-[#DCEBFA]">
            The foundational principle of SharkMind:
            <span className="font-bold text-[#F7FAFE] ml-1">
              "Understand before evaluating. Validate before investing."
            </span>
          </p>
        </div>
      </section>

      {/* How it works / Methodology Section */}
      <section id="how-it-works" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
            Validation Framework
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#F7FAFE]">
            How SharkMind puts your business to the test
          </h2>
          <p className="mt-3 text-sm text-[#94A9C3]">
            Unlike generic business plan generators that hallucinate numbers, SharkMind rigorously interrogates internal consistency and isolates critical unknowns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-[#0B2545] rounded-xl border border-[#173B63] p-6 shadow-sm hover:border-[#31577D] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#071A33] border border-[#173B63] flex items-center justify-center text-[#3B82F6] mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-[#3B82F6] mb-1">01. Discovery Diagnosis</div>
            <h3 className="text-base font-bold text-[#F7FAFE] mb-2">
              13-Dimension Mapping
            </h3>
            <p className="text-xs text-[#94A9C3] leading-relaxed">
              We audit known facts, plausible inferences, and critical unknowns across problem, customer, monetization, defensibility, and operational feasibility.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0B2545] rounded-xl border border-[#173B63] p-6 shadow-sm hover:border-[#31577D] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#071A33] border border-[#173B63] flex items-center justify-center text-[#3B82F6] mb-4">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-[#3B82F6] mb-1">02. Strategic Inquiry</div>
            <h3 className="text-base font-bold text-[#F7FAFE] mb-2">
              Adaptive Interview
            </h3>
            <p className="text-xs text-[#94A9C3] leading-relaxed">
              Targeted questions crafted specifically for your venture's blind spots. Helps you stress-test customer alternatives, acquisition channels, and moats.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0B2545] rounded-xl border border-[#173B63] p-6 shadow-sm hover:border-[#31577D] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#071A33] border border-[#173B63] flex items-center justify-center text-[#3B82F6] mb-4">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-[#3B82F6] mb-1">03. Report & Experiments</div>
            <h3 className="text-base font-bold text-[#F7FAFE] mb-2">
              Viability Score & Execution
            </h3>
            <p className="text-xs text-[#94A9C3] leading-relaxed">
              Receive a mathematical viability score (0–100), empirical confidence level, tailored validation experiments with pass/fail metrics, and an active AI advisor.
            </p>
          </div>
        </div>
      </section>

      {/* Preview Section: Sample Dashboard Preview (clearly identified as example) */}
      <section id="example-preview" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 sm:p-10 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#173B63]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase bg-[#071A33] text-[#3B82F6] px-2 py-0.5 rounded border border-[#173B63]">
                  Interactive Demo Preview
                </span>
                <span className="text-xs text-[#94A9C3]">· Illustrative Sample</span>
              </div>
              <h3 className="text-xl font-bold text-[#F7FAFE] mt-2">
                Sample SharkMind Validation Dashboard
              </h3>
              <p className="text-xs text-[#94A9C3] mt-1">
                This is how your interactive report will be structured once you complete the interview with your real venture.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#071A33] p-3 rounded-xl border border-[#173B63]">
              <div className="text-right">
                <div className="text-xs text-[#94A9C3]">Viability Score</div>
                <div className="text-2xl font-black text-[#F7FAFE] font-mono tabular-nums">
                  78<span className="text-xs font-normal text-[#94A9C3]">/100</span>
                </div>
              </div>
              <div className="h-10 w-px bg-[#173B63]" />
              <div>
                <div className="text-xs text-[#94A9C3]">Empirical Confidence</div>
                <div className="text-sm font-bold text-[#3B82F6]">Medium · 65%</div>
              </div>
            </div>
          </div>

          {/* Sample metrics breakdown */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#071A33]/80 border border-[#173B63]">
              <div className="flex items-center justify-between text-xs text-[#94A9C3] mb-1">
                <span>Problem Clarity</span>
                <span className="font-mono font-semibold text-[#F7FAFE]">88/100 (20%)</span>
              </div>
              <div className="w-full bg-[#173B63] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#3B82F6] h-full rounded-full" style={{ width: '88%' }} />
              </div>
              <p className="text-[11px] text-[#94A9C3] mt-2">
                Urgent economic pain directly quantified in daily downtime loss.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#071A33]/80 border border-[#173B63]">
              <div className="flex items-center justify-between text-xs text-[#94A9C3] mb-1">
                <span>Evidence of Demand</span>
                <span className="font-mono font-semibold text-[#F7FAFE]">62/100 (20%)</span>
              </div>
              <div className="w-full bg-[#173B63] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#38BDF8] h-full rounded-full" style={{ width: '62%' }} />
              </div>
              <p className="text-[11px] text-[#94A9C3] mt-2">
                Requires confirming willingness-to-pay via 10 clinical director discovery interviews.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#071A33]/80 border border-[#173B63]">
              <div className="flex items-center justify-between text-xs text-[#94A9C3] mb-1">
                <span>Execution Feasibility</span>
                <span className="font-mono font-semibold text-[#F7FAFE]">82/100 (15%)</span>
              </div>
              <div className="w-full bg-[#173B63] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#3B82F6] h-full rounded-full" style={{ width: '82%' }} />
              </div>
              <p className="text-[11px] text-[#94A9C3] mt-2">
                Standard off-the-shelf sensor hardware with low marginal cloud deployment cost.
              </p>
            </div>
          </div>

          {/* Sample Experiment preview */}
          <div className="mt-6 p-4 rounded-xl bg-[#071A33] border border-[#173B63] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-[#3B82F6]">Recommended Validation Experiment #1</div>
              <div className="text-sm font-bold text-[#F7FAFE] mt-0.5">
                Smoke Test & LOI Campaign with 5 Local Dental Practices
              </div>
              <p className="text-xs text-[#94A9C3] mt-1">
                Success metric: Secure 3 signed non-binding Letters of Intent (LOIs) before custom fabrication.
              </p>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('idea-form');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-semibold text-[#3B82F6] hover:text-[#60A5FA] flex items-center gap-1 shrink-0 cursor-pointer"
            >
              Test with your idea <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Scientific Rigor notice */}
      <section id="methodology" className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center text-xs text-[#94A9C3]">
        <div className="flex items-center justify-center gap-2 mb-2 text-[#F7FAFE] font-semibold text-sm">
          <ShieldCheck className="w-4 h-4 text-[#3B82F6]" />
          <span>Strategic Candor Commitment</span>
        </div>
        <p className="leading-relaxed">
          SharkMind never manufactures fake market statistics or hallucinated market shares. When a business assumption requires empirical validation, we provide the exact lean testing methodology to verify it with real customers before you spend a dime.
        </p>
      </section>
    </div>
  );
};
