/**
 * Ventex AI Provider System
 * Implements fallback logic: Gemini -> OpenAI -> DeepSeek
 */

interface AIProviderOptions {
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: 'text' | 'json_object';
}

/**
 * Attempts to generate content using Gemini.
 */
async function callGemini(options: AIProviderOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not found');

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: options.systemPrompt }]
      },
      contents: [{
        role: 'user',
        parts: [{ text: options.userPrompt }]
      }],
      generationConfig: {
        responseMimeType: options.responseFormat === 'json_object' ? 'application/json' : 'text/plain',
      }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API Error: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty text');
  return text;
}

/**
 * Attempts to generate content using OpenAI.
 */
async function callOpenAI(options: AIProviderOptions): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not found');

  const payload: any = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: options.systemPrompt },
      { role: 'user', content: options.userPrompt }
    ]
  };

  if (options.responseFormat === 'json_object') {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API Error: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned empty text');
  return text;
}

/**
 * Attempts to generate content using DeepSeek.
 */
async function callDeepSeek(options: AIProviderOptions): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not found');

  const payload: any = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: options.systemPrompt },
      { role: 'user', content: options.userPrompt }
    ]
  };

  if (options.responseFormat === 'json_object') {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`DeepSeek API Error: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('DeepSeek returned empty text');
  return text;
}

/**
 * Main export for AI generation with automatic fallback.
 */
export async function generateAIContent(options: AIProviderOptions): Promise<string> {
  let lastError: Error | unknown;

  try {
    return await callGemini(options);
  } catch (e) {
    console.warn('[AI] Gemini failed, falling back to OpenAI:', e);
    lastError = e;
  }

  try {
    return await callOpenAI(options);
  } catch (e) {
    console.warn('[AI] OpenAI failed, falling back to DeepSeek:', e);
    lastError = e;
  }

  try {
    return await callDeepSeek(options);
  } catch (e) {
    console.error('[AI] All AI providers failed. Last error from DeepSeek:', e);
    lastError = e;
  }

  throw new Error(`All AI providers failed. Last error: ${lastError}`);
}
