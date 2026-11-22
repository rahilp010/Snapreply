// src/shared/storage/index.ts
import { UserSettings, HistoryItem } from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  provider: 'mock', // Out-of-the-box working demo mode
  apiKeys: {
    openai: '',
    gemini: '',
    anthropic: '',
    custom: '',
  },
  customEndpoint: 'http://localhost:11434/v1',
  customModel: 'llama3:latest',
  selectedModels: {
    openai: 'gpt-4o-mini',
    gemini: 'gemini-1.5-flash',
    anthropic: 'claude-3-5-haiku-20241022',
  },
  defaultTone: 'friendly',
  defaultLength: 'balanced',
  defaultLanguage: 'Auto',
  customTonePrompt: '',
  theme: 'system',
  floatingActionEnabled: true,
  historyEnabled: true,
  autoCopy: false,
  autoGenerateOnQuestion: true,
  detectCopiedQuestions: true,
  onboardingCompleted: false,
};

const SETTINGS_KEY = 'snapreply_settings';
const HISTORY_KEY = 'snapreply_history';

// Safe storage access with localStorage fallback for web environments
const isChromeStorageAvailable = () => {
  return typeof chrome !== 'undefined' && Boolean(chrome?.storage?.local);
};

export async function getSettings(): Promise<UserSettings> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve) => {
      chrome.storage.local.get([SETTINGS_KEY], (result) => {
        if (result && result[SETTINGS_KEY]) {
          resolve({ ...DEFAULT_SETTINGS, ...result[SETTINGS_KEY] });
        } else {
          resolve(DEFAULT_SETTINGS);
        }
      });
    });
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // Ignore error
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings();
  const updated: UserSettings = { ...current, ...settings };

  if (isChromeStorageAvailable()) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({ [SETTINGS_KEY]: updated }, () => resolve());
    });
  } else {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore error
    }
  }

  return updated;
}

export async function getHistory(): Promise<HistoryItem[]> {
  if (isChromeStorageAvailable()) {
    return new Promise((resolve) => {
      chrome.storage.local.get([HISTORY_KEY], (result) => {
        resolve(result?.[HISTORY_KEY] || []);
      });
    });
  }

  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore error
  }
  return [];
}

export async function addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<HistoryItem[]> {
  const settings = await getSettings();
  if (!settings.historyEnabled) return [];

  const history = await getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  // Keep max 50 items locally
  const updatedHistory = [newItem, ...history].slice(0, 50);

  if (isChromeStorageAvailable()) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({ [HISTORY_KEY]: updatedHistory }, () => resolve());
    });
  } else {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch {
      // Ignore error
    }
  }

  return updatedHistory;
}

export async function deleteHistoryItem(id: string): Promise<HistoryItem[]> {
  const history = await getHistory();
  const updated = history.filter((item) => item.id !== id);

  if (isChromeStorageAvailable()) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({ [HISTORY_KEY]: updated }, () => resolve());
    });
  } else {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Ignore error
    }
  }

  return updated;
}

export async function clearHistory(): Promise<void> {
  if (isChromeStorageAvailable()) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.remove([HISTORY_KEY], () => resolve());
    });
  } else {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Ignore error
    }
  }
}

export async function clearAllLocalData(): Promise<void> {
  if (isChromeStorageAvailable()) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.clear(() => resolve());
    });
  } else {
    try {
      localStorage.clear();
    } catch {
      // Ignore error
    }
  }
}

// Watch settings updates
export function onSettingsChanged(callback: (settings: UserSettings) => void): () => void {
  if (isChromeStorageAvailable()) {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes[SETTINGS_KEY]) {
        callback({ ...DEFAULT_SETTINGS, ...changes[SETTINGS_KEY].newValue });
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }

  const storageHandler = (e: StorageEvent) => {
    if (e.key === SETTINGS_KEY && e.newValue) {
      try {
        callback({ ...DEFAULT_SETTINGS, ...JSON.parse(e.newValue) });
      } catch {
        // Ignore
      }
    }
  };
  window.addEventListener('storage', storageHandler);
  return () => window.removeEventListener('storage', storageHandler);
}
