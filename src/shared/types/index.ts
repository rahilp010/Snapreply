// src/shared/types/index.ts

export type SnapReplyAction =
  | 'reply'
  | 'rewrite'
  | 'professional'
  | 'friendly'
  | 'shorten'
  | 'explain'
  | 'summarize'
  | 'translate';

export type TonePreset =
  | 'friendly'
  | 'professional'
  | 'casual'
  | 'confident'
  | 'empathetic'
  | 'concise'
  | 'custom';

export type ResponseLength = 'short' | 'balanced' | 'detailed';

export type ProviderType = 'mock' | 'nararouter' | 'openai' | 'gemini' | 'anthropic' | 'custom';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserSettings {
  provider: ProviderType;
  apiKeys: {
    nararouter: string;
    openai: string;
    gemini: string;
    anthropic: string;
    custom: string;
  };
  customEndpoint: string;
  customModel: string;
  selectedModels: {
    nararouter?: string;
    openai: string;
    gemini: string;
    anthropic: string;
  };
  defaultTone: TonePreset;
  defaultLength: ResponseLength;
  defaultLanguage: string;
  customTonePrompt: string;
  theme: ThemeMode;
  floatingActionEnabled: boolean;
  historyEnabled: boolean;
  autoCopy: boolean;
  autoGenerateOnQuestion: boolean;
  detectCopiedQuestions: boolean;
  onboardingCompleted: boolean;
}

export interface GenerateRequest {
  action: SnapReplyAction;
  selectedText: string;
  userIntent?: string;
  tone?: TonePreset;
  language?: string;
  length?: ResponseLength;
  customTonePrompt?: string;
}

export interface GenerateResponse {
  text: string;
  requestId?: string;
  tokensUsed?: number;
  modelUsed?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  action: SnapReplyAction;
  tone?: TonePreset;
  length?: ResponseLength;
  language?: string;
  originalText: string;
  userIntent?: string;
  resultText: string;
}

export interface InsertResult {
  success: boolean;
  fallbackToCopy: boolean;
  reason?: string;
}

// Inter-process messaging message types
export type MessageType =
  | 'GET_SELECTION'
  | 'SELECTION_CAPTURED'
  | 'TRIGGER_ACTION'
  | 'OPEN_OVERLAY'
  | 'CLOSE_OVERLAY'
  | 'GENERATE_REQUEST'
  | 'GENERATE_RESPONSE'
  | 'INSERT_TEXT'
  | 'INSERT_RESPONSE'
  | 'GET_SETTINGS'
  | 'SAVE_SETTINGS'
  | 'CLEAR_ALL_DATA'
  | 'TEST_PROVIDER';

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
  source?: 'popup' | 'background' | 'content' | 'options' | 'onboarding';
}
