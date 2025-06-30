#!/usr/bin/env node

/**
 * Script de Migração MongoDB -> PostgreSQL
 * 
 * Este script ajuda na migração dos dados de callbacks do MongoDB para PostgreSQL
 * Execute apenas uma vez durante a transição.
 */

require('dotenv').config();
const fs = require('fs');
const DatabaseManager = require('./database/database-manager');

const CALLBACKS_FILE_PATH = './callbacks.json';

async function migrate() {
    console.log('🔄 Iniciando migração de callbacks...');
    
    try {
        // 1. Conectar ao PostgreSQL
        const dbManager = new DatabaseManager();
        const connected = await dbManager.connect();
        
        if (!connected) {
            throw new Error('Não foi possível conectar ao PostgreSQL');
        }
        
        await dbManager.createCallbacksTable();
        console.log('✅ Tabela callbacks criada/verificada no PostgreSQL');
          // 2. Ler callbacks do arquivo JSON
        let callbacks = [];
        
        if (fs.existsSync(CALLBACKS_FILE_PATH)) {
            try {
                const data = JSON.parse(fs.readFileSync(CALLBACKS_FILE_PATH, 'utf8'));
                callbacks = data.callbacks || [];
                console.log(`📁 ${callbacks.length} callbacks encontrados no arquivo`);
            } catch (err) {
                console.error('❌ Erro ao ler arquivo de callbacks:', err.message);
                process.exit(1);
            }
        } else {
            console.log('📁 Arquivo de callbacks não encontrado, criando estrutura vazia');
        }
        
        // 3. Migrar dados para PostgreSQL
        if (callbacks.length > 0) {
            console.log('🔄 Migrando callbacks para PostgreSQL...');
            
            // Limpar tabela existente
            await dbManager.query('TRUNCATE TABLE callbacks RESTART IDENTITY');
            
            let migratedCount = 0;
            for (const callback of callbacks) {
                try {
                    await dbManager.query(`
                        INSERT INTO callbacks (callback_id, chat_id, user_name, user_data, scheduled_time, message, status) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [
                        callback.id,
                        callback.chatId,
                        callback.userName || null,
                        JSON.stringify(callback.userData || {}),
                        new Date(callback.scheduledTime),
                        callback.message || null,
                        callback.status || 'pending'
                    ]);
                    migratedCount++;
                } catch (err) {
                    console.error(`❌ Erro ao migrar callback ID ${callback.id}:`, err.message);
                }
            }
            
            console.log(`✅ ${migratedCount}/${callbacks.length} callbacks migrados com sucesso`);
        }
        
        // 4. Verificar migração
        const result = await dbManager.query('SELECT COUNT(*) as total FROM callbacks');
        const totalInDB = parseInt(result.rows[0].total);
        
        console.log(`📊 Total de callbacks no PostgreSQL: ${totalInDB}`);
        
        // 5. Criar backup do arquivo original
        if (fs.existsSync(CALLBACKS_FILE_PATH)) {
            const backupPath = `${CALLBACKS_FILE_PATH}.backup.${Date.now()}`;
            fs.copyFileSync(CALLBACKS_FILE_PATH, backupPath);
            console.log(`💾 Backup criado: ${backupPath}`);
        }
        
        await dbManager.disconnect();
        console.log('✅ Migração concluída com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante a migração:', error.message);
        process.exit(1);
    }
}

// Verificar se deve executar a migração
async function checkAndMigrate() {
    console.log('🔍 Verificando necessidade de migração...');
    
    try {
        const dbManager = new DatabaseManager();
        const connected = await dbManager.connect();
        
        if (!connected) {
            console.log('⚠️ PostgreSQL não está disponível. Pulando migração.');
            return;
        }
        
        // Verificar se já existem dados no PostgreSQL
        const result = await dbManager.query('SELECT COUNT(*) as total FROM callbacks');
        const totalInDB = parseInt(result.rows[0].total);
        
        if (totalInDB > 0) {
            console.log(`ℹ️ PostgreSQL já contém ${totalInDB} callbacks. Migração não necessária.`);
            await dbManager.disconnect();
            return;
        }
        
        // Verificar se existe arquivo de callbacks
        if (!fs.existsSync(CALLBACKS_FILE_PATH)) {
            console.log('ℹ️ Arquivo de callbacks não encontrado. Nada para migrar.');
            await dbManager.disconnect();
            return;
        }
        
        await dbManager.disconnect();
        
        // Executar migração
        await migrate();
        
    } catch (error) {
        console.error('❌ Erro ao verificar migração:', error.message);
    }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
    console.log('🚀 Iniciando script de migração MongoDB -> PostgreSQL');
    checkAndMigrate().then(() => {
        console.log('🏁 Script finalizado');
        process.exit(0);
    }).catch(err => {
        console.error('💥 Erro fatal:', err.message);
        process.exit(1);
    });
}

module.exports = { migrate, checkAndMigrate };
