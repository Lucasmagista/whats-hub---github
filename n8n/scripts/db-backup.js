#!/usr/bin/env node

/**
 * Script para fazer backup do banco PostgreSQL
 * Compatível com Windows PowerShell
 */

require('dotenv').config();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações do banco a partir do .env
const config = {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || '5432',
    database: process.env.POSTGRES_DB || 'whats_hub',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD
};

console.log('🏠 Inaugura Lar Bot - Backup PostgreSQL');
console.log('='.repeat(50));
console.log(`📍 Host: ${config.host}:${config.port}`);
console.log(`🗄️ Database: ${config.database}`);
console.log(`👤 User: ${config.user}`);
console.log('='.repeat(50));

// Criar nome do arquivo de backup
const date = new Date();
const timestamp = date.toISOString()
    .slice(0, 19)
    .replace(/[-:]/g, '')
    .replace('T', '_');

const backupDir = path.join(__dirname, '..', 'backups');
const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);

// Criar diretório de backup se não existir
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('📁 Diretório de backup criado');
}

// Comando pg_dump
const args = [
    '-h', config.host,
    '-p', config.port,
    '-U', config.user,
    '-d', config.database,
    '--no-password',
    '--verbose',
    '--clean',
    '--create',
    '--format=plain'
];

console.log('💾 Executando backup...');
console.log(`Arquivo: ${backupFile}`);
console.log(`Comando: pg_dump ${args.join(' ')}`);
console.log('');

// Configurar ambiente
const env = { ...process.env };
if (config.password) {
    env.PGPASSWORD = config.password;
}

// Criar stream de arquivo
const fileStream = fs.createWriteStream(backupFile);

// Executar comando
const pgDump = spawn('pg_dump', args, {
    env: env,
    shell: true
});

// Redirecionar stdout para arquivo
pgDump.stdout.pipe(fileStream);

// Mostrar stderr no console
pgDump.stderr.pipe(process.stderr);

pgDump.on('close', (code) => {
    fileStream.end();
    console.log('');
    
    if (code === 0) {
        // Verificar tamanho do arquivo
        const stats = fs.statSync(backupFile);
        const fileSizeKB = (stats.size / 1024).toFixed(2);
        
        console.log('✅ Backup realizado com sucesso!');
        console.log(`📁 Arquivo: ${backupFile}`);
        console.log(`📊 Tamanho: ${fileSizeKB} KB`);
        console.log('');
        console.log('💡 Para restaurar:');
        console.log(`psql -h ${config.host} -U ${config.user} -d postgres < "${backupFile}"`);
    } else {
        console.log('❌ Erro no backup do banco de dados');
        
        // Remover arquivo vazio em caso de erro
        if (fs.existsSync(backupFile)) {
            const stats = fs.statSync(backupFile);
            if (stats.size === 0) {
                fs.unlinkSync(backupFile);
                console.log('🗑️ Arquivo de backup vazio removido');
            }
        }
        
        console.log('');
        console.log('🔍 Verificações:');
        console.log('1. PostgreSQL está instalado e rodando?');
        console.log('2. Credenciais no .env estão corretas?');
        console.log('3. pg_dump está no PATH do sistema?');
    }
    
    process.exit(code);
});

pgDump.on('error', (error) => {
    fileStream.end();
    console.error('❌ Erro ao executar pg_dump:', error.message);
    console.log('');
    console.log('🔍 Verificações:');
    console.log('1. PostgreSQL está instalado?');
    console.log('2. pg_dump está no PATH do sistema?');
    console.log('3. Execute: where pg_dump (para verificar)');
    process.exit(1);
});
