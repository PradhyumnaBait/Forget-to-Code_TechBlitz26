import { Router } from 'express';
import { chat, detectIntent } from '../controllers/aiController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/chat', authMiddleware, chat);
router.post('/intent', authMiddleware, detectIntent);

export default router;
