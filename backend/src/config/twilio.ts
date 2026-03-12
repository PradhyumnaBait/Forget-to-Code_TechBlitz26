import twilio from 'twilio';
import { env } from './environment';

let twilioClient: ReturnType<typeof twilio> | null = null;

if (env.TWILIO_ENABLED) {
  twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  console.log('✅ Twilio client initialized');
} else {
  console.log('ℹ️  Twilio disabled (no credentials) — messages will be logged to console');
}

export { twilioClient };
