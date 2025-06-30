# 🛡️ Segurança, Rate Limiting e Governança

## Visão Geral
Este documento cobre as práticas e implementações para:
- Rate limiting (limite de requisições)
- Logging e trilha de auditoria
- Perfis de usuário e permissões
- Rotinas de backup automático

---

## 1. Rate Limiting
- Limita ações sensíveis (ex: upload de comprovante, cadastro)
- Implementado via middleware Express e lógica customizada
- Parâmetros configuráveis em `config-manager.js`

### Exemplo
```js
app.use('/api/', rateLimitMiddleware({ windowMs: 60000, maxRequests: 100 }));
```

---

## 2. Logging e Auditoria
- Logs detalhados de todas as ações críticas
- Logs em arquivo (`/logs`) e console
- Trilha de auditoria para uploads, pedidos, transferências

---

## 3. Perfis de Usuário
- Perfis: admin, operador, cliente, parceiro
- Controle de acesso por função (role)
- Exemplo: `role: 'admin'` no modelo User

---

## 4. Backup Automático
- Backup periódico do banco e arquivos críticos
- Scripts: `scripts/db-backup.js`, pasta `/backups`
- Configuração em `config-manager.js` e `.env`

---

## 5. Boas Práticas
- Sanitização e validação de entrada
- Controle de acesso por API Key e JWT
- Logs de erro e alertas automáticos

---

## 6. Referências
- [SEGURANCA-BOAS-PRATICAS.md](./SEGURANCA-BOAS-PRATICAS.md)
- [config-manager.js](../config-manager.js)
- [scripts/db-backup.js](../scripts/db-backup.js)
