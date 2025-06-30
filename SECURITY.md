# 🔒 GUIA DE SEGURANÇA - WhatsHub

## ⚠️ IMPORTANTE - ANTES DE COMMITAR

Este projeto foi sanitizado para remover dados sensíveis. SEMPRE verifique antes de fazer commit:

### 📋 Checklist de Segurança

- [ ] Nenhuma senha real nos arquivos
- [ ] Nenhum token/API key real nos arquivos
- [ ] Arquivos .env não commitados (apenas .env.example)
- [ ] Credenciais de banco de dados substituídas por exemplos
- [ ] URLs e domínios específicos removidos

### 🔧 Configuração Local

1. **Crie seu arquivo .env local:**
   ```bash
   cp .env.example .env
   ```

2. **Configure suas credenciais reais no .env:**
   - Banco de dados PostgreSQL
   - API tokens (MailerSend, N8N, etc.)
   - Senhas seguras
   - JWT secrets únicos

3. **NUNCA commite o arquivo .env real!**

### 🚫 Dados Removidos/Substituídos

#### Senhas Padrão Removidas:
- `admin123` → `sua_senha_admin_segura`
- `password123` → `sua_senha_n8n_aqui`
- `postgres` (senha) → `sua_senha_postgres`

#### Tokens/Keys Removidos:
- MailerSend API Token
- NextAuth Secret Key
- JWT Secrets
- Database URLs específicas

#### Defaults Seguros Implementados:
- `default-secret` → `sua-chave-jwt-segura`
- Credenciais hardcoded → Variáveis de ambiente
- URLs específicas → URLs de exemplo

### 🔐 Boas Práticas

1. **Use geradores de senha:**
   - Para JWT_SECRET: `openssl rand -base64 32`
   - Para senhas: Use geradores de senha seguros

2. **Variáveis de ambiente sempre:**
   ```env
   # ❌ Nunca assim
   const password = "123456"
   
   # ✅ Sempre assim
   const password = process.env.PASSWORD || "senha_default_exemplo"
   ```

3. **Arquivos sensíveis no .gitignore:**
   ```gitignore
   .env
   .env.local
   *.key
   *.pem
   config/production.json
   ```

### 📚 Arquivos que Contêm Exemplos

- `.env.example` - Template de configuração
- `n8n/.env.example` - Template N8N
- `sistema web/.env.example` - Template Sistema Web
- Todos os arquivos de documentação foram atualizados

### 🛡️ Configuração de Produção

Para produção, use:
- Variáveis de ambiente do servidor
- Secrets managers (AWS Secrets, Azure Key Vault, etc.)
- Configurações específicas por ambiente
- Autenticação multifator onde possível

### 📞 Suporte

Se encontrar algum dado sensível ainda exposto:
1. NÃO commite
2. Remova imediatamente
3. Atualize este guia se necessário

---
**Último update**: Janeiro 2025
**Status**: ✅ Projeto sanitizado e seguro para commit público
