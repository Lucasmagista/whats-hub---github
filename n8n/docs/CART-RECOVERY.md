# 🛒 Recuperação de Carrinho e Fluxo de Multi-Produto

## Visão Geral
Este documento detalha a estratégia e implementação para:
- Carrinho de compras multi-produto no WhatsApp
- Recuperação automática de carrinhos abandonados
- Integração com catálogo Next.js

---

## 1. Carrinho Multi-Produto
- Usuário pode adicionar vários produtos antes de finalizar
- Cada produto: nome, variação, quantidade, observação
- Resumo do carrinho enviado antes da confirmação

### Exemplo de Resumo
```
*Seu Carrinho:*
1. Produto X (Vermelho) x2
2. Produto Y x1
Total: R$ 150,00
```

---

## 2. Recuperação de Carrinho
- Se o usuário não finalizar, bot agenda lembrete automático (ex: após 30min)
- Mensagem: "Seu carrinho está esperando por você! Deseja finalizar a compra?"
- Pode ser customizado por horário e canal

---

## 3. Integração com Catálogo
- Sincronização de produtos, preços e variações
- Carrinho do site pode ser transferido para o WhatsApp e vice-versa
- Webhook para atualização de status do pedido

---

## 4. Boas Práticas
- Não ser invasivo: máximo 2 lembretes por carrinho
- Permitir opt-out: "Não quero mais receber lembretes"
- Logar todas as tentativas de recuperação para analytics

---

## 5. Referências
- [CartContext.js do catálogo](../catalog/web/components/CartContext.js)
- [Fluxo de compra robusto no bot](../whatsapp-webjs-server-complete.js)
