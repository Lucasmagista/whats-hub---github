# FOLDER_LOADING_ANIMATION

## Animação de Loading para Pastas

Este documento descreve a animação de loading utilizada nas operações de pasta do Whats Hub, com exemplos de implementação e dicas de UX.

### Características
- Animação CSS customizada (spinner, barra de progresso ou skeleton)
- Feedback visual durante operações longas (upload, leitura, sincronização)
- Compatível com dark e light mode

### Exemplo de Implementação
```css
.folder-loading {
  animation: spin 1s linear infinite;
  border: 4px solid #eee;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### Boas Práticas
- Sempre exibir loading em operações assíncronas que demorem mais de 500ms
- Fornecer mensagem textual junto à animação (ex: "Carregando arquivos...")
- Garantir acessibilidade: contraste, tamanho e descrição para leitores de tela

---
Para detalhes de implementação, veja `FOLDER_LOADING_ANIMATION_IMPLEMENTATION.md`.
