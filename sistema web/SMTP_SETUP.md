# 📧 Configuração de Email SMTP para WhatsApp Dashboard

## Problema Identificado
O EmailJS não permite chamadas diretas do servidor (erro 403: "API calls are disabled for non-browser applications").

## Solução Implementada
Substituímos o EmailJS por Nodemailer para envio de emails server-side.

## 🔧 Como Configurar o Gmail SMTP

### Passo 1: Ativar Autenticação de Dois Fatores
1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em **Segurança**
3. Ative a **Verificação em duas etapas**

### Passo 2: Gerar Senha de App
1. Ainda em **Segurança**, clique em **Senhas de app**
2. Selecione **Aplicativo**: Outro (nome personalizado)
3. Digite: **WhatsApp Dashboard**
4. Clique em **Gerar**
5. **COPIE** a senha gerada (16 caracteres)

### Passo 3: Configurar o .env
No arquivo `.env`, substitua:
```
SMTP_PASS=sua-senha-de-app-gmail-aqui
```

Por:
```
SMTP_PASS=sua-senha-de-16-caracteres-aqui
```

## 🚀 Vantagens da Nova Solução

1. **Funciona no servidor**: Sem limitações de browser
2. **Mais confiável**: SMTP é protocolo padrão
3. **Melhor template**: HTML responsivo e bonito
4. **Segurança**: Usa autenticação Gmail oficial
5. **Fallback**: Mantém EmailJS para client-side se necessário

## 📋 Variáveis de Ambiente Necessárias

```bash
# SMTP obrigatório
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=lucasmagistav@gmail.com
SMTP_PASS=sua-senha-de-app-aqui
FROM_EMAIL=lucasmagistav@gmail.com
FROM_NAME=WhatsApp Dashboard
```

## 🔍 Testando
Após configurar, teste criando uma nova conta no sistema. Você deve receber um email com o código de verificação.

## 🛠️ Alternativas se Gmail não funcionar
- **Outlook**: smtp.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Sendgrid**: smtp.sendgrid.net:587 (recomendado para produção)

## 📞 Suporte
Se você tiver problemas, verifique:
1. Senha de app está correta
2. Autenticação de dois fatores está ativa
3. Não há erro de firewall/antivírus bloqueando SMTP
