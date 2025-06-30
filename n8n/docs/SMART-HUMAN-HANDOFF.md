# 👥 Smart Human Handoff (Transferência Inteligente para Atendente)

## Visão Geral
Este documento detalha a lógica e as melhores práticas para:
- Transferência automática e inteligente do bot para atendente humano
- Priorização, histórico e tipo de solicitação
- Integração com painel e APIs REST

---

## 1. Critérios de Transferência
- Solicitação explícita do usuário ("atendente", "humano")
- Detecção de insatisfação ou problema não resolvido
- Falha em etapas críticas do fluxo

---

## 2. Priorização e Fila
- Clientes VIP ou urgentes vão para frente da fila
- Fila gerenciada pela classe `SupportQueue`
- Métricas: tempo de espera, posição, prioridade

---

## 3. Histórico e Contexto
- Todo histórico de mensagens é enviado ao atendente
- Dados do usuário, pedidos e interações anteriores
- Permite atendimento personalizado e rápido

---

## 4. Tipos de Solicitação
- Suporte, dúvidas, reclamações, vendas
- Roteamento por especialidade do atendente (skills)

---

## 5. Integração Técnica
- Webhook para painel humano: `PANEL_WEBHOOK_URL`
- APIs REST para consulta e gestão da fila
- Logs de todas as transferências para auditoria

---

## 6. Referências
- [docs/GUIA-ATENDIMENTO-HUMANO.md](./GUIA-ATENDIMENTO-HUMANO.md)
- [Classe SupportQueue no código](../whatsapp-webjs-server-complete.js)
