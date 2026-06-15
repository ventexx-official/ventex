// Raw Integration Wrappers for AI Providers

export async function callGemini(systemPrompt: string, userPrompt: string, responseFormat?: 'json_object'): Promise<string> {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');
  
  const instruction = responseFormat === 'json_object' 
    ? `${systemPrompt}\n\nReturn exactly valid JSON and nothing else.`
    : systemPrompt;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: `${instruction}\n\n${userPrompt}` }] }],
      generationConfig: responseFormat === 'json_object' ? { responseMimeType: "application/json" } : undefined
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API Error: ${err}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return responseFormat === 'json_object' ? text.replace(/```json|```/g, '').trim() : text.trim();
}

export async function callOpenAI(systemPrompt: string, userPrompt: string, responseFormat?: 'json_object'): Promise<string> {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: responseFormat === 'json_object' ? { type: "json_object" } : undefined
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API Error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

export async function callDeepSeek(systemPrompt: string, userPrompt: string, responseFormat?: 'json_object'): Promise<string> {
  if (!process.env.DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY missing');

  // DeepSeek is OpenAI-compatible
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: responseFormat === 'json_object' ? `${systemPrompt}\nReturn exact JSON.` : systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: responseFormat === 'json_object' ? { type: "json_object" } : undefined
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API Error: ${err}`);
  }

  const data = await res.json();
  const text = data.choices[0].message.content.trim();
  return responseFormat === 'json_object' ? text.replace(/```json|```/g, '').trim() : text.trim();
}
