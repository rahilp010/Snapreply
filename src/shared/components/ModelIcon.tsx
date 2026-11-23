// src/shared/components/ModelIcon.tsx
import React from 'react';
import { ProviderType } from '../types';

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * 1. NaraRouter Official Brand Icon
 * Energetic neural routing N with electric cyan, amber & tangerine gradients
 */
export const NaraRouterIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="nara-grad-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e1b2e" />
        <stop offset="100%" stopColor="#0b0a12" />
      </linearGradient>
      <linearGradient id="nara-grad-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="48%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6.5" fill="url(#nara-grad-bg)" stroke="rgba(251,191,36,0.3)" strokeWidth="0.8" />
    <path
      d="M7.5 17V7l9 10V7"
      stroke="url(#nara-grad-stroke)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7.5" cy="7" r="1.8" fill="#38bdf8" />
    <circle cx="16.5" cy="17" r="1.8" fill="#f97316" />
  </svg>
);

/**
 * 2. OpenAI Official Rosette Spiral Icon
 */
export const OpenAIIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <path
      d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.02-1.1638a.0804.0804 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.402-.686zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.407 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813v6.7227zm1.145-2.0728l2.548-1.4715 2.548 1.4715v2.943l-2.548 1.4715-2.548-1.4715z"
      fill="#10a37f"
    />
  </svg>
);

/**
 * 3. Google Gemini Official 4-Pointed Star Icon
 */
export const GeminiIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="gemini-diamond-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4da3ff" />
        <stop offset="50%" stopColor="#9b72ff" />
        <stop offset="100%" stopColor="#ff70a6" />
      </linearGradient>
    </defs>
    <path
      d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z"
      fill="url(#gemini-diamond-grad)"
    />
  </svg>
);

/**
 * 4. Anthropic Claude Official Burst Icon
 */
export const ClaudeIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <path
      d="M4.5 12h15M12 4.5v15M6.7 6.7l10.6 10.6M17.3 6.7L6.7 17.3"
      stroke="#d97757"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * 5. Local / Custom AI Hardware Microchip Icon
 */
export const CustomAIIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#60a5fa"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" fill="#3b82f6" fillOpacity="0.25" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  </svg>
);

/**
 * 6. Built-in Demo Engine / Mock Mode Icon
 */
export const DemoAIIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
  >
    <defs>
      <linearGradient id="demo-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="50%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#67e8f9" />
      </linearGradient>
    </defs>
    <path
      d="M12 2L14.7 9.3L22 12L14.7 14.7L12 22L9.3 14.7L2 12L9.3 9.3L12 2Z"
      fill="url(#demo-star-grad)"
    />
  </svg>
);

/**
 * Universal Model Icon Dispatcher
 */
export const ModelIcon: React.FC<{
  provider?: ProviderType | string;
  size?: number;
  className?: string;
}> = ({ provider, size = 16, className = '' }) => {
  switch (provider) {
    case 'nararouter':
      return <NaraRouterIcon size={size} className={className} />;
    case 'openai':
      return <OpenAIIcon size={size} className={className} />;
    case 'gemini':
      return <GeminiIcon size={size} className={className} />;
    case 'anthropic':
      return <ClaudeIcon size={size} className={className} />;
    case 'custom':
      return <CustomAIIcon size={size} className={className} />;
    case 'mock':
    default:
      return <DemoAIIcon size={size} className={className} />;
  }
};

/**
 * Get human-readable provider information
 */
export function getProviderInfo(provider?: ProviderType | string, modelName?: string) {
  switch (provider) {
    case 'nararouter':
      return {
        name: 'NaraRouter',
        model: modelName || 'auto/bynara',
        fullTitle: `NaraRouter (${modelName || 'auto/bynara'}) • Real & Humanized AI`,
        pillBorder: 'border-amber-400/25 hover:border-amber-400/50',
        pillGlow: 'hover:shadow-[0_0_12px_rgba(251,191,36,0.22)]',
        accentBg: 'bg-amber-500/10',
      };
    case 'openai':
      return {
        name: 'OpenAI',
        model: modelName || 'gpt-4o-mini',
        fullTitle: `OpenAI (${modelName || 'gpt-4o-mini'})`,
        pillBorder: 'border-emerald-400/25 hover:border-emerald-400/50',
        pillGlow: 'hover:shadow-[0_0_12px_rgba(16,185,129,0.22)]',
        accentBg: 'bg-emerald-500/10',
      };
    case 'gemini':
      return {
        name: 'Gemini',
        model: modelName || 'gemini-1.5-flash',
        fullTitle: `Google Gemini (${modelName || 'gemini-1.5-flash'})`,
        pillBorder: 'border-purple-400/25 hover:border-purple-400/50',
        pillGlow: 'hover:shadow-[0_0_12px_rgba(168,85,247,0.22)]',
        accentBg: 'bg-purple-500/10',
      };
    case 'anthropic':
      return {
        name: 'Claude',
        model: modelName || 'claude-3-5-haiku',
        fullTitle: `Anthropic Claude (${modelName || 'claude-3-5-haiku'})`,
        pillBorder: 'border-[#d97757]/30 hover:border-[#d97757]/60',
        pillGlow: 'hover:shadow-[0_0_12px_rgba(217,119,87,0.22)]',
        accentBg: 'bg-[#d97757]/10',
      };
    case 'custom':
      return {
        name: 'Local AI',
        model: modelName || 'Custom / Ollama',
        fullTitle: `Local / Custom AI (${modelName || 'Custom Endpoint'})`,
        pillBorder: 'border-blue-400/25 hover:border-blue-400/50',
        pillGlow: 'hover:shadow-[0_0_12px_rgba(59,130,246,0.22)]',
        accentBg: 'bg-blue-500/10',
      };
    case 'mock':
    default:
      return {
        name: 'Demo Engine',
        model: 'Built-in Beta',
        fullTitle: 'Built-in Demo Engine (Offline Mode)',
        pillBorder: 'border-purple-300/25 hover:border-purple-300/50',
        pillGlow: 'hover:shadow-[0_0_12px_rgba(192,132,252,0.22)]',
        accentBg: 'bg-purple-500/10',
      };
  }
}

/**
 * Sleek Model Badge Icon Pill for Headers & Navigation
 * Displays the model's icon instead of plain text name
 */
export const ModelBadge: React.FC<{
  provider?: ProviderType | string;
  modelName?: string;
  onClick?: () => void;
  className?: string;
}> = ({ provider = 'nararouter', modelName, onClick, className = '' }) => {
  const info = getProviderInfo(provider, modelName);

  return (
    <button
      onClick={onClick}
      type="button"
      title={`${info.fullTitle} • Click to configure`}
      className={`group relative flex items-center justify-center h-6 px-1.5 py-0.5 rounded-full border bg-white/[0.04] backdrop-blur-md transition-all duration-200 cursor-pointer active:scale-95 ${info.pillBorder} ${info.pillGlow} ${className}`}
    >
      <ModelIcon provider={provider} size={15} />
      {/* Subtle indicator dot that glows on hover */}
      <span className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white ml-1.5 transition-colors" />
    </button>
  );
};
