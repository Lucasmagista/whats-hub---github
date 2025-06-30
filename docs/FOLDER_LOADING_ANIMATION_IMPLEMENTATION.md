# FOLDER_LOADING_ANIMATION_IMPLEMENTATION

## Guia de Implementação da Animação de Loading

Este guia mostra como implementar e personalizar a animação de loading para operações de pasta no Whats Hub.

### Passos para Implementação
1. **Importe o CSS**
   - Adicione o CSS da animação em `App.css` ou no componente específico.
2. **Use o Componente de Loading**
   - Exiba o loading durante operações assíncronas:
     ```tsx
     {isLoading && <div className="folder-loading">Carregando arquivos...</div>}
     ```
3. **Personalize**
   - Altere cores, tamanhos e tipo de animação conforme o tema do sistema.
   - Exemplo de variação:
     ```css
     .folder-loading.dark { border-top: 4px solid #fff; }
     .folder-loading.light { border-top: 4px solid #007bff; }
     ```

### Dicas Avançadas
- Use skeleton loaders para listas grandes.
- Adicione aria-label para acessibilidade.
- Teste em diferentes navegadores e dispositivos.

---
Para exemplos visuais, consulte o arquivo `FOLDER_LOADING_ANIMATION.md`.
