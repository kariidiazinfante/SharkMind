import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  ArrowLeft,
  Bot,
  User,
  AlertCircle,
  Copy,
  Check,
  Lightbulb,
} from 'lucide-react';
import type { ValidationReport, ConfirmedSummary, ChatMessage } from '../types/sharkmind';

interface AdvisorChatProps {
  report: ValidationReport;
  confirmedSummary: ConfirmedSummary | null;
  ideaDescription: string;
  interviewAnswers: Record<string, string>;
  onBackToReport: () => void;
}

const STARTER_PROMPTS = [
  'How do I acquire my first 5 to 10 customers without spending on ads?',
  'How can I reduce initial validation costs and launch faster?',
  'Which recommended experiment should I prioritize first?',
  'What exact questions should I ask in customer discovery interviews?',
  'How do I sharpen my value proposition to be irresistible?',
  'What pricing model or initial tier should I test first?',
];

export const AdvisorChat: React.FC<AdvisorChatProps> = ({
  report,
  confirmedSummary,
  ideaDescription,
  interviewAnswers,
  onBackToReport,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content: `Hello! I have thoroughly evaluated your venture "${report.ideaTitle}" (Viability: ${report.viability.overallScore}/100, Confidence: ${report.viability.confidenceLevel}). I have full context on your identified open assumptions, competitive risks, and the strategic verdict of "${report.finalRecommendation.category}".

What tactical or strategic dilemma would you like to work through right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/advisor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          context: {
            ideaDescription,
            confirmedSummary,
            interviewAnswers,
            report,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to communicate with AI advisor.');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: data.reply || 'I received your query. Would you like to dive deeper into any specific aspect?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Advisor chat error:', err);
      setErrorMessage(err.message || 'Could not retrieve response from AI advisor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#071A33] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 text-[#F7FAFE]">
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-7rem)] bg-[#0B2545] rounded-2xl border border-[#173B63] shadow-xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-[#173B63] bg-[#0B2545] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToReport}
              className="p-1.5 rounded-lg text-[#94A9C3] hover:text-[#F7FAFE] hover:bg-[#173B63] transition-colors cursor-pointer"
              title="Back to report"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#F7FAFE]">
                  SharkMind AI Strategic Advisor
                </span>
                <span className="text-xs text-[#38BDF8] font-mono">
                  · Viability {report.viability.overallScore}/100
                </span>
              </div>
              <p className="text-[11px] text-[#94A9C3] truncate max-w-sm sm:max-w-md">
                Grounded in: {report.ideaTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94A9C3] hidden sm:inline">
              Full venture context active
            </span>
            <button
              onClick={onBackToReport}
              className="px-3 py-1.5 rounded-lg border border-[#31577D] text-xs font-medium text-[#DCEBFA] hover:bg-[#173B63] transition-colors cursor-pointer"
            >
              View Report
            </button>
          </div>
        </div>

        {/* Chat Message Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#071A33]/70">
          {messages.map((msg) => {
            const isAssistant = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  isAssistant ? 'justify-start' : 'justify-end'
                }`}
              >
                {isAssistant && (
                  <div className="w-8 h-8 rounded-lg bg-[#173B63] border border-[#31577D] text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isAssistant
                      ? 'bg-[#0B2545] border border-[#173B63] text-[#F7FAFE] shadow-sm'
                      : 'bg-[#3B82F6] text-white shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>

                  <div
                    className={`mt-2 pt-1 flex items-center justify-between text-[10px] ${
                      isAssistant ? 'text-[#627D98]' : 'text-blue-200'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    {isAssistant && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {!isAssistant && (
                  <div className="w-8 h-8 rounded-lg bg-[#3B82F6] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#173B63] border border-[#31577D] text-[#38BDF8] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#0B2545] border border-[#173B63] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-[#94A9C3]">
                  <div className="w-3.5 h-3.5 border-2 border-[#38BDF8]/30 border-t-[#38BDF8] rounded-full animate-spin" />
                  <span>The advisor is analyzing your business context...</span>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/70 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 4 && (
          <div className="p-3 bg-[#0B2545] border-t border-[#173B63] overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <span className="text-[11px] text-[#94A9C3] whitespace-nowrap mr-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-[#38BDF8]" />
              Frequently asked:
            </span>
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-md bg-[#071A33] hover:bg-[#173B63] border border-[#173B63] text-[#DCEBFA] whitespace-nowrap transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-[#0B2545] border-t border-[#173B63]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask SharkMind a strategic question about customer acquisition, pricing, experiments..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#173B63] bg-[#071A33] text-xs sm:text-sm text-[#F7FAFE] placeholder-[#627D98] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold transition-colors disabled:opacity-40 flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
