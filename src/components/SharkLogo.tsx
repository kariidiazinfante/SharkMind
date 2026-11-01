import React from 'react';

interface SharkLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
  monochrome?: boolean;
}

export const SharkLogo: React.FC<SharkLogoProps> = ({
  className = '',
  size = 'md',
  withText = true,
  monochrome = false,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Geometric shark fin mark */}
      <div
        className={`${iconSizes[size]} flex items-center justify-center rounded-lg ${
          monochrome
            ? 'bg-white text-[#071A33]'
            : 'bg-gradient-to-br from-[#173B63] via-[#0B2545] to-[#3B82F6] text-white shadow-sm ring-1 ring-[#3B82F6]/30'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5"
        >
          {/* Abstract geometric shark dorsal fin with strategic forward-leaning angle */}
          <path
            d="M5 19C5 19 8.5 18 11.5 13.5C14.5 9 17 4.5 19 4C18 7.5 17 12 19 15.5C16.5 15.5 12 16.5 5 19Z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <path
            d="M7 18.5C9.5 17.5 12 15 14 11"
            stroke="#DCEBFA"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {withText && (
        <span
          className={`font-extrabold tracking-tight text-[#F7FAFE] font-['Plus_Jakarta_Sans'] ${textSizes[size]}`}
        >
          SHARK<span className="text-[#3B82F6] font-medium">MIND</span>
        </span>
      )}
    </div>
  );
};
