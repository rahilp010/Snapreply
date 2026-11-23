// src/shared/providers/nararouter.ts
import { GenerateRequest, GenerateResponse, UserSettings } from '../types';
import { buildPrompt } from '../prompts';

/**
 * NaraRouter (Bynara) API Integration
 * Endpoint: https://router.bynara.id/v1/chat/completions
 * Model: auto/bynara
 */
export async function nararouterGenerate(
  req: GenerateRequest,
  settings: UserSettings
): Promise<GenerateResponse> {
  const apiKey = settings.apiKeys.nararouter?.trim() || settings.apiKeys.custom?.trim();

  if (!apiKey) {
    throw new Error(
      'NaraRouter API key not configured. Please enter your NaraRouter API key in SnapReply to generate real humanized answers.'
    );
  }

  const model = settings.selectedModels?.nararouter?.trim() || 'auto/bynara';
  const endpoint = 'https://router.bynara.id/v1/chat/completions';

  const { systemPrompt, userPrompt } = buildPrompt(req);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData?.error?.message ||
      `NaraRouter error (${response.status}): ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim() || '';

  if (!text) {
    throw new Error('Received empty response from NaraRouter API.');
  }

  return {
    text,
    requestId: data.id,
    tokensUsed: data.usage?.total_tokens,
    modelUsed: model,
  };
}
