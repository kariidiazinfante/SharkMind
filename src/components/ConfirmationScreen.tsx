import React, { useState } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Check,
} from 'lucide-react';
import type { ConfirmedSummary } from '../types/sharkmind';

interface ConfirmationScreenProps {
  summary: ConfirmedSummary;
  onUpdateSummary: (updated: ConfirmedSummary) => void;
  onConfirmAndGenerateReport: () => void;
  onBackToInterview: () => void;
  isLoading: boolean;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  summary,
  onUpdateSummary,
  onConfirmAndGenerateReport,
  onBackToInterview,
  isLoading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<ConfirmedSummary>({ ...summary });

  const handleSaveDraft = () => {
    onUpdateSummary(draft);
    setIsEditing(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#071A33] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-[#F7FAFE]">
      <div className="max-w-4xl mx-auto">
        {/* Navigation header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={onBackToInterview}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#94A9C3] hover:text-[#F7FAFE] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to interview</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#3B82F6] font-semibold">
              Step 4 of 5 · Pre-Report Confirmation
            </span>
          </div>
        </div>

        {/* Header & Reassurance */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7FAFE] tracking-tight">
                Startup Idea Confirmation
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#94A9C3]">
                Review how SharkMind structured your venture. You can edit any section before generating your definitive validation report.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  handleSaveDraft();
                } else {
                  setDraft({ ...summary });
                  setIsEditing(true);
                }
              }}
              className="px-3.5 py-1.5 rounded-lg border border-[#31577D] bg-[#0B2545] text-xs font-medium text-[#DCEBFA] hover:bg-[#173B63] hover:text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {isEditing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save changes</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Edit synthesis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Structured Synthesis Cards */}
        <div className="space-y-4">
          {/* Concept & Problem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0B2545] rounded-xl border border-[#173B63] p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6] mb-1.5">
                Business Concept
              </div>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={draft.businessConcept}
                  onChange={(e) => setDraft({ ...draft, businessConcept: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#31577D] bg-[#071A33] text-[#F7FAFE]"
                />
              ) : (
                <p className="text-sm font-medium text-[#F7FAFE] leading-relaxed">
                  {summary.businessConcept}
                </p>
              )}
            </div>

            <div className="bg-[#0B2545] rounded-xl border border-[#173B63] p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6] mb-1.5">
                Core Problem Solved
              </div>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={draft.problem}
                  onChange={(e) => setDraft({ ...draft, problem: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#31577D] bg-[#071A33] text-[#F7FAFE]"
                />
              ) : (
                <p className="text-sm font-medium text-[#F7FAFE] leading-relaxed">
                  {summary.problem}
                </p>
              )}
            </div>
          </div>

          {/* Customer & Solution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0B2545] rounded-xl border border-[#173B63] p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6] mb-1.5">
                Specific Target Customer
              </div>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={draft.targetCustomer}
                  onChange={(e) => setDraft({ ...draft, targetCustomer: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#31577D] bg-[#071A33] text-[#F7FAFE]"
                />
              ) : (
                <p className="text-xs text-[#DCEBFA] leading-relaxed">
                  {summary.targetCustomer}
                </p>
              )}
            </div>

            <div className="bg-[#0B2545] rounded-xl border border-[#173B63] p-5 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6] mb-1.5">
                Solution & Value Proposition
              </div>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={draft.solution}
                  onChange={(e) => setDraft({ ...draft, solution: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#31577D] bg-[#071A33] text-[#F7FAFE]"
                />
              ) : (
                <p className="text-xs text-[#DCEBFA] leading-relaxed">
                  {summary.solution}
                </p>
              )}
            </div>
          </div>

          {/* Business Model */}
          <div className="bg-[#0B2545] rounded-xl border border-[#173B63] p-5 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6] mb-1.5">
              Monetization & Business Model Mechanism
            </div>
            {isEditing ? (
              <textarea
                rows={2}
                value={draft.potentialBusinessModel}
                onChange={(e) => setDraft({ ...draft, potentialBusinessModel: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-[#31577D] bg-[#071A33] text-[#F7FAFE]"
              />
            ) : (
              <p className="text-xs text-[#DCEBFA] leading-relaxed">
                {summary.potentialBusinessModel}
              </p>
            )}
          </div>

          {/* Assumptions & Unknowns side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0B2545] rounded-xl border border-[#173B63] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-[#F7FAFE] font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Key Assumptions to Validate</span>
              </div>
              <ul className="space-y-2 mt-2">
                {summary.mainAssumptions.map((item, idx) => (
                  <li key={idx} className="text-xs text-[#94A9C3] flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0B2545] rounded-xl border border-[#173B63] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-[#F7FAFE] font-semibold text-xs">
                <HelpCircle className="w-4 h-4 text-[#3B82F6] shrink-0" />
                <span>Current Information Gaps</span>
              </div>
              <ul className="space-y-2 mt-2">
                {summary.unknownInformation.map((item, idx) => (
                  <li key={idx} className="text-xs text-[#94A9C3] flex items-start gap-2">
                    <span className="text-[#3B82F6] font-bold shrink-0">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Call to action card */}
        <div className="mt-8 bg-[#0B2545] rounded-2xl border border-[#173B63] p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-[#F7FAFE]">
              Does this synthesis accurately reflect your vision?
            </div>
            <p className="text-xs text-[#94A9C3] mt-0.5">
              Upon confirmation, SharkMind will calculate the weighted viability score, evaluate risks, and design your lean validation experiments.
            </p>
          </div>

          <button
            type="button"
            onClick={onConfirmAndGenerateReport}
            disabled={isLoading}
            className="w-full sm:w-auto px-7 py-3 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 group cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating full report...</span>
              </>
            ) : (
              <>
                <span>Generate my SharkMind report</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
