require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Catálogo Web API',
      version: '1.0.0',
      description: 'API RESTful para catálogo de produtos, pedidos e integração com WhatsApp bot.'
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Desenvolvimento local' }
    ]
  },
  apis: ['./routes/*.js', './models/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas principais
app.use('/api', routes);


// Página inicial amigável
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 Catálogo Web API</h1>
    <p>Bem-vindo à API do Catálogo!</p>
    <ul>
      <li><a href="/api-docs">Documentação Swagger</a></li>
      <li><a href="/health">Status do servidor</a></li>
      <li>Base da API: <code>/api</code></li>
    </ul>
    <p>Personalize o HOST ou PROTOCOL no seu <code>.env</code> se desejar.</p>
  `);
});

// Teste de saúde
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || 'localhost';
const PROTOCOL = process.env.PROTOCOL || 'http';
const API_PATH = '/api';

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('==============================================');
    console.log('✅  Conexão com o banco de dados estabelecida!');
    console.log('==============================================');
  } catch (err) {
    console.error('❌  Erro ao conectar no banco:', err.message);
    console.log('==============================================');
  }
  console.log('🚀  Servidor catálogo rodando!');
  console.log(`🌐  Acesse: ${PROTOCOL}://${HOST}:${PORT}`);
  console.log(`📚  Documentação Swagger: ${PROTOCOL}://${HOST}:${PORT}/api-docs`);
  console.log(`🔗  API Base: ${PROTOCOL}://${HOST}:${PORT}${API_PATH}`);
  console.log('==============================================');
  console.log('ℹ️  Para personalizar o HOST ou PROTOCOL, basta definir as variáveis de ambiente HOST e PROTOCOL no seu .env.');
  console.log('Exemplo:');
  console.log('HOST=0.0.0.0');
  console.log('PROTOCOL=https');
  console.log('==============================================');
});
