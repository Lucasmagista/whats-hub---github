# 🚨 SOLUÇÃO RÁPIDA - Template EmailJS Básico

O erro HTTP 400 indica que o template `template_r190n0d` não está configurado corretamente no EmailJS.

## ✅ **SOLUÇÃO IMEDIATA:**

### 1. **Acesse o EmailJS Dashboard**
   - Vá em https://dashboard.emailjs.com/
   - Faça login na sua conta

### 2. **Criar Novo Template**
   - Clique em **"Email Templates"**
   - Clique em **"Create New Template"**
   - Use este template básico:

```html
Assunto: Código de Verificação - {{user_name}}

Olá {{user_name}},

{{message}}

Atenciosamente,
Equipe WhatsApp Dashboard
```

### 3. **Variáveis do Template**
No template, use estas variáveis:
- `{{user_name}}` - Nome do usuário
- `{{user_email}}` - Email do usuário  
- `{{message}}` - Mensagem com código

### 4. **Copiar Template ID**
- Após salvar, copie o novo **Template ID**
- Atualize no arquivo `.env`:

```env
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=seu_novo_template_id_aqui
```

### 5. **Verificar Service ID**
- No menu **"Email Services"**
- Confirme se o service `sservice_cmrb7qu` está ativo
- Se não existir, crie um novo e atualize o `.env`

## 🧪 **TESTAR RAPIDAMENTE:**

1. Após atualizar o template, acesse:
   http://localhost:3000/api/test-email

2. Se der sucesso, teste o cadastro completo:
   http://localhost:3000/register

## 📋 **TEMPLATE ALTERNATIVO COMPLETO:**

Se quiser um template mais bonito, use este HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Código de Verificação</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">🔐 Código de Verificação</h2>
        
        <p>Olá <strong>{{user_name}}</strong>,</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <p style="font-size: 18px; margin: 0;">{{message}}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            Este código expira em 10 minutos.<br>
            Se você não solicitou este código, ignore este email.
        </p>
        
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
            WhatsApp Dashboard - Sistema de Verificação
        </p>
    </div>
</body>
</html>
```

## ⚡ **STATUS ATUAL:**
- ✅ **Configuração**: OK
- ✅ **API**: Funcionando  
- ❌ **Template**: Precisa ser reconfigurado
- ✅ **Sistema**: Pronto para funcionar após correção do template

Após seguir estes passos, o sistema de cadastro e verificação por email funcionará perfeitamente!
