# DASHBOARD_ELEMENTOS

Este documento lista e detalha todos os elementos presentes no dashboard do Whats Hub, com exemplos de uso e recomendações de implementação.

## Elementos do Dashboard

### 1. Status do Bot
- Exibe o estado atual do bot (Online, Offline, Carregando, Erro).
- Recomendações:
  - Use cores distintas para cada status.
  - Exemplo: Verde (Online), Vermelho (Erro), Amarelo (Carregando).
  - Exemplo de uso:
    ```tsx
    <BotStatus status={status} />
    ```

### 2. Logs em Tempo Real
- Mostra logs recebidos do backend em tempo real.
- Recomendações:
  - Exibir mensagem "Sem logs recentes" após 5 segundos sem eventos.
  - Permitir busca e filtro nos logs.
  - Exemplo de uso:
    ```tsx
    <BotLogsModal logs={logs} isOpen={isLogsOpen} />
    ```

### 3. QR Code para Autenticação
- Exibe QR Code para autenticação do bot no WhatsApp.
- Recomendações:
  - Atualizar QR Code automaticamente se expirar.
  - Exibir mensagem de erro se não for possível gerar o QR Code.
  - Exemplo de uso:
    ```tsx
    <QRCodeModal qrCode={qrCode} isOpen={isQrOpen} />
    ```

### 4. Gerenciamento de Tickets
- Permite visualizar, criar e fechar tickets de atendimento.
- Recomendações:
  - Exibir status do ticket (aberto, em andamento, fechado).
  - Permitir busca por ID, cliente ou status.

### 5. Métricas e Relatórios
- Exibe métricas em tempo real e relatórios exportáveis.
- Recomendações:
  - Gráficos de mensagens enviadas, recebidas, tempo de resposta.
  - Exportação para PDF/CSV.

### 6. Configurações de E-mail
- Permite configurar remetente, destinatário e templates de e-mail.
- Recomendações:
  - Validar campos obrigatórios.
  - Exibir status de envio/teste.

---

Para detalhes de implementação e exemplos avançados, consulte também o arquivo `DASHBOARD_MELHORADA.MD`.
