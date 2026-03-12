import { openaiClient } from '../config/openai';
import { AIIntent } from '../types';
import prisma from '../config/database';
import { slotService } from './slotService';

interface IntentResult {
  intent: AIIntent;
  date?: string;
  time?: string;
  appointmentId?: string;
  message?: string;
}

const SYSTEM_PROMPT = `You are an AI assistant for MedDesk, a clinic management system.
Your role is to help patients book appointments, check status, and get clinic information.
Today's date: ${new Date().toISOString().split('T')[0]}

When responding:
- Be concise and friendly
- For bookings, confirm date and time
- Always respond in the same language as the user
- For intent detection, return JSON

Clinic hours: Monday–Saturday, 9:00 AM – 6:00 PM
Consultation fee: ₹500`;

export class AIService {
  async detectIntent(message: string): Promise<IntentResult> {
    if (!openaiClient) {
      return this.mockIntentDetection(message);
    }

    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `${SYSTEM_PROMPT}
            
Analyze the user message and return ONLY a JSON object with:
{
  "intent": "BOOK_APPOINTMENT|CANCEL_APPOINTMENT|RESCHEDULE_APPOINTMENT|CHECK_APPOINTMENT|CLINIC_INFO|QUEUE_STATUS|UNKNOWN",
  "date": "YYYY-MM-DD or null",
  "time": "HH:MM or null",
  "appointmentId": "id or null",
  "message": "brief explanation"
}`,
          },
          { role: 'user', content: message },
        ],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content) as IntentResult;
      }
    } catch (err) {
      console.error('[AI intent error]', err);
    }

    return { intent: AIIntent.UNKNOWN, message: 'Could not determine intent' };
  }

  async chat(
    message: string,
    conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
  ): Promise<string> {
    if (!openaiClient) {
      return this.mockChat(message);
    }

    try {
      // Get available slots for context
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const slots = await slotService.getAvailableSlots(tomorrowStr);

      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `${SYSTEM_PROMPT}
Available slots for tomorrow (${tomorrowStr}): ${slots.slice(0, 5).join(', ')}${slots.length > 5 ? ' and more' : ''}`,
          },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return (
        response.choices[0]?.message?.content ||
        'I apologize, I could not process your request. Please try again.'
      );
    } catch (err) {
      console.error('[AI chat error]', err);
      return 'I am currently unavailable. Please call the clinic directly.';
    }
  }

  async handleWhatsAppMessage(
    phone: string,
    message: string
  ): Promise<string> {
    const intent = await this.detectIntent(message);

    switch (intent.intent) {
      case AIIntent.BOOK_APPOINTMENT: {
        if (intent.date) {
          const slots = await slotService.getAvailableSlots(intent.date);
          if (slots.length === 0) {
            return `Sorry, no slots available on ${intent.date}. Try another date?`;
          }
          return `Available slots on ${intent.date}:\n${slots.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nReply with the slot number or time to book.`;
        }
        const dates = await slotService.getAvailableDates(7);
        return `I can help book an appointment! Available days this week:\n${dates.slice(0, 5).join('\n')}\n\nWhich date works for you?`;
      }

      case AIIntent.CANCEL_APPOINTMENT:
        return 'To cancel your appointment, please provide your appointment ID or contact the clinic at +91-XXXXXXXXXX.';

      case AIIntent.CHECK_APPOINTMENT:
        return 'Please provide your appointment ID to check the status, or visit our website.';

      case AIIntent.QUEUE_STATUS:
        return 'Please visit the clinic reception desk to get your queue position, or check the patient portal.';

      case AIIntent.CLINIC_INFO:
        return '🏥 *MedDesk Clinic*\n\n⏰ Hours: Mon–Sat, 9AM–6PM\n💰 Consultation: ₹500\n📞 Call us for emergencies\n\nWould you like to book an appointment?';

      default:
        return await this.chat(message);
    }
  }

  private mockIntentDetection(message: string): IntentResult {
    const lower = message.toLowerCase();
    if (lower.includes('book') || lower.includes('appointment')) {
      return { intent: AIIntent.BOOK_APPOINTMENT, message: 'Booking intent detected' };
    }
    if (lower.includes('cancel')) {
      return { intent: AIIntent.CANCEL_APPOINTMENT, message: 'Cancellation intent detected' };
    }
    if (lower.includes('reschedule')) {
      return { intent: AIIntent.RESCHEDULE_APPOINTMENT, message: 'Reschedule intent detected' };
    }
    if (lower.includes('queue') || lower.includes('wait')) {
      return { intent: AIIntent.QUEUE_STATUS, message: 'Queue status intent detected' };
    }
    if (lower.includes('hours') || lower.includes('clinic') || lower.includes('fee')) {
      return { intent: AIIntent.CLINIC_INFO, message: 'Clinic info intent detected' };
    }
    return { intent: AIIntent.UNKNOWN, message: 'Could not determine intent (AI disabled)' };
  }

  private async mockChat(message: string): Promise<string> {
    const lower = message.toLowerCase();
    if (lower.includes('book')) {
      const dates = await slotService.getAvailableDates(3);
      return `I can help you book an appointment! Available dates: ${dates.join(', ')}. Which date works for you?`;
    }
    if (lower.includes('hours')) {
      return 'We are open Monday to Saturday, 9:00 AM to 6:00 PM.';
    }
    if (lower.includes('fee')) {
      return 'The consultation fee is ₹500.';
    }
    return 'Hello! I am the MedDesk AI assistant. I can help you book appointments, check clinic hours, or answer general questions. How can I help?';
  }
}

export const aiService = new AIService();
