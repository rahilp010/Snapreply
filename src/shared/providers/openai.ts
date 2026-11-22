// src/shared/providers/openai.ts
import { GenerateRequest, GenerateResponse, UserSettings } from '../types';
import { buildPrompt } from '../prompts';

export async function openAIGenerate(req: GenerateRequest, settings: UserSettings): Promise<GenerateResponse> {
  const apiKey = settings.apiKeys.openai?.trim();
  if (!apiKey) {
    throw new Error('OpenAI API Key is missing. Please add your API key in SnapReply Settings.');
  }

  const model = settings.selectedModels.openai || 'gpt-4o-mini';
  const { systemPrompt, userPrompt } = buildPrompt(req);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `OpenAI error (${response.status}): ${response.statusText}`;

    if (response.status === 401) {
      throw new Error('Invalid OpenAI API Key. Please verify your key in Settings.');
    }
    if (response.status === 429) {
      throw new Error('OpenAI rate limit or quota exceeded. Please check your account usage.');
    }
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim() || '';

  if (!text) {
    throw new Error('Received empty response from OpenAI. Please try again.');
  }

  return {
    text,
    requestId: data.id,
    tokensUsed: data.usage?.total_tokens,
    modelUsed: model,
  };
}
