import React, { useEffect, useState } from 'react';
import { SharkLogo } from './SharkLogo';
import { Compass } from 'lucide-react';

interface DiscoveryLoadingProps {
  ideaSnippet: string;
}

const DISCOVERY_STEPS = [
  'Initializing SharkMind discovery engine...',
  'Evaluating dimensions: Problem, Customer & Value Proposition...',
  'Analyzing operational feasibility, monetization & market...',
  'Classifying data into Known facts, Inferences, and Unknown gaps...',
  'Formulating personalized strategic interview questions...',
];

export const DiscoveryLoadingScreen: React.FC<DiscoveryLoadingProps> = ({ ideaSnippet }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev < DISCOVERY_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#071A33] flex items-center justify-center p-4 text-[#F7FAFE]">
      <div className="max-w-lg w-full bg-[#0B2545] rounded-2xl border border-[#173B63] p-8 shadow-2xl text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#173B63] via-[#0B2545] to-[#3B82F6] flex items-center justify-center text-white shadow-lg mb-6 ring-1 ring-[#3B82F6]/30 animate-pulse">
          <Compass className="w-7 h-7 text-[#38BDF8]" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
          Initial Discovery Diagnosis
        </span>

        <h2 className="text-xl font-bold text-[#F7FAFE] mt-1 mb-2">
          Analyzing 13 Strategic Dimensions
        </h2>

        <p className="text-xs text-[#94A9C3] mb-6 line-clamp-2 italic max-w-sm mx-auto">
          "{ideaSnippet}"
        </p>

        {/* Progress bar */}
        <div className="w-full bg-[#071A33] h-1.5 rounded-full overflow-hidden mb-6 border border-[#173B63]">
          <div
            className="bg-[#3B82F6] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (currentStepIdx + 1) * 22)}%` }}
          />
        </div>

        {/* Active step display */}
        <div className="p-3.5 rounded-xl bg-[#071A33] border border-[#173B63] text-xs text-[#DCEBFA] flex items-center justify-center gap-2.5">
          <div className="w-3.5 h-3.5 border-2 border-[#38BDF8]/30 border-t-[#38BDF8] rounded-full animate-spin shrink-0" />
          <span className="font-medium">{DISCOVERY_STEPS[currentStepIdx]}</span>
        </div>
      </div>
    </div>
  );
};

interface ReportLoadingProps {
  ideaTitle: string;
}

const REPORT_STEPS = [
  'Processing strategic interview responses...',
  'Calculating mathematical weighted score across 6 pillars...',
  'Auditing risks, assumptions, and defensible moats...',
  'Engineering 3 to 5 tailored validation experiments...',
  'Consolidating prioritized action plan for 48h, 7d, and 30d...',
];

export const ReportLoadingScreen: React.FC<ReportLoadingProps> = ({ ideaTitle }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev < REPORT_STEPS.length - 1 ? prev + 1 : prev));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#071A33] flex items-center justify-center p-4 text-[#F7FAFE]">
      <div className="max-w-lg w-full bg-[#0B2545] rounded-2xl border border-[#173B63] p-8 shadow-2xl text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#173B63] via-[#0B2545] to-[#3B82F6] flex items-center justify-center text-white shadow-lg mb-6 ring-1 ring-[#3B82F6]/30 animate-pulse">
          <SharkLogo size="md" withText={false} monochrome={false} />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]">
          Generating Definitive Report
        </span>

        <h2 className="text-xl font-bold text-[#F7FAFE] mt-1 mb-2">
          Evaluating Viability & Lean Experiments
        </h2>

        <p className="text-xs text-[#94A9C3] mb-6 truncate max-w-sm mx-auto">
          Venture: <span className="font-semibold text-[#F7FAFE]">{ideaTitle || 'Your Startup'}</span>
        </p>

        {/* Progress bar */}
        <div className="w-full bg-[#071A33] h-1.5 rounded-full overflow-hidden mb-6 border border-[#173B63]">
          <div
            className="bg-[#3B82F6] h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (currentStepIdx + 1) * 22)}%` }}
          />
        </div>

        {/* Active step display */}
        <div className="p-3.5 rounded-xl bg-[#071A33] border border-[#173B63] text-xs text-[#DCEBFA] flex items-center justify-center gap-2.5">
          <div className="w-3.5 h-3.5 border-2 border-[#38BDF8]/30 border-t-[#38BDF8] rounded-full animate-spin shrink-0" />
          <span className="font-medium">{REPORT_STEPS[currentStepIdx]}</span>
        </div>
      </div>
    </div>
  );
};
