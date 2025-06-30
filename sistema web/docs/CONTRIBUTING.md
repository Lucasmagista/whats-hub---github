# Contribuição

Obrigado por considerar contribuir para o WhatsApp Bot Dashboard! Este documento fornece diretrizes para contribuir com o projeto.

## Código de Conduta

### Nosso Compromisso

Nós, como membros, colaboradores e líderes, nos comprometemos a fazer da participação em nossa comunidade uma experiência livre de assédio para todos, independentemente de idade, tamanho corporal, deficiência visível ou invisível, etnia, características sexuais, identidade e expressão de gênero, nível de experiência, educação, status socioeconômico, nacionalidade, aparência pessoal, raça, religião ou identidade e orientação sexual.

### Padrões

Exemplos de comportamento que contribuem para um ambiente positivo:

- Demonstrar empatia e bondade para com outras pessoas
- Ser respeitoso com opiniões, pontos de vista e experiências diferentes
- Dar e aceitar graciosamente feedback construtivo
- Aceitar responsabilidade e pedir desculpas aos afetados por nossos erros
- Focar no que é melhor não apenas para nós como indivíduos, mas para a comunidade como um todo

Exemplos de comportamento inaceitável:

- Uso de linguagem ou imagens sexualizadas e atenção ou avanços sexuais
- Trolling, comentários insultuosos ou depreciativos e ataques pessoais ou políticos
- Assédio público ou privado
- Publicar informações privadas de outros sem permissão explícita
- Outra conduta que poderia razoavelmente ser considerada inadequada em um ambiente profissional

## Como Contribuir

### Reportando Bugs

Antes de reportar um bug, verifique se ele já foi reportado nas [Issues](link-to-issues). Se não encontrar uma issue similar, crie uma nova com as seguintes informações:

#### Template para Bug Report

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do que é o bug.

**Passos para Reproduzir**
Passos para reproduzir o comportamento:
1. Vá para '...'
2. Clique em '....'
3. Role até '....'
4. Veja o erro

**Comportamento Esperado**
Uma descrição clara e concisa do que você esperava que acontecesse.

**Screenshots**
Se aplicável, adicione screenshots para ajudar a explicar seu problema.

**Ambiente:**
- OS: [ex: Windows 10, macOS 12.0, Ubuntu 20.04]
- Browser: [ex: Chrome 96, Firefox 95, Safari 15]
- Versão do Node.js: [ex: 18.17.0]
- Versão do Projeto: [ex: 1.0.0]

**Informações Adicionais**
Qualquer outra informação sobre o problema.
```

### Sugerindo Melhorias

Para sugerir melhorias, crie uma issue com o label "enhancement" incluindo:

#### Template para Feature Request

```markdown
**A sua feature request está relacionada a um problema? Descreva.**
Uma descrição clara e concisa do problema. Ex: Estou sempre frustrado quando [...]

**Descreva a solução que você gostaria**
Uma descrição clara e concisa do que você quer que aconteça.

**Descreva alternativas que você considerou**
Uma descrição clara e concisa de qualquer solução ou feature alternativa que você considerou.

**Informações Adicionais**
Adicione qualquer outra informação ou screenshots sobre a feature request aqui.
```

### Configuração do Ambiente de Desenvolvimento

1. **Fork o repositório**
2. **Clone seu fork:**
   ```bash
   git clone https://github.com/seu-usuario/dashboard.git
   cd dashboard
   ```

3. **Instale as dependências:**
   ```bash
   npm install
   ```

4. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env.local
   # Edite .env.local com suas configurações
   ```

5. **Configure o banco de dados:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

6. **Execute o projeto:**
   ```bash
   npm run dev
   ```

### Processo de Desenvolvimento

#### Workflow Git

1. **Crie uma branch para sua feature:**
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. **Faça commits pequenos e descritivos:**
   ```bash
   git commit -m "feat: adiciona validação de email no form de cliente"
   ```

3. **Mantenha sua branch atualizada:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. **Push sua branch:**
   ```bash
   git push origin feature/nome-da-feature
   ```

5. **Abra um Pull Request**

#### Convenções de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/). Exemplos:

```bash
feat: adiciona nova funcionalidade
fix: corrige bug na validação
docs: atualiza documentação
style: corrige formatação do código
refactor: refatora componente de login
test: adiciona testes para componente
chore: atualiza dependências
```

**Tipos de commit:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, missing semi colons, etc
- `refactor`: Refatoração de código
- `test`: Adição de testes
- `chore`: Manutenção, atualizações de dependências

#### Estrutura de Branches

- `main`: Branch principal (produção)
- `develop`: Branch de desenvolvimento
- `feature/*`: Novas funcionalidades
- `fix/*`: Correções de bugs
- `hotfix/*`: Correções urgentes para produção

### Padrões de Código

#### TypeScript

```typescript
// ✅ Bom
interface UserProps {
  id: string
  name: string
  email: string
  isActive?: boolean
}

const createUser = async (userData: UserProps): Promise<User> => {
  // Implementação
}

// ❌ Evitar
const createUser = async (userData: any) => {
  // Implementação
}
```

#### React Components

```tsx
// ✅ Bom
import { FC } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

#### Styling (Tailwind CSS)

```tsx
// ✅ Bom - Classes organizadas
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">

// ❌ Evitar - Classes muito longas
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 mb-4 mt-2">
```

#### File Naming

```
// ✅ Bom
components/
├── CustomerCard.tsx
├── UserProfile.tsx
└── ui/
    ├── button.tsx
    └── input.tsx

// ❌ Evitar
components/
├── customercard.tsx
├── User_Profile.tsx
└── UI/
    ├── Button.tsx
    └── Input.tsx
```

### Testes

#### Estrutura de Testes

```
__tests__/
├── components/
│   ├── Button.test.tsx
│   └── CustomerCard.test.tsx
├── hooks/
│   └── useAuth.test.ts
└── utils/
    └── formatters.test.ts
```

#### Exemplo de Teste

```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  test('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByText('Click me')).toBeDisabled()
  })
})
```

#### Executando Testes

```bash
# Todos os testes
npm test

# Testes em watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Testes específicos
npm test Button.test.tsx
```

### Documentação

#### Comentários de Código

```typescript
/**
 * Calcula a satisfação média dos clientes
 * @param customers - Array de clientes
 * @param period - Período para cálculo (dias)
 * @returns Satisfação média (0-5)
 */
export function calculateAverageSatisfaction(
  customers: Customer[], 
  period: number
): number {
  // Implementação
}
```

#### README de Componentes

```markdown
# CustomerCard

Componente para exibir informações de um cliente.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| customer | Customer | - | Dados do cliente |
| onEdit | (customer: Customer) => void | - | Callback para edição |
| onDelete | (id: string) => void | - | Callback para exclusão |

## Exemplo

```tsx
<CustomerCard
  customer={customer}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```
```

### Pull Request

#### Template de Pull Request

```markdown
## Descrição

Breve descrição das mudanças realizadas.

## Tipo de Mudança

- [ ] Bug fix (mudança que corrige uma issue)
- [ ] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação

## Como Testar

Descreva os passos para testar suas mudanças:

1. Vá para '...'
2. Clique em '....'
3. Verifique que '....'

## Checklist

- [ ] Meu código segue o style guide do projeto
- [ ] Fiz uma auto-review do meu código
- [ ] Comentei meu código, especialmente em áreas complexas
- [ ] Fiz mudanças correspondentes na documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que minha correção/feature funciona
- [ ] Testes novos e existentes passam localmente
- [ ] Mudanças dependentes foram merged e publicadas

## Screenshots (se aplicável)

Adicione screenshots das mudanças visuais.

## Issues Relacionadas

Closes #123
```

#### Revisão de Código

Critérios para aprovação:

1. **Funcionalidade**: O código faz o que deveria fazer?
2. **Legibilidade**: O código é fácil de entender?
3. **Manutenibilidade**: O código é fácil de modificar?
4. **Performance**: O código é eficiente?
5. **Segurança**: O código introduz vulnerabilidades?
6. **Testes**: O código tem testes adequados?

### Lançamentos

#### Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Mudanças incompatíveis na API
- **MINOR** (0.1.0): Funcionalidades mantendo compatibilidade
- **PATCH** (0.0.1): Correções de bugs mantendo compatibilidade

#### Processo de Release

1. **Atualizar versão no `package.json`**
2. **Atualizar `CHANGELOG.md`**
3. **Criar tag:**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```
4. **Criar release no GitHub**

### Recursos Úteis

#### Ferramentas

- [VS Code](https://code.visualstudio.com/) - Editor recomendado
- [GitHub Desktop](https://desktop.github.com/) - Cliente Git visual
- [Postman](https://www.postman.com/) - Testes de API
- [Figma](https://www.figma.com/) - Design de interface

#### Extensões do VS Code

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "formulahendry.auto-rename-tag",
    "bradgashler.htmltagwrap"
  ]
}
```

#### Links Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

### Dúvidas e Suporte

- **Issues**: Para bugs e feature requests
- **Discussions**: Para perguntas gerais
- **Email**: Para questões sensíveis (opcional)

### Reconhecimento

Contribuidores são reconhecidos:

1. **Lista de contribuidores** no README
2. **Mentions** em releases
3. **Badge de contribuidor** (se aplicável)

### Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

---

## Agradecimentos

Obrigado por contribuir! Cada contribuição, não importa o tamanho, é valorizada e ajuda a tornar este projeto melhor para todos.

Se você tem alguma dúvida sobre como contribuir, não hesite em abrir uma issue ou entrar em contato. Estamos aqui para ajudar! 🚀
