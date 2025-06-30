# Integração Gofile no WhatsApp Bot

## O que foi implementado?

Agora, todo arquivo (imagem, vídeo, documento, etc) enviado para o bot, após passar pela análise antivírus (Scanii), é automaticamente salvo no serviço Gofile.

- O upload só ocorre se o arquivo for considerado limpo pela API de antivírus.
- O arquivo é salvo em uma "pasta virtual" nomeada com o nome do contato (se disponível) ou número de telefone, junto com a data e hora do recebimento.
- O usuário recebe um link seguro do Gofile para acessar o arquivo salvo.

---

## Como funciona o fluxo

1. **Recebimento da mídia**: O bot intercepta qualquer arquivo enviado.
2. **Análise antivírus**: O arquivo é convertido para buffer e enviado para Scanii.
3. **Upload para Gofile**: Se aprovado, o arquivo é enviado para o Gofile usando a API pública.
   - O nome da pasta segue o padrão: `NOME_CONTATO_YYYY-MM-DD_HH-MM` ou `NUMERO_YYYY-MM-DD_HH-MM`.
   - O link de download é retornado ao usuário.
4. **Falha no upload**: Se o upload falhar, o usuário é avisado, mas o arquivo não é perdido localmente.

---

## Detalhes Técnicos

- **API utilizada**: https://gofile.io/api
- **Processo**:
  1. Buscar o servidor de upload disponível (`/getServer`).
  2. Enviar o arquivo via `multipart/form-data` para o endpoint de upload.
  3. Adicionar metadados na descrição (nome do contato, número, data/hora).
  4. Receber o link de download seguro.
- **Limite de tamanho**: 50MB por arquivo.
- **Dependências**: axios, form-data

---

## Vantagens

- **Organização**: Cada arquivo é salvo em uma pasta virtual separada por contato e data/hora, facilitando buscas e auditoria.
- **Segurança**: Só arquivos limpos são salvos e compartilhados.
- **Acesso fácil**: O usuário recebe o link do arquivo salvo imediatamente após o upload.

---

## Exemplo de pasta criada

- João Silva_2025-06-22_14-30
- 5511999999999_2025-06-22_14-31

---

## Mensagens para o usuário

- Sucesso: `✅ Arquivo salvo com sucesso! Link seguro: <url>`
- Falha no upload: `⚠️ Arquivo limpo, mas não foi possível salvar no Gofile: <erro>`
- Arquivo bloqueado: `🚫 Arquivo bloqueado: detectamos possível ameaça de vírus ou conteúdo malicioso. Envie outro arquivo ou entre em contato com o suporte.`

---

## Observações

- O Gofile não cria pastas reais, mas a descrição do arquivo e o nome do link facilitam a organização.
- O link gerado é público, mas só quem recebe o link pode acessar.
- O sistema pode ser expandido para salvar arquivos em outros serviços de nuvem, se necessário.

---

## Como configurar

- Não é necessário criar conta no Gofile para uploads simples.
- Certifique-se de ter as dependências `axios` e `form-data` instaladas.
- O código já está pronto para uso, basta rodar o bot normalmente.

---

## Manutenção

- Monitore os logs para identificar falhas de upload.
- Caso o Gofile esteja fora do ar, os arquivos não serão perdidos localmente, mas o usuário será avisado.

---

## Dúvidas?
Consulte a documentação oficial do Gofile: https://gofile.io/api
Ou entre em contato com o responsável pelo projeto.
