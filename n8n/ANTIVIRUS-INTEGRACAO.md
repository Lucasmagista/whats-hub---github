# Integração Antivírus - WhatsApp Bot

## Visão Geral

Este projeto implementa uma camada de segurança para todos os arquivos e mídias recebidos pelo bot do WhatsApp, utilizando a API de antivírus Scanii. O objetivo é garantir que nenhum arquivo malicioso seja processado, baixado ou encaminhado para o atendimento humano, protegendo tanto a operação quanto os usuários finais.

---

## Como Funciona

1. **Recebimento de Arquivo**: O usuário envia um arquivo (imagem, vídeo, documento, etc) para o bot.
2. **Verificação com Scanii**: O arquivo é enviado para a API Scanii. Se for considerado limpo, segue para a próxima etapa.
3. **Processamento Seguro**: Apenas arquivos limpos são processados e encaminhados.

---

## APIs Utilizadas

### Scanii API
- Endpoint: `https://api.scanii.com/v2.1/files`
- Método: POST
- Autenticação: Basic Auth (API Key e Secret)
- Envio: Multipart/form-data
- Resposta esperada: Sem findings para arquivos limpos

---

## Vantagens da Solução

- **Camada de Segurança**: O antivírus Scanii verifica todos os arquivos recebidos.
- **Automatização**: O usuário é avisado automaticamente em caso de problema, sem intervenção manual.
- **Proteção de Dados e Operação**: Evita que arquivos maliciosos cheguem ao time de atendimento ou sejam processados pelo sistema.

---

## Como Configurar

1. Adicione as variáveis de ambiente no seu `.env`:
   - `SCANII_API_KEY=SEU_API_KEY_SCANII`
   - `SCANII_API_SECRET=SEU_API_SECRET_SCANII`
2. Certifique-se de que as dependências `axios` e `form-data` estão instaladas.
3. O código já está pronto para uso, basta rodar o bot normalmente.

---

## Mensagens de Retorno para o Usuário

- Arquivo limpo: fluxo segue normalmente.
- Arquivo suspeito/bloqueado: "🚫 Arquivo bloqueado: detectamos possível ameaça de vírus ou conteúdo malicioso. Envie outro arquivo ou entre em contato com o suporte."
- Erro de processamento: "❌ Erro ao processar/verificar o arquivo enviado. Tente novamente."

---

## Observações

- O limite de tamanho para análise é de 50MB por arquivo.
- O sistema pode ser expandido para outras APIs de antivírus facilmente.
- O fluxo é transparente para o usuário final, aumentando a confiança no atendimento.

---

## Exemplo de Uso

1. Usuário envia uma foto ou documento.
2. O bot responde imediatamente caso o arquivo seja suspeito.
3. Se o arquivo for limpo, segue o atendimento normalmente (ex: registro de problema, compra, etc).

---

## Manutenção

- Monitore os logs para identificar possíveis falhas de integração com as APIs.
- Atualize as chaves de API periodicamente por segurança.
- Caso a API fique fora do ar, avalie se deseja permitir o upload apenas com uma verificação ou bloquear todos os arquivos temporariamente.

---

## Contato

Dúvidas ou sugestões? Entre em contato com o responsável pelo projeto.
