# TROUBLESHOOTING MAILERSEND

## Solução de Problemas na Integração com MailerSend

Este guia traz dicas para resolver problemas comuns ao integrar o Whats Hub com o MailerSend.

### Problemas Comuns e Soluções
- **Credenciais Inválidas**
  - Verifique se o API Token, domínio e remetente estão corretos no `.env`.
- **Template não encontrado**
  - Confirme se o template existe no painel do MailerSend e se o nome/ID está correto.
- **E-mail não enviado**
  - Veja os logs do dashboard e do MailerSend.
  - Verifique se o destinatário está correto e se não há bloqueio do provedor.
- **Variáveis não substituídas**
  - Certifique-se de passar todas as variáveis esperadas pelo template.

### Dicas Gerais
- Sempre teste o envio após qualquer alteração.
- Consulte a documentação oficial do MailerSend para mensagens de erro específicas.
- Use o painel do MailerSend para monitorar status e histórico de envios.

---
Para configuração inicial, veja `GUIA COMPLETO MAILERSEND`.
