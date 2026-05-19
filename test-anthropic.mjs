import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

async function test() {
  console.log('Testing Anthropic directly...');
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150,
      messages: [
        { role: 'user', content: 'Say hello world' }
      ]
    });
    console.log(response.content[0]);
  } catch (err) {
    console.error('Anthropic Error:', err);
  }
}

test();
