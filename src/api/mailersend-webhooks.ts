// Endpoint básico para receber webhooks do MailerSend
import type { NextApiRequest, NextApiResponse } from 'next';

// Exemplo de tipos de eventos
const SUPPORTED_EVENTS = [
  'delivered',
  'opened',
  'clicked',
  'bounced',
  'spam',
  'unsubscribed',
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const event = req.body.event;
  if (!SUPPORTED_EVENTS.includes(event)) {
    return res.status(400).json({ error: 'Evento não suportado' });
  }

  // Aqui você pode processar e armazenar o evento (ex: atualizar status no banco)
  // Exemplo: console.log('Webhook recebido:', req.body);

  res.status(200).json({ received: true });
}

/**
 * Para conectar este endpoint ao MailerSend:
 * 1. No painel MailerSend, acesse Webhooks > Add Webhook.
 * 2. Informe a URL deste endpoint (ex: https://seusite.com/api/mailersend-webhooks).
 * 3. Selecione os eventos desejados (delivered, opened, etc).
 * 4. Salve e teste o webhook.
 */
