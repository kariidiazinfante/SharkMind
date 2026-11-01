import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { InterviewScreen } from './components/InterviewScreen';
import { ConfirmationScreen } from './components/ConfirmationScreen';
import { ReportDashboard } from './components/ReportDashboard';
import { AdvisorChat } from './components/AdvisorChat';
import { ExportModal } from './components/ExportModal';
import { DiscoveryLoadingScreen, ReportLoadingScreen } from './components/LoadingScreens';
import type {
  AppScreen,
  DiscoveryAnalysis,
  InterviewQuestion,
  ConfirmedSummary,
  ValidationReport,
} from './types/sharkmind';

const STORAGE_VERSION_KEY = 'sharkmind_lang_version_v5_en';

const STORAGE_KEYS = {
  IDEA: 'sharkmind_idea_description_en',
  ANALYSIS: 'sharkmind_discovery_analysis_en',
  QUESTIONS: 'sharkmind_interview_questions_en',
  ANSWERS: 'sharkmind_interview_answers_en',
  SUMMARY: 'sharkmind_confirmed_summary_en',
  REPORT: 'sharkmind_validation_report_en',
  SCREEN: 'sharkmind_current_screen_en',
};

const hasSpanishIndicators = (str: string): boolean => {
  if (!str) return false;
  return (
    /[¿¡áéíóúÁÉÍÓÚñÑ]/.test(str) ||
    /\b(clínica|mantenimiento|sensores|precio|modelo|problema|solución|mercado|equipo|clientes|validación|suscripción|cobro|mensual|coste|costo|competencia|adquisición|cómo|cuál|quién|dónde|por qué|todavía|canal|canales)\b/i.test(str)
  );
};

// Auto-purge any stale legacy Spanish localStorage keys
try {
  const version = localStorage.getItem(STORAGE_VERSION_KEY);
  if (version !== 'v5_en') {
    // Purge old Spanish keys
    localStorage.removeItem('sharkmind_idea_description');
    localStorage.removeItem('sharkmind_discovery_analysis');
    localStorage.removeItem('sharkmind_interview_questions');
    localStorage.removeItem('sharkmind_interview_answers');
    localStorage.removeItem('sharkmind_confirmed_summary');
    localStorage.removeItem('sharkmind_validation_report');
    localStorage.removeItem('sharkmind_current_screen');
    localStorage.setItem(STORAGE_VERSION_KEY, 'v5_en');
  }
} catch (e) {
  console.warn('Storage purge error:', e);
}

export default function App() {
  // Application State with LocalStorage hydration
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCREEN);
      if (saved && ['HOME', 'INTERVIEW', 'CONFIRMATION', 'REPORT', 'ADVISOR'].includes(saved)) {
        return saved as AppScreen;
      }
    } catch (e) {}
    return 'HOME';
  });

  const [ideaDescription, setIdeaDescription] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IDEA);
      if (saved && !hasSpanishIndicators(saved)) {
        return saved;
      }
    } catch {}
    return '';
  });

  const [discoveryAnalysis, setDiscoveryAnalysis] = useState<DiscoveryAnalysis | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
      if (saved && !hasSpanishIndicators(saved)) {
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  const [questions, setQuestions] = useState<InterviewQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (saved && !hasSpanishIndicators(saved)) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANSWERS);
      if (saved && !hasSpanishIndicators(saved)) {
        return JSON.parse(saved);
      }
    } catch {}
    return {};
  });

  const [confirmedSummary, setConfirmedSummary] = useState<ConfirmedSummary | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUMMARY);
      if (saved && !hasSpanishIndicators(saved)) {
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  const [report, setReport] = useState<ValidationReport | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORT);
      if (saved && !hasSpanishIndicators(saved)) {
        return JSON.parse(saved);
      }
    } catch {}
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Sync state changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.IDEA, ideaDescription);
      if (currentScreen !== 'DISCOVERY_LOADING' && currentScreen !== 'REPORT_LOADING') {
        localStorage.setItem(STORAGE_KEYS.SCREEN, currentScreen);
      }
      if (discoveryAnalysis) {
        localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(discoveryAnalysis));
      }
      if (questions.length > 0) {
        localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
      }
      localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(interviewAnswers));
      if (confirmedSummary) {
        localStorage.setItem(STORAGE_KEYS.SUMMARY, JSON.stringify(confirmedSummary));
      }
      if (report) {
        localStorage.setItem(STORAGE_KEYS.REPORT, JSON.stringify(report));
      }
    } catch (e) {
      console.warn('Could not persist to LocalStorage:', e);
    }
  }, [
    ideaDescription,
    currentScreen,
    discoveryAnalysis,
    questions,
    interviewAnswers,
    confirmedSummary,
    report,
  ]);

  // Reset all state to start fresh
  const handleReset = () => {
    if (
      report &&
      !window.confirm(
        'Start a new analysis? Your current report is saved locally, but you will return to the initial screen.'
      )
    ) {
      return;
    }
    setIdeaDescription('');
    setDiscoveryAnalysis(null);
    setQuestions([]);
    setInterviewAnswers({});
    setConfirmedSummary(null);
    setReport(null);
    setCurrentScreen('HOME');
    try {
      localStorage.removeItem(STORAGE_KEYS.IDEA);
      localStorage.removeItem(STORAGE_KEYS.ANALYSIS);
      localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
      localStorage.removeItem(STORAGE_KEYS.ANSWERS);
      localStorage.removeItem(STORAGE_KEYS.SUMMARY);
      localStorage.removeItem(STORAGE_KEYS.REPORT);
      localStorage.setItem(STORAGE_KEYS.SCREEN, 'HOME');
    } catch (e) {}
  };

  // 1. Submit initial idea -> Call Discovery Engine
  const handleSubmitIdea = async () => {
    if (!ideaDescription.trim() || ideaDescription.length < 30) {
      setErrorMessage('Please provide a more detailed description (minimum 30 characters).');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    setCurrentScreen('DISCOVERY_LOADING');

    try {
      const res = await fetch('/api/analyze-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaDescription }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server connection error.');
      }

      const data = await res.json();
      setDiscoveryAnalysis(data.analysis);
      setQuestions(data.questions || []);
      setCurrentScreen('INTERVIEW');
    } catch (err: any) {
      console.error('Submit idea error:', err);
      setErrorMessage(err.message || 'An error occurred while analyzing the idea with AI. Please retry.');
      setCurrentScreen('HOME');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Update answer in interview
  const handleUpdateAnswer = (questionId: string, answer: string) => {
    setInterviewAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // 3. Complete interview -> Generate summary for confirmation
  const handleFinishInterview = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaDescription,
          interviewAnswers,
          discoveryAnalysis,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error generating synthesis.');
      }

      const data = await res.json();
      setConfirmedSummary(data.summary);
      setCurrentScreen('CONFIRMATION');
    } catch (err: any) {
      console.error('Summary error:', err);
      setErrorMessage(err.message || 'Error synthesizing responses. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Confirm summary -> Generate final validation report
  const handleConfirmAndGenerateReport = async () => {
    if (!confirmedSummary) return;

    setIsLoading(true);
    setErrorMessage(null);
    setCurrentScreen('REPORT_LOADING');

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaDescription,
          interviewAnswers,
          confirmedSummary,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error generating validation report with AI.');
      }

      const data = await res.json();
      setReport(data.report);
      setCurrentScreen('REPORT');
    } catch (err: any) {
      console.error('Report generation error:', err);
      setErrorMessage(err.message || 'Error generating report. Please retry.');
      setCurrentScreen('CONFIRMATION');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#071A33] text-[#F7FAFE] flex flex-col font-sans selection:bg-[#3B82F6] selection:text-white">
      {/* Top Bar following Top Bar Contract */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        hasReport={!!report}
        onReset={handleReset}
        onScrollToSection={handleScrollToSection}
      />

      {/* Screen Router */}
      <main className="flex-1">
        {currentScreen === 'HOME' && (
          <HomeScreen
            ideaDescription={ideaDescription}
            setIdeaDescription={setIdeaDescription}
            onSubmitIdea={handleSubmitIdea}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {currentScreen === 'DISCOVERY_LOADING' && (
          <DiscoveryLoadingScreen ideaSnippet={ideaDescription} />
        )}

        {currentScreen === 'INTERVIEW' && (
          <InterviewScreen
            questions={questions}
            discoveryAnalysis={discoveryAnalysis}
            answers={interviewAnswers}
            onUpdateAnswer={handleUpdateAnswer}
            onFinishInterview={handleFinishInterview}
            onBackToHome={() => setCurrentScreen('HOME')}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {currentScreen === 'CONFIRMATION' && confirmedSummary && (
          <ConfirmationScreen
            summary={confirmedSummary}
            onUpdateSummary={(updated) => setConfirmedSummary(updated)}
            onConfirmAndGenerateReport={handleConfirmAndGenerateReport}
            onBackToInterview={() => setCurrentScreen('INTERVIEW')}
            isLoading={isLoading}
          />
        )}

        {currentScreen === 'REPORT_LOADING' && (
          <ReportLoadingScreen
            ideaTitle={confirmedSummary?.businessConcept || ideaDescription.slice(0, 40)}
          />
        )}

        {currentScreen === 'REPORT' && report && (
          <ReportDashboard
            report={report}
            onOpenAdvisor={() => setCurrentScreen('ADVISOR')}
            onOpenExport={() => setIsExportOpen(true)}
            onBackToInterview={() => setCurrentScreen('INTERVIEW')}
            onResetToNewIdea={handleReset}
          />
        )}

        {currentScreen === 'ADVISOR' && report && (
          <AdvisorChat
            report={report}
            confirmedSummary={confirmedSummary}
            ideaDescription={ideaDescription}
            interviewAnswers={interviewAnswers}
            onBackToReport={() => setCurrentScreen('REPORT')}
          />
        )}
      </main>

      {/* Printable / Downloadable Export Modal */}
      {report && (
        <ExportModal
          report={report}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="no-print bg-[#0B2545] border-t border-[#173B63] py-8 text-xs text-[#94A9C3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F7FAFE]">SHARKMIND</span>
            <span>·</span>
            <span>Turn ideas into validated opportunities</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Validate before investing</span>
            <span>·</span>
            <span className="text-[11px] text-[#38BDF8]">
              Powered by Gemini AI Engine
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
