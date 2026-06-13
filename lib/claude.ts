import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function generatePitchSummary(pitchData: any): Promise<string> {
  const prompt = `You are summarising a startup pitch for the Ventexx platform discovery feed. Read the following startup information and write exactly 2-3 sentences that clearly explain: (1) what the business is and how it works, (2) who it serves and where, (3) one specific proof point — traction, market insight, or key feature. Be factual and specific. No hype words. No vague statements. Write like a journalist, not a marketer. Maximum 60 words total.

Startup Data:
Title: ${pitchData.title || 'N/A'}
Tagline: ${pitchData.tagline || 'N/A'}
Problem: ${pitchData.problem || 'N/A'}
Solution: ${pitchData.solution || 'N/A'}
Unique Insight: ${pitchData.unique_insight || 'N/A'}
TAM: ${pitchData.tam || 'N/A'}
Country: ${pitchData.country || 'N/A'}
Stage: ${pitchData.stage || 'N/A'}
Milestones: ${pitchData.milestones || 'N/A'}
MRR: ${pitchData.mrr || 'N/A'}
`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 150,
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  const block = response.content[0];
  if (block.type === 'text') {
    return block.text.trim();
  }
  
  throw new Error('Unexpected response type from Claude');
}
