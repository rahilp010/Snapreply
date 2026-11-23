// src/onboarding/Onboarding.tsx
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight,
  ShieldCheck,
  MousePointerClick,
  Sliders,
  CheckCircle2,
  Key,
  Copy,
  Check,
  CornerDownLeft,
  RefreshCw,
} from 'lucide-react';
import '../styles/globals.css';
import { UserSettings, ProviderType, TonePreset } from '../shared/types';
import { getSettings, saveSettings } from '../shared/storage';
import { generateContent } from '../shared/providers';
import { ChromaticOrb } from '../shared/components/ChromaticOrb';
import { ModelIcon } from '../shared/components/ModelIcon';

export const OnboardingApp: React.FC = () => {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Setup state
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>('mock');
  const [apiKey, setApiKey] = useState('');
  const [defaultTone, setDefaultTone] = useState<TonePreset>('friendly');

  // Interactive Test State
  const [sampleMessage] = useState(
    'Hi! We loved your proposal and want to move forward. Could you let us know your availability for a kickoff call this week?'
  );
  const [sampleIntent, setSampleIntent] = useState('Accept with excitement, suggest Thursday at 2pm');
  const [sampleTone, setSampleTone] = useState<TonePreset>('friendly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sampleOutput, setSampleOutput] = useState('');
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setSelectedProvider(s.provider || 'mock');
      setDefaultTone(s.defaultTone || 'friendly');
    });
  }, []);

  const handleTestGenerate = async () => {
    if (!settings) return;
    setIsGenerating(true);
    setHasCopied(false);

    try {
      const res = await generateContent(
        {
          action: 'reply',
          selectedText: sampleMessage,
          userIntent: sampleIntent,
          tone: sampleTone,
          length: 'balanced',
        },
        {
          ...settings,
          provider: selectedProvider,
          apiKeys: {
            ...settings.apiKeys,
            [selectedProvider]: apiKey || settings.apiKeys[selectedProvider as keyof typeof settings.apiKeys] || '',
          },
        }
      );
      setSampleOutput(res.text);
    } catch (err: unknown) {
      setSampleOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinish = async () => {
    if (!settings) return;
    const updatedKeys = { ...settings.apiKeys };
    if (selectedProvider !== 'mock' && selectedProvider !== 'custom') {
      updatedKeys[selectedProvider as keyof typeof updatedKeys] = apiKey;
    }

    await saveSettings({
      provider: selectedProvider,
      apiKeys: updatedKeys,
      defaultTone,
      onboardingCompleted: true,
    });

    window.close();
  };

  return (
    <div className="min-h-screen bg-[#040407] text-white font-sans flex flex-col justify-between p-6 selection:bg-white/20">
      <div className="max-w-2xl mx-auto w-full pt-6">
        {/* Progress Bar & Header with Chromatic Orb */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ChromaticOrb size={32} isGenerating={false} />
            <span className="font-semibold text-base tracking-tight text-white">SnapReply</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-white'
                    : s < step
                    ? 'w-4 bg-white/40'
                    : 'w-4 bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: WELCOME & WORKFLOW */}
        {step === 1 && (
          <div className="snapreply-obsidian-glass rounded-[32px] p-8 border border-white/12 space-y-6 animate-island-pop">
            <div className="space-y-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                Welcome to SnapReply
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Write better replies in seconds — right where you browse.
              </h1>
              <p className="text-xs text-white/60 leading-relaxed">
                SnapReply is a focused writing companion. It turns incoming messages into clear, polished replies without switching tabs or copy-pasting.
              </p>
            </div>

            {/* Workflow steps card */}
            <div className="space-y-3 pt-1">
              {[
                {
                  icon: MousePointerClick,
                  title: '1. Select any message',
                  desc: 'Highlight incoming text on email, LinkedIn, Slack web, or any webpage.',
                },
                {
                  icon: Sliders,
                  title: '2. Pick your tone & intent',
                  desc: 'Choose Friendly, Professional, Concise, or type a quick instruction.',
                },
                {
                  icon: ChromaticOrb,
                  title: '3. Generate & review draft',
                  desc: 'Get an instant high-quality draft and tweak any words directly.',
                },
                {
                  icon: CornerDownLeft,
                  title: '4. 1-Click Insert or Copy',
                  desc: 'Insert safely into your text box. You always review and send yourself.',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]"
                  >
                    <div className="p-2 rounded-xl bg-white/[0.08] text-white shrink-0">
                      {item.icon === ChromaticOrb ? <ChromaticOrb size={16} /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {item.title}
                      </div>
                      <div className="text-xs text-white/50 mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="h-10 px-5 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PRIVACY FIRST */}
        {step === 2 && (
          <div className="snapreply-obsidian-glass rounded-[32px] p-8 border border-white/12 space-y-6 animate-island-pop">
            <div className="space-y-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Privacy & Security Commitment
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Your data stays strictly under your control.
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                Unlike invasive extensions that read every page you visit, SnapReply operates on explicit user action only.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-1.5">
                <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No Background Scraping
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  We never inspect pages in the background or monitor your browsing history.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-1.5">
                <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Never Auto-Sends
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Insertion never presses enter or submits forms. You are always the one who hits send.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-1.5">
                <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Local Key Storage
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Your API keys and draft history are stored only in your local Chrome profile.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-1.5">
                <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Untrusted Input Defense
                </div>
                <p className="text-xs text-white/50 leading-relaxed">
                  Incoming messages are strictly isolated as untrusted data to protect against prompt injections.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="h-10 px-5 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all"
              >
                <span>Select AI Provider</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROVIDER SETUP */}
        {step === 3 && (
          <div className="snapreply-obsidian-glass rounded-[32px] p-8 border border-white/12 space-y-6 animate-island-pop">
            <div className="space-y-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                Step 3: Setup AI Provider
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                How would you like to run AI generation?
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                You can start instantly with our built-in demo engine, or plug in your preferred AI API key.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div
                onClick={() => setSelectedProvider('nararouter')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedProvider === 'nararouter'
                    ? 'border-white/40 bg-white/[0.09] shadow-sm ring-1 ring-white/20'
                    : 'border-white/[0.08] hover:border-white/20 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white flex items-center gap-2">
                    <ModelIcon provider="nararouter" size={18} />
                    NaraRouter (auto/bynara)
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Real & Humanized
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  Fast, intelligent AI routing for natural, authentic conversational replies.
                </p>
              </div>

              <div
                onClick={() => setSelectedProvider('mock')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedProvider === 'mock'
                    ? 'border-white/40 bg-white/[0.09] shadow-sm ring-1 ring-white/20'
                    : 'border-white/[0.08] hover:border-white/20 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white flex items-center gap-2">
                    <ModelIcon provider="mock" size={18} />
                    Built-in Demo Engine (Fastest)
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    No Key Needed
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  Try all features immediately without entering an API key. Great for getting started in 10 seconds!
                </p>
              </div>

              <div
                onClick={() => setSelectedProvider('openai')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedProvider === 'openai'
                    ? 'border-white/40 bg-white/[0.09] shadow-sm ring-1 ring-white/20'
                    : 'border-white/[0.08] hover:border-white/20 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white flex items-center gap-2">
                    <ModelIcon provider="openai" size={18} />
                    OpenAI (GPT-4o-mini / GPT-4o)
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.08] text-white/70">
                    BYOK
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  Connect your OpenAI API key for maximum versatility and quality.
                </p>
              </div>

              <div
                onClick={() => setSelectedProvider('gemini')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedProvider === 'gemini'
                    ? 'border-white/40 bg-white/[0.09] shadow-sm ring-1 ring-white/20'
                    : 'border-white/[0.08] hover:border-white/20 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white flex items-center gap-2">
                    <ModelIcon provider="gemini" size={18} />
                    Google Gemini (1.5 Flash)
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.08] text-white/70">
                    Generous Free Tier
                  </span>
                </div>
                <p className="text-xs text-white/50">
                  Ultra-fast responses with Google AI Studio free tier.
                </p>
              </div>
            </div>

            {selectedProvider !== 'mock' && (
              <div className="pt-3 border-t border-white/[0.08] space-y-1.5 animate-slide-down">
                <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-white/70" />
                  <span>Enter {selectedProvider.toUpperCase()} API Key</span>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`sk-...`}
                  className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-white/12 bg-black/70 font-mono text-white focus:outline-hidden"
                />
              </div>
            )}

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="h-10 px-5 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all"
              >
                <span>Test Interactive Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: INTERACTIVE DEMO (WITH SCREENSHOT-MATCHING CAPSULE) */}
        {step === 4 && (
          <div className="snapreply-obsidian-glass rounded-[32px] p-8 border border-white/12 space-y-6 animate-island-pop">
            <div className="space-y-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                Step 4: Try Your First Reply
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Test the workflow right now
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                Here is a sample client message. Pick a tone or customize the intent, then generate a response!
              </p>
            </div>

            {/* Sample incoming message */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <div className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1">
                Incoming Message:
              </div>
              <div className="text-xs text-white/80 italic leading-relaxed">
                "{sampleMessage}"
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-white/60 block mb-1.5">
                  Select Tone:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['friendly', 'professional', 'casual', 'concise'] as TonePreset[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSampleTone(t)}
                      className={`px-3 py-1 text-xs rounded-full font-medium capitalize transition-all ${
                        sampleTone === t
                          ? 'bg-white text-black font-semibold shadow-xs'
                          : 'bg-white/[0.05] text-white/70 border border-white/[0.08] hover:bg-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Screenshot Dynamic Island Capsule */}
              <div>
                <label className="text-xs font-medium text-white/60 block mb-1">
                  What do you want to say?
                </label>
                <div className="snapreply-capsule h-12 px-3.5 rounded-full flex items-center gap-3">
                  <ChromaticOrb size={24} isGenerating={isGenerating} />
                  <input
                    type="text"
                    value={sampleIntent}
                    onChange={(e) => setSampleIntent(e.target.value)}
                    placeholder="Ask anything..."
                    className="w-full text-sm bg-transparent text-white placeholder:text-white/40 focus:outline-hidden tracking-tight"
                  />
                </div>
              </div>

              <button
                onClick={handleTestGenerate}
                disabled={isGenerating}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-full bg-white text-black hover:bg-white/90 active:scale-[0.98] text-xs font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" /> : <ChromaticOrb size={18} />}
                <span>{sampleOutput ? 'Regenerate Draft' : 'Generate Test Draft'}</span>
              </button>

              {sampleOutput && (
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/12 space-y-2 animate-slide-up">
                  <div className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
                    Generated Reply:
                  </div>
                  <div className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap font-sans">
                    {sampleOutput}
                  </div>
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(sampleOutput);
                        setHasCopied(true);
                        setTimeout(() => setHasCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 text-xs px-3 py-1 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                    >
                      {hasCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{hasCopied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-white/[0.08]">
              <button
                onClick={() => setStep(3)}
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="h-10 px-6 rounded-full bg-white text-black font-bold text-xs flex items-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Finish & Start Using SnapReply</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-white/30 py-4">
        SnapReply Manifest V3 • You are always in control of what is sent
      </div>
    </div>
  );
};

// Mount Onboarding
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<OnboardingApp />);
}
