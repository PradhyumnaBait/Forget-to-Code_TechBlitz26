import OpenAI from 'openai';
import { env } from './environment';

let openaiClient: OpenAI | null = null;

if (env.OPENAI_ENABLED) {
  openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  console.log('✅ OpenAI client initialized');
} else {
  console.log('ℹ️  OpenAI disabled (no OPENAI_API_KEY) — AI features will return mock responses');
}

export { openaiClient };
