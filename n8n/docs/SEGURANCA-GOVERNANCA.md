# Guia de Segurança, Governança e Backup para Bot WhatsApp

## Objetivo
Este documento orienta sobre:
- Limitação de taxa (rate limiting)
- Logging e trilha de auditoria
- Perfis de usuário e permissões
- Rotinas de backup automático

---

## 1. Rate Limiting
### O que fazer
- Limite uploads de comprovantes e ações sensíveis por tempo/usuário
- Use um middleware para bloquear excessos

### Exemplo
```js
if (userActionCount > 5 por hora) {
  await client.sendMessage(chatId, 'Você atingiu o limite de ações. Tente novamente mais tarde.');
}
```

---

## 2. Logging e Auditoria
- Registre todas as ações críticas (pedidos, uploads, transferências)
- Use logs rotativos e salve em arquivo seguro
- Exemplo: `logs/audit-2025-06-28.log`

---

## 3. Perfis de Usuário
- Defina perfis: cliente, parceiro, staff
- Restrinja comandos sensíveis por perfil
- Salve perfil no estado do usuário

---

## 4. Backup Automático
- Agende backup de `userStates.json`, pedidos e uploads
- Use scripts em `scripts/db-backup.js` e `scripts/db-reset.js`
- Recomende backup externo (cloud, S3, etc)

---

## 5. Boas Práticas
- Nunca exponha dados sensíveis em logs
- Use variáveis de ambiente para segredos
- Teste restauração de backup periodicamente

---

## 6. Troubleshooting
- Falha no backup? Verifique permissões e espaço em disco
- Logs não aparecem? Cheque configuração e rotação

---

## 7. Contato
Dúvidas ou sugestões? Fale com a equipe de desenvolvimento: dev@inauguralar.com
