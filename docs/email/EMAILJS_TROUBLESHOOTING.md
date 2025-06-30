# EMAILJS TROUBLESHOOTING

## Solução de Problemas na Integração com EmailJS

Este guia traz dicas para resolver problemas comuns ao integrar o Whats Hub com o EmailJS.

### Problemas Comuns e Soluções
- **Credenciais Inválidas**
  - Verifique se o Service ID, Template ID e Public Key estão corretos no `.env`.
- **Template não encontrado**
  - Confirme se o template existe no painel do EmailJS e se o ID está correto.
- **E-mail não enviado**
  - Veja os logs do dashboard e do EmailJS.
  - Verifique se o destinatário está correto e se não há bloqueio do provedor.
- **Variáveis não substituídas**
  - Certifique-se de passar todas as variáveis esperadas pelo template.

### Dicas Gerais
- Sempre teste o envio após qualquer alteração.
- Consulte a documentação oficial do EmailJS para mensagens de erro específicas.
- Use o painel do EmailJS para monitorar status e histórico de envios.

---
Para configuração inicial, veja `EMAILJS_GUIA_COMPLETO.md`.
