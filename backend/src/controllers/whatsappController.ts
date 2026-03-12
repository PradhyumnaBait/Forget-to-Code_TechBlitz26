import { Response, NextFunction, Request } from 'express';
import { AuthRequest, successResponse, errorResponse } from '../types';
import { aiService } from '../services/aiService';
import { messagingService } from '../services/messagingService';
import { z } from 'zod';

// Twilio Webhook — patient sends a WhatsApp message
export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Twilio sends form-encoded data
    const from: string = req.body?.From || '';
    const body: string = req.body?.Body || '';

    if (!from || !body) {
      res.status(200).send('<Response></Response>');
      return;
    }

    // Strip whatsapp: prefix
    const phone = from.replace('whatsapp:', '');

    console.log(`[WhatsApp Webhook] From: ${phone} | Message: ${body}`);

    const reply = await aiService.handleWhatsAppMessage(phone, body);
    await messagingService.sendCustomMessage(phone, reply);

    // Twilio expects TwiML response
    res.status(200).set('Content-Type', 'text/xml').send(`
      <Response>
        <Message>${reply.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Message>
      </Response>
    `);
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { phone, message } = z
      .object({ phone: z.string(), message: z.string() })
      .parse(req.body);

    const ok = await messagingService.sendCustomMessage(phone, message);
    if (!ok) {
      res.status(500).json(errorResponse('Failed to send message'));
      return;
    }
    res.json(successResponse('Message sent'));
  } catch (err) {
    next(err);
  }
};
