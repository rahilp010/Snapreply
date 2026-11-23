// src/options/Options.tsx
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Key,
  Sliders,
  Shield,
  Keyboard,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  RefreshCw,
  Check,
} from 'lucide-react';
import '../styles/globals.css';
import {
  UserSettings,
  ProviderType,
  TonePreset,
  ResponseLength,
} from '../shared/types';
import {
  getSettings,
  saveSettings,
  clearAllLocalData,
} from '../shared/storage';
import { testProviderConnection, generateContent } from '../shared/providers';
import { SUPPORTED_LANGUAGES } from '../shared/prompts';
import { ChromaticOrb } from '../shared/components/ChromaticOrb';
import { ModelIcon } from '../shared/components/ModelIcon';

type ActiveTab = 'providers' | 'preferences' | 'privacy' | 'shortcuts' | 'playground';

export const OptionsApp: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('providers');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Test connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; model?: string } | null>(null);

  // Playground state
  const [testInput, setTestInput] = useState(
    'Hey, could we move our sync tomorrow from 2pm to 4pm? Let me know if that works for you!'
  );
  const [testIntent, setTestIntent] = useState('Agree, but ask to send the agenda first');
  const [testOutput, setTestOutput] = useState('');
  const [isPlaygroundRunning, setIsPlaygroundRunning] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
    });
  }, []);

  const updateSetting = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    const updated = await saveSettings({ [key]: value });
    setSettings(updated);
    flashSaved();
  };

  const flashSaved = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!settings) return;
    setIsTesting(true);
    setTestResult(null);

    const res = await testProviderConnection(settings.provider, settings);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleRunPlayground = async () => {
    if (!settings || !testInput.trim()) return;
    setIsPlaygroundRunning(true);
    try {
      const res = await generateContent(
        {
          action: 'reply',
          selectedText: testInput,
          userIntent: testIntent,
          tone: settings.defaultTone,
          length: settings.defaultLength,
        },
        settings
      );
      setTestOutput(res.text);
    } catch (err: unknown) {
      setTestOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsPlaygroundRunning(false);
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to delete all stored settings, API keys, and local history? This cannot be undone.')) {
      await clearAllLocalData();
      const fresh = await getSettings();
      setSettings(fresh);
      alert('All SnapReply local data has been erased cleanly.');
    }
  };

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-[#040407] text-white font-sans selection:bg-white/20">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-[#07070a]/80 backdrop-blur-2xl border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChromaticOrb size={30} isGenerating={false} />
            <div>
              <h1 className="font-semibold text-base text-white tracking-tight flex items-center gap-2">
                SnapReply
                <span className="text-[11px] font-light px-3 rounded-full bg-white/[0.08] text-white/80 border border-white/[0.12] uppercase">
                  Settings & AI
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium animate-fade-in">
                <Check className="w-3.5 h-3.5" /> Changes saved
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-60 shrink-0">
          <nav className="space-y-1">
            {[
              { id: 'providers', label: 'AI Provider & Keys', icon: Key },
              { id: 'preferences', label: 'Writing Preferences', icon: Sliders },
              { id: 'privacy', label: 'Privacy & Data', icon: Shield },
              { id: 'shortcuts', label: 'Shortcuts & Usage', icon: Keyboard },
              { id: 'playground', label: 'Test Playground', icon: PlayCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Tab Content Panes */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: AI PROVIDERS */}
          {activeTab === 'providers' && (
            <div className="snapreply-obsidian-glass rounded-[28px] p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">AI Provider Configuration</h2>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  Choose your preferred AI brain. Use our built-in Demo mode for zero-setup testing, or connect your personal API key (BYOK) for direct provider access.
                </p>
              </div>

              {/* Provider Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'nararouter',
                    name: 'NaraRouter (Bynara)',
                    desc: 'Fast AI router (auto/bynara) with natural, humanized replies. Direct endpoint.',
                    badge: 'Real & Humanized',
                  },
                  {
                    id: 'mock',
                    name: 'Built-in Demo Mode',
                    desc: 'Instant, realistic, offline-capable responses. Zero API key required.',
                    badge: 'Ready to use',
                  },
                  {
                    id: 'openai',
                    name: 'OpenAI',
                    desc: 'GPT-4o, GPT-4o-mini. Fast, world-class reasoning and formatting.',
                    badge: 'BYOK',
                  },
                  {
                    id: 'gemini',
                    name: 'Google Gemini',
                    desc: 'Gemini 1.5 Flash / Pro. Generous free tier and low latency.',
                    badge: 'BYOK',
                  },
                  {
                    id: 'anthropic',
                    name: 'Anthropic Claude',
                    desc: 'Claude 3.5 Sonnet / Haiku. Natural, nuanced communication tone.',
                    badge: 'BYOK',
                  },
                  {
                    id: 'custom',
                    name: 'Local / Custom AI',
                    desc: 'Ollama, LM Studio, or custom OpenAI-compatible server endpoints.',
                    badge: 'Local AI',
                  },
                ].map((prov) => {
                  const isSelected = settings.provider === prov.id;
                  return (
                    <div
                      key={prov.id}
                      onClick={() => updateSetting('provider', prov.id as ProviderType)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-white/40 bg-white/[0.09] shadow-sm ring-1 ring-white/20'
                          : 'border-white/[0.08] hover:border-white/20 bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-xs text-white flex items-center gap-2">
                          <ModelIcon provider={prov.id} size={18} />
                          {prov.name}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.08] text-white/70">
                          {prov.badge}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">
                        {prov.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Provider Key / Configuration Details */}
              {settings.provider !== 'mock' && (
                <div className="pt-4 border-t border-white/[0.08] space-y-4">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                    {settings.provider.toUpperCase()} Settings
                  </h3>

                  {settings.provider !== 'custom' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/70 flex items-center justify-between">
                        <span>API Key</span>
                        <a
                          href={
                            settings.provider === 'nararouter'
                              ? 'https://router.bynara.id'
                              : settings.provider === 'openai'
                              ? 'https://platform.openai.com/api-keys'
                              : settings.provider === 'gemini'
                              ? 'https://aistudio.google.com/app/apikey'
                              : 'https://console.anthropic.com/settings/keys'
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-white/70 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          {settings.provider === 'nararouter' ? 'NaraRouter Portal' : 'Get API Key'} <ExternalLink className="w-3 h-3" />
                        </a>
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={settings.apiKeys[settings.provider as keyof typeof settings.apiKeys] || ''}
                          onChange={(e) => {
                            const newKeys = {
                              ...settings.apiKeys,
                              [settings.provider]: e.target.value,
                            };
                            updateSetting('apiKeys', newKeys);
                          }}
                          placeholder={
                            settings.provider === 'nararouter'
                              ? 'Paste your NaraRouter API key (Bearer token)...'
                              : `Enter your ${settings.provider} API key...`
                          }
                          className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-2xl border border-white/12 bg-black/70 font-mono text-white placeholder:text-white/30 focus:border-white/35 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-2.5 text-white/40 hover:text-white"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-white/40">
                        {settings.provider === 'nararouter'
                          ? 'Calls https://router.bynara.id/v1/chat/completions directly. Stored securely in local Chrome storage.'
                          : 'Stored strictly in local Chrome storage. Never sent to any telemetry servers.'}
                      </p>
                    </div>
                  )}

                  {settings.provider === 'custom' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-white/70">
                          Server Endpoint URL
                        </label>
                        <input
                          type="text"
                          value={settings.customEndpoint}
                          onChange={(e) => updateSetting('customEndpoint', e.target.value)}
                          placeholder="http://localhost:11434/v1"
                          className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-white/12 bg-black/70 font-mono text-white focus:outline-hidden"
                        />
                        <p className="text-[11px] text-white/40">
                          Compatible with Ollama (http://localhost:11434/v1), LM Studio, vLLM, etc.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-white/70">
                          Model Name
                        </label>
                        <input
                          type="text"
                          value={settings.customModel}
                          onChange={(e) => updateSetting('customModel', e.target.value)}
                          placeholder="llama3:latest"
                          className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-white/12 bg-black/70 font-mono text-white focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  {/* Model Selector */}
                  {settings.provider === 'nararouter' && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-white/70">
                        NaraRouter Model
                      </label>
                      <input
                        type="text"
                        value={settings.selectedModels.nararouter || 'auto/bynara'}
                        onChange={(e) => {
                          const updated = { ...settings.selectedModels, nararouter: e.target.value };
                          updateSetting('selectedModels', updated);
                        }}
                        placeholder="auto/bynara"
                        className="w-full text-xs px-3.5 py-2.5 rounded-2xl border border-white/12 bg-black/80 font-mono text-white focus:outline-hidden"
                      />
                      <p className="text-[11px] text-white/40">
                        Endpoint: https://router.bynara.id/v1/chat/completions (Default: auto/bynara).
                      </p>
                    </div>
                  )}

                  {settings.provider === 'openai' && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-white/70">
                        OpenAI Model
                      </label>
                      <select
                        value={settings.selectedModels.openai}
                        onChange={(e) => {
                          const updated = { ...settings.selectedModels, openai: e.target.value };
                          updateSetting('selectedModels', updated);
                        }}
                        className="w-full text-xs px-3.5 py-2 rounded-2xl border border-white/12 bg-black/80 text-white focus:outline-hidden"
                      >
                        <option value="gpt-4o-mini">gpt-4o-mini (Fast, highly cost-effective - Recommended)</option>
                        <option value="gpt-4o">gpt-4o (Most intelligent)</option>
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
                      </select>
                    </div>
                  )}

                  {settings.provider === 'gemini' && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-white/70">
                        Gemini Model
                      </label>
                      <select
                        value={settings.selectedModels.gemini}
                        onChange={(e) => {
                          const updated = { ...settings.selectedModels, gemini: e.target.value };
                          updateSetting('selectedModels', updated);
                        }}
                        className="w-full text-xs px-3.5 py-2 rounded-2xl border border-white/12 bg-black/80 text-white focus:outline-hidden"
                      >
                        <option value="gemini-1.5-flash">gemini-1.5-flash (Super fast - Recommended)</option>
                        <option value="gemini-1.5-pro">gemini-1.5-pro (Advanced reasoning)</option>
                        <option value="gemini-2.0-flash">gemini-2.0-flash (Latest preview)</option>
                      </select>
                    </div>
                  )}

                  {settings.provider === 'anthropic' && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-white/70">
                        Claude Model
                      </label>
                      <select
                        value={settings.selectedModels.anthropic}
                        onChange={(e) => {
                          const updated = { ...settings.selectedModels, anthropic: e.target.value };
                          updateSetting('selectedModels', updated);
                        }}
                        className="w-full text-xs px-3.5 py-2 rounded-2xl border border-white/12 bg-black/80 text-white focus:outline-hidden"
                      >
                        <option value="claude-3-5-haiku-20241022">claude-3-5-haiku (Lightning fast - Recommended)</option>
                        <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet (Highest nuance)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Test Connection Button & Status */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="h-10 px-4 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
                  <span>Test Connection</span>
                </button>

                {testResult && (
                  <div
                    className={`flex items-center gap-2 text-xs font-medium px-3.5 py-2 rounded-full border ${
                      testResult.success
                        ? 'bg-emerald-950/70 text-emerald-200 border-emerald-700/50'
                        : 'bg-rose-950/70 text-rose-200 border-rose-700/50'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WRITING PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="snapreply-obsidian-glass rounded-[28px] p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">Writing Preferences & Defaults</h2>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  Customize the default tone, length, and interface behaviors across web apps.
                </p>
              </div>

              {/* Default Tone */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
                  Default Tone
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'friendly', label: 'Friendly' },
                    { id: 'professional', label: 'Professional' },
                    { id: 'casual', label: 'Casual' },
                    { id: 'confident', label: 'Confident' },
                    { id: 'empathetic', label: 'Empathetic' },
                    { id: 'concise', label: 'Concise' },
                    { id: 'custom', label: 'Custom' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateSetting('defaultTone', t.id as TonePreset)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        settings.defaultTone === t.id
                          ? 'bg-white text-black font-semibold shadow-xs'
                          : 'bg-white/[0.05] text-white/70 border border-white/[0.08] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {settings.defaultTone === 'custom' && (
                  <div className="pt-2">
                    <input
                      type="text"
                      value={settings.customTonePrompt}
                      onChange={(e) => updateSetting('customTonePrompt', e.target.value)}
                      placeholder="e.g. In the style of Hemingway, punchy and direct with no adjectives"
                      className="w-full text-xs p-3 rounded-2xl border border-white/12 bg-black/70 text-white placeholder:text-white/40 focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              {/* Default Length */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
                  Default Length
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'short', name: 'Short', desc: '1 to 2 crisp, high-impact sentences' },
                    { id: 'balanced', name: 'Balanced', desc: '1 to 2 paragraphs with standard detail' },
                    { id: 'detailed', name: 'Detailed', desc: 'Comprehensive, structured reply' },
                  ].map((len) => (
                    <div
                      key={len.id}
                      onClick={() => updateSetting('defaultLength', len.id as ResponseLength)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        settings.defaultLength === len.id
                          ? 'border-white/40 bg-white/[0.09] shadow-xs'
                          : 'border-white/[0.08] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white mb-0.5">
                        {len.name}
                      </div>
                      <div className="text-[11px] text-white/50">
                        {len.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Default Language */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">
                  Default Output Language
                </label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => updateSetting('defaultLanguage', e.target.value)}
                  className="w-full sm:w-64 text-xs px-3.5 py-2 rounded-2xl border border-white/12 bg-black/80 text-white focus:outline-hidden"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-white/40">
                  Auto matches the language of the incoming message.
                </p>
              </div>

              {/* UI Toggles */}
              <div className="pt-4 border-t border-white/[0.08] space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.floatingActionEnabled}
                    onChange={(e) => updateSetting('floatingActionEnabled', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-white focus:ring-0"
                  />
                  <div>
                    <span className="font-medium text-xs text-white">
                      Show floating quick action capsule
                    </span>
                    <p className="text-[11px] text-white/50">
                      Displays a subtle Dynamic Island capsule near highlighted text for 1-click reply drafting.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoCopy}
                    onChange={(e) => updateSetting('autoCopy', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-white focus:ring-0"
                  />
                  <div>
                    <span className="font-medium text-xs text-white">
                      Auto-copy drafts to clipboard
                    </span>
                    <p className="text-[11px] text-white/50">
                      Automatically place freshly generated drafts onto the clipboard.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoGenerateOnQuestion ?? true}
                    onChange={(e) => updateSetting('autoGenerateOnQuestion', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-white focus:ring-0"
                  />
                  <div>
                    <span className="font-medium text-xs text-white flex items-center gap-1.5">
                      Auto-answer detected questions
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                        Smart
                      </span>
                    </span>
                    <p className="text-[11px] text-white/50">
                      Automatically detects interrogatives or questions when selecting text and generates an answer without extra clicks.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.detectCopiedQuestions ?? true}
                    onChange={(e) => updateSetting('detectCopiedQuestions', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-white focus:ring-0"
                  />
                  <div>
                    <span className="font-medium text-xs text-white flex items-center gap-1.5">
                      Detect copied questions (Ctrl+C / Cmd+C)
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                        Active
                      </span>
                    </span>
                    <p className="text-[11px] text-white/50">
                      Surfaces the Dynamic Island answer capsule when you copy a question from any webpage.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY & DATA */}
          {activeTab === 'privacy' && (
            <div className="snapreply-obsidian-glass rounded-[28px] p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">Privacy Pledge & Data Governance</h2>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  SnapReply is engineered to respect your privacy with strict local-only data sovereignty.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'No Background Page Scraping',
                    desc: 'SnapReply never scans tabs, feeds, emails, or browsing history in the background. Only text explicitly selected by you when triggering an action is captured.',
                  },
                  {
                    title: 'Direct Provider Communication',
                    desc: 'When using BYOK mode, your requests travel directly from your browser to your chosen AI provider without passing through any intermediate proxy servers.',
                  },
                  {
                    title: 'No Auto-Send Guarantee',
                    desc: 'SnapReply will NEVER send a message or submit a form automatically. You always review, edit, and click Send yourself.',
                  },
                  {
                    title: 'Local-Only Storage',
                    desc: 'All preferences, API keys, and draft history live strictly inside your local Chrome profile and are never synced to any proprietary cloud.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                    <div className="font-semibold text-xs text-white mb-1">
                      {item.title}
                    </div>
                    <div className="text-xs text-white/60 leading-relaxed">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* History Toggle */}
              <div className="pt-4 border-t border-white/[0.08] space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.historyEnabled}
                    onChange={(e) => updateSetting('historyEnabled', e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-white focus:ring-0"
                  />
                  <div>
                    <span className="font-medium text-xs text-white">
                      Keep recent generation history locally
                    </span>
                    <p className="text-[11px] text-white/50">
                      Retains up to 50 recent drafts in local storage for easy recovery.
                    </p>
                  </div>
                </label>

                {/* Clear All Data */}
                <div className="pt-2">
                  <button
                    onClick={handleClearAllData}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-rose-800/60 text-rose-300 hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Local Data & API Keys</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="snapreply-obsidian-glass rounded-[28px] p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">Keyboard Shortcuts</h2>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  Speed up your workflow using native Chromium keyboard shortcuts.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-white">
                      Reply to selected text in webpage
                    </div>
                    <div className="text-xs text-white/50">
                      Opens SnapReply floating overlay with selection pre-filled
                    </div>
                  </div>
                  <kbd className="px-3 py-1 text-xs font-mono font-semibold bg-white/10 border border-white/20 rounded-full text-white">
                    Alt + Shift + R
                  </kbd>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-white">
                      Open SnapReply Toolbar Popup
                    </div>
                    <div className="text-xs text-white/50">
                      Quick manual composer & history drawer
                    </div>
                  </div>
                  <kbd className="px-3 py-1 text-xs font-mono font-semibold bg-white/10 border border-white/20 rounded-full text-white">
                    Alt + Shift + P
                  </kbd>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-white">
                      Close Overlay Panel
                    </div>
                    <div className="text-xs text-white/50">
                      Dismisses active floating assistant
                    </div>
                  </div>
                  <kbd className="px-3 py-1 text-xs font-mono font-semibold bg-white/10 border border-white/20 rounded-full text-white">
                    Escape
                  </kbd>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
                      chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
                    } else {
                      window.open('chrome://extensions/shortcuts', '_blank');
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
                >
                  <span>Open Chrome Shortcuts Manager</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PLAYGROUND */}
          {activeTab === 'playground' && (
            <div className="snapreply-obsidian-glass rounded-[28px] p-6 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">Live AI Test Playground</h2>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">
                  Test your current AI configuration ({settings.provider}) right here with live prompts.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-medium text-white/70">
                    Sample Incoming Message
                  </label>
                  <textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    rows={3}
                    className="mt-1 w-full text-xs p-3 rounded-2xl border border-white/12 bg-black/70 text-white focus:outline-hidden"
                  />
                </div>

                {/* Capsule input matching screenshot */}
                <div>
                  <label className="text-xs font-medium text-white/70 block mb-1">
                    Your Intent / Instruction
                  </label>
                  <div className="snapreply-capsule h-12 px-3.5 rounded-full flex items-center gap-3">
                    <ChromaticOrb size={24} isGenerating={isPlaygroundRunning} />
                    <input
                      type="text"
                      value={testIntent}
                      onChange={(e) => setTestIntent(e.target.value)}
                      placeholder="Ask anything... (e.g. Agree enthusiastically)"
                      className="w-full text-sm bg-transparent text-white placeholder:text-white/40 focus:outline-hidden tracking-tight"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRunPlayground}
                  disabled={isPlaygroundRunning}
                  className="h-10 px-5 rounded-full bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isPlaygroundRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
                  <span>Generate Test Reply</span>
                </button>

                {testOutput && (
                  <div className="pt-2 space-y-1.5 animate-slide-up">
                    <label className="text-xs font-medium text-white/70">
                      Generated Result
                    </label>
                    <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/12 text-xs leading-relaxed whitespace-pre-wrap font-sans text-white/90">
                      {testOutput}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Mount Options
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<OptionsApp />);
}
