import { callGemini, callOpenAI, callDeepSeek } from '@/providers/ai';

export type GenerateAIProps = {
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: 'json_object';
};

/**
 * Executes a fallback chain for AI generation:
 * 1. Gemini
 * 2. OpenAI
 * 3. DeepSeek
 * Ensures the platform never crashes due to a single AI provider failure.
 */
export async function generateWithFallback({ systemPrompt, userPrompt, responseFormat }: GenerateAIProps): Promise<string> {
  const providers = [
    { name: 'Gemini', fn: callGemini },
    { name: 'OpenAI', fn: callOpenAI },
    { name: 'DeepSeek', fn: callDeepSeek },
  ];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      console.log(`[AI Orchestrator] Attempting generation with ${provider.name}...`);
      const result = await provider.fn(systemPrompt, userPrompt, responseFormat);
      if (result) {
        return result;
      }
    } catch (e: any) {
      console.warn(`[AI Orchestrator] ${provider.name} failed:`, e.message || e);
      lastError = e;
    }
  }

  throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
}
