# Catálogo Web Profissional

Backend Node.js/Express + PostgreSQL + API RESTful + Autenticação JWT + Webhooks + Swagger + Pronto para integração com WhatsApp bot.

## Funcionalidades
- Cadastro e gestão de produtos, categorias, estoque
- API RESTful para integração
- Pedidos e controle de status
- Autenticação JWT para painel admin
- Webhooks para integração em tempo real
- Documentação Swagger/OpenAPI
- Pronto para deploy em produção

## Como rodar
1. Copie `.env.example` para `.env` e configure o banco e JWT
2. Instale dependências: `npm install`
3. Rode as migrations: `npx sequelize-cli db:migrate`
4. Inicie o servidor: `npm run dev`

Acesse a documentação em: http://localhost:4000/api-docs

## Estrutura de Pastas
- `src/models` - Models Sequelize
- `src/routes` - Rotas da API
- `src/server.js` - Inicialização do servidor

## Integração
- Use os endpoints REST para listar produtos, criar pedidos, etc.
- Webhooks podem ser configurados para notificar o bot em tempo real.

## Painel Admin (frontend)
- O painel React pode ser criado na pasta `admin/` (não incluso neste backend).
