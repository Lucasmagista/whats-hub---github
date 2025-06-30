# 🔧 Correção de Z-Index para Dropdowns em Modais

## 🚨 Problema Identificado

Os dropdowns e selects (como o seletor de "Ambiente") estavam aparecendo **atrás dos modais** quando abertos, tornando-os inacessíveis aos usuários.

## 🎯 Causa Raiz

- **Modais:** z-index de `9999`
- **SelectContent (Radix UI):** z-index de apenas `50`
- **Resultado:** Dropdowns ficavam invisíveis atrás do modal

## ✅ Solução Implementada

### 1. **CSS Global (index.css)**
Adicionado conjunto completo de regras CSS para garantir que todos os elementos de UI interativo tenham z-index superior aos modais:

```css
/* DROPDOWN E SELECT Z-INDEX FIX */

/* Todos os portals do Radix UI */
[data-radix-popper-content-wrapper] {
  z-index: 99999 !important;
}

[data-radix-select-content] {
  z-index: 99999 !important;
  position: fixed !important;
}

[data-radix-portal] {
  z-index: 99999 !important;
}

/* Outros componentes UI */
[data-radix-dropdown-menu-content] {
  z-index: 99999 !important;
}

[data-radix-popover-content] {
  z-index: 99999 !important;
}
```

### 2. **Componente Select (select.tsx)**
Atualizado o z-index do `SelectContent` de `z-50` para `z-[99999]`:

```tsx
// ANTES
"relative z-50 max-h-96..."

// DEPOIS  
"relative z-[99999] max-h-96..."
```

## 🎯 Hierarquia Z-Index Final

1. **Dropdowns/Selects:** `99999` (mais alto)
2. **Modais:** `9999` 
3. **Headers/Sticky:** `50`
4. **Conteúdo normal:** `auto`

## ✨ Benefícios

- ✅ **Dropdowns visíveis** em todos os modais
- ✅ **Usabilidade melhorada** para configuração de bots
- ✅ **Comportamento consistente** em toda a aplicação
- ✅ **Compatibilidade** com todos os componentes Radix UI

## 🧪 Componentes Afetados

- Select/Dropdown de **Ambiente** (Produção/Desenvolvimento)
- Select de **Package Manager** (npm/yarn/pnpm/bun)
- Select de **Start Mode** 
- Select de **Categoria**
- Todos os outros dropdowns em modais

## 📝 Arquivos Modificados

- `src/index.css` - Regras CSS globais para z-index
- `src/components/ui/select.tsx` - Z-index do SelectContent

## 🔍 Teste da Correção

Para testar se a correção funcionou:

1. Abra o modal de "Adicionar Novo Bot"
2. Vá para a aba "🎯 Local Dev"
3. Clique no dropdown "Ambiente"
4. **Resultado esperado:** Dropdown deve aparecer **acima** do modal
5. Teste outros selects no mesmo modal

A correção garante que todos os elementos interativos sejam sempre acessíveis, independentemente de estarem dentro de modais ou não.
