// src/shared/providers/anthropic.ts
import { GenerateRequest, GenerateResponse, UserSettings } from '../types';
import { buildPrompt } from '../prompts';

export async function anthropicGenerate(req: GenerateRequest, settings: UserSettings): Promise<GenerateResponse> {
  const apiKey = settings.apiKeys.anthropic?.trim();
  if (!apiKey) {
    throw new Error('Anthropic API Key is missing. Please add your API key in SnapReply Settings.');
  }

  const model = settings.selectedModels.anthropic || 'claude-3-5-haiku-20241022';
  const { systemPrompt, userPrompt } = buildPrompt(req);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'dangerously-allow-browser': 'true', // Required when calling directly from client/extension
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      max_tokens: 600,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Anthropic error (${response.status}): ${response.statusText}`;

    if (response.status === 401) {
      throw new Error('Invalid Anthropic API Key. Please verify your key in Settings.');
    }
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.content?.[0]?.text?.trim() || '';

  if (!text) {
    throw new Error('Received empty response from Anthropic Claude. Please try again.');
  }

  return {
    text,
    requestId: data.id,
    tokensUsed: (data?.usage?.input_tokens || 0) + (data?.usage?.output_tokens || 0),
    modelUsed: model,
  };
}
