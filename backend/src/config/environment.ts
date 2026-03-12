import dotenv from 'dotenv';
dotenv.config();

export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'meddesk-dev-secret-change-in-production',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',

  // Twilio
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER || '',

  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  // App
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Feature flags (computed)
  get IS_DEV() {
    return this.NODE_ENV === 'development';
  },
  get TWILIO_ENABLED() {
    return !!(this.TWILIO_ACCOUNT_SID && this.TWILIO_AUTH_TOKEN);
  },
  get OPENAI_ENABLED() {
    return !!this.OPENAI_API_KEY;
  },
};

// Warn about missing critical vars
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set — database features will fail');
}
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set — using insecure default');
}
