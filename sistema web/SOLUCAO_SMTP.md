# 📧 Guia de Solução - Erro SMTP Gmail

## 🚨 Problema Atual
Erro 535-5.7.8: "Username and Password not accepted"

## ✅ Soluções Passo a Passo

### Solução 1: Reconfigurar Senha de App
1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas" se não estiver ativo
3. Vá em "Senhas de app"
4. Delete qualquer senha antiga do WhatsApp Dashboard
5. Crie nova senha para "Outro aplicativo"
6. Nome: "WhatsApp Dashboard"
7. Copie a senha de 16 caracteres **SEM ESPAÇOS**
8. Cole no .env: `SMTP_PASS=abcdwfghijklmnop`

### Solução 2: Verificar Configurações de Segurança
1. Vá em: https://myaccount.google.com/lesssecureapps
2. Se existir, **DESATIVE** "Acesso a app menos seguro"
3. Use apenas "Senhas de app" (mais seguro)

### Solução 3: Verificar Bloqueios
1. Acesse: https://accounts.google.com/DisplayUnlockCaptcha
2. Se houver captcha, complete-o
3. Tente novamente

### Solução 4: Alternativa com Outlook (se Gmail não funcionar)
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu_email@outlook.com
SMTP_PASS=sua_senha_outlook
```

## 🧪 Comandos de Teste

```bash
# Teste a configuração
node scripts/test-smtp.js

# Teste via API
curl http://localhost:3000/api/test-smtp

# Teste no navegador
http://localhost:3000/api/test-smtp
```

## 📞 Suporte

Se nada funcionar, teste com outros provedores:
- **SendGrid** (recomendado para produção)
- **Mailgun**
- **Amazon SES**

## 🎯 Resultado Esperado
Após configurar corretamente, você deve ver:
```
✅ Autenticação SMTP bem-sucedida!
✅ Email enviado com sucesso via SMTP!
```
