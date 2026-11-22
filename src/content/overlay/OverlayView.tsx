// src/content/overlay/OverlayView.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  CornerDownLeft,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Languages,
  MessageSquareQuote,
  Pencil,
  FileText,
  HelpCircle,
  Scissors,
  CheckCircle2,
  AlertCircle,
  GripHorizontal,
} from 'lucide-react';
import {
  SnapReplyAction,
  TonePreset,
  ResponseLength,
  UserSettings,
  GenerateRequest,
} from '../../shared/types';
import { SUPPORTED_LANGUAGES, isQuestionText } from '../../shared/prompts';
import { generateContent } from '../../shared/providers';
import { addHistoryItem } from '../../shared/storage';
import { insertTextSafely } from '../insertion';
import { copyToClipboard } from '../../shared/utils/clipboard';
import { ChromaticOrb } from '../../shared/components/ChromaticOrb';

interface OverlayViewProps {
  initialText: string;
  initialX?: number;
  initialY?: number;
  settings: UserSettings;
  onClose: () => void;
}

export const OverlayView: React.FC<OverlayViewProps> = ({
  initialText,
  initialX = window.innerWidth / 2 - 215,
  initialY = 90,
  settings,
  onClose,
}) => {
  // State
  const [selectedText, setSelectedText] = useState(initialText);
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const [action, setAction] = useState<SnapReplyAction>('reply');
  const [tone, setTone] = useState<TonePreset>(settings.defaultTone || 'friendly');
  const [length, setLength] = useState<ResponseLength>(settings.defaultLength || 'balanced');
  const [language, setLanguage] = useState<string>(settings.defaultLanguage || 'Auto');
  const [userIntent, setUserIntent] = useState('');
  const [customTonePrompt, setCustomTonePrompt] = useState(settings.customTonePrompt || '');

  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [hasInserted, setHasInserted] = useState(false);

  // Position & Drag state
  const [position, setPosition] = useState({
    x: Math.min(Math.max(20, initialX), window.innerWidth - 450),
    y: Math.min(Math.max(20, initialY), window.innerHeight - 580),
  });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

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

  // Auto-generate answer if selected or copied text is a question
  useEffect(() => {
    if (initialText) {
      setSelectedText(initialText);
      if (isQuestionText(initialText) && settings.autoGenerateOnQuestion !== false) {
        handleGenerate(initialText);
      }
    }
  }, [initialText]);

  // Toast timer
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const newX = Math.min(Math.max(10, moveEvent.clientX - dragOffset.current.x), window.innerWidth - 450);
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

  const handleGenerate = async (textOverride?: string | React.MouseEvent) => {
    const textToUse = typeof textOverride === 'string' && textOverride.trim() ? textOverride : selectedText;
    if (!textToUse.trim()) {
      setErrorMsg('Please select or provide context text to draft a response.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setHasCopied(false);
    setHasInserted(false);

    try {
      const req: GenerateRequest = {
        action,
        selectedText: textToUse,
        userIntent: userIntent.trim() || undefined,
        tone,
        length,
        language: action === 'translate' ? language : undefined,
        customTonePrompt: tone === 'custom' ? customTonePrompt : undefined,
      };

      const res = await generateContent(req, settings);
      setResultText(res.text);

      if (settings.historyEnabled) {
        await addHistoryItem({
          action,
          tone,
          length,
          language,
          originalText: selectedText,
          userIntent,
          resultText: res.text,
        });
      }

      if (settings.autoCopy) {
        await copyToClipboard(res.text);
        setHasCopied(true);
        setToastMsg({ text: 'Draft generated & copied to clipboard!', type: 'success' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!resultText) return;
    const ok = await copyToClipboard(resultText);
    if (ok) {
      setHasCopied(true);
      setToastMsg({ text: 'Copied to clipboard!', type: 'success' });
      setTimeout(() => setHasCopied(false), 2400);
    } else {
      setToastMsg({ text: 'Failed to copy to clipboard.', type: 'error' });
    }
  };

  const handleInsert = async () => {
    if (!resultText) return;
    const res = await insertTextSafely(resultText);
    if (res.success) {
      setHasInserted(true);
      setToastMsg({ text: 'Inserted draft into field safely!', type: 'success' });
      setTimeout(() => setHasInserted(false), 2400);
    } else if (res.fallbackToCopy) {
      setHasCopied(true);
      setToastMsg({
        text: res.reason || 'Copied to clipboard! Focus a text field to insert.',
        type: 'info',
      });
      setTimeout(() => setHasCopied(false), 2400);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 2147483647,
        width: '430px',
        maxHeight: '90vh',
      }}
      className="snapreply-obsidian-glass rounded-[28px] overflow-hidden flex flex-col font-sans text-white select-none shadow-2xl animate-island-pop"
    >
      {/* Header with Drag Handle & Dynamic Chromatic Orb */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.08] cursor-move select-none"
      >
        <div className="flex items-center gap-2.5">
          <ChromaticOrb size={26} isGenerating={isLoading} />
          <span className="font-semibold text-sm tracking-tight text-white/95">SnapReply</span>
          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/[0.08] text-white/80 border border-white/[0.12]">
            {isQuestionText(selectedText) ? 'Question • Answering' : action}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <GripHorizontal className="w-4 h-4 text-white/30 mr-1" />
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.15] text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 overflow-y-auto flex-1 space-y-3.5 max-h-[calc(90vh-120px)] select-text">
        {/* Dynamic Island Floating Toast */}
        {toastMsg && (
          <div
            className={`flex items-center gap-2 px-3 py-2 text-xs rounded-full shadow-lg border animate-slide-down ${
              toastMsg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-200 border-emerald-700/50'
                : toastMsg.type === 'error'
                ? 'bg-rose-950/80 text-rose-200 border-rose-700/50'
                : 'bg-white/10 text-white/90 border-white/20'
            }`}
          >
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="flex-1 font-medium">{toastMsg.text}</span>
          </div>
        )}

        {/* Selected Context Preview Inset */}
        <div className="bg-white/[0.04] rounded-2xl p-3 border border-white/[0.08] transition-all">
          <div className="flex items-center justify-between text-xs text-white/50 mb-1.5 select-none">
            <span className="flex items-center gap-1.5 font-medium">
              <MessageSquareQuote className="w-3.5 h-3.5 text-white/70" />
              Selected Context ({selectedText.length} chars)
            </span>
            <button
              onClick={() => setIsContextExpanded(!isContextExpanded)}
              className="flex items-center gap-0.5 text-white/70 hover:text-white transition-colors"
            >
              {isContextExpanded ? (
                <>Less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>More <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          </div>

          <div
            className={`text-xs text-white/80 leading-relaxed overflow-hidden transition-all duration-200 ${
              isContextExpanded ? 'max-h-48 overflow-y-auto' : 'max-h-12 line-clamp-2'
            }`}
          >
            {selectedText ? (
              <span>{selectedText}</span>
            ) : (
              <input
                type="text"
                placeholder="Type or paste context here..."
                onChange={(e) => setSelectedText(e.target.value)}
                className="w-full text-xs p-1 bg-transparent border-b border-white/20 text-white placeholder:text-white/40 focus:outline-hidden"
              />
            )}
          </div>
        </div>

        {/* Action Grid (3-Button Grid without horizontal scroll) */}
        <div className="grid grid-cols-3 gap-1.5 select-none">
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
                    : 'bg-white/[0.04] text-white/70 hover:bg-white/[0.09] hover:text-white border-white/[0.08]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-black' : 'text-white/50'}`} />
                <span className="truncate">{act.label}</span>
              </button>
            );
          })}
        </div>

        {/* Language picker if action === 'translate' */}
        {action === 'translate' && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] rounded-2xl border border-white/[0.08]">
            <Languages className="w-3.5 h-3.5 text-white/70" />
            <span className="text-xs text-white/70 font-medium">Target Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs bg-black/80 border border-white/20 rounded-xl px-2.5 py-1 text-white focus:outline-hidden"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tone Selector Pills */}
        <div className="space-y-1.5 select-none">
          <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
            Tone
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'friendly', label: 'Friendly' },
              { id: 'professional', label: 'Professional' },
              { id: 'casual', label: 'Casual' },
              { id: 'confident', label: 'Confident' },
              { id: 'empathetic', label: 'Empathetic' },
              { id: 'concise', label: 'Concise' },
              { id: 'custom', label: 'Custom' },
            ].map((t) => {
              const isSelected = tone === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id as TonePreset)}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                    isSelected
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'bg-white/[0.06] text-white/70 border border-white/[0.08] hover:bg-white/[0.12] hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {tone === 'custom' && (
            <input
              type="text"
              value={customTonePrompt}
              onChange={(e) => setCustomTonePrompt(e.target.value)}
              placeholder="e.g. Sarcastic, poetic, like a Silicon Valley founder..."
              className="mt-1.5 w-full text-xs px-3 py-2 rounded-xl border border-white/15 bg-black/70 text-white placeholder:text-white/40 focus:ring-1 focus:ring-white/40 focus:outline-hidden"
            />
          )}
        </div>

        {/* Capsule Input matching User's Uploaded Image */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider flex items-center justify-between">
            <span>What do you want to say? (Optional)</span>
            <span className="text-[10px] text-white/40 font-normal">Press Enter to draft</span>
          </label>

          <div className="snapreply-capsule h-12 px-3.5 rounded-full flex items-center gap-3 focus-within:border-white/35 transition-all">
            <ChromaticOrb size={24} isGenerating={isLoading} />
            <input
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
                action === 'reply'
                  ? 'Ask anything... (or press Enter)'
                  : 'e.g. Make it punchy and persuasive'
              }
              className="w-full text-sm bg-transparent text-white placeholder:text-white/45 focus:outline-hidden tracking-tight"
            />
          </div>
        </div>

        {/* Length Selector */}
        <div className="flex items-center justify-between text-xs select-none">
          <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
            Length
          </span>
          <div className="flex gap-1 p-0.5 bg-white/[0.05] border border-white/[0.08] rounded-full">
            {(['short', 'balanced', 'detailed'] as ResponseLength[]).map((len) => (
              <button
                key={len}
                onClick={() => setLength(len)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize transition-all ${
                  length === len
                    ? 'bg-white text-black font-semibold shadow-xs'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {len}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="flex-1 leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Generate Primary Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-white text-black hover:bg-white/90 active:scale-[0.98] font-semibold text-xs tracking-tight shadow-md transition-all disabled:opacity-50 cursor-pointer select-none"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
              <span>Drafting your {action}...</span>
            </>
          ) : (
            <>
              <ChromaticOrb size={18} isGenerating={false} />
              <span>{resultText ? `Regenerate ${action}` : `Generate ${action}`}</span>
            </>
          )}
        </button>

        {/* Generated Result Card */}
        {resultText && (
          <div className="space-y-2.5 pt-1 animate-slide-up select-text">
            <div className="flex items-center justify-between text-xs select-none">
              <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
                Draft Preview (Editable)
              </span>
              <span className="text-[10px] text-white/40">
                {resultText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <textarea
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              rows={4}
              className="w-full text-xs p-3.5 rounded-2xl border border-white/12 bg-white/[0.04] text-white/95 focus:border-white/30 focus:outline-hidden leading-relaxed resize-y font-sans shadow-inner"
            />

            {/* Action Bar: Copy & Safe Insert */}
            <div className="flex items-center gap-2 pt-1 select-none">
              <button
                onClick={handleCopy}
                className={`flex-1 h-10 flex items-center justify-center gap-1.5 rounded-full border text-xs font-semibold transition-all ${
                  hasCopied
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : 'bg-white/[0.07] border-white/12 text-white/90 hover:bg-white/[0.12] hover:text-white'
                }`}
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleInsert}
                className={`flex-1 h-10 flex items-center justify-center gap-1.5 rounded-full border text-xs font-semibold transition-all ${
                  hasInserted
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : 'bg-white text-black hover:bg-white/90 border-transparent shadow-sm'
                }`}
                title="Safely insert into active text field without submitting"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                <span>{hasInserted ? 'Inserted!' : 'Insert in Page'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-black/60 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-white/40 select-none">
        <span>Provider: {settings.provider}</span>
        <span>Review before sending • Never auto-sends</span>
      </div>
    </div>
  );
};
