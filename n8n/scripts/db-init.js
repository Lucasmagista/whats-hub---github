#!/usr/bin/env node

/**
 * Script para inicializar o banco PostgreSQL
 * Compatível com Windows PowerShell
 */

require('dotenv').config();
const { spawn } = require('child_process');
const { Pool } = require('pg');
const path = require('path');

// Configurações do banco a partir do .env
const config = {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || '5432',
    database: process.env.POSTGRES_DB || 'whats_hub',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD
};

console.log('🏠 Inaugura Lar Bot - Inicialização PostgreSQL');
console.log('='.repeat(50));
console.log(`📍 Host: ${config.host}:${config.port}`);
console.log(`🗄️ Database: ${config.database}`);
console.log(`👤 User: ${config.user}`);
console.log('='.repeat(50));

// Caminho para o arquivo SQL
const sqlFile = path.join(__dirname, '..', 'database', 'init.sql');

// Comando psql
const args = [
    '-h', config.host,
    '-p', config.port,
    '-U', config.user,
    '-d', config.database,
    '-f', sqlFile
];

// Configurar ambiente
const env = { ...process.env };
if (config.password) {
    env.PGPASSWORD = config.password;
}

// Função para criar banco de dados
async function createDatabase() {
    const postgresConfig = {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: 'postgres' // Conecta ao banco postgres padrão
    };

    const pool = new Pool(postgresConfig);
    
    try {
        console.log('🔧 Verificando se o banco de dados existe...');
        
        // Verificar se o banco existe
        const checkResult = await pool.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [config.database]
        );
        
        if (checkResult.rows.length === 0) {
            console.log('📝 Criando banco de dados...');
            await pool.query(`CREATE DATABASE ${config.database}`);
            console.log('✅ Banco de dados criado com sucesso!');
        } else {
            console.log('ℹ️ Banco de dados já existe, continuando...');
        }
        
        await pool.end();
        return true;
    } catch (error) {
        console.error('❌ Erro ao criar banco de dados:', error.message);
        await pool.end();
        return false;
    }
}

// Criar banco de dados primeiro
createDatabase().then((success) => {
    if (!success) {
        console.log('❌ Falha ao criar banco de dados');
        process.exit(1);
    }
    
    console.log('');
    console.log('🔧 Executando inicialização das tabelas...');
    console.log(`Comando: psql ${args.join(' ')}`);
    console.log('');

    // Executar inicialização das tabelas
    const psql = spawn('psql', args, {
        stdio: 'inherit',
        env: env,
        shell: true
    });

    psql.on('close', (code) => {
        console.log('');
        if (code === 0) {
            console.log('✅ Banco de dados inicializado com sucesso!');
            console.log('');
            console.log('📋 Próximos passos:');
            console.log('1. Execute: npm start');
            console.log('2. Acesse: http://localhost:3001');
        } else {
            console.log('❌ Erro na inicialização do banco de dados');
            console.log('');
            console.log('🔍 Verificações:');
            console.log('1. PostgreSQL está instalado e rodando?');
            console.log('2. Credenciais no .env estão corretas?');
            console.log('3. Arquivo database/init.sql existe?');
        }
        process.exit(code);
    });

    psql.on('error', (error) => {
        console.error('❌ Erro ao executar psql:', error.message);
        console.log('');
        console.log('🔍 Verificações:');
        console.log('1. PostgreSQL está instalado?');
        console.log('2. psql está no PATH do sistema?');
        console.log('3. Execute: where psql (para verificar)');
        process.exit(1);
    });
}).catch((error) => {
    console.error('❌ Erro inesperado:', error);
    process.exit(1);
});
