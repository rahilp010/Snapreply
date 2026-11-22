// src/shared/providers/index.ts
import { GenerateRequest, GenerateResponse, UserSettings, ProviderType } from '../types';
import { mockGenerate } from './mock';
import { openAIGenerate } from './openai';
import { geminiGenerate } from './gemini';
import { anthropicGenerate } from './anthropic';
import { customGenerate } from './custom';

export async function generateContent(
  req: GenerateRequest,
  settings: UserSettings
): Promise<GenerateResponse> {
  const provider = settings.provider || 'mock';

  switch (provider) {
    case 'openai':
      return openAIGenerate(req, settings);
    case 'gemini':
      return geminiGenerate(req, settings);
    case 'anthropic':
      return anthropicGenerate(req, settings);
    case 'custom':
      return customGenerate(req, settings);
    case 'mock':
    default:
      return mockGenerate(req);
  }
}

/**
 * Validates connection to the selected provider with a minimal test ping
 */
export async function testProviderConnection(
  provider: ProviderType,
  settings: UserSettings
): Promise<{ success: boolean; message: string; model?: string }> {
  try {
    const testReq: GenerateRequest = {
      action: 'reply',
      selectedText: 'Hello! This is a test connection from SnapReply.',
      tone: 'friendly',
      length: 'short',
    };

    const tempSettings: UserSettings = {
      ...settings,
      provider,
    };

    const res = await generateContent(testReq, tempSettings);
    return {
      success: true,
      message: 'Connection successful! Provider responded cleanly.',
      model: res.modelUsed,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message,
    };
  }
}
