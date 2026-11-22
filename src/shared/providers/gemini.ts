// src/shared/providers/gemini.ts
import { GenerateRequest, GenerateResponse, UserSettings } from '../types';
import { buildPrompt } from '../prompts';

export async function geminiGenerate(req: GenerateRequest, settings: UserSettings): Promise<GenerateResponse> {
  const apiKey = settings.apiKeys.gemini?.trim();
  if (!apiKey) {
    throw new Error('Google Gemini API Key is missing. Please add your API key in SnapReply Settings.');
  }

  const model = settings.selectedModels.gemini || 'gemini-1.5-flash';
  const { systemPrompt, userPrompt } = buildPrompt(req);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n---\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Gemini API error (${response.status}): ${response.statusText}`;

    if (response.status === 400 && message.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Gemini API Key. Please verify your key in Settings.');
    }
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

  if (!text) {
    throw new Error('Received empty response from Gemini. Please try again.');
  }

  return {
    text,
    tokensUsed: data?.usageMetadata?.totalTokenCount,
    modelUsed: model,
  };
}
