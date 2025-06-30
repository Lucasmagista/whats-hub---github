# Como migrar templates para MailerSend

1. Copie o HTML do template existente.
2. Substitua variáveis do formato antigo (ex: `${nome}` ou `{nome}`) para o padrão MailerSend: `{{nome}}`.
3. Salve o arquivo em `src/templates/mailersend/` com um nome descritivo.
4. No painel MailerSend, crie um novo template e cole o HTML migrado.
5. Use as mesmas variáveis ao enviar o email pelo serviço.

Exemplo de variável dinâmica:
```html
Olá {{user_name}}, seu alerta: {{alert_message}}
```

Recomenda-se validar o template visualmente no painel MailerSend após a migração.
