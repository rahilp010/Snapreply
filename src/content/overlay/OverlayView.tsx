// src/content/overlay/OverlayView.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Copy,
  Check,
  CornerDownLeft,
  RefreshCw,
  History,
  Trash2,
  Languages,
  MessageSquareQuote,
  Pencil,
  FileText,
  HelpCircle,
  Scissors,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  Sparkles,
  ChevronLeft,
  X,
  Key,
} from 'lucide-react';
import {
  SnapReplyAction,
  TonePreset,
  ResponseLength,
  UserSettings,
  GenerateRequest,
  HistoryItem,
} from '../../shared/types';
import {
  saveSettings,
  getHistory,
  addHistoryItem,
  clearHistory,
} from '../../shared/storage';
import { SUPPORTED_LANGUAGES, isQuestionText } from '../../shared/prompts';
import { generateContent } from '../../shared/providers';
import { insertTextSafely } from '../insertion';
import { copyToClipboard } from '../../shared/utils/clipboard';
import { ChromaticOrb } from '../../shared/components/ChromaticOrb';
import { ModelBadge } from '../../shared/components/ModelIcon';

interface OverlayViewProps {
  initialText: string;
  initialX?: number;
  initialY?: number;
  settings: UserSettings;
  onClose: () => void;
}

export const OverlayView: React.FC<OverlayViewProps> = ({
  initialText,
  initialX = window.innerWidth / 2 - 205,
  initialY = 70,
  settings: initialSettings,
  onClose,
}) => {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [activeView, setActiveView] = useState<'composer' | 'history'>('composer');

  // Generation state
  const [contextText, setContextText] = useState(initialText);
  const [action, setAction] = useState<SnapReplyAction>('reply');
  const [tone, setTone] = useState<TonePreset>(initialSettings.defaultTone || 'friendly');
  const [length, setLength] = useState<ResponseLength>(initialSettings.defaultLength || 'balanced');
  const [language, setLanguage] = useState(initialSettings.defaultLanguage || 'Auto');
  const [userIntent, setUserIntent] = useState('');
  const [isToneMenuOpen, setIsToneMenuOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const [hasInserted, setHasInserted] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // History state
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [inlineApiKey, setInlineApiKey] = useState('');
  const toneMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Position & Drag state
  const [position, setPosition] = useState({
    x: Math.min(Math.max(16, initialX), window.innerWidth - 426),
    y: Math.min(Math.max(16, initialY), window.innerHeight - 565),
  });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Ensure @property --sr-angle works inside content-script / Shadow DOM environments
  useEffect(() => {
    try {
      if (typeof CSS !== 'undefined' && 'registerProperty' in CSS) {
        CSS.registerProperty({
          name: '--sr-angle',
          syntax: '<angle>',
          inherits: true,
          initialValue: '0deg',
        });
      }
    } catch {
      // Already registered
    }
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Auto-dismiss floating toast
  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 2600);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  // Close tone menu when clicking outside
  useEffect(() => {
    if (!isToneMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (toneMenuRef.current && !toneMenuRef.current.contains(e.target as Node)) {
        setIsToneMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isToneMenuOpen]);

  // Auto-generate answer if selected or copied text is a question
  useEffect(() => {
    if (initialText) {
      setContextText(initialText);
      if (isQuestionText(initialText) && settings.autoGenerateOnQuestion !== false) {
        executeGeneration(initialText);
      }
    }
    loadHistory();
  }, [initialText]);

  const loadHistory = async () => {
    const list = await getHistory();
    setHistoryItems(list);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select, textarea, a')) return;

    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const newX = Math.min(Math.max(10, moveEvent.clientX - dragOffset.current.x), window.innerWidth - 425);
      const newY = Math.min(Math.max(10, moveEvent.clientY - dragOffset.current.y), window.innerHeight - 180);
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
      window.open(chrome.runtime.getURL('options/index.html'), '_blank');
    }
  };

  const executeGeneration = async (
    textToUse: string,
    overrideIntent?: string,
    passedSettings?: UserSettings
  ) => {
    const context = textToUse.trim();
    if (!context) {
      setErrorMsg('Please select or paste context text first.');
      return;
    }

    const currentSettings = passedSettings || settings;
    setIsLoading(true);
    setErrorMsg('');
    setHasCopied(false);
    setHasInserted(false);

    try {
      const isQ = isQuestionText(context);
      const req: GenerateRequest = {
        action: isQ ? 'reply' : action,
        selectedText: context,
        userIntent: (overrideIntent !== undefined ? overrideIntent : userIntent).trim() || undefined,
        tone,
        length,
        language: action === 'translate' ? language : undefined,
      };

      const res = await generateContent(req, currentSettings);
      setResultText(res.text);

      if (currentSettings.historyEnabled) {
        await addHistoryItem({
          action,
          tone,
          length,
          language,
          originalText: context,
          userIntent: overrideIntent || userIntent,
          resultText: res.text,
        });
        loadHistory();
      }

      if (currentSettings.autoCopy) {
        await copyToClipboard(res.text);
        setHasCopied(true);
        setToastMsg({ text: 'Answer generated & copied to clipboard!', type: 'success' });
      } else if (isQ) {
        setToastMsg({ text: 'Question detected • Answer generated!', type: 'success' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (overrideIntent?: string) => {
    if (!contextText.trim()) {
      setErrorMsg('Please select or paste context text first.');
      return;
    }
    await executeGeneration(contextText, overrideIntent);
  };

  const handleCopy = async () => {
    if (!resultText) return;
    const ok = await copyToClipboard(resultText);
    if (ok) {
      setHasCopied(true);
      setToastMsg({ text: 'Copied to clipboard!', type: 'success' });
      setTimeout(() => setHasCopied(false), 2000);
    } else {
      setToastMsg({ text: 'Failed to copy to clipboard.', type: 'error' });
    }
  };

  const handleInsertInPage = async () => {
    if (!resultText) return;
    const res = await insertTextSafely(resultText);
    if (res.success) {
      setHasInserted(true);
      setToastMsg({ text: 'Inserted draft into webpage field!', type: 'success' });
      setTimeout(() => setHasInserted(false), 2000);
    } else if (res.fallbackToCopy) {
      setHasCopied(true);
      setToastMsg({
        text: res.reason || 'Copied! Focus a text field on page to insert.',
        type: 'info',
      });
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const isQuestion = isQuestionText(contextText);
  const activeModelName =
    settings?.provider === 'nararouter'
      ? settings?.selectedModels?.nararouter || 'auto/bynara'
      : settings?.provider === 'openai'
      ? settings?.selectedModels?.openai || 'gpt-4o-mini'
      : settings?.provider === 'gemini'
      ? settings?.selectedModels?.gemini || 'gemini-1.5-flash'
      : settings?.provider === 'anthropic'
      ? settings?.selectedModels?.anthropic || 'claude-3-5-haiku'
      : settings?.provider === 'custom'
      ? settings?.customModel || 'Local Model'
      : undefined;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 2147483647,
        width: '410px',
        height: '545px',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
      className={`sr-overlay-root relative w-[410px] h-[545px] overflow-hidden bg-[#050508] text-white font-sans flex flex-col select-none rounded-[28px] border border-white/12 shadow-[0_28px_70px_rgba(0,0,0,0.85)] ${
        isLoading ? 'sr-shell-active' : ''
      }`}
    >
      <style>{`
        @property --sr-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes sr-border-rotate {
          to { --sr-angle: 360deg; }
        }
        @keyframes sr-toast-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sr-draft-in {
          from { opacity: 0; transform: translateY(10px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .sr-overlay-root,
        .sr-overlay-root * {
          box-sizing: border-box;
        }

        .sr-overlay-root input:focus,
        .sr-overlay-root textarea:focus,
        .sr-overlay-root select:focus {
          outline: none !important;
          box-shadow: none !important;
        }

        .sr-toast-anim {
          animation: sr-toast-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .sr-draft-anim {
          animation: sr-draft-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Thin-Film Iridescent Outer Border when Generating */
        .sr-shell-active::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 28px;
          padding: 1.5px;
          background: conic-gradient(
            from var(--sr-angle),
            rgba(103, 232, 249, 0.85),
            rgba(251, 191, 36, 0.85),
            rgba(249, 115, 22, 0.85),
            rgba(192, 132, 252, 0.85),
            rgba(103, 232, 249, 0.85)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 50;
          animation: sr-border-rotate 2.6s linear infinite;
        }

        /* Dynamic Island Glass Capsule + Running Thin-Film Border */
        .sr-capsule-modern {
          position: relative;
          border-radius: 9999px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.045);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.11);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 8px 20px -6px rgba(0, 0, 0, 0.65);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: text;
        }
        .sr-capsule-modern:hover {
          border-color: rgba(255, 255, 255, 0.22);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 10px 24px -6px rgba(0, 0, 0, 0.75);
        }
        .sr-capsule-modern::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 520px;
          height: 520px;
          margin-top: -260px;
          margin-left: -260px;
          border-radius: 50%;
          background: conic-gradient(
            transparent 10%,
            #67e8f9 28%,
            #fbbf24 50%,
            #f97316 68%,
            #c084fc 85%,
            transparent 95%
          );
          animation: sr-capsule-spin 2.4s linear infinite;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 0;
        }
        .sr-capsule-modern::after {
          content: '';
          position: absolute;
          inset: 1.2px;
          border-radius: 9999px;
          background: #09090f;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
          pointer-events: none;
          z-index: 1;
          transition: background 0.3s ease;
        }
        .sr-capsule-modern:focus-within::before,
        .sr-capsule-modern.is-generating::before {
          opacity: 1;
        }
        .sr-capsule-modern.is-generating {
          background: rgba(251, 191, 36, 0.05);
          box-shadow: 0 0 22px -4px rgba(251, 191, 36, 0.28);
        }
        .sr-capsule-modern.is-generating::after {
          background: #0c0b11;
        }
        .sr-capsule-modern > * {
          position: relative;
          z-index: 2;
        }
        @keyframes sr-capsule-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Thin Glass Scrollbar */
        .sr-thin-scroll::-webkit-scrollbar {
          width: 4px;
          height: 3px;
        }
        .sr-thin-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sr-thin-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 9999px;
        }
        .sr-thin-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Subtle Ambient Top Light Bloom */}
      <div
        className={`pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full blur-3xl transition-opacity duration-700 ${
          isLoading ? 'opacity-35' : 'opacity-15'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(251,191,36,0.38) 0%, rgba(103,232,249,0.28) 50%, transparent 75%)',
        }}
      />

      {/* 1. Header Bar (h-12 / 48px) with Drag Handle */}
      <header
        onMouseDown={handleMouseDown}
        className="relative z-20 h-12 px-4 flex items-center justify-between border-b border-white/[0.08] bg-white/[0.025] backdrop-blur-xl shrink-0 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2">
          <ChromaticOrb size={24} isGenerating={isLoading} />
          <span className="font-semibold text-sm tracking-tight text-white/95">SnapReply</span>
          <ModelBadge
            provider={settings?.provider}
            modelName={activeModelName}
            onClick={openOptions}
          />
        </div>

        {/* Segmented Tab Switcher (Composer <-> History) + Close */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-0.5 rounded-full bg-white/[0.06] border border-white/[0.1]">
            <button
              onClick={() => setActiveView('composer')}
              className={`w-7 h-6 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                activeView === 'composer'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Composer"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`relative w-7 h-6 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                activeView === 'history'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Recent History"
            >
              <History className="w-3.5 h-3.5" />
              {historyItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          </div>

          <button
            onClick={openOptions}
            className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 cursor-pointer"
            title="Settings"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Floating Toast Pill Notification (never shifts layout) */}
      {toastMsg && (
        <div className="absolute top-[54px] left-4 right-4 z-40 pointer-events-none flex justify-center">
          <div
            className={`pointer-events-auto flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-full border backdrop-blur-xl shadow-lg sr-toast-anim ${
              toastMsg.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                : 'bg-[#12121a]/95 text-white border-white/20'
            }`}
          >
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            )}
            <span className="font-medium truncate">{toastMsg.text}</span>
          </div>
        </div>
      )}

      {/* Smooth Sliding Dual-Pane Viewport */}
      <div className="relative z-10 flex-1 overflow-hidden">
        {/* PANE 1: COMPOSER (ZERO-SCROLL FIXED WORKSPACE) */}
        <div
          className={`absolute inset-0 px-4 py-3 flex flex-col gap-2.5 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            activeView === 'composer'
              ? 'opacity-100 translate-x-0 pointer-events-auto scale-100'
              : 'opacity-0 -translate-x-6 pointer-events-none scale-[0.98]'
          }`}
        >
          {/* NaraRouter Quick Key Setup Banner */}
          {settings?.provider === 'nararouter' && !settings?.apiKeys?.nararouter && (
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 shrink-0 space-y-1.5 animate-slide-down">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Key className="w-3 h-3 text-amber-400" />
                  NaraRouter API Key Needed
                </span>
                <button
                  onClick={openOptions}
                  className="text-[10px] text-white/60 hover:text-white underline cursor-pointer"
                >
                  Options
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="password"
                  value={inlineApiKey}
                  onChange={(e) => setInlineApiKey(e.target.value)}
                  placeholder="Paste Bearer token here..."
                  className="flex-1 text-[11px] px-2.5 py-1 rounded-xl border border-white/15 bg-black/80 font-mono text-white placeholder:text-white/30 focus:outline-hidden"
                />
                <button
                  onClick={async () => {
                    if (inlineApiKey.trim()) {
                      const updated = await saveSettings({
                        apiKeys: {
                          ...settings.apiKeys,
                          nararouter: inlineApiKey.trim(),
                        },
                      });
                      setSettings(updated);
                      setToastMsg({ text: 'NaraRouter key saved!', type: 'success' });
                    }
                  }}
                  disabled={!inlineApiKey.trim()}
                  className="px-2.5 py-1 rounded-xl bg-white text-black font-semibold text-[10px] hover:bg-white/90 disabled:opacity-40 cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* 2. Context Card */}
          <div className="bg-white/[0.038] hover:bg-white/[0.048] focus-within:bg-white/[0.055] focus-within:border-white/20 rounded-2xl p-2.5 border border-white/[0.08] transition-all duration-200 shrink-0">
            <div className="flex items-center justify-between text-[11px] text-white/50 mb-1 select-none">
              <span className="flex items-center gap-1.5 font-medium">
                <MessageSquareQuote className="w-3 h-3 text-cyan-300/80" />
                {contextText ? (
                  isQuestion ? (
                    <span className="text-white flex items-center gap-1.5 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Detected Question ({contextText.length} chars)
                    </span>
                  ) : (
                    `Selected Context (${contextText.length} chars)`
                  )
                ) : (
                  'No Context Selected'
                )}
              </span>
              {contextText ? (
                <button
                  onClick={() => setContextText('')}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/55 hover:text-white hover:bg-white/12 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              ) : (
                <button
                  onClick={async () => {
                    const text = await navigator.clipboard.readText().catch(() => '');
                    if (text) setContextText(text);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/65 hover:text-white hover:bg-white/12 transition-colors cursor-pointer"
                >
                  Paste
                </button>
              )}
            </div>
            <textarea
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Highlight message on webpage (or paste text here)..."
              rows={2}
              className="w-full text-xs bg-transparent text-white/92 placeholder:text-white/35 outline-none focus:outline-none leading-relaxed resize-none select-text sr-thin-scroll border-transparent focus:border-transparent rounded-xl px-2.5 py-1.5 transition-all duration-200 focus:ring-0"
            />
          </div>

          {/* 3. Action Grid (3-Button Grid without horizontal scroll) */}
          <div className="grid grid-cols-3 gap-1.5 shrink-0 select-none">
            {[
              { id: 'reply', label: 'Reply', icon: MessageSquareQuote },
              { id: 'rewrite', label: 'Rewrite', icon: Pencil },
              { id: 'shorten', label: 'Shorten', icon: Scissors },
              { id: 'summarize', label: 'Summarize', icon: FileText },
              { id: 'explain', label: 'Explain', icon: HelpCircle },
              { id: 'translate', label: 'Translate', icon: Languages },
            ].map((act) => {
              const Icon = act.icon;
              const isSelected = action === act.id;
              return (
                <button
                  key={act.id}
                  onClick={() => setAction(act.id as SnapReplyAction)}
                  className={`h-8 px-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-xs font-semibold'
                      : 'bg-white/[0.035] text-white/70 hover:bg-white/[0.08] hover:text-white border-white/[0.08]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-black' : 'text-white/50'}`} />
                  <span className="truncate">{act.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tone & Length Controls Row */}
          <div className="flex items-center justify-between gap-2 py-0.5 shrink-0 select-none">
            {/* Length Selector */}
            <div className="flex gap-0.5 p-0.5 bg-white/[0.05] rounded-full border border-white/[0.08]">
              {(['short', 'balanced', 'detailed'] as ResponseLength[]).map((len) => (
                <button
                  key={len}
                  onClick={() => setLength(len)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium capitalize transition-all duration-200 cursor-pointer ${
                    length === len
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'text-white/55 hover:text-white'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>

            {/* Tone Dropdown Selector */}
            <div className="relative" ref={toneMenuRef}>
              <button
                onClick={() => setIsToneMenuOpen((prev) => !prev)}
                className={`h-6 px-2.5 rounded-full border text-[11px] font-medium flex items-center gap-1.5 transition-all duration-200 capitalize cursor-pointer ${
                  isToneMenuOpen
                    ? 'bg-white/15 border-white/30 text-white'
                    : 'bg-white/[0.05] border-white/[0.11] text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <SlidersHorizontal className="w-2.5 h-2.5 text-amber-300/80" />
                <span>{tone}</span>
                <span
                  className={`text-[9px] text-white/45 transition-transform duration-200 ${
                    isToneMenuOpen ? 'rotate-180' : ''
                  }`}
                >
                  ▾
                </span>
              </button>

              {/* Animated Tone Dropdown Popover */}
              <div
                className={`absolute right-0 top-7 w-34 p-1 bg-[#0d0d13]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl z-50 origin-top-right transition-all duration-200 ease-out ${
                  isToneMenuOpen
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                }`}
              >
                {(['friendly', 'professional', 'casual', 'confident', 'empathetic', 'concise'] as TonePreset[]).map(
                  (t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTone(t);
                        setIsToneMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-xl capitalize font-medium transition-colors cursor-pointer ${
                        tone === t
                          ? 'bg-white text-black font-semibold'
                          : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Language Selector for Translate */}
          {action === 'translate' && (
            <div className="shrink-0 -mt-0.5">
              <div className="flex items-center justify-between px-3 py-1 bg-white/[0.04] rounded-full border border-white/[0.08] text-xs">
                <span className="flex items-center gap-1.5 text-[11px] text-white/70 font-medium">
                  <Languages className="w-3 h-3 text-cyan-300" />
                  Target Language
                </span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-xs bg-black/80 border border-white/15 rounded-full px-2.5 py-0.5 text-white focus:outline-hidden cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 4. Dynamic Island Capsule Input */}
          <div
            onClick={() => inputRef.current?.focus()}
            className={`sr-capsule-modern h-11 px-3 rounded-full flex items-center gap-2.5 shrink-0 ${
              isLoading ? 'is-generating' : ''
            }`}
          >
            <ChromaticOrb size={22} isGenerating={isLoading} />
            <input
              ref={inputRef}
              type="text"
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder={
                isQuestion
                  ? 'Question detected! Press Enter to re-answer...'
                  : action === 'reply'
                  ? 'Ask anything... (or press Enter)'
                  : 'Add specific instruction...'
              }
              className="w-full text-xs bg-transparent text-white placeholder:text-white/40 focus:outline-hidden tracking-tight select-text outline-none focus:outline-none focus:ring-0"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 disabled:opacity-40 cursor-pointer shadow-sm"
              title="Generate"
            >
              {isLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin text-black" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="py-1.5 px-3 text-[11px] text-rose-200 bg-rose-950/70 rounded-full border border-rose-500/40 mt-1.5 flex items-center gap-1.5 shrink-0 sr-toast-anim">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{errorMsg}</span>
            </div>
          )}

          {/* 5. Adaptive Bottom Workspace */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {resultText ? (
              /* Result Preview Card */
              <div className="flex-1 min-h-0 flex flex-col justify-between bg-white/[0.04] border border-white/[0.1] rounded-2xl p-2.5 sr-draft-anim select-text">
                <div className="flex items-center justify-between text-[11px] text-white/50 pb-1 select-none shrink-0">
                  <span className="font-semibold uppercase tracking-wider text-white/75 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Generated Draft
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/45">
                    {resultText.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                <textarea
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  className="flex-1 min-h-0 w-full text-xs p-2.5 rounded-xl bg-black/55 border border-white/[0.08] focus:border-white/25 text-white/95 focus:outline-hidden resize-none leading-relaxed sr-thin-scroll transition-colors"
                />

                <div className="flex items-center gap-2 pt-2 select-none shrink-0">
                  <button
                    onClick={handleCopy}
                    className={`flex-1 h-8 rounded-full border text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                      hasCopied
                        ? 'bg-emerald-950/85 border-emerald-500/50 text-emerald-200'
                        : 'bg-white/[0.08] border-white/12 text-white hover:bg-white/[0.14]'
                    }`}
                  >
                    {hasCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{hasCopied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleInsertInPage}
                    className="flex-1 h-8 rounded-full bg-white text-black hover:bg-white/90 active:scale-[0.98] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs"
                  >
                    <CornerDownLeft className="w-3 h-3" />
                    <span>{hasInserted ? 'Inserted!' : 'Insert in Page'}</span>
                  </button>

                  <button
                    onClick={() => handleGenerate()}
                    disabled={isLoading}
                    className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/12 text-white/80 hover:text-white hover:bg-white/[0.15] flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-40"
                    title="Regenerate"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            ) : (
              /* Idle Workspace: Modern Assistant Card */
              <div className="flex-1 min-h-0 flex flex-col justify-between p-3.5 bg-white/[0.025] border border-white/[0.07] rounded-2xl select-none">
                <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                  {isQuestion ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-2">
                        <Sparkles className="w-4 h-4 text-emerald-300" />
                      </div>
                      <div className="text-xs font-semibold text-white/95 mb-1">
                        Question Detected
                      </div>
                      <div className="text-[11px] text-white/50 leading-relaxed mb-3 max-w-[280px]">
                        SnapReply identified an interrogative question. Click below to generate an instant answer.
                      </div>
                      <button
                        onClick={() => handleGenerate()}
                        disabled={isLoading}
                        className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-white/90 active:scale-95 transition-all cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3 h-3 text-black" />
                        <span>Answer Question</span>
                      </button>
                    </>
                  ) : contextText ? (
                    <>
                      <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mb-2">
                        <MessageSquareQuote className="w-4 h-4 text-cyan-300/80" />
                      </div>
                      <div className="text-xs font-semibold text-white/95 mb-1 capitalize">
                        Ready to {action}
                      </div>
                      <div className="text-[11px] text-white/50 leading-relaxed max-w-[280px]">
                        Press <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.08] border border-white/[0.12] text-white/80 font-mono text-[10px]">Enter</kbd> in the input capsule or click the arrow above to draft.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center mb-2">
                        <Sparkles className="w-4 h-4 text-white/60" />
                      </div>
                      <div className="text-xs font-semibold text-white/95 mb-1">
                        Select text on any webpage
                      </div>
                      <div className="text-[11px] text-white/50 leading-relaxed max-w-[280px]">
                        Highlight text or copy a question to generate instant replies, rewrites, and summaries.
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom Shortcut Chip */}
                <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] text-[10px] text-white/40">
                  <span>Quick Shortcut</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/60 font-mono">
                    Alt + Shift + R
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PANE 2: HISTORY DRAWER */}
        <div
          className={`absolute inset-0 px-4 py-3 flex flex-col justify-between overflow-hidden select-text transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            activeView === 'history'
              ? 'opacity-100 translate-x-0 pointer-events-auto scale-100'
              : 'opacity-0 translate-x-6 pointer-events-none scale-[0.98]'
          }`}
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08] shrink-0 select-none">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              Recent Drafts ({historyItems.length})
            </span>
            {historyItems.length > 0 && (
              <button
                onClick={async () => {
                  await clearHistory();
                  setHistoryItems([]);
                  setToastMsg({ text: 'History cleared', type: 'info' });
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-[11px] text-rose-300 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto sr-thin-scroll space-y-2 py-2.5">
            {historyItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-white/[0.025] border border-white/[0.06] text-white/40 text-xs">
                <History className="w-5 h-5 mb-2 text-white/25" />
                <span>No drafts yet. Generated drafts will appear here.</span>
              </div>
            ) : (
              historyItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white/[0.038] hover:bg-white/[0.06] rounded-2xl border border-white/[0.08] transition-all duration-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] text-white/45">
                    <span className="font-semibold uppercase tracking-wide text-white/80">
                      {item.action} • {item.tone}
                    </span>
                    <span>
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-white/85 line-clamp-2 leading-relaxed">{item.resultText}</div>
                  <div className="flex items-center justify-end gap-1.5 pt-0.5 select-none">
                    <button
                      onClick={() => {
                        setContextText(item.originalText);
                        setResultText(item.resultText);
                        setActiveView('composer');
                      }}
                      className="px-2.5 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/[0.14] text-[10px] font-medium text-white/75 hover:text-white transition-colors cursor-pointer"
                    >
                      Load
                    </button>
                    <button
                      onClick={async () => {
                        await copyToClipboard(item.resultText);
                        setToastMsg({ text: 'Copied to clipboard!', type: 'success' });
                      }}
                      className="px-2.5 py-0.5 rounded-full bg-white/12 hover:bg-white/22 text-[10px] font-medium text-white transition-colors cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setActiveView('composer')}
            className="w-full h-9 rounded-full bg-white text-black font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-white/90 active:scale-[0.98] transition-all duration-200 shrink-0 mt-1 cursor-pointer shadow-sm select-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Composer</span>
          </button>
        </div>
      </div>
    </div>
  );
};