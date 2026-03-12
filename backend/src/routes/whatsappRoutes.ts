import { Router } from 'express';
import { handleWebhook, sendMessage } from '../controllers/whatsappController';
import { authMiddleware } from '../middlewares/authMiddleware';
import express from 'express';

const router = Router();

// Webhook — no auth (Twilio calls this directly)
router.post('/webhook', express.urlencoded({ extended: false }), handleWebhook);
router.post('/send', authMiddleware, sendMessage);

export default router;
