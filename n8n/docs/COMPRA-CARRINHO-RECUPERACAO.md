# Guia de Implementação: Carrinho Multi-Produto e Recuperação de Carrinho no Bot WhatsApp

## Objetivo
Este documento detalha a implementação de:
- Carrinho de compras multi-produto
- Recuperação automática de carrinho abandonado
- Integração com o fluxo de compra robusto do bot

---

## 1. Carrinho Multi-Produto
### Funcionalidades
- Usuário pode adicionar vários produtos antes de finalizar
- Exibe resumo do carrinho a cada adição
- Permite remover/alterar itens antes de fechar pedido

### Exemplo de Fluxo
1. Usuário envia nome do produto
2. Bot pergunta quantidade e observações
3. Bot pergunta: "Deseja adicionar mais produtos? (sim/não)"
4. Se sim, repete o fluxo; se não, exibe resumo e segue para dados pessoais

### Estrutura de Dados Sugerida
```js
userData.cart = [
  { nome: 'Produto A', quantidade: 2, observacao: 'Sem açúcar' },
  { nome: 'Produto B', quantidade: 1, observacao: '' }
];
```

---

## 2. Recuperação de Carrinho
### Como Funciona
- Se o usuário abandonar o fluxo (não responder por X minutos), o bot envia lembrete automático
- Mensagem: "Seu pedido está quase pronto! Deseja finalizar?"
- Link para retomar do ponto onde parou

### Implementação
- Salve o estado do carrinho em `userStates.json` ou banco
- Use um job agendado para verificar carrinhos inativos
- Envie lembrete via WhatsApp usando `client.sendMessage`

---

## 3. Boas Práticas
- Sempre confirme antes de finalizar o pedido
- Permita fácil edição/remover itens
- Não force o usuário a finalizar, apenas lembre gentilmente

---

## 4. Troubleshooting
- Verifique se o estado do usuário está sendo salvo corretamente
- Teste o lembrete em diferentes cenários de abandono

---

## 5. Contato
Dúvidas ou sugestões? Fale com a equipe de desenvolvimento: dev@inauguralar.com
