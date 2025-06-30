# 🎨 Template EmailJS Completo - Design Aprimorado

Este é o template HTML completo e aprimorado para o EmailJS, com design moderno em estilo WhatsApp.

## 📋 **Instruções para Configurar no EmailJS:**

### 1. **Acesse o Dashboard do EmailJS**
- Vá para: https://dashboard.emailjs.com/
- Faça login na sua conta

### 2. **Editar o Template Existente**
- Clique em **"Email Templates"**
- Encontre o template `template_r190n0d` 
- Clique em **"Edit Template"**

### 3. **Substituir pelo HTML Completo**
Substitua todo o conteúdo do template pelo código abaixo:

```html
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
                            &copy; {{year}} WhatsApp Dashboard. Todos os direitos reservados.
                        </small>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
```

### 4. **Configurar Assunto do Email**
No campo "Subject", coloque:
```
Código de Verificação - {{to_name}}
```

### 5. **Configurar Nome do Remetente**
No campo "From Name", coloque:
```
{{from_name}}
```

### 6. **Variáveis Utilizadas no Template**
O template usa as seguintes variáveis que são enviadas pelo sistema:

- `{{to_name}}` - Nome do usuário que se cadastrou
- `{{verification_code}}` - Código de 6 dígitos gerado automaticamente
- `{{from_name}}` - Nome do remetente (WhatsApp Dashboard)
- `{{year}}` - Ano atual para o footer

### 7. **Salvar as Alterações**
- Clique em **"Save"** para salvar o template
- O template ID `template_r190n0d` continuará o mesmo

## 🎨 **Recursos do Design:**

### ✨ **Características Visuais:**
- **Tema Escuro**: Estilo WhatsApp com cores #111b21, #202c33
- **Gradientes**: Efeitos visuais modernos
- **Ícone de Cadeado**: Simboliza segurança (🔒)
- **Código Destacado**: Código de verificação em destaque
- **Design Responsivo**: Funciona em desktop e mobile

### 🔧 **Elementos Funcionais:**
- **Código Centralizado**: Fácil de ler e copiar
- **Instruções Claras**: Orientações passo a passo
- **Link de Suporte**: Para ajuda adicional
- **Footer Profissional**: Com direitos autorais e ano atual

## 🧪 **Testar o Template:**

### 1. **Após configurar, teste:**
```bash
cd /c/Users/lucas/OneDrive/Imagens/dashboard
npm run dev
```

### 2. **Acesse o teste de email:**
```
http://localhost:3000/api/test-email
```

### 3. **Ou teste o cadastro completo:**
```
http://localhost:3000/register
```

## 📱 **Preview do Email:**

O email terá essa aparência:

```
┌─────────────────────────────────────┐
│          🔒 Código de Verificação    │
│           Finalize seu cadastro      │
├─────────────────────────────────────┤
│                                     │
│ Olá Lucas,                          │
│                                     │
│ Obrigado por se cadastrar! Para     │
│ concluir seu cadastro, utilize o    │
│ código de verificação abaixo:       │
│                                     │
│ ┌─ Seu código de verificação ─┐     │
│ │        1 2 3 4 5 6          │     │
│ └─────────────────────────────┘     │
│                                     │
│ Digite este código no sistema para  │
│ ativar sua conta.                   │
│                                     │
│ Atenciosamente,                     │
│ WhatsApp Dashboard                  │
├─────────────────────────────────────┤
│ Este é um email automático.         │
│ © 2025 WhatsApp Dashboard          │
└─────────────────────────────────────┘
```

## ✅ **Status Após Configuração:**
- ✅ **Template**: Configurado com design moderno
- ✅ **Variáveis**: Todas mapeadas corretamente  
- ✅ **Sistema**: Pronto para enviar emails
- ✅ **Design**: Responsivo e profissional

O sistema agora enviará emails com um design profissional e moderno! 🎉
