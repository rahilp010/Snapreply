// src/shared/providers/custom.ts
import { GenerateRequest, GenerateResponse, UserSettings } from '../types';
import { buildPrompt } from '../prompts';

export async function customGenerate(req: GenerateRequest, settings: UserSettings): Promise<GenerateResponse> {
  const endpoint = settings.customEndpoint?.trim() || 'http://localhost:11434/v1';
  const model = settings.customModel?.trim() || 'llama3:latest';
  const apiKey = settings.apiKeys.custom?.trim();

  const { systemPrompt, userPrompt } = buildPrompt(req);

  const url = `${endpoint.replace(/\/$/, '')}/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Custom AI server error (${response.status}): ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim() || '';

  if (!text) {
    throw new Error('Received empty response from custom AI server.');
  }

  return {
    text,
    requestId: data.id,
    tokensUsed: data.usage?.total_tokens,
    modelUsed: model,
  };
}
