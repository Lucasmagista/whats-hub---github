# Configuração do EmailJS - Sistema de Verificação por Email

Este projeto implementa um sistema completo de verificação por email usando EmailJS. Siga os passos abaixo para configurar:

## ✅ **FLUXO IMPLEMENTADO:**

1. **Cadastro** → Usuário preenche formulário
2. **Código Enviado** → Sistema gera código de 6 dígitos e envia por email
3. **Verificação** → Usuário digita código para ativar conta
4. **Ativação** → Conta fica ativa após verificação

## 🔧 **1. Criar conta no EmailJS**

1. Acesse [EmailJS](https://www.emailjs.com/)
2. Crie uma conta gratuita
3. Confirme seu email

## 📧 **2. Configurar Serviço de Email**

1. No dashboard do EmailJS, vá em **Email Services**
2. Clique em **Add New Service**
3. Escolha seu provedor (Gmail recomendado)
4. Configure com suas credenciais
5. **IMPORTANTE**: Anote o **Service ID**

## 📝 **3. Criar Template de Email**

1. Vá em **Email Templates**
2. Clique em **Create New Template**
3. Configure o template com o HTML abaixo:

### Template HTML Completo:

```html
```html
```html
<!-- templateemail.html -->

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #111b21; padding: 48px 0;">
    <tr>
        <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background: #202c33; border-radius: 14px; box-shadow: 0 4px 24px rgba(0,0,0,0.25); overflow: hidden; font-family: 'Segoe UI', Arial, sans-serif;">
                <!-- Header -->
                <tr>
                    <td style="background: linear-gradient(90deg, #222e35 0%, #111b21 100%); padding: 40px 0 24px 0; text-align: center;">
                        <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background: #202c33; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-size: 36px; color: #25d366; margin-bottom: 12px;">
                            &#128274;
                        </div>
                        <h1 style="color: #e9edef; font-size: 30px; margin: 0 0 8px 0; letter-spacing: 1px;">Código de Verificação</h1>
                        <p style="color: #8696a0; font-size: 16px; margin: 0;">Finalize seu cadastro</p>
                    </td>
                </tr>
                <!-- Body -->
                <tr>
                    <td style="padding: 40px 48px 32px 48px; color: #e9edef;">
                        <p style="font-size: 19px; margin: 0 0 18px 0;">Olá <strong>{{to_name}}</strong>,</p>
                        <p style="font-size: 16px; margin: 0 0 28px 0;">
                            Obrigado por se cadastrar! Para concluir seu cadastro, utilize o código de verificação abaixo:
                        </p>
                        <div style="background: #1f2c34; border-left: 5px solid #25d366; padding: 28px 28px 18px 28px; margin-bottom: 28px; border-radius: 8px;">
                            <h2 style="color: #25d366; font-size: 22px; margin: 0 0 14px 0;">Seu código de verificação</h2>
                            <div style="font-size: 32px; font-weight: bold; letter-spacing: 3px; background: #222e35; color: #e9edef; padding: 14px 0; border-radius: 8px; text-align: center; margin-bottom: 10px;">
                                {{verification_code}}
                            </div>
                            <p style="font-size: 15px; color: #8696a0; margin: 0;">
                                Digite este código no sistema para ativar sua conta.<br>
                                Caso não tenha solicitado este cadastro, ignore este email.
                            </p>
                        </div>
                        <p style="font-size: 15px; color: #e9edef; margin: 36px 0 0 0;">
                            Se precisar de suporte ou tiver dúvidas, entre em contato conosco respondendo este email ou acesse nosso <a href="https://seusite.com/suporte" style="color: #25d366; text-decoration: underline;">canal de suporte</a>.
                        </p>
                        <p style="font-size: 15px; color: #e9edef; margin: 0;">
                            Atenciosamente,<br>
                            <strong>{{from_name}}</strong>
                        </p>
                    </td>
                </tr>
                <!-- Divider -->
                <tr>
                    <td style="padding: 0 48px;">
                        <hr style="border: none; border-top: 1px solid #222e35; margin: 0;">
                    </td>
                </tr>
                <!-- Footer -->
                <tr>
                    <td style="background: #111b21; padding: 28px 48px; text-align: center;">
                        <small style="color: #8696a0; font-size: 13px; display: block; margin-bottom: 6px;">
                            Este é um email automático. Por favor, não responda diretamente a esta mensagem.
                        </small>
                        <small style="color: #3b4a54; font-size: 12px;">
                            &copy; {{year}} Seu Projeto. Todos os direitos reservados.
                        </small>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
```
```

4. **IMPORTANTE**: Anote o **Template ID**

## 🔑 **4. Configurar Variáveis de Ambiente**

No seu arquivo `.env`, configure:

```env
# EmailJS Configuration (OBRIGATÓRIO)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=seu_service_id_aqui
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=seu_template_id_aqui
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=sua_public_key_aqui
```

## 🔗 **5. Obter Public Key**

1. No dashboard do EmailJS, vá em **Integration**
2. Copie a **Public Key**
3. Cole na variável `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

## 🧪 **6. Testar Sistema Completo**

### Para testar o fluxo completo:

1. Execute o projeto: `npm run dev`
2. Acesse `http://localhost:3000/register`
3. Cadastre um usuário **com seu email real**
4. Verifique se recebeu o email com código de 6 dígitos
5. Digite o código na página de verificação
6. Confirme que a conta foi ativada

### URLs do Sistema:
- **Cadastro**: `/register`
- **Verificação**: `/verify-email?email=usuario@email.com`
- **Login**: `/login`

## 📋 **APIs Implementadas**

- `POST /api/auth/register` - Criar conta e enviar código
- `POST /api/auth/verify-email` - Verificar código
- `POST /api/auth/resend-verification` - Reenviar código

## 🎯 **Tipos de Email Enviados**

- **🔐 Verification Email**: Código de 6 dígitos para ativar conta
- **🎉 Welcome Email**: Enviado após verificação (opcional)
- **🔄 Password Reset**: Para redefinição de senha
- **📢 Notifications**: Notificações gerais do sistema

## ⚠️ **Limitações e Considerações**

### Plano Gratuito EmailJS:
- ❌ **200 emails/mês**
- ❌ **Rate limiting**
- ❌ **Pode ir para spam**

### Para Produção:
- ✅ **Use um serviço SMTP dedicado** (SendGrid, Mailgun, SES)
- ✅ **Configure SPF, DKIM, DMARC**
- ✅ **Use domínio próprio**

## 🚨 **Troubleshooting**

### ❌ Email não está sendo enviado
- ✅ Verifique as 3 variáveis de ambiente
- ✅ Confirme que o serviço está ativo no EmailJS
- ✅ Teste com seu próprio email primeiro
- ✅ Verifique o console do browser/servidor para erros

### ❌ Emails indo para spam
- ✅ Use Gmail/Outlook como provedor no EmailJS
- ✅ Teste com vários provedores de email
- ✅ Não use palavras como "grátis", "promoção" no assunto

### ❌ Código não está sendo validado
- ✅ Verifique se o banco de dados está funcionando
- ✅ Confirme que a tabela `VerificationToken` existe
- ✅ Verifique se o código não expirou (10 minutos)

### ❌ "Cannot read properties of undefined"
- ✅ Execute `npx prisma db push` para criar as tabelas
- ✅ Verifique se todas as migrações foram aplicadas

## 🔧 **Comandos Úteis**

```bash
# Resetar banco de dados
npx prisma db push --force-reset

# Ver banco de dados
npx prisma studio

# Gerar cliente Prisma
npx prisma generate

# Executar em desenvolvimento
npm run dev
```

## 🎯 **Status das Funcionalidades**

- ✅ **Sistema de cadastro com verificação**
- ✅ **Envio de código de 6 dígitos**
- ✅ **Página de verificação com timer**
- ✅ **Reenvio de código**
- ✅ **Validação server-side**
- ✅ **Logs de segurança**
- ✅ **Interface moderna e responsiva**

O sistema está **100% funcional** e pronto para uso!
