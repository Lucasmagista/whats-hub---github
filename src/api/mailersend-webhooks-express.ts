// Endpoint Express para receber webhooks do MailerSend
import express, { Request, Response } from 'express';
import { saveMailerSendEvent } from '../services/mailerSendAnalyticsService';

const router = express.Router();

const SUPPORTED_EVENTS = [
  'delivered',
  'opened',
  'clicked',
  'bounced',
  'spam',
  'unsubscribed',
];

router.post('/api/mailersend-webhooks', express.json(), async (req: Request, res: Response) => {
  const event = req.body.event;
  if (!SUPPORTED_EVENTS.includes(event)) {
    return res.status(400).json({ error: 'Evento não suportado' });
  }

  // Persistência do evento recebido
  await saveMailerSendEvent(req.body);

  res.status(200).json({ received: true });
});

export default router;

/**
 * Para usar:
 * 1. Importe este router no seu app Express principal:
 *    import mailersendWebhooks from './api/mailersend-webhooks-express';
 *    app.use(mailersendWebhooks);
 * 2. Configure a URL no painel MailerSend para apontar para /api/mailersend-webhooks
 */
