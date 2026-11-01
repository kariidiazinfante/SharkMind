import React from 'react';
import { SharkLogo } from './SharkLogo';
import { AppScreen } from '../types/sharkmind';

interface NavbarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  hasReport: boolean;
  onReset: () => void;
  onScrollToSection?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  hasReport,
  onReset,
  onScrollToSection,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#071A33]/90 backdrop-blur-md border-b border-[#173B63]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single element) */}
        <button
          onClick={() => onNavigate('HOME')}
          className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded"
          aria-label="Go to SharkMind Home"
        >
          <SharkLogo size="md" />
        </button>

        {/* Zone 2: 4 single-line nav links in English */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#94A9C3]">
          <button
            onClick={() => onNavigate('HOME')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#F7FAFE] ${
              currentScreen === 'HOME' ? 'text-[#F7FAFE] font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              if (currentScreen !== 'HOME') {
                onNavigate('HOME');
                setTimeout(() => onScrollToSection?.('how-it-works'), 100);
              } else {
                onScrollToSection?.('how-it-works');
              }
            }}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-[#F7FAFE]"
          >
            How it works
          </button>
          <button
            onClick={() => {
              if (currentScreen !== 'HOME') {
                onNavigate('HOME');
                setTimeout(() => onScrollToSection?.('methodology'), 100);
              } else {
                onScrollToSection?.('methodology');
              }
            }}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-[#F7FAFE]"
          >
            Methodology
          </button>
          <button
            onClick={() => {
              if (currentScreen !== 'HOME') {
                onNavigate('HOME');
                setTimeout(() => onScrollToSection?.('example-preview'), 100);
              } else {
                onScrollToSection?.('example-preview');
              }
            }}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-[#F7FAFE]"
          >
            Sample Analysis
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {hasReport && currentScreen !== 'REPORT' && currentScreen !== 'ADVISOR' ? (
            <button
              onClick={() => onNavigate('REPORT')}
              className="px-4 py-2 text-xs font-semibold text-[#F7FAFE] bg-[#173B63] hover:bg-[#1E4A7D] border border-[#31577D] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              View Active Report
            </button>
          ) : null}

          {currentScreen !== 'HOME' ? (
            <button
              onClick={onReset}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              New Analysis
            </button>
          ) : (
            <button
              onClick={() => onScrollToSection?.('idea-form')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
