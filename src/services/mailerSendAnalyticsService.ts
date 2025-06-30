// Exemplo de função para persistir eventos de webhook do MailerSend
// Adapte para seu banco de dados (MongoDB, PostgreSQL, etc)

import fs from 'fs/promises';

export interface MailerSendWebhookEvent {
  event: string;
  message_id: string;
  recipient: string;
  timestamp: number;
  [key: string]: any;
}

// Exemplo: salva eventos em arquivo local (substitua por persistência real)
export async function saveMailerSendEvent(event: MailerSendWebhookEvent) {
  const logLine = JSON.stringify(event) + '\n';
  await fs.appendFile('mailersend-events.log', logLine);
}

// Use esta função no endpoint de webhook:
// await saveMailerSendEvent(req.body);
