#!/usr/bin/env node

/**
 * Script para resetar o banco PostgreSQL
 * Compatível com Windows PowerShell
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

// Configurações do banco a partir do .env
const config = {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || '5432',
    database: process.env.POSTGRES_DB || 'whats_hub',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD
};

console.log('🏠 Inaugura Lar Bot - Reset PostgreSQL');
console.log('='.repeat(50));
console.log(`📍 Host: ${config.host}:${config.port}`);
console.log(`🗄️ Database: ${config.database}`);
console.log(`👤 User: ${config.user}`);
console.log('='.repeat(50));

// Configurar ambiente
const env = { ...process.env };
if (config.password) {
    env.PGPASSWORD = config.password;
}

// Primeiro: Dropar e recriar o banco
const dropCreateSQL = `DROP DATABASE IF EXISTS ${config.database}; CREATE DATABASE ${config.database};`;
const args1 = [
    '-h', config.host,
    '-p', config.port,
    '-U', config.user,
    '-d', 'postgres',
    '-c', dropCreateSQL
];

console.log('🗑️ Dropping e recriando banco de dados...');
console.log(`Comando: psql ${args1.join(' ')}`);
console.log('');

const psql1 = spawn('psql', args1, {
    stdio: 'inherit',
    env: env,
    shell: true
});

psql1.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Banco dropado e recriado com sucesso!');
        console.log('');
        console.log('🔧 Executando inicialização...');
        
        // Segundo: Executar inicialização
        const initScript = spawn('node', [path.join(__dirname, 'db-init.js')], {
            stdio: 'inherit',
            shell: true
        });
        
        initScript.on('close', (initCode) => {
            if (initCode === 0) {
                console.log('✅ Reset completo realizado com sucesso!');
            } else {
                console.log('❌ Erro na inicialização após reset');
            }
            process.exit(initCode);
        });
        
    } else {
        console.log('❌ Erro ao resetar banco de dados');
        console.log('');
        console.log('🔍 Verificações:');
        console.log('1. PostgreSQL está instalado e rodando?');
        console.log('2. Credenciais no .env estão corretas?');
        console.log('3. Usuário tem permissões para criar/dropar banco?');
        process.exit(code);
    }
});

psql1.on('error', (error) => {
    console.error('❌ Erro ao executar psql:', error.message);
    console.log('');
    console.log('🔍 Verificações:');
    console.log('1. PostgreSQL está instalado?');
    console.log('2. psql está no PATH do sistema?');
    process.exit(1);
});
