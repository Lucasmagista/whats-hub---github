// =========================
// 🔊 TRANSCRIÇÃO DE ÁUDIO E REGISTRO PARA DASHBOARD
// =========================

/**
 * Salva transcrição de áudio e metadados para integração com dashboard
 * @param {object} params - { chatId, nome, data, transcript, audioPath, intent, status }
 */
/**
 * Salva transcrição de áudio e metadados para integração com dashboard
 * - Salva localmente em JSON
 * - (Opcional) Envia para API REST da dashboard se configurado
 * @param {object} params - { chatId, nome, data, transcript, audioPath, intent, status }
 */
function saveAudioTranscriptForDashboard(params) {
    const fs = require('fs');
    const path = require('path');
    const axios = require('axios');
    const DASHBOARD_AUDIO_FILE = './audio-transcripts.json';
    let all = [];
    if (fs.existsSync(DASHBOARD_AUDIO_FILE)) {
        try {
            all = JSON.parse(fs.readFileSync(DASHBOARD_AUDIO_FILE, 'utf8'));
        } catch (e) { all = []; }
    }
    all.unshift({
        chatId: params.chatId,
        nome: params.nome,
        data: params.data,
        transcript: params.transcript,
        audioPath: params.audioPath,
        intent: params.intent,
        status: params.status || 'novo'
    });
    // Mantém só os últimos 500 registros
    if (all.length > 500) all = all.slice(0, 500);
    fs.writeFileSync(DASHBOARD_AUDIO_FILE, JSON.stringify(all, null, 2));

    // Se configurado, envia para API REST da dashboard
    if (process.env.DASHBOARD_API_URL) {
        axios.post(process.env.DASHBOARD_API_URL, {
            chatId: params.chatId,
            nome: params.nome,
            data: params.data,
            transcript: params.transcript,
            audioPath: params.audioPath,
            intent: params.intent,
            status: params.status || 'novo'
        }).catch(err => {
            console.error('Erro ao enviar transcrição para dashboard:', err.message);
        });
    }
}

// =========================
// 🔄 INTEGRAÇÃO FINAL DO CONTROLE DE PAUSA/RETOMADA POR ATENDENTE
// =========================

// Listener principal de mensagens (exemplo, adapte conforme seu fluxo real)
if (globalThis.client) {
    globalThis.client.on('message', async (message) => {
        // 1. Comandos invisíveis de atendente (assumir/finalizar)
        if (await processAttendantCommands(message)) return;
        // 2. Ignora mensagens de chats pausados
        if (await shouldIgnoreMessage(message)) return;
        // 3. Processamento normal do bot
        // Exemplo de integração:
        // const userState = await stateManager.getUserState(message.from);
        // const result = await ConversationFlow.processMessage(message, userState);
        // ...
    });
}

// =========================
// 🔄 LOGGING/AUDITORIA DE AÇÕES DE CONTROLE DE BOT
// =========================
// const fs = require('fs'); // Removido: já declarado anteriormente
function logBotControlAction(action, chatId, attendantId, details = {}) {
    const logLine = JSON.stringify({
        timestamp: new Date().toISOString(),
        action,
        chatId,
        attendantId,
        ...details
    }) + '\n';
    fs.appendFile('./logs/bot-control.log', logLine, err => {
        if (err) console.error('Erro ao gravar log de controle do bot:', err.message);
    });
}

// Função única: processa comandos de atendente e faz logging/auditoria
async function processAttendantCommands(message) {
    const chatId = message.from;
    const body = (message.body || '').trim();
    // Comando para assumir chat
    if (body.startsWith('#ASSUMIR') || body.toLowerCase().startsWith('/assumir')) {
        const attendantId = message.author || message.sender?.id || 'atendente';
        botControl.pausedChats.set(chatId, {
            attendantId,
            pausedAt: new Date().toISOString(),
            reason: 'Atendente assumiu o chat'
        });
        botControl.savePausedChats();
        logBotControlAction('pause', chatId, attendantId, { reason: 'Atendente assumiu o chat' });
        console.log(`👨‍💼 Chat ${chatId} assumido por ${attendantId}`);
        if (message.reply) await message.reply('✅ Você assumiu este chat. O bot foi pausado para este cliente.');
        return true;
    }
    // Comando para finalizar chat
    if (body.startsWith('#FINALIZAR') || body.toLowerCase().startsWith('/finalizar')) {
        if (botControl.pausedChats.has(chatId)) {
            const attendantId = botControl.pausedChats.get(chatId)?.attendantId || 'atendente';
            botControl.pausedChats.delete(chatId);
            botControl.savePausedChats();
            logBotControlAction('resume', chatId, attendantId, { reason: 'Atendente finalizou o chat' });
            console.log(`✅ Chat ${chatId} finalizado pelo atendente. Bot retomado.`);
            if (typeof askSatisfactionFeedback === 'function') {
                await askSatisfactionFeedback(global.client, chatId, 'atendimento humano');
            }
            if (message.reply) await message.reply('✅ Chat finalizado. O bot foi reativado para este cliente.');
        }
        return true;
    }
    return false;
}
// 1. Feedback contínuo após cada atendimento ou etapa importante
async function askSatisfactionFeedback(client, chatId, context = '') {
    let msg = '✨ Gostaríamos muito de saber sua opinião!\nPor favor, avalie seu atendimento de 1 a 5 (sendo 5 = excelente).';
    if (context) msg = `✨ Sobre ${context}:\n` + msg;
    await client.sendMessage(chatId, msg);
}
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const CALLBACKS_FILE_PATH = './callbacks.json';
const DatabaseManager = require('./database/database-manager');

// Sistema de Usuários e Permissões
const userManager = require('./user-management');
const userAPI = require('./user-api');

// Controle de Bot por Chat (pausa/retomada)
const botControl = require('./bot-control');
// =========================
// 🔄 FILTRO DE PAUSA DE CHAT POR ATENDENTE
// =========================

function isChatPaused(chatId) {
    return botControl.pausedChats && botControl.pausedChats.has(chatId);
}

// Middleware para ignorar mensagens de chats pausados
async function shouldIgnoreMessage(message) {
    // chatId pode ser message.from (privado) ou message.id.remote (grupo)
    const chatId = message.from;
    if (isChatPaused(chatId)) {
        // Opcional: logar tentativa de mensagem em chat pausado
        console.log(`⏸️ Mensagem ignorada (chat pausado): ${chatId}`);
        return true;
    }
    return false;
}

// Carregar variáveis de ambiente
require('dotenv').config();
// =========================
// 🔄 COMANDOS INVISÍVEIS PARA ATENDENTES (ASSUMIR/FINALIZAR)
// =========================

// ...existing code...

// =========================
// 🔄 INTEGRAÇÃO NO LISTENER DE MENSAGENS
// =========================

// Exemplo de listener:
// client.on('message', async (message) => {
//     if (await processAttendantCommands(message)) return;
//     if (await shouldIgnoreMessage(message)) return;
//     // ...processamento normal...
// });

// Adapte para o seu fluxo real de mensagens.
// 📦 UTILITÁRIOS MULTIMÍDIA E FEEDBACK
// =========================

/**
 * Envia mídia (imagem, vídeo, áudio) com fallback para texto se falhar.
 * @param {object} client - Instância do WhatsApp client
 * @param {string} to - Número ou grupo destino
 * @param {string} filePath - Caminho do arquivo de mídia
 * @param {string} caption - Legenda opcional
 * @param {string} fallbackText - Texto alternativo se mídia falhar
 */
async function sendMediaWithFallback(client, to, filePath, caption = '', fallbackText = '') {
    try {
        const media = MessageMedia.fromFilePath(filePath);
        await client.sendMessage(to, media, caption ? { caption } : {});
    } catch (err) {
        if (fallbackText) await client.sendMessage(to, fallbackText);
    }
}

/**
 * Envia mensagem de feedback instantâneo (👍👎 ou 1-5) após etapas importantes.
 * @param {object} client - Instância do WhatsApp client
 * @param {string} to - Número destino
 * @param {string} tipo - 'like' para 👍👎, 'rating' para 1-5
 */
async function sendInstantFeedback(client, to, tipo = 'like') {
    if (tipo === 'like') {
        await client.sendMessage(to, 'Como você avalia esta etapa? Responda com 👍 ou 👎');
    } else {
        await client.sendMessage(to, 'Por favor, avalie de 1 a 5:\n1 - Muito Ruim 😠\n2 - Ruim 🙁\n3 - Regular 😐\n4 - Bom 🙂\n5 - Excelente 😄');
    }
}
// 📋 CONSTANTES E CONFIGURAÇÕES
// =========================

// Arquivo para gerenciar grupos permitidos
const ALLOWED_GROUPS_FILE = './allowed-groups.json';

// Configurações do filtro de mensagens
const FILTER_CONFIG = {
    allowPrivateMessages: true,
    allowSpecificGroups: true,
    blockStatusMessages: true,
    blockAllGroupsByDefault: true,
    logBlockedMessages: process.env.LOG_BLOCKED_MESSAGES === 'true' || false
};

// Instanciar gerenciador de banco de dados
let dbManager = null;
(async () => {
    try {
        dbManager = new DatabaseManager();
        const connected = await dbManager.connect();
        if (connected) {
            await dbManager.createUserStatesTable();
            await dbManager.createCallbacksTable();
            await dbManager.createMessagesTable();
        }
    } catch (error) {
        console.error('⚠️ Erro na inicialização do PostgreSQL:', error.message);
        console.log('📝 Sistema funcionará com arquivos JSON como fallback');
    }
})();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configurações
const PORT = process.env.PORT || 3002;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/whatsapp-messages';
const STATE_FILE_PATH = './userStates.json';
const UPLOAD_FOLDER = './uploads/';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

// =========================
// 📋 GERENCIADOR DE GRUPOS PERMITIDOS
// =========================

class AllowedGroupsManager {
    constructor() {
        this.allowedGroups = new Set();
        this.loadAllowedGroups();
    }

    // Carregar grupos permitidos do arquivo
    loadAllowedGroups() {
        try {
            if (fs.existsSync(ALLOWED_GROUPS_FILE)) {
                const data = fs.readFileSync(ALLOWED_GROUPS_FILE, 'utf8');
                const groupsData = JSON.parse(data);
                
                if (Array.isArray(groupsData.groups)) {
                    this.allowedGroups = new Set(groupsData.groups);
                    console.log(`✅ ${this.allowedGroups.size} grupos permitidos carregados`);
                } else {
                    console.log('⚠️ Formato inválido no arquivo de grupos, criando novo');
                    this.createDefaultGroupsFile();
                }
            } else {
                console.log('📝 Arquivo de grupos não encontrado, criando novo');
                this.createDefaultGroupsFile();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar grupos permitidos:', error.message);
            this.createDefaultGroupsFile();
        }
    }

    // Criar arquivo padrão de grupos
    createDefaultGroupsFile() {
        const defaultData = {
            groups: [],
            description: "Lista de IDs de grupos onde o bot pode responder",
            instructions: "Adicione os IDs dos grupos no array 'groups'. Use o comando /groups para ver os grupos disponíveis",
            lastUpdated: new Date().toISOString()
        };
        
        try {
            fs.writeFileSync(ALLOWED_GROUPS_FILE, JSON.stringify(defaultData, null, 2));
            console.log('📝 Arquivo de grupos criado:', ALLOWED_GROUPS_FILE);
        } catch (error) {
            console.error('❌ Erro ao criar arquivo de grupos:', error.message);
        }
    }

    // Salvar grupos permitidos
    saveAllowedGroups() {
        try {
            const data = {
                groups: Array.from(this.allowedGroups),
                description: "Lista de IDs de grupos onde o bot pode responder",
                instructions: "Adicione os IDs dos grupos no array 'groups'. Use o comando /groups para ver os grupos disponíveis",
                lastUpdated: new Date().toISOString(),
                totalGroups: this.allowedGroups.size
            };
            
            fs.writeFileSync(ALLOWED_GROUPS_FILE, JSON.stringify(data, null, 2));
            console.log(`💾 ${this.allowedGroups.size} grupos salvos no arquivo`);
        } catch (error) {
            console.error('❌ Erro ao salvar grupos:', error.message);
        }
    }

    // Verificar se um grupo é permitido
    isGroupAllowed(groupId) {
        return this.allowedGroups.has(groupId);
    }

    // Adicionar grupo à lista permitida
    addGroup(groupId, groupName = '') {
        if (!groupId) return false;
        
        const wasAdded = !this.allowedGroups.has(groupId);
        this.allowedGroups.add(groupId);
        
        if (wasAdded) {
            this.saveAllowedGroups();
            console.log(`➕ Grupo adicionado: ${groupName || groupId}`);
        }
        
        return wasAdded;
    }

    // Remover grupo da lista permitida
    removeGroup(groupId) {
        if (!groupId) return false;
        
        const wasRemoved = this.allowedGroups.has(groupId);
        this.allowedGroups.delete(groupId);
        
        if (wasRemoved) {
            this.saveAllowedGroups();
            console.log(`➖ Grupo removido: ${groupId}`);
        }
        
        return wasRemoved;
    }

    // Obter lista de grupos permitidos
    getAllowedGroups() {
        return Array.from(this.allowedGroups);
    }

    // Limpar todos os grupos
    clearAllGroups() {
        const count = this.allowedGroups.size;
        this.allowedGroups.clear();
        this.saveAllowedGroups();
        console.log(`🧹 ${count} grupos removidos da lista`);
        return count;
    }

    // Estatísticas
    getStats() {
        return {
            totalAllowedGroups: this.allowedGroups.size,
            groups: this.getAllowedGroups(),
            lastUpdated: new Date().toISOString()
        };
    }
}

// =========================
// 🔍 SISTEMA DE FILTRAGEM DE MENSAGENS
// =========================

class MessageFilter {
    constructor(allowedGroupsManager) {
        this.allowedGroupsManager = allowedGroupsManager;
        this.blockedCount = 0;
        this.allowedCount = 0;
        this.statusCount = 0;
    }

    // Verificar se a mensagem deve ser processada
    shouldProcessMessage(message) {
        try {
            // Verificar se é mensagem de status/story
            if (this.isStatusMessage(message)) {
                this.statusCount++;
                if (FILTER_CONFIG.logBlockedMessages) {
                    console.log('🚫 Status/Story bloqueado:', message.from);
                }
                return false;
            }

            // Verificar se é mensagem privada
            if (!message.isGroupMsg) {
                if (FILTER_CONFIG.allowPrivateMessages) {
                    this.allowedCount++;
                    if (FILTER_CONFIG.logBlockedMessages) {
                        console.log('✅ Mensagem privada permitida:', message.from);
                    }
                    return true;
                } else {
                    this.blockedCount++;
                    if (FILTER_CONFIG.logBlockedMessages) {
                        console.log('🚫 Mensagem privada bloqueada:', message.from);
                    }
                    return false;
                }
            }

            // Verificar se é mensagem de grupo
            if (message.isGroupMsg) {
                const groupId = message.from;
                
                // Se permite grupos específicos, verificar se está na lista
                if (FILTER_CONFIG.allowSpecificGroups) {
                    if (this.allowedGroupsManager.isGroupAllowed(groupId)) {
                        this.allowedCount++;
                        if (FILTER_CONFIG.logBlockedMessages) {
                            console.log('✅ Grupo permitido:', groupId);
                        }
                        return true;
                    }
                }

                // Bloquear grupo por padrão
                this.blockedCount++;
                if (FILTER_CONFIG.logBlockedMessages) {
                    console.log('🚫 Grupo bloqueado:', groupId);
                }
                return false;
            }

            // Caso padrão: bloquear
            this.blockedCount++;
            return false;

        } catch (error) {
            console.error('❌ Erro no filtro de mensagens:', error.message);
            return false; // Em caso de erro, bloquear por segurança
        }
    }

    // Verificar se é mensagem de status/story
    isStatusMessage(message) {
        if (!message?.from) return false;
        
        // Verificar padrões comuns de status
        const statusPatterns = [
            /status@broadcast/i,
            /@broadcast/i,
            /status\.whatsapp\.net/i
        ];

        return statusPatterns.some(pattern => 
            pattern.test(message.from) || 
            (message.to && pattern.test(message.to))
        );
    }

    // Obter estatísticas do filtro
    getStats() {
        const total = this.allowedCount + this.blockedCount + this.statusCount;
        
        return {
            total: total,
            allowed: this.allowedCount,
            blocked: this.blockedCount,
            status: this.statusCount,
            allowedPercentage: total > 0 ? ((this.allowedCount / total) * 100).toFixed(2) : 0,
            blockedPercentage: total > 0 ? ((this.blockedCount / total) * 100).toFixed(2) : 0,
            statusPercentage: total > 0 ? ((this.statusCount / total) * 100).toFixed(2) : 0
        };
    }

    // Resetar estatísticas
    resetStats() {
        this.allowedCount = 0;
        this.blockedCount = 0;
        this.statusCount = 0;
    }
}

// Instanciar gerenciadores
const allowedGroupsManager = new AllowedGroupsManager();
const messageFilter = new MessageFilter(allowedGroupsManager);

// Criar diretórios necessários
if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

// Gerenciador de Estado do Usuário
let userStates = {};

// Sistema de log de mensagens
let messageLog = [];
const MAX_LOG_SIZE = 100; // Manter últimas 100 mensagens

function addToMessageLog(messageData) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        from: messageData.from,
        body: messageData.body,
        type: messageData.type,
        sentToN8n: true
    };
    
    messageLog.unshift(logEntry);
    
    // Manter apenas as últimas MAX_LOG_SIZE mensagens
    if (messageLog.length > MAX_LOG_SIZE) {
        messageLog = messageLog.slice(0, MAX_LOG_SIZE);
    }
}

const stateManager = {
    // Carrega estados do PostgreSQL primeiro, depois do arquivo como fallback
    async loadStates() {
        try {
            // Tentar carregar do PostgreSQL primeiro
            if (dbManager?.pool) {
                const result = await dbManager.query('SELECT * FROM user_states');
                if (result.rows.length > 0) {
                    userStates = {};
                    result.rows.forEach(row => {
                        const cleanChatId = row.chat_id.replace('@c.us', '');
                        userStates[cleanChatId] = {
                            step: row.user_step,
                            data: row.user_data || {},
                            lastInteraction: row.last_interaction.getTime()
                        };
                    });
                    console.log(`✅ ${result.rows.length} estados de usuário carregados do PostgreSQL`);
                    return;
                }
            }
        } catch (error) {
            console.log('⚠️ Erro ao carregar estados do PostgreSQL, usando arquivo local:', error.message);
        }

        // Fallback para arquivo JSON
        try {
            if (fs.existsSync(STATE_FILE_PATH)) {
                const data = fs.readFileSync(STATE_FILE_PATH, 'utf8');
                userStates = JSON.parse(data);
                console.log('📊 Estados dos usuários carregados do arquivo local.');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar estados:', error);
            userStates = {};
        }
    },

    async saveStates() {
        try {
            // Salvar no PostgreSQL primeiro
            if (dbManager?.pool) {
                let savedCount = 0;
                for (const [chatId, state] of Object.entries(userStates)) {
                    try {
                        const fullChatId = chatId.includes('@c.us') ? chatId : `${chatId}@c.us`;
                        await dbManager.saveUserState(fullChatId, state.step, state.data);
                        savedCount++;
                    } catch (error) {
                        console.error(`❌ Erro ao salvar estado do usuário ${chatId}:`, error.message);
                    }
                }
                if (savedCount > 0) {
                    console.log(`💾 ${savedCount} estados salvos no PostgreSQL`);
                }
            }
        } catch (error) {
            console.log('⚠️ Erro ao salvar no PostgreSQL, salvando em arquivo local:', error.message);
        }

        // Sempre salvar no arquivo também como backup
        try {
            fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(userStates, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar estados:', error);
        }
    },

    async getUserState(from) {
        const cleanFrom = from.replace('@c.us', '');
        
        // Verificar timeout de sessão
        if (userStates[cleanFrom] && (Date.now() - userStates[cleanFrom].lastInteraction > SESSION_TIMEOUT_MS)) {
            console.log(`⏰ Sessão expirada para ${cleanFrom}`);
            await this.deleteUserState(from);
            return null;
        }
        
        // Tentar buscar do PostgreSQL se não estiver no cache
        if (!userStates[cleanFrom]) {
            try {
                if (dbManager?.pool) {
                    const state = await dbManager.getUserState(from);
                    if (state) {
                        userStates[cleanFrom] = state; // Cache local
                        return state;
                    }
                }
            } catch (error) {
                console.log('⚠️ Erro ao buscar estado do PostgreSQL:', error.message);
            }
        }
        
        return userStates[cleanFrom];
    },

    async setUserState(from, state) {
        const cleanFrom = from.replace('@c.us', '');
        state.lastInteraction = Date.now();
        userStates[cleanFrom] = state;
        
        // Salvar no PostgreSQL
        try {
            if (dbManager?.pool) {
                await dbManager.saveUserState(from, state.step, state.data);
            }
        } catch (error) {
            console.log('⚠️ Erro ao salvar estado no PostgreSQL:', error.message);
        }
        
        // Salvar no arquivo como backup
        this.saveStatesSync();
    },

    async deleteUserState(from) {
        const cleanFrom = from.replace('@c.us', '');
        delete userStates[cleanFrom];
        
        // Remover do PostgreSQL
        try {
            if (dbManager?.pool) {
                await dbManager.deleteUserState(from);
            }
        } catch (error) {
            console.log('⚠️ Erro ao deletar estado do PostgreSQL:', error.message);
        }
        
        this.saveStatesSync();
    },

    // Versão síncrona para compatibilidade
    saveStatesSync() {
        try {
            fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(userStates, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar estados:', error);
        }
    },

    // Limpeza automática de estados antigos
    async cleanupOldStates() {
        const timeoutMs = parseInt(process.env.SESSION_TIMEOUT_MS) || SESSION_TIMEOUT_MS;
        
        try {
            if (dbManager?.pool) {
                const deletedCount = await dbManager.cleanupOldUserStates(timeoutMs);
                if (deletedCount > 0) {
                    console.log(`🧹 ${deletedCount} estados antigos removidos do PostgreSQL`);
                }
            }
        } catch (error) {
            console.log('⚠️ Erro na limpeza do PostgreSQL:', error.message);
        }

        // Limpeza do cache local também
        const now = Date.now();
        let localDeletedCount = 0;
        for (const [chatId, state] of Object.entries(userStates)) {
            if (now - state.lastInteraction > timeoutMs) {
                delete userStates[chatId];
                localDeletedCount++;
            }
        }
        
        if (localDeletedCount > 0) {
            console.log(`🧹 ${localDeletedCount} estados antigos removidos do cache local`);
        }    }
};

// =========================
// 🔒 INTEGRAÇÃO ANTIVÍRUS E UPLOAD
// =========================

/**
 * Verifica arquivo com API Scanii
 * @param {Buffer} buffer - Buffer do arquivo
 * @param {string} filename - Nome do arquivo
 * @returns {Promise<{clean: boolean, error?: string}>}
 */
async function checkWithScanii(buffer, filename) {
    try {
        // Verificar se as credenciais estão configuradas
        const apiKey = process.env.SCANII_API_KEY;
        const apiSecret = process.env.SCANII_API_SECRET;
        
        if (!apiKey || !apiSecret) {
            console.log('⚠️ Credenciais Scanii não configuradas, permitindo arquivo');
            return { clean: true };
        }

        // Preparar FormData
        const formData = new FormData();
        formData.append('file', buffer, {
            filename: filename,
            contentType: 'application/octet-stream'
        });

        const authToken = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

        // Fazer requisição para API Scanii
        const response = await axios.post('https://api.scanii.com/v2.1/files', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Basic ${authToken}`
            },
            timeout: 30000 // 30 segundos
        });

        // Verificar resposta
        if (response.data?.findings) {
            const findings = response.data.findings;
            if (findings.length === 0) {
                console.log('✅ Arquivo limpo - Scanii');
                return { clean: true };
            } else {
                console.log('🚫 Arquivo bloqueado - Scanii:', findings);
                return { clean: false, error: `Ameaças detectadas: ${findings.join(', ')}` };
            }
        } else {
            console.log('✅ Arquivo limpo - Scanii (sem findings)');
            return { clean: true };
        }

    } catch (error) {
        console.error('❌ Erro na verificação Scanii:', error.message);
        
        // Em caso de erro na API, permitir o arquivo mas logar o erro
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        
        return { clean: true, error: `Erro na verificação: ${error.message}` };
    }
}

/**
 * Faz upload do arquivo para Gofile
 * @param {Buffer} buffer - Buffer do arquivo
 * @param {string} filename - Nome do arquivo
 * @param {string} folderName - Nome da pasta/descrição
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
async function uploadToGofile(buffer, filename, folderName) {
    try {
        // Primeiro, obter servidor de upload disponível
        const serverResponse = await axios.get('https://api.gofile.io/getServer', {
            timeout: 10000
        });

        if (serverResponse.data.status !== 'ok') {
            throw new Error('Não foi possível obter servidor Gofile');
        }

        const server = serverResponse.data.data.server;
        const uploadUrl = `https://${server}.gofile.io/uploadFile`;

        // Preparar FormData para upload
        const formData = new FormData();
        formData.append('file', buffer, {
            filename: filename,
            contentType: 'application/octet-stream'
        });
        formData.append('description', `Arquivo de ${folderName} - Enviado via WhatsApp Bot`);

        // Fazer upload
        const uploadResponse = await axios.post(uploadUrl, formData, {
            headers: {
                ...formData.getHeaders()
            },
            timeout: 60000, // 60 segundos para upload
            maxContentLength: 52428800, // 50MB
            maxBodyLength: 52428800
        });

        if (uploadResponse.data.status === 'ok') {
            const downloadPage = uploadResponse.data.data.downloadPage;
            console.log('✅ Upload Gofile realizado com sucesso:', downloadPage);
            return { success: true, url: downloadPage };
        } else {
            throw new Error(uploadResponse.data.message || 'Erro desconhecido no upload');
        }

    } catch (error) {
        console.error('❌ Erro no upload Gofile:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        
        return { success: false, error: error.message };
    }
}

// =========================
// 🔗 VALIDAÇÃO DE LINK DO MERCADO LIVRE
// =========================

/**
 * Verifica se o link é da loja oficial acessando a página em segundo plano
 * @param {string} url - URL a ser verificada
 * @returns {Promise<object>} - Resultado da verificação
 */
async function verifyMercadoLivreStorePage(url) {
    try {
        console.log(`🔍 Verificando página: ${url}`);
        
        // Fazer requisição HTTP para a página
        const response = await axios.get(url, {
            timeout: 10000, // 10 segundos timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });
        
        const html = response.data.toLowerCase();
        
        // Lista de indicadores que confirmam que é da loja "inaugura-lar"
        const storeIndicators = [
            // Nome da loja
            /inaugura.?lar/i,
            /inauguralar/i,
            
            // Possíveis variações do seller
            /"seller".*"inaugura.?lar"/i,
            /"seller_id".*"inaugura.?lar"/i,
            
            // Links específicos da loja
            /\/loja\/inaugura.?lar/i,
            /\/stores\/inaugura.?lar/i,
            
            // Metadados e JSON-LD
            /"name".*"inaugura.?lar"/i,
            /"storeName".*"inaugura.?lar"/i,
            
            // URLs no conteúdo
            /mercadolivre\.com\.br\/loja\/inaugura.?lar/i
        ];
        
        // Verificar se algum indicador foi encontrado
        const foundIndicator = storeIndicators.find(pattern => pattern.test(html));
        
        if (foundIndicator) {
            console.log(`✅ Loja oficial confirmada via scraping: ${url}`);
            return {
                isOfficialStore: true,
                verificationMethod: 'page_scraping',
                indicator: foundIndicator.source,
                confidence: 'high'
            };
        }
        
        // Se não encontrou indicadores específicos, mas é uma página válida do ML
        if (html.includes('mercadolivre') || html.includes('mercadolibre')) {
            console.log(`⚠️ Página do ML válida mas loja não identificada: ${url}`);
            return {
                isOfficialStore: false,
                verificationMethod: 'page_scraping',
                reason: 'store_not_identified',
                confidence: 'medium'
            };
        }
        
        // Página não é do Mercado Livre
        return {
            isOfficialStore: false,
            verificationMethod: 'page_scraping',
            reason: 'not_mercadolivre_page',
            confidence: 'high'
        };
        
    } catch (error) {
        console.error(`❌ Erro na verificação da página: ${error.message}`);
        
        // Em caso de erro, retorna resultado neutro
        return {
            isOfficialStore: null,
            verificationMethod: 'page_scraping',
            error: error.message,
            confidence: 'unknown'
        };
    }
}

/**
 * Valida se o link é da loja oficial no Mercado Livre (Versão Híbrida)
 * @param {string} link - URL a ser validada
 * @returns {Promise<object>} - Resultado da validação
 */
async function validateMercadoLivreLink(link) {
    try {
        // ETAPA 1: Verificação rápida da URL
        const url = new URL(link);
        
        // Verifica se é do domínio do Mercado Livre
        const validDomains = [
            'mercadolivre.com.br',
            'mercadolibre.com',
            'produto.mercadolivre.com.br',
            'www.mercadolivre.com.br'
        ];
        
        const isMLDomain = validDomains.some(domain => url.hostname.includes(domain));
        
        if (!isMLDomain) {
            return {
                isValid: false,
                reason: 'not_mercadolivre',
                message: '⚠️ Este link não é do *Mercado Livre*.\n\n🏪 Por favor, envie um link de produto da nossa loja oficial:\nhttps://www.mercadolivre.com.br/loja/inaugura-lar\n\n📝 *Exemplo de links válidos:*\n• https://produto.mercadolivre.com.br/MLB-xxxxxxx-...\n• https://www.mercadolivre.com.br/produto/p/MLBxxxxxxx'
            };
        }
        
        // Verificar se é um link de produto válido do ML
        const productPatterns = [
            /produto\.mercadolivre\.com\.br\/MLB-\d+-.+/i,
            /www\.mercadolivre\.com\.br\/.+\/p\/MLB\d+/i,
            /mercadolivre\.com\.br\/MLB-\d+/i,
            /loja\/inaugura-lar/i,
            /MLB-?\d+/i
        ];
        
        const isValidProductLink = productPatterns.some(pattern => pattern.test(link));
        
        if (!isValidProductLink) {
            return {
                isValid: false,
                reason: 'invalid_product_format',
                message: '⚠️ Este link não parece ser de um produto válido do Mercado Livre.\n\n🔍 *Verifique se o link contém:*\n• Código do produto (MLB-xxxxxxx)\n• É um link de produto ativo\n\n📝 Se não tiver o link, responda "não" para pular.'
            };
        }
        
        // ETAPA 2: Verificação rápida na URL
        const quickStoreValidations = [
            url.pathname.includes('/loja/inaugura-lar'),
            url.searchParams.get('seller_id') === 'inaugura-lar',
            link.toLowerCase().includes('inaugura-lar'),
            url.pathname.includes('/p/inaugura-lar'),
            (link.includes('_seller_') && link.includes('inaugura-lar')),
            url.pathname.includes('/stores/inaugura-lar')
        ];
        
        const isQuicklyIdentified = quickStoreValidations.some(validation => validation === true);
        
        if (isQuicklyIdentified) {
            return {
                isValid: true,
                reason: 'valid_official_store_quick',
                message: '✅ Link validado com sucesso da nossa loja oficial!',
                verificationMethod: 'url_analysis'
            };
        }
        
        // ETAPA 3: Verificação em segundo plano (scraping)
        console.log(`🔍 Iniciando verificação avançada para: ${link}`);
        
        const pageVerification = await verifyMercadoLivreStorePage(link);
        
        if (pageVerification.isOfficialStore === true) {
            return {
                isValid: true,
                reason: 'valid_official_store_verified',
                message: '✅ Link verificado e confirmado como da nossa loja oficial!',
                verificationMethod: 'page_scraping',
                confidence: pageVerification.confidence
            };
        } else if (pageVerification.isOfficialStore === false) {
            return {
                isValid: false,
                reason: 'wrong_store_verified',
                message: '⚠️ Link verificado e confirmado que NÃO é da nossa loja oficial.\n\n🏪 *NOSSA LOJA:* https://www.mercadolivre.com.br/loja/inaugura-lar\n\n📝 Por favor, envie um link de produto da nossa loja ou responda "não" para pular.',
                verificationMethod: 'page_scraping',
                confidence: pageVerification.confidence
            };
        } else {
            // Erro na verificação - aceitar com aviso
            const productCodeMatch = link.match(/MLB-?\d+/i);
            const productCode = productCodeMatch ? productCodeMatch[0] : 'não identificado';
            
            console.log(`⚠️ Erro na verificação, aceito com aviso: ${productCode} - ${pageVerification.error}`);
            
            return {
                isValid: true,
                reason: 'valid_ml_product_unverified',
                message: '✅ Link do Mercado Livre aceito!\n\n⚠️ *Importante:* Não foi possível verificar automaticamente se é da nossa loja oficial. Nosso atendente irá confirmar.\n\n🔢 Quantas unidades desse produto você deseja comprar?',
                warning: true,
                verificationMethod: 'verification_failed',
                verificationError: pageVerification.error
            };
        }
        
    } catch (error) {
        console.error('❌ Erro na validação do link:', error.message);
        return {
            isValid: false,
            reason: 'invalid_url',
            message: '⚠️ O link informado não é válido. Se não tiver o link, responda "não".\n\nSe tiver, envie o link completo (começando com http).'
        };
    }
}

// Sistema de Fila de Atendimento Humano Avançado
class SupportQueue {
    static queue = [];
    static activeChats = new Map(); // chatId -> attendant info
    static attendants = new Map(); // attendantId -> attendant info
    static chatHistory = new Map(); // chatId -> messages array
    static statistics = {
        totalChatsToday: 0,
        averageWaitTime: 0,
        averageChatDuration: 0,
        customerSatisfaction: 0,
        startTime: Date.now()
    };
    
    static addToQueue(chatId, userData) {
        // Verificar se já está na fila
        const existingIndex = this.queue.findIndex(item => item.chatId === chatId);
        if (existingIndex !== -1) {
            return existingIndex + 1; // Retorna posição atual
        }
        
        const queueItem = {
            chatId: chatId,
            userData: userData,
            timestamp: new Date().toISOString(),
            waitingTime: Date.now(),
            priority: userData.priority || 'normal', // normal, high, urgent
            topic: userData.topic || 'geral',
            estimatedDuration: 10 // minutos estimados
        };
        
        // Adicionar com prioridade (urgent primeiro, depois high, depois normal)
        if (queueItem.priority === 'urgent') {
            this.queue.unshift(queueItem);
        } else if (queueItem.priority === 'high') {
            const urgentCount = this.queue.filter(item => item.priority === 'urgent').length;
            this.queue.splice(urgentCount, 0, queueItem);
        } else {
            this.queue.push(queueItem);
        }
        
        console.log(`📞 ${chatId} adicionado à fila. Posição: ${this.getPosition(chatId)}, Prioridade: ${queueItem.priority}`);
        
        return this.getPosition(chatId);
    }
    
    static removeFromQueue(chatId) {
        const index = this.queue.findIndex(item => item.chatId === chatId);
        if (index !== -1) {
            this.queue.splice(index, 1);
            console.log(`🚪 ${chatId} removido da fila`);
            return true;
        }
        return false;
    }
    
    static getPosition(chatId) {
        const index = this.queue.findIndex(item => item.chatId === chatId);
        return index !== -1 ? index + 1 : 0;
    }
    
    static getNext() {
        return this.queue.length > 0 ? this.queue[0] : null;
    }
    
    static startChat(chatId, attendantInfo) {
        const queueItem = this.queue.find(item => item.chatId === chatId);
        const waitTime = queueItem ? Date.now() - queueItem.waitingTime : 0;
        
        this.removeFromQueue(chatId);
        
        const chatInfo = {
            chatId: chatId,
            attendantId: attendantInfo.id,
            attendantName: attendantInfo.name,
            startTime: Date.now(),
            waitTime: waitTime,
            userData: queueItem?.userData || {}
        };
        
        this.activeChats.set(chatId, chatInfo);
        this.chatHistory.set(chatId, []);
        
        // Atualizar estatísticas
        this.statistics.totalChatsToday++;
        this.updateAverageWaitTime(waitTime);
        
        console.log(`💬 Chat iniciado: ${chatId} com atendente ${attendantInfo.name} (${attendantInfo.id})`);
        
        return chatInfo;
    }
    
    static endChat(chatId, rating = null, feedback = null) {
        const chatInfo = this.activeChats.get(chatId);
        if (chatInfo) {
            const chatDuration = Date.now() - chatInfo.startTime;
            
            // Atualizar estatísticas
            this.updateAverageChatDuration(chatDuration);
            if (rating) {
                this.updateCustomerSatisfaction(rating);
            }
            
            // Salvar histórico completo
            const completedChat = {
                ...chatInfo,
                endTime: Date.now(),
                duration: chatDuration,
                rating: rating,
                feedback: feedback,
                messages: this.chatHistory.get(chatId) || []
            };
            
            this.activeChats.delete(chatId);
            this.chatHistory.delete(chatId);
            
            console.log(`✅ Chat finalizado: ${chatId} - Duração: ${Math.floor(chatDuration / 1000 / 60)} min`);
            
            return completedChat;
        }
        return null;
    }
    
    static addMessageToHistory(chatId, message, isFromAttendant = false) {
        if (!this.chatHistory.has(chatId)) {
            this.chatHistory.set(chatId, []);
        }
        
        const messageEntry = {
            timestamp: new Date().toISOString(),
            message: message,
            isFromAttendant: isFromAttendant,
            attendantId: isFromAttendant ? this.activeChats.get(chatId)?.attendantId : null
        };
        
        this.chatHistory.get(chatId).push(messageEntry);
    }
    
    static registerAttendant(attendantId, attendantName, skills = []) {
        const attendantInfo = {
            id: attendantId,
            name: attendantName,
            skills: skills,
            status: 'available', // available, busy, away
            activeChats: 0,
            maxChats: 3,
            totalChatsToday: 0,
            loginTime: Date.now()
        };
        
        this.attendants.set(attendantId, attendantInfo);
        console.log(`👨‍💼 Atendente registrado: ${attendantName} (${attendantId})`);
        
        return attendantInfo;
    }
    
    static updateAttendantStatus(attendantId, status) {
        const attendant = this.attendants.get(attendantId);
        if (attendant) {
            attendant.status = status;
            return true;
        }
        return false;
    }
    
    static getAvailableAttendants() {
        return Array.from(this.attendants.values()).filter(att => 
            att.status === 'available' && att.activeChats < att.maxChats
        );
    }
    
    static autoAssignToAttendant() {
        const nextInQueue = this.getNext();
        const availableAttendants = this.getAvailableAttendants();
        
        if (nextInQueue && availableAttendants.length > 0) {
            // Escolher atendente com menos chats ativos
            const bestAttendant = availableAttendants.reduce((best, current) => 
                current.activeChats < best.activeChats ? current : best,
                availableAttendants[0] // valor inicial
            );
            
            return {
                queueItem: nextInQueue,
                attendant: bestAttendant
            };
        }
        
        return null;
    }
    
    static updateAverageWaitTime(newWaitTime) {
        const currentAvg = this.statistics.averageWaitTime;
        const totalChats = this.statistics.totalChatsToday;
        
        this.statistics.averageWaitTime = 
            ((currentAvg * (totalChats - 1)) + newWaitTime) / totalChats;
    }
    
    static updateAverageChatDuration(newDuration) {
        const currentAvg = this.statistics.averageChatDuration;
        const totalChats = this.statistics.totalChatsToday;
        
        this.statistics.averageChatDuration = 
            ((currentAvg * (totalChats - 1)) + newDuration) / totalChats;
    }
    
    static updateCustomerSatisfaction(rating) {
        // Implementar lógica de média de satisfação
        const currentSat = this.statistics.customerSatisfaction;
        const totalChats = this.statistics.totalChatsToday;
        
        this.statistics.customerSatisfaction = 
            ((currentSat * (totalChats - 1)) + rating) / totalChats;
    }
    
    static getDetailedQueueStatus() {
        const totalWaitingTime = this.queue.reduce((total, item) => 
            total + (Date.now() - item.waitingTime), 0
        );
        
        return {
            queueLength: this.queue.length,
            activeChats: this.activeChats.size,
            availableAttendants: this.getAvailableAttendants().length,
            totalAttendants: this.attendants.size,
            averageWaitTimeMinutes: totalWaitingTime > 0 ? Math.floor(totalWaitingTime / this.queue.length / 1000 / 60) : 0,
            statistics: {
                ...this.statistics,
                averageWaitTimeMinutes: Math.floor(this.statistics.averageWaitTime / 1000 / 60),
                averageChatDurationMinutes: Math.floor(this.statistics.averageChatDuration / 1000 / 60),
                uptime: Math.floor((Date.now() - this.statistics.startTime) / 1000 / 60)
            },
            queue: this.queue.map((item, index) => ({
                position: index + 1,
                chatId: item.chatId,
                userName: item.userData?.name || 'Não informado',
                priority: item.priority,
                topic: item.topic,
                waitingTimeMinutes: Math.floor((Date.now() - item.waitingTime) / 1000 / 60),
                estimatedDuration: item.estimatedDuration,
                timestamp: item.timestamp
            })),
            activeChatsDetails: Array.from(this.activeChats.entries()).map(([chatId, chatInfo]) => ({
                chatId,
                attendantId: chatInfo.attendantId,
                attendantName: chatInfo.attendantName,
                userName: chatInfo.userData?.name || 'Cliente',
                durationMinutes: Math.floor((Date.now() - chatInfo.startTime) / 1000 / 60),
                messageCount: this.chatHistory.get(chatId)?.length || 0
            })),
            attendants: Array.from(this.attendants.values()).map(att => ({
                id: att.id,
                name: att.name,
                status: att.status,
                skills: att.skills,
                activeChats: att.activeChats,
                maxChats: att.maxChats,
                totalChatsToday: att.totalChatsToday,
                onlineTimeMinutes: Math.floor((Date.now() - att.loginTime) / 1000 / 60)
            }))
        };
    }
}

// Lógica de Fluxo Conversacional
class ConversationFlow {
    /**
     * Processa mensagem de áudio: transcreve, analisa intenção, registra para dashboard e responde conforme contexto.
     * Só processa se NÃO estiver em atendimento humano.
     */
    static async handleAudioMessage(message, userState) {
        // NÃO faz antivírus nem upload Gofile para áudio!
        const fs = require('fs');
        const path = require('path');
        const { execFile } = require('child_process');
        const UPLOAD_FOLDER = './uploads/';
        const audioExt = '.ogg';
        const fileName = `audio-${Date.now()}${audioExt}`;
        const filePath = path.join(UPLOAD_FOLDER, fileName);
        // Baixa o áudio
        const media = await message.downloadMedia();
        fs.writeFileSync(filePath, media.data, { encoding: 'base64' });

        // Chama Whisper localmente (exemplo: whisper.cpp ou openai-whisper via CLI)
        const whisperCmd = process.env.WHISPER_CMD || 'whisper';
        const whisperArgs = [filePath, '--model', 'small', '--language', 'pt', '--output_format', 'txt'];

        let transcript = '';
        try {
            await new Promise((resolve, reject) => {
                execFile(whisperCmd, whisperArgs, { cwd: process.cwd() }, (err, stdout, stderr) => {
                    if (err) return reject(err);
                    const txtFile = filePath.replace(/\.[^.]+$/, '.txt');
                    if (fs.existsSync(txtFile)) {
                        transcript = fs.readFileSync(txtFile, 'utf8');
                        try { fs.unlinkSync(txtFile); } catch (e) {}
                    }
                    resolve();
                });
            });
        } catch (err) {
            transcript = '[ERRO NA TRANSCRIÇÃO: ' + err.message + ']';
        }

        // Remove o áudio após uso
        try { fs.unlinkSync(filePath); } catch (e) {}

        // Salva para dashboard
        saveAudioTranscriptForDashboard({
            chatId: message.from,
            nome: userState?.data?.name || '',
            data: new Date().toISOString(),
            transcript,
            audioPath: filePath,
            intent: '',
            status: 'novo'
        });

        // NÃO envia para grupo, NÃO faz upload, NÃO faz antivírus
        // Envia a transcrição como mensagem "oculta" (prefixo especial) para o próprio chat, mas o cliente não vê (dashboard pode filtrar)
        if (globalThis.client) {
            const hiddenMsg = `[TRANSCRICAO_OCULTA] ${transcript}`;
            await globalThis.client.sendMessage(message.from, hiddenMsg);
        }

        // Análise do texto para identificar intenção
        const lower = transcript.toLowerCase();
        const problemas = [
            'quebrado', 'trincado', 'defeito', 'não funciona', 'nao funciona', 'faltando', 'veio errado',
            'problema', 'reclamação', 'reclamacao', 'não gostei', 'nao gostei', 'insatisfeito', 'garantia', 'troca', 'devolução', 'devolucao', 'não chegou', 'nao chegou'
        ];
        const isProblema = problemas.some(p => lower.includes(p));

        if (isProblema) {
            // Atualiza registro para dashboard
            saveAudioTranscriptForDashboard({
                chatId: message.from,
                nome: userState?.data?.name || '',
                data: new Date().toISOString(),
                transcript,
                audioPath: filePath,
                intent: 'product_issue',
                status: 'detectado_problema'
            });
            // Inicia fluxo de problema com produto
            return {
                response: '📋 *Registro de Problema com Produto*\n\nDetectamos que você está relatando um problema. Para agilizar seu atendimento, por favor envie:\n\n1️⃣ *Nota fiscal ou número do pedido*\n(Você pode enviar uma foto da nota fiscal ou apenas digitar o número).',
                newStep: 'product_issue_nf',
                data: userState.data || {}
            };
        } else {
            // Segue fluxo normal, apenas confirma recebimento do áudio
            return {
                response: '✅ Áudio recebido! Caso precise de algo, é só digitar ou enviar mais detalhes.',
                newStep: userState.step,
                data: userState.data || {}
            };
        }
    }
// =========================
// 📄 DOCUMENTAÇÃO PARA INTEGRAÇÃO COM DASHBOARD
// =========================
/**
 * Estrutura do arquivo ./audio-transcripts.json:
 * [
 *   {
 *     chatId: string, // ID do chat do cliente
 *     nome: string,   // Nome do cliente (se disponível)
 *     data: string,   // Data/hora ISO
 *     transcript: string, // Texto transcrito do áudio
 *     audioPath: string,  // Caminho do arquivo de áudio original
 *     intent: string,     // Intenção detectada (ex: 'product_issue')
 *     status: string      // Status do registro ('novo', 'detectado_problema', 'revisado', etc)
 *   }, ...
 * ]
 *
 * Para integração:
 * - Buscar transcrições por chatId, nome, data, intenção ou status.
 * - Exibir transcrição e permitir ações administrativas (marcar como revisado, responder, etc).
 * - Acessar o áudio original pelo campo audioPath.
 * - Atualizar status conforme ações na dashboard.
 */
    /**
     * Transcreve áudio usando Whisper local e faz análise do contexto.
     * Se identificar reclamação/problema, inicia fluxo de problema com produto.
     * Envia a transcrição como mensagem "oculta" (só para atendentes, não para o cliente).
     */
    static async handleAudioMessage(message, userState) {
        const fs = require('fs');
        const path = require('path');
        const { execFile } = require('child_process');
        const UPLOAD_FOLDER = './uploads/';
        const audioExt = '.ogg';
        const fileName = `audio-${Date.now()}${audioExt}`;
        const filePath = path.join(UPLOAD_FOLDER, fileName);
        // Baixa o áudio
        const media = await message.downloadMedia();
        fs.writeFileSync(filePath, media.data, { encoding: 'base64' });

        // Chama Whisper localmente (exemplo: whisper.cpp ou openai-whisper via CLI)
        // Ajuste o comando conforme seu ambiente (exemplo: 'whisper', 'whisper.cpp', etc)
        // Aqui usamos whisper via Python: whisper --model small --language pt --output_format txt <arquivo>
        const whisperCmd = process.env.WHISPER_CMD || 'whisper';
        const whisperArgs = [filePath, '--model', 'small', '--language', 'pt', '--output_format', 'txt'];

        let transcript = '';
        try {
            // Executa Whisper
            await new Promise((resolve, reject) => {
                execFile(whisperCmd, whisperArgs, { cwd: process.cwd() }, (err, stdout, stderr) => {
                    if (err) return reject(err);
                    // O Whisper salva o arquivo .txt no mesmo diretório
                    const txtFile = filePath.replace(/\.[^.]+$/, '.txt');
                    if (fs.existsSync(txtFile)) {
                        transcript = fs.readFileSync(txtFile, 'utf8').trim();
                        fs.unlinkSync(txtFile);
                    }
                    resolve();
                });
            });
        } catch (err) {
            transcript = '[ERRO NA TRANSCRIÇÃO: ' + err.message + ']';
        }

        // Remove o áudio após uso
        try { fs.unlinkSync(filePath); } catch (e) {}

        // Envia a transcrição como mensagem "oculta" (só para atendentes, não para o cliente)
        // No WhatsApp não existe mensagem realmente oculta, mas podemos usar um prefixo especial e instruir os atendentes a ignorar mensagens que começam com, por exemplo, "[TRANSCRIÇÃO OCULTA]"
        // O cliente verá a mensagem, mas pode ser "escondida" via instrução ou filtro no painel do atendente
        // Se você usa um painel próprio, pode filtrar por esse prefixo
        if (globalThis.client) {
            const hiddenMsg = `[TRANSCRIÇÃO OCULTA] ${transcript}`;
            await globalThis.client.sendMessage(message.from, hiddenMsg);
        }

        // Análise do texto para identificar intenção
        // Simples: busca palavras-chave de reclamação/problema
        const lower = transcript.toLowerCase();
        const problemas = [
            'quebrado', 'trincado', 'defeito', 'não funciona', 'nao funciona', 'faltando', 'veio errado',
            'problema', 'reclamação', 'reclamacao', 'não gostei', 'nao gostei', 'insatisfeito', 'garantia', 'troca', 'devolução', 'devolucao', 'não chegou', 'nao chegou'
        ];
        const isProblema = problemas.some(p => lower.includes(p));

        if (isProblema) {
            // Inicia fluxo de problema com produto
            return {
                response: '📋 *Registro de Problema com Produto*\n\nDetectamos que você está relatando um problema. Para agilizar seu atendimento, por favor envie:\n\n1️⃣ *Nota fiscal ou número do pedido*\n(Você pode enviar uma foto da nota fiscal ou apenas digitar o número).',
                newStep: 'product_issue_nf',
                data: userState.data || {}
            };
        } else {
            // Segue fluxo normal, apenas confirma recebimento do áudio
            return {
                response: '✅ Áudio recebido! Caso precise de algo, é só digitar ou enviar mais detalhes.',
                newStep: userState.step,
                data: userState.data || {}
            };
        }
    }
    // Novo: tratamento de áudios recebidos para transcrição e análise de intenção
    static async handleAudioMessage(message, userState) {
        const fs = require('fs');
        const path = require('path');
        const attendantsGroupId = process.env.ATTENDANTS_GROUP_ID;
        let transcript = null;
        let detectedIntent = null;
        let tempFilePath = null;
        try {
            // Baixa o áudio
            const media = await message.downloadMedia();
            if (!media) throw new Error('Falha ao baixar o áudio');
            const ext = media.mimetype.split('/')[1] || 'ogg';
            const fileName = `audio-${Date.now()}.${ext}`;
            tempFilePath = path.join('./uploads/', fileName);
            fs.writeFileSync(tempFilePath, media.data, { encoding: 'base64' });
            // Transcrição usando Whisper local (chamada via shell)
            // Exemplo: whisper audio.mp3 --language pt --model base --output_format txt
            const { execSync } = require('child_process');
            let whisperOutput = '';
            try {
                // Ajuste o comando conforme o seu ambiente Whisper local
                // O comando abaixo supõe que whisper está instalado globalmente
                execSync(`whisper "${tempFilePath}" --language pt --model base --output_format txt --output_dir ./uploads/`);
                const txtPath = tempFilePath.replace(/\.[^/.]+$/, '.txt');
                if (fs.existsSync(txtPath)) {
                    whisperOutput = fs.readFileSync(txtPath, 'utf8');
                }
            } catch (e) {
                whisperOutput = '[Erro ao transcrever com Whisper: ' + e.message + ']';
            }
            transcript = whisperOutput.trim();
        } catch (err) {
            transcript = '[Erro ao transcrever o áudio: ' + err.message + ']';
        }

        // Envia mensagem oculta para o grupo de atendentes (ou log)
        if (attendantsGroupId && globalThis.client && transcript) {
            let msg = `🔎 *Transcrição automática de áudio do cliente* (${message.from}):\n\n"${transcript}"`;
            await globalThis.client.sendMessage(attendantsGroupId, msg);
        }

        // Analisa intenção do áudio (simples, pode ser expandido)
        if (transcript) {
            const t = transcript.toLowerCase();
            if (t.includes('quebrado') || t.includes('trincado') || t.includes('faltando') || t.includes('produto') || t.includes('defeito') || t.includes('veio errado') || t.includes('não funciona') || t.includes('nao funciona')) {
                detectedIntent = 'product_issue';
            }
        }

        // Se detectou problema com produto, inicia fluxo a partir do ponto correto
        if (detectedIntent === 'product_issue') {
            return {
                response: '📋 *Registro de Problema com Produto*\n\nDetectamos que você está relatando um problema com seu produto. Para agilizar seu atendimento, por favor envie:\n\n1️⃣ *Nota fiscal ou número do pedido*\n(Você pode enviar uma foto da nota fiscal ou apenas digitar o número).',
                newStep: 'product_issue_nf',
                data: {
                    ...userState.data,
                    flowType: 'product_issue',
                    audioTranscript: transcript
                }
            };
        }

        // Caso não detecte intenção clara, segue fluxo normal (pode customizar)
        return {
            response: 'Recebemos seu áudio! Em breve um atendente irá analisar sua mensagem e te responder. Se quiser agilizar, pode digitar sua dúvida ou escolher uma opção do menu.',
            newStep: userState.step || 'start',
            data: {
                ...userState.data,
                audioTranscript: transcript
            }
        };
    }
    // Novo: tratamento de áudios recebidos para transcrição e análise de intenção
    static async handleAudioMessage(message, userState) {
        const fs = require('fs');
        const path = require('path');
        const attendantsGroupId = process.env.ATTENDANTS_GROUP_ID;
        let transcript = null;
        let detectedIntent = null;
        let tempFilePath = null;
        try {
            // Baixa o áudio
            const media = await message.downloadMedia();
            if (!media) throw new Error('Não foi possível baixar o áudio.');
            const ext = media.mimetype.split('/')[1] || 'ogg';
            const fileName = `audio-${Date.now()}.${ext}`;
            tempFilePath = path.join('./uploads/', fileName);
            fs.writeFileSync(tempFilePath, media.data, { encoding: 'base64' });
            // Transcrição (usando openai-whisper ou serviço similar)
            // Aqui é um mock, substitua por integração real se necessário
            let whisperTranscribe = null;
            try {
                whisperTranscribe = require('whisper-openai');
            } catch (e) {}
            if (whisperTranscribe) {
                transcript = await whisperTranscribe.transcribe(tempFilePath, { lang: 'pt' });
            } else {
                // Fallback: mensagem de erro
                transcript = '[Transcrição automática não disponível neste ambiente]';
            }
        } catch (err) {
            transcript = '[Erro ao transcrever o áudio: ' + err.message + ']';
        }

        // Envia mensagem oculta para o grupo de atendentes (ou log)
        if (attendantsGroupId && globalThis.client && transcript) {
            let msg = `🔎 *Transcrição automática de áudio do cliente* (${message.from}):\n\n"${transcript}"`;
            await globalThis.client.sendMessage(attendantsGroupId, msg);
        }

        // Analisa intenção do áudio (mock simples, pode ser substituído por IA)
        // Exemplo: se mencionar "quebrado", "faltando", "produto", etc, direciona para problema com produto
        if (transcript) {
            const t = transcript.toLowerCase();
            if (t.includes('quebrado') || t.includes('trincado') || t.includes('faltando') || t.includes('produto') || t.includes('defeito') || t.includes('veio errado') || t.includes('não funciona') || t.includes('nao funciona')) {
                detectedIntent = 'product_issue';
            }
        }

        // Se detectou problema com produto, inicia fluxo a partir do ponto correto
        if (detectedIntent === 'product_issue') {
            return {
                response: '📋 *Registro de Problema com Produto*\n\nDetectamos que você está relatando um problema com seu produto. Para agilizar seu atendimento, por favor envie:\n\n1️⃣ *Nota fiscal ou número do pedido*\n(Você pode enviar uma foto da nota fiscal ou apenas digitar o número).',
                newStep: 'product_issue_nf',
                data: {
                    ...userState.data,
                    flowType: 'product_issue',
                    audioTranscript: transcript
                }
            };
        }

        // Caso não detecte intenção clara, segue fluxo normal (pode customizar)
        return {
            response: 'Recebemos seu áudio! Em breve um atendente irá analisar sua mensagem e te responder. Se quiser agilizar, pode digitar sua dúvida ou escolher uma opção do menu.',
            newStep: userState.step || 'start',
            data: {
                ...userState.data,
                audioTranscript: transcript
            }
        };
    }
    // LOGGING CENTRALIZADO
    static logEvent(type, chatId, step, data = {}) {
        const fs = require('fs');
        const logLine = JSON.stringify({
            timestamp: new Date().toISOString(),
            type,
            chatId,
            step,
            data
        }) + '\n';
        fs.appendFile('./logs/whatsapp-bot.log', logLine, err => {
            if (err) console.error('Erro ao gravar log:', err.message);
        });
    }

    // RECUPERAÇÃO DE CARRINHO (persistência simples por usuário)
    static getCartFromStorage(chatId) {
        const fs = require('fs');
        const file = `./userStates/${chatId}-cart.json`;
        if (fs.existsSync(file)) {
            try {
                return JSON.parse(fs.readFileSync(file, 'utf8'));
            } catch (e) { return []; }
        }
        return [];
    }
    static saveCartToStorage(chatId, cart) {
        const fs = require('fs');
        if (!fs.existsSync('./userStates')) fs.mkdirSync('./userStates');
        fs.writeFileSync(`./userStates/${chatId}-cart.json`, JSON.stringify(cart));
    }
    // Utilitário: gera resumo do carrinho
    static formatCart(cart = []) {
        if (!cart.length) return '🛒 Seu carrinho está vazio.';
        let txt = '*🛒 Seu Carrinho:*\n';
        cart.forEach((item, i) => {
            txt += `*${i+1}*. ${item.name} — ${item.qty} un.\n`;
        });
        return txt;
    }

    // Novo fluxo: carrinho multi-produto avançado
    static async handleCartFlow(message, userState) {
        let cart = userState.data?.cart || ConversationFlow.getCartFromStorage(message.from);
        let step = userState.step;
        let data = userState.data || {};
        const body = (message.body || '').trim().toLowerCase();

        // Logging de entrada no fluxo do carrinho
        ConversationFlow.logEvent('cart_flow', message.from, step, { body, cart });

        // Comandos globais
        if (body === 'cancelar') {
            ConversationFlow.saveCartToStorage(message.from, []);
            return {
                response: '❌ Carrinho cancelado. Se quiser começar de novo, digite "comprar".',
                newStep: 'awaiting_main_option',
                data: {}
            };
        }
        if (body === 'finalizar') {
            if (!cart.length) {
                return {
                    response: '🛒 Seu carrinho está vazio. Adicione pelo menos um produto antes de finalizar.',
                    newStep: 'cart_add_product',
                    data
                };
            }
            // Prossegue para dados pessoais
            data.cart = cart;
            ConversationFlow.saveCartToStorage(message.from, cart);
            return {
                response: this.formatCart(cart) + '\n\nPara finalizar, envie seu *nome completo*:',
                newStep: 'cart_ask_name',
                data
            };
        }
        if (body === 'ver carrinho' || body === 'carrinho') {
            return {
                response: this.formatCart(cart) + '\n\nDigite "adicionar" para incluir mais produtos, "remover" para tirar algum, "editar" para alterar quantidade, "finalizar" para concluir ou "cancelar" para sair.',
                newStep: 'cart_menu',
                data
            };
        }

        // Fluxo principal
        switch (step) {
            case 'cart_start':
            case 'cart_add_product': {
                if (body === 'adicionar' || !cart.length) {
                    return {
                        response: '📝 Envie o *nome do produto* que deseja adicionar ao carrinho:',
                        newStep: 'cart_ask_product_name',
                        data
                    };
                }
                if (body === 'remover') {
                    if (!cart.length) {
                        return {
                            response: 'Seu carrinho está vazio.',
                            newStep: 'cart_add_product',
                            data
                        };
                    }
                    return {
                        response: this.formatCart(cart) + '\n\nDigite o número do item que deseja remover:',
                        newStep: 'cart_remove_item',
                        data
                    };
                }
                if (body === 'editar') {
                    if (!cart.length) {
                        return {
                            response: 'Seu carrinho está vazio.',
                            newStep: 'cart_add_product',
                            data
                        };
                    }
                    return {
                        response: this.formatCart(cart) + '\n\nDigite o número do item que deseja editar a quantidade:',
                        newStep: 'cart_edit_item',
                        data
                    };
                }
                return {
                    response: 'Comando não reconhecido. Digite "adicionar", "remover", "editar", "finalizar" ou "cancelar".',
                    newStep: 'cart_add_product',
                    data
                };
            }
            case 'cart_ask_product_name': {
                if (!message.body || message.body.length < 2) {
                    return {
                        response: '⚠️ Informe o *nome do produto* (mínimo 2 letras):',
                        newStep: 'cart_ask_product_name',
                        data
                    };
                }
                data._currentProduct = message.body.trim();
                return {
                    response: '🔢 Quantas unidades desse produto?',
                    newStep: 'cart_ask_product_qty',
                    data
                };
            }
            case 'cart_ask_product_qty': {
                const qty = parseInt(message.body?.trim());
                if (isNaN(qty) || qty < 1) {
                    return {
                        response: '⚠️ Informe a *quantidade* (apenas números):',
                        newStep: 'cart_ask_product_qty',
                        data
                    };
                }
                cart.push({ name: data._currentProduct, qty });
                data.cart = cart;
                delete data._currentProduct;
                ConversationFlow.saveCartToStorage(message.from, cart);
                return {
                    response: this.formatCart(cart) + '\n\nProduto adicionado! Digite "adicionar" para incluir mais, "remover", "editar", "finalizar" ou "cancelar".',
                    newStep: 'cart_add_product',
                    data
                };
            }
            case 'cart_remove_item': {
                const idx = parseInt(message.body?.trim()) - 1;
                if (isNaN(idx) || idx < 0 || idx >= cart.length) {
                    return {
                        response: 'Número inválido. Digite o número do item que deseja remover:',
                        newStep: 'cart_remove_item',
                        data
                    };
                }
                cart.splice(idx, 1);
                data.cart = cart;
                ConversationFlow.saveCartToStorage(message.from, cart);
                return {
                    response: this.formatCart(cart) + '\n\nItem removido! Digite "adicionar", "remover", "editar", "finalizar" ou "cancelar".',
                    newStep: 'cart_add_product',
                    data
                };
            }
            case 'cart_edit_item': {
                const idx = parseInt(message.body?.trim()) - 1;
                if (isNaN(idx) || idx < 0 || idx >= cart.length) {
                    return {
                        response: 'Número inválido. Digite o número do item que deseja editar:',
                        newStep: 'cart_edit_item',
                        data
                    };
                }
                data._editIdx = idx;
                return {
                    response: `Digite a nova quantidade para *${cart[idx].name}* (atual: ${cart[idx].qty}):`,
                    newStep: 'cart_edit_qty',
                    data
                };
            }
            case 'cart_edit_qty': {
                const qty = parseInt(message.body?.trim());
                if (isNaN(qty) || qty < 1) {
                    return {
                        response: 'Quantidade inválida. Digite um número maior que zero:',
                        newStep: 'cart_edit_qty',
                        data
                    };
                }
                cart[data._editIdx].qty = qty;
                data.cart = cart;
                delete data._editIdx;
                ConversationFlow.saveCartToStorage(message.from, cart);
                return {
                    response: this.formatCart(cart) + '\n\nQuantidade atualizada! Digite "adicionar", "remover", "editar", "finalizar" ou "cancelar".',
                    newStep: 'cart_add_product',
                    data
                };
            }
            case 'cart_menu': {
                return {
                    response: this.formatCart(cart) + '\n\nDigite "adicionar" para incluir mais produtos, "remover" para tirar algum, "editar" para alterar quantidade, "finalizar" para concluir ou "cancelar" para sair.',
                    newStep: 'cart_add_product',
                    data
                };
            }
            case 'cart_ask_name': {
                const name = message.body?.trim();
                if (!name || name.split(' ').length < 2) {
                    return {
                        response: '⚠️ Informe seu *nome completo* (pelo menos duas palavras):',
                        newStep: 'cart_ask_name',
                        data
                    };
                }
                data.name = name;
                // Aqui pode seguir para endereço, pagamento, etc.
                return {
                    response: '🏠 Agora, envie seu *endereço completo* com CEP:',
                    newStep: 'cart_ask_address',
                    data
                };
            }
            case 'cart_ask_address': {
                const address = message.body?.trim();
                if (!address || address.length < 8) {
                    return {
                        response: '⚠️ Endereço inválido. Por favor, envie seu *endereço completo* com CEP:',
                        newStep: 'cart_ask_address',
                        data
                    };
                }
                data.address = address;
                // Finaliza
                ConversationFlow.saveCartToStorage(message.from, []); // Limpa carrinho após finalização
                return {
                    response: '✅ Pedido registrado! Em breve um atendente irá confirmar os detalhes e combinar o pagamento. Obrigado por comprar conosco! Se quiser, digite "menu" para voltar ao início.',
                    newStep: 'start',
                    data,
                    finalizeSession: true
                };
            }
            default:
                return {
                    response: 'Comando não reconhecido. Digite "adicionar", "remover", "editar", "finalizar" ou "cancelar".',
                    newStep: 'cart_add_product',
                    data
                };
        }
    // (continuação dos métodos da classe)
        // ...
        // ...
    }
    // Novo: fluxo robusto de compra via WhatsApp
    static async handlePurchaseRobust(message, userState) {
        const step = userState.step;
        const userData = userState.data || {};
        const catalogUrl = process.env.CATALOG_URL || 'https://inauguralar.com/catalog';
        const cityAllowed = (process.env.CITY_ALLOWED || '').toLowerCase();
        const onlineStores = (process.env.ONLINE_STORES || '').split(';').filter(Boolean);
        const attendantsGroupId = process.env.ATTENDANTS_GROUP_ID;
        const companyName = process.env.COMPANY_NAME || 'Inaugura Lar';
        const instagramUrl = process.env.INSTAGRAM_URL || 'https://instagram.com/inauguralar';
        const UPLOAD_FOLDER = './uploads/';
        const fs = require('fs');
        const path = require('path');
        const { MessageMedia } = require('whatsapp-web.js');
        switch (step) {
            case 'purchase_ask_catalog': {
                // Primeira pergunta: conhece o catálogo?
                const answer = (message.body || '').toLowerCase();
                if (answer.includes('catalog') || answer.includes('catálogo') || answer.includes('quero ver') || answer.includes('ver catálogo') || answer === '1') {
                    userData._sendMedia = {
                        file: './media/catalog-card.jpg',
                        caption: '🛍️ Veja nosso catálogo digital e descubra ofertas especiais! Qualquer dúvida, estamos aqui para ajudar 😊'
                    };
                    return {
                        response: `🔗 Acesse nosso catálogo online: ${catalogUrl}\n\nQuando finalizar o pedido no site, clique em "Finalizar pelo WhatsApp" para retornar aqui.\n\nSe preferir, digite *continuar pelo WhatsApp* para comprar por aqui.`,
                        newStep: 'purchase_ask_catalog',
                        data: userData
                    };
                }
                if (answer.includes('whatsapp') || answer.includes('continuar') || answer === '2') {
                    // Prossegue para checagem de cidade
                    return {
                        response: '🏙️ Para continuarmos, me diga de qual cidade você está falando? (Assim garantimos o melhor atendimento para você!)',
                        newStep: 'purchase_ask_city',
                        data: userData
                    };
                }
                // Resposta padrão: apresenta opções
                return {
                    response: `Você já conhece nosso catálogo digital?\n\n*1*. Quero ver o catálogo online\n*2*. Continuar comprando pelo WhatsApp\n\nResponda *1* para catálogo ou *2* para WhatsApp.`,
                    newStep: 'purchase_ask_catalog',
                    data: userData
                };
            }
            case 'purchase_ask_city': {
                // Validação robusta: compara apenas com a cidade principal do .env
                function normalizeCity(str) {
                    return (str || '')
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[^a-z\p{L}\s]/gu, '')
                        .replace(/\s+/g, ' ')
                        .trim();
                }
                // Pega a cidade principal do .env (primeira, ignorando variações)
                const cityEnv = (process.env.CITY_ALLOWED || '').split(';')[0] || '';
                const cityEnvNorm = normalizeCity(cityEnv);
                let userCityNorm = '';
                if (message.type === 'chat' && typeof message.body === 'string') {
                    userCityNorm = normalizeCity(message.body);
                    userData.city = message.body?.trim();
                } else {
                    // Se não for mensagem de texto, pede para digitar a cidade
                    return {
                        response: '🏙️ Por favor, digite o nome da sua cidade para continuar.',
                        newStep: 'purchase_ask_city',
                        data: userData
                    };
                }

                // Aceita se for igual, substring, ou similaridade alta
                let isAllowed = false;
                if (userCityNorm === cityEnvNorm) {
                    isAllowed = true;
                } else if (userCityNorm.includes(cityEnvNorm) || cityEnvNorm.includes(userCityNorm)) {
                    isAllowed = true;
                } else {
                    // Similaridade: permite diferença de até 2 caracteres OU 80%+ de similaridade
                    function levenshtein(a, b) {
                        if (a === b) return 0;
                        if (!a.length) return b.length;
                        if (!b.length) return a.length;
                        const matrix = [];
                        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
                        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
                        for (let i = 1; i <= b.length; i++) {
                            for (let j = 1; j <= a.length; j++) {
                                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                                    matrix[i][j] = matrix[i - 1][j - 1];
                                } else {
                                    matrix[i][j] = Math.min(
                                        matrix[i - 1][j - 1] + 1, // substituição
                                        matrix[i][j - 1] + 1,     // inserção
                                        matrix[i - 1][j] + 1      // deleção
                                    );
                                }
                            }
                        }
                        return matrix[b.length][a.length];
                    }
                    const lev = levenshtein(userCityNorm, cityEnvNorm);
                    const maxLen = Math.max(userCityNorm.length, cityEnvNorm.length);
                    const similarity = 1 - lev / maxLen;
                    if (lev <= 2 || similarity >= 0.8) {
                        isAllowed = true;
                    }
                }
                if (!isAllowed) {
                    // Cidade não permitida: responde e envia links das lojas oficiais e Instagram
                    let linksMsg = '';
                    if (onlineStores.length) {
                        linksMsg += '\n\n🌐 Compre online em nossas lojas oficiais:\n';
                        onlineStores.forEach((url, idx) => {
                            linksMsg += `• Loja ${idx+1}: ${url}\n`;
                        });
                    }
                    linksMsg += `\n📸 Siga nosso Instagram: ${instagramUrl}`;
                    return {
                        response: `⚠️ A compra pelo WhatsApp é exclusiva para clientes da cidade de ${cityEnv}.\n${linksMsg}`,
                        newStep: 'start',
                        data: userData,
                        finalizeSession: true
                    };
                }
                // Prossegue para fluxo WhatsApp
                return {
                    response: '📝 Por favor, envie o *nome do produto* que deseja comprar:',
                    newStep: 'purchase_product_name_robust',
                    data: userData
                };
            }
            case 'purchase_choose_channel': {
                const answer = (message.body || '').toLowerCase();
                if (answer.includes('catalog')) {
                    return {
                        response: `🔗 Acesse nosso catálogo online: ${catalogUrl}\n\nQuando finalizar o pedido no site, clique em "Finalizar pelo WhatsApp" para retornar aqui.`,
                        newStep: 'awaiting_main_option',
                        data: userData
                    };
                }
                // Prossegue para fluxo WhatsApp
                return {
                    response: '📝 Por favor, envie o *nome do produto* que deseja comprar:',
                    newStep: 'purchase_product_name_robust',
                    data: userData
                };
            }
            case 'purchase_product_name_robust': {
                const productName = message.body?.trim();
                if (!productName || productName.length < 2) {
                    return {
                        response: '⚠️ Por favor, informe o *nome do produto* que deseja comprar:',
                        newStep: 'purchase_product_name_robust',
                        data: userData
                    };
                }
                userData.productName = productName;
                return {
                    response: '🔢 Quantas unidades desse produto você deseja comprar?',
                    newStep: 'purchase_quantity_robust',
                    data: userData
                };
            }
            case 'purchase_quantity_robust': {
                const qty = parseInt(message.body?.trim());
                if (isNaN(qty) || qty < 1) {
                    return {
                        response: '⚠️ Por favor, informe a *quantidade* desejada (apenas números):',
                        newStep: 'purchase_quantity_robust',
                        data: userData
                    };
                }
                userData.quantity = qty;
                return {
                    response: '❓ Tem alguma dúvida ou observação sobre o produto?\nSe não, responda "não".',
                    newStep: 'purchase_questions_robust',
                    data: userData
                };
            }
            case 'purchase_questions_robust': {
                const obs = message.body?.trim();
                userData.questions = (obs && (obs.toLowerCase() !== 'não' && obs.toLowerCase() !== 'nao')) ? obs : 'Nenhuma dúvida.';
                // Confirma resumo do pedido
                let resumo = `*Resumo do seu pedido:*\n• Produto: ${userData.productName}\n• Quantidade: ${userData.quantity}\n• Observação: ${userData.questions}`;
                userData._sendMedia = {
                    file: './media/order-summary.jpg',
                    caption: '📝 Aqui está um resumo visual do seu pedido! Confira se está tudo certinho. Qualquer ajuste, é só avisar 😉'
                };
                return {
                    response: resumo + '\n\nEstá tudo certo? (Responda "sim" para continuar ou "não" para refazer)',
                    newStep: 'purchase_confirm_order_robust',
                    data: userData
                };
            }
            case 'purchase_confirm_order_robust': {
                const answer = (message.body || '').toLowerCase();
                if (answer.includes('não') || answer.includes('nao')) {
                    return {
                        response: '🔄 Ok, vamos reiniciar o pedido.\n\nPor favor, envie o *nome do produto* que deseja comprar:',
                        newStep: 'purchase_product_name_robust',
                        data: {}
                    };
                }
                // Prossegue para dados pessoais
                return {
                    response: '👤 Para finalizar, envie seu *nome completo*:',
                    newStep: 'purchase_ask_name_robust',
                    data: userData
                };
            }
            case 'purchase_ask_name_robust': {
                const name = message.body?.trim();
                if (!name || name.split(' ').length < 2) {
                    return {
                        response: '⚠️ Por favor, informe seu *nome completo* (pelo menos duas palavras):',
                        newStep: 'purchase_ask_name_robust',
                        data: userData
                    };
                }
                userData.name = name;
                return {
                    response: '🏠 Agora, envie seu *endereço completo* com CEP:',
                    newStep: 'purchase_ask_address_robust',
                    data: userData
                };
            }
            case 'purchase_ask_address_robust': {
                const address = message.body?.trim();
                if (!address || address.length < 8) {
                    return {
                        response: '⚠️ Endereço inválido. Por favor, envie seu *endereço completo* com CEP:',
                        newStep: 'purchase_ask_address_robust',
                        data: userData
                    };
                }
                userData.address = address;
                return {
                    response: '💳 Qual forma de pagamento?\n\n*PIX* ou *Dinheiro*?',
                    newStep: 'purchase_ask_payment_robust',
                    data: userData
                };
            }
            case 'purchase_ask_payment_robust': {
                const answer = (message.body || '').toLowerCase();
                const pixKey = process.env.PIX_KEY || 'chave-pix-exemplo';
                if (answer.includes('pix')) {
                    userData.paymentMethod = 'PIX';
                    return {
                        response: `🔑 Chave PIX: *${pixKey}*\n\nDeseja já realizar o pagamento agora para agilizar?\n\n*1*. Sim, quero pagar agora (envie o comprovante em seguida)\n*2*. Prefiro pagar na hora de receber o produto`,
                        newStep: 'purchase_pix_choose_when',
                        data: userData
                    };
                } else if (answer.includes('dinheiro')) {
                    userData.paymentMethod = 'Dinheiro';
                    return {
                        response: '💵 Pagamento em dinheiro será feito na entrega.\n\nSeu pedido foi registrado! Aguarde a confirmação de um atendente.',
                        newStep: 'purchase_notify_attendant_robust',
                        data: userData
                    };
                } else {
                    return {
                        response: '⚠️ Forma de pagamento inválida. Responda *PIX* ou *Dinheiro*.',
                        newStep: 'purchase_ask_payment_robust',
                        data: userData
                    };
                }
            }

            case 'purchase_pix_choose_when': {
                const answer = (message.body || '').toLowerCase();
                const pixKey = process.env.PIX_KEY || 'chave-pix-exemplo';
                if (answer === '1' || answer.includes('sim') || answer.includes('agora')) {
                    return {
                        response: 'Ótimo! Por favor, envie o comprovante do pagamento PIX em imagem para prosseguirmos com a análise e liberação do pedido.',
                        newStep: 'purchase_awaiting_pix_proof_robust',
                        data: userData
                    };
                } else if (answer === '2' || answer.includes('hora') || answer.includes('receber') || answer.includes('entrega')) {
                    return {
                        response: `Sem problemas! Você pode pagar via PIX na hora que receber o produto.\n\nSe quiser agilizar, já deixo aqui a chave PIX: *${pixKey}*\n\nSeu pedido foi registrado e será preparado. Qualquer dúvida, estamos à disposição!`,
                        newStep: 'purchase_notify_attendant_robust',
                        data: userData
                    };
                } else {
                    return {
                        response: 'Por favor, responda *1* para pagar agora ou *2* para pagar na hora de receber.',
                        newStep: 'purchase_pix_choose_when',
                        data: userData
                    };
                }
            }
            case 'purchase_awaiting_pix_proof_robust': {
                if (message.hasMedia) {
                    try {
                        const media = await message.downloadMedia();
                        // Salva comprovante como arquivo local
                        const ext = media.mimetype.split('/')[1] || 'jpg';
                        const fileName = `pix-proof-${Date.now()}.${ext}`;
                        const filePath = path.join(UPLOAD_FOLDER, fileName);
                        fs.writeFileSync(filePath, media.data, { encoding: 'base64' });
                        userData.pixProofPath = filePath;
                        // OCR automático (Tesseract.js via node-tesseract-ocr)
                        let ocrResult = null;
                        try {
                            const tesseract = require('node-tesseract-ocr');
                            const ocrText = await tesseract.recognize(filePath, { lang: 'por' });
                            // Busca nome da empresa e valor
                            const nomeEmpresa = companyName.toLowerCase();
                            const nomeEncontrado = ocrText.toLowerCase().includes(nomeEmpresa);
                            const valorMatch = ocrText.match(/valor\s*:?.*?([\d.,]+)/i);
                            ocrResult = {
                                texto: ocrText,
                                nomeEmpresaEncontrado: nomeEncontrado,
                                valor: valorMatch ? valorMatch[1] : null,
                                status: nomeEncontrado ? 'ok' : 'empresa_nao_encontrada'
                            };
                        } catch (ocrErr) {
                            ocrResult = { status: 'erro', erro: ocrErr.message };
                        }
                        userData.ocrResult = ocrResult;
                        // Notifica atendente
                        if (attendantsGroupId && globalThis.client) {
                            let msg = `🆕 *Novo comprovante PIX aguardando validação!*\n`;
                            msg += `• Cliente: ${userData.name || '-'}\n`;
                            msg += `• Endereço: ${userData.address || '-'}\n`;
                            if (ocrResult && ocrResult.valor) {
                                msg += `• Valor detectado: R$ ${ocrResult.valor}\n`;
                            }
                            msg += `• Empresa detectada: ${ocrResult && ocrResult.nomeEmpresaEncontrado ? 'Sim' : 'Não'}\n`;
                            msg += `• Data: ${(new Date()).toLocaleString('pt-BR')}\n`;
                            await globalThis.client.sendMessage(attendantsGroupId, msg);
                            const mediaMsg = MessageMedia.fromFilePath(filePath);
                            await globalThis.client.sendMessage(attendantsGroupId, mediaMsg, { caption: `Comprovante PIX` });
                        }
                    } catch (err) {
                        return {
                            response: '❌ Erro ao processar comprovante. Tente novamente ou envie outra imagem.',
                            newStep: 'purchase_awaiting_pix_proof_robust',
                            data: userData
                        };
                    }
                    // Validação OCR
                    if (!userData.ocrResult || userData.ocrResult.status !== 'ok') {
                        return {
                            response: '⚠️ Não foi possível validar o comprovante automaticamente. Um atendente irá revisar manualmente. Aguarde a confirmação.',
                            newStep: 'purchase_notify_attendant_robust',
                            data: userData
                        };
                    }
                    return {
                        response: '🔎 Comprovante recebido e validado! Aguarde a confirmação de um atendente.',
                        newStep: 'purchase_notify_attendant_robust',
                        data: userData
                    };
                } else {
                    return {
                        response: '⚠️ Por favor, envie o *comprovante do pagamento PIX* como imagem.',
                        newStep: 'purchase_awaiting_pix_proof_robust',
                        data: userData
                    };
                }
            }
            case 'purchase_notify_attendant_robust': {
                userData._sendMedia = {
                    file: './media/order-confirmed.jpg',
                    caption: '🎉 Pedido recebido com sucesso! Agora é só aguardar a confirmação. Obrigado por confiar na Inaugura Lar! 💙'
                };
                userData._sendFeedback = true;
                return {
                    response: '✅ Seu pedido está em análise com nossa equipe. Assim que o pagamento for validado, você receberá uma confirmação e o envio será iniciado. Se precisar de qualquer coisa, digite "atendente". Muito obrigado por comprar conosco! 🙏',
                    newStep: 'start',
                    data: userData,
                    finalizeSession: true
                };
            }
            default:
                return {
                    response: '❌ Fluxo de compra não reconhecido. Digite "menu" para voltar ao início.',
                    newStep: 'start',
                    data: userData
                };
        }
    }
    
    static async processMessage(message, userState) {
        const messageBody = message.body?.toLowerCase()?.trim() || '';
        const normalizedBody = this.normalizeText(messageBody);
        const currentStep = userState?.step || 'start';

        // NOVO: Se for áudio, faz transcrição e análise, mas só se NÃO estiver em atendimento humano
        if (message.hasMedia && message.type === 'audio' && currentStep !== 'in_human_chat') {
            return await this.handleAudioMessage(message, userState);
        }

        // NOVO: Detecta payload do catálogo web
        if (messageBody.startsWith('pedido via site:')) {
            // Extrai detalhes do pedido
            const pedidoDetalhes = message.body.substring('pedido via site:'.length).trim();
            let orderId = null;
            // Salva no banco de dados se possível
            if (typeof dbManager?.createOrderFromCatalog === 'function') {
                try {
                    // Cria pedido no banco: chatId, payload, status, data/hora
                    const order = await dbManager.createOrderFromCatalog({
                        chatId: message.from,
                        payload: pedidoDetalhes,
                        status: 'aguardando_dados_cliente',
                        createdAt: new Date()
                    });
                    orderId = order?.id || null;
                } catch (err) {
                    console.error('Erro ao criar pedido no banco:', err.message);
                }
            }
            return {
                response: '🛒 Recebemos seu pedido do site! Para finalizar, por favor informe seu *nome completo*:',
                newStep: 'purchase_catalog_awaiting_name',
                data: {
                    ...userState?.data,
                    catalogOrderPayload: pedidoDetalhes,
                    orderId: orderId
                }
            };
        }

        // Encaminha para o novo fluxo se for compra via catálogo
        if (currentStep && currentStep.startsWith('purchase_catalog_')) {
            const result = await this.handlePurchaseCatalog(message, userState);
            // Envia mídia se necessário
            if (globalThis.client && result?.data) {
                const userData = result.data;
                if (userData && userData._sendMedia && userData._sendMedia.file) {
                    try {
                        const { MessageMedia } = require('whatsapp-web.js');
                        const fs = require('fs');
                        if (fs.existsSync(userData._sendMedia.file)) {
                            const media = MessageMedia.fromFilePath(userData._sendMedia.file);
                            await globalThis.client.sendMessage(message.from, media, { caption: userData._sendMedia.caption || '' });
                        }
                    } catch (err) {
                        console.error('Erro ao enviar mídia:', err.message);
                    }
                }
            }
            // Feedback instantâneo após finalização
            if (globalThis.client && result?.finalizeSession && result?.newStep === 'start') {
                await askSatisfactionFeedback(globalThis.client, message.from, 'compra finalizada');
            }
            return result;
        }

        console.log(`🔄 Processando fluxo - Usuário: ${message.from}, Passo: ${currentStep}, Mensagem: "${messageBody}"`);
        
        switch (currentStep) {
            // Submenu de dúvidas
            case 'faq_menu': {
                const answer = (message.body || '').trim();
                const answerLower = answer.toLowerCase();
                const env = process.env;
                // Se o usuário digitar "menu" ou "voltar", retorna ao menu principal
                if (['menu', 'voltar'].includes(answerLower)) {
                    return await this.handleMainMenu(message, userState, answerLower);
                }
                // Se o usuário digitar um número de 1 a 6, responde a dúvida correspondente
                switch (answer) {
                    case '1': {
                        const horario = env.BUSINESS_HOURS || 'Seg a Sex: 08:00 às 18:00\nSábado: 08:00 às 12:00\nDomingo: Fechado';
                        const dias = env.BUSINESS_DAYS || 'Segunda a Sábado';
                        return {
                            response: `🕒 *Horário e Dias de Funcionamento*\n\n${horario}\n${dias}\n\nDigite *menu* para voltar ao menu principal ou escolha outra dúvida (1-6).`,
                            newStep: 'faq_menu',
                            data: userState.data
                        };
                    }
                    case '2': {
                        const endereco = env.STORE_ADDRESS || 'Endereço não cadastrado.';
                        const latitude = env.STORE_LATITUDE;
                        const longitude = env.STORE_LONGITUDE;
                        let response = `🏪 *Endereço da Loja*\n\n${endereco}`;
                        if (latitude && longitude) {
                            response += `\n\n📍 Localização: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                        }
                        return {
                            response: response + '\n\nDigite *menu* para voltar ao menu principal ou escolha outra dúvida (1-6).',
                            newStep: 'faq_menu',
                            data: userState.data
                        };
                    }
                    case '3': {
                        const presencial = env.PAYMENT_PRESENCIAL || 'PIX, Cartão de Crédito/Débito, Dinheiro';
                        const online = env.PAYMENT_ONLINE || 'PIX, Cartão (conforme plataforma), Mercado Pago';
                        return {
                            response: `💳 *Formas de Pagamento*\n\n• *Presencial:* ${presencial}\n• *Online:* ${online}\n\nDigite *menu* para voltar ao menu principal ou escolha outra dúvida (1-6).`,
                            newStep: 'faq_menu',
                            data: userState.data
                        };
                    }
                    case '4': {
                        const entrega = env.DELIVERY_INFO || 'Entregamos em toda a cidade e região. Prazo médio: 1 a 3 dias úteis após confirmação do pagamento.';
                        return {
                            response: `🚚 *Entregas e Prazos*\n\n${entrega}\n\nDigite *menu* para voltar ao menu principal ou escolha outra dúvida (1-6).`,
                            newStep: 'faq_menu',
                            data: userState.data
                        };
                    }
                    case '5': {
                        const trocas = env.EXCHANGE_POLICY || 'Aceitamos trocas e devoluções em até 7 dias após o recebimento, conforme o CDC. Fale com um atendente para iniciar o processo.';
                        return {
                            response: `🔄 *Trocas e Devoluções*\n\n${trocas}\n\nDigite *menu* para voltar ao menu principal ou escolha outra dúvida (1-6).`,
                            newStep: 'faq_menu',
                            data: userState.data
                        };
                    }
                    case '6': {
                        const contato = env.CONTACT_INFO || 'Telefone/WhatsApp: (00) 00000-0000\nEmail: contato@empresa.com';
                        return {
                            response: `📞 *Outros Assuntos*\n\nEntre em contato conosco:\n${contato}\n\nDigite *menu* para voltar ao menu principal ou escolha outra dúvida (1-6).`,
                            newStep: 'faq_menu',
                            data: userState.data
                        };
                    }
                    default:
                        return {
                            response: '❓ Opção inválida. Por favor, escolha uma das dúvidas do menu (1-6) ou digite *menu* para voltar ao menu principal.',
                            newStep: 'faq_menu',
                            data: userState.data
                        };
                }
            }
// Novo: fluxo para pedido vindo do catálogo web
}

// Função estática fora da classe devido a erro de sintaxe
ConversationFlow.handlePurchaseCatalog = async function(message, userState) {
    const step = userState.step;
    const userData = userState.data || {};
    switch (step) {
        case 'purchase_catalog_awaiting_name': {
            const name = message.body?.trim();
            if (!name || name.split(' ').length < 2) {
                return {
                    response: '⚠️ Por favor, informe seu *nome completo* (pelo menos duas palavras):',
                    newStep: 'purchase_catalog_awaiting_name',
                    data: userData
                };
            }
            userData.name = name;
            // Atualiza no banco se possível
            if (userData.orderId && typeof dbManager?.updateOrderCustomerData === 'function') {
                try {
                    await dbManager.updateOrderCustomerData(userData.orderId, { name, address: userData.address || null });
                } catch (err) {
                    console.error('Erro ao atualizar nome do cliente no pedido:', err.message);
                }
            }
            return {
                response: '🏠 Agora, por favor envie seu *endereço completo* com CEP:',
                newStep: 'purchase_catalog_awaiting_address',
                data: userData
            };
        }
        case 'purchase_catalog_awaiting_address': {
            const address = message.body?.trim();
            if (!address || address.length < 8) {
                return {
                    response: '⚠️ Endereço inválido. Por favor, envie seu *endereço completo* com CEP:',
                    newStep: 'purchase_catalog_awaiting_address',
                    data: userData
                };
            }
            userData.address = address;
            // Atualiza no banco se possível
            if (userData.orderId && typeof dbManager?.updateOrderCustomerData === 'function') {
                try {
                    await dbManager.updateOrderCustomerData(userData.orderId, { name: userData.name || null, address });
                } catch (err) {
                    console.error('Erro ao atualizar endereço do cliente no pedido:', err.message);
                }
            }
            // Validação de endereço via API de geolocalização (exemplo Google Maps)
            let geoStatus = 'não validado';
            let geoData = null;
            try {
                if (process.env.GOOGLE_MAPS_API_KEY) {
                    const mapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
                    const geoResp = await axios.get(mapsUrl);
                    if (geoResp.data.status === 'OK' && geoResp.data.results.length > 0) {
                        geoStatus = 'validado';
                        geoData = geoResp.data.results[0];
                        userData.geoLocation = geoData.geometry.location;
                        userData.geoAddress = geoData.formatted_address;
                    } else {
                        geoStatus = 'não encontrado';
                    }
                }
            } catch (geoErr) {
                console.error('Erro na validação de endereço Maps:', geoErr.message);
                geoStatus = 'erro';
            }
            userData.geoStatus = geoStatus;
            // Mensagem de feedback
            let addressMsg = '✅ Endereço recebido!';
            if (geoStatus === 'validado') {
                addressMsg += `\n\n📍 Endereço validado: ${userData.geoAddress}`;
            } else if (geoStatus === 'não encontrado') {
                addressMsg += '\n\n⚠️ Não foi possível validar o endereço automaticamente. Confira se está correto.';
            } else if (geoStatus === 'erro') {
                addressMsg += '\n\n⚠️ Erro ao validar endereço. Será revisado manualmente.';
            }
            return {
                response: addressMsg + '\n\nEm breve enviaremos as instruções de pagamento PIX.',
                newStep: 'purchase_catalog_awaiting_pix',
                data: userData
            };
        }
        case 'purchase_catalog_awaiting_pix': {
            // Aqui você pode enviar a chave PIX e pedir comprovante
            return {
                response: '💳 Para finalizar, envie o comprovante do pagamento PIX para esta chave: *' + (process.env.PIX_KEY || 'chave-pix-exemplo') + '*',
                newStep: 'purchase_catalog_awaiting_proof',
                data: userData
            };
        }
        case 'purchase_catalog_awaiting_proof': {
            if (message.hasMedia) {
                try {
                    const media = await message.downloadMedia();
                    if (media && userData.orderId && typeof dbManager?.updateOrderPaymentProof === 'function') {
                        // Salva comprovante como arquivo local
                        const ext = media.mimetype.split('/')[1] || 'jpg';
                        const fileName = `pix-proof-${userData.orderId}-${Date.now()}.${ext}`;
                        const filePath = path.join(UPLOAD_FOLDER, fileName);
                        fs.writeFileSync(filePath, media.data, { encoding: 'base64' });
                        // Atualiza no banco: comprovante (caminho), status aguardando validação
                        await dbManager.updateOrderPaymentProof(userData.orderId, {
                            proofPath: filePath,
                            status: 'aguardando_validacao',
                            receivedAt: new Date()
                        });
                        userData.pixProofPath = filePath;
                        userData.paymentStatus = 'aguardando_validacao';
                        // OCR automático (Tesseract.js via node-tesseract-ocr)
                        let ocrResult = null;
                        try {
                            const tesseract = require('node-tesseract-ocr');
                            const ocrText = await tesseract.recognize(filePath, { lang: 'por' });
                            // Regex simples para valor e chave PIX
                            const valorMatch = ocrText.match(/valor\s*:?\s*R?\$?\s*([\d.,]+)/i);
                            const chaveMatch = ocrText.match(/chave\s*:?\s*([\w@.\-]+)/i);
                            ocrResult = {
                                texto: ocrText,
                                valor: valorMatch ? valorMatch[1] : null,
                                chave: chaveMatch ? chaveMatch[1] : null,
                                status: 'ok'
                            };
                        } catch (ocrErr) {
                            console.error('Erro no OCR do comprovante:', ocrErr.message);
                            ocrResult = { status: 'erro', erro: ocrErr.message };
                        }
                        userData.ocrResult = ocrResult;
                        // Notificação interna para atendentes (exemplo: grupo WhatsApp ou webhook)
                        try {
                            // Enviar mensagem para grupo de atendentes (ID via env)
                            if (process.env.ATTENDANTS_GROUP_ID && globalThis.client) {
                                const groupId = process.env.ATTENDANTS_GROUP_ID;
                                let msg = `🆕 *Novo comprovante PIX aguardando validação!*\n`;
                                msg += `• Pedido: ${userData.orderId}\n`;
                                msg += `• Cliente: ${userData.name || '-'}\n`;
                                msg += `• Endereço: ${userData.address || '-'}\n`;
                                if (userData.ocrResult && userData.ocrResult.valor) {
                                    msg += `• Valor detectado: R$ ${userData.ocrResult.valor}\n`;
                                }
                                if (userData.ocrResult && userData.ocrResult.chave) {
                                    msg += `• Chave PIX detectada: ${userData.ocrResult.chave}\n`;
                                }
                                msg += `• Data: ${(new Date()).toLocaleString('pt-BR')}\n`;
                                await globalThis.client.sendMessage(groupId, msg);
                                // Envia imagem do comprovante
                                const mediaMsg = MessageMedia.fromFilePath(filePath);
                                await globalThis.client.sendMessage(groupId, mediaMsg, { caption: `Comprovante PIX pedido ${userData.orderId}` });
                            }
                            // Webhook opcional para sistemas externos
                            if (process.env.PIX_WEBHOOK_URL) {
                                await axios.post(process.env.PIX_WEBHOOK_URL, {
                                    orderId: userData.orderId,
                                    name: userData.name,
                                    address: userData.address,
                                    pixProofPath: userData.pixProofPath,
                                    ocrResult: userData.ocrResult,
                                    createdAt: new Date(),
                                });
                            }
                        } catch (notifyErr) {
                            console.error('Erro ao notificar atendentes:', notifyErr.message);
                        }
                    }
                } catch (err) {
                    console.error('Erro ao salvar comprovante PIX:', err.message);
                }
                return {
                    response: '🔎 Comprovante recebido! Aguarde a validação. Em breve um atendente irá te chamar. Obrigado pela compra!',
                    newStep: 'purchase_catalog_done',
                    data: userData
                };
            } else {
                return {
                    response: '⚠️ Por favor, envie o *comprovante do pagamento PIX* como imagem.',
                    newStep: 'purchase_catalog_awaiting_proof',
                    data: userData
                };
            }
        }
        case 'purchase_catalog_done': {
            // Aqui pode ser implementada lógica de pós-venda, acompanhamento, etc.
            return {
                response: '✅ Seu pedido está em análise. Assim que o pagamento for validado, você receberá uma confirmação e o envio será iniciado. Se precisar de atendimento, digite "atendente".',
                newStep: 'start',
                data: userData,
                finalizeSession: true
            };
        }
        default:
            return {
                response: '❌ Fluxo de compra via site não reconhecido. Digite "menu" para voltar ao início.',
                newStep: 'start',
                data: userData
            };
    }
};
// ...existing code...

// =========================
// 🔄 PROCESSAMENTO DE MENSAGENS COM CONTROLE DE PAUSA
// =========================

// Exemplo de integração no ponto de entrada das mensagens:
// (Adapte para o seu listener real, ex: client.on('message', ...))

// Exemplo:
// client.on('message', async (message) => {
//     if (await shouldIgnoreMessage(message)) return;
//     // ...processamento normal...
// });

// Se já existir um listener, adicione o filtro shouldIgnoreMessage antes do processamento normal.
        switch (currentStep) {
            case 'start':
                return this.handleStart(message);
            case 'awaiting_name':
                return this.handleName(message, userState);
            case 'awaiting_main_option':
                return this.handleMainMenu(message, userState, normalizedBody);
            // Novo fluxo robusto de compra
            case 'purchase_ask_catalog':
            case 'purchase_ask_city':
            case 'purchase_choose_channel':
            case 'purchase_product_name_robust':
            case 'purchase_quantity_robust':
            case 'purchase_questions_robust':
            case 'purchase_confirm_order_robust':
            case 'purchase_ask_name_robust':
            case 'purchase_ask_address_robust':
            case 'purchase_ask_payment_robust':
            case 'purchase_awaiting_pix_proof_robust':
            case 'purchase_notify_attendant_robust': {
                const result = await this.handlePurchaseRobust(message, userState);
                // Envia mídia se necessário
                if (globalThis.client && result?.data) {
                    const userData = result.data;
                    if (userData && userData._sendMedia && userData._sendMedia.file) {
                        try {
                            const { MessageMedia } = require('whatsapp-web.js');
                            const fs = require('fs');
                            if (fs.existsSync(userData._sendMedia.file)) {
                                const media = MessageMedia.fromFilePath(userData._sendMedia.file);
                                await globalThis.client.sendMessage(message.from, media, { caption: userData._sendMedia.caption || '' });
                            }
                        } catch (err) {
                            console.error('Erro ao enviar mídia:', err.message);
                        }
                    }
                }
                // Feedback instantâneo após finalização
                if (globalThis.client && result?.finalizeSession && result?.newStep === 'start') {
                    await globalThis.client.sendMessage(message.from, '🙏 Como foi sua experiência até aqui?\nResponda com um número de 1 a 5 (sendo 5 = excelente).');
                }
                return result;
            }
            // Fluxo antigo de compra
            case 'product_issue_nf':
            case 'product_issue_photo':
            case 'product_issue_box_photo':
            case 'product_issue_label_photo':
            case 'product_issue_address':
            case 'product_issue_comments':
                return this.handleProductIssue(message, userState);
            case 'purchase_product_name':
            case 'purchase_product_link':
            case 'purchase_product_photo':
            case 'purchase_quantity':
            case 'purchase_questions':
                return await this.handlePurchase(message, userState);
            case 'awaiting_satisfaction_rating':
            case 'awaiting_satisfaction_feedback':
                return this.handleSatisfaction(message, userState);
            case 'transfer_to_human':
                return this.handleHumanTransfer(message, userState);
            case 'in_human_chat': {
                // Usuário está em chat ativo com atendente
                return {
                    response: '💬 Sua mensagem foi encaminhada para o atendente.',
                    newStep: 'in_human_chat',
                    data: userState.data,
                    forwardToAttendant: true
                };
            }
            default:
                return this.handleStart(message);
        }
    }
    
    static normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .trim();
    }
    
    static handleStart(message) {
        const messageBody = this.normalizeText(message.body);
        
        // Se usuário disse "oi", reiniciar conversa
        if (messageBody === 'oi' || messageBody === 'ola' || messageBody === 'inicio' || messageBody === 'Reinciar') {
            return {
                response: '🏠 *Inaugura Lar - Atendimento Especializado* 🏠\n\nOlá! 👋 Seja bem-vindo(a) ao nosso canal de atendimento. Estamos aqui para resolver seu problema com agilidade e qualidade.\n\nPara iniciarmos o atendimento personalizado, por favor informe:\n\n*Nome completo:*',
                newStep: 'awaiting_name',
                data: {}
            };
        }
        
        // Primeira mensagem
        return {
            response: '🏠 *Inaugura Lar - Atendimento Especializado* 🏠\n\nOlá! 👋 Seja bem-vindo(a) ao nosso canal de atendimento. Estamos aqui para resolver seu problema com agilidade e qualidade.\n\nPara iniciarmos o atendimento personalizado, por favor informe:\n\n*Nome completo:*',
                newStep: 'awaiting_name',
                data: {}
        };
    }
    
    static handleName(message, userState) {
        const messageBody = message.body?.trim() || '';
        const nameParts = messageBody.split(' ').filter(part => part.length > 0);
        
        // Validar nome (pelo menos duas palavras)
        if (nameParts.length < 2) {
            return {
                response: '⚠️ Por favor, informe seu *nome completo* (pelo menos duas palavras) para prosseguirmos.',
                newStep: 'awaiting_name',
                data: userState?.data || {}
            };
        }
        
        // Nome válido
        const firstName = nameParts[0];
        const fullName = messageBody;
        
        return {
            response: `👋 Olá, *${firstName}*!\n\nComo podemos ajudar você hoje?\n\n*1*. 🛠️ Problema com produto\n*2*. 📄 Nota Fiscal\n*3*. 💳 Fazer uma compra\n*4*. ❓ Dúvidas Frequentes\n\nResponda com o *número* ou *palavra-chave* da opção desejada.`,
            newStep: 'awaiting_main_option',
            data: {
                ...(userState?.data || {}),
                name: fullName,
                firstName: firstName
            }
        };
    }
    
    static handleMainMenu(message, userState, normalizedBody) {
        // Novo fluxo robusto de compra via WhatsApp
        const keywordMapping = {
            '1': 'product_issue',
            'problema': 'product_issue',
            'defeito': 'product_issue',
            'quebrado': 'product_issue',
            'suporte': 'product_issue',
            '2': 'invoice',
            'nota fiscal': 'invoice',
            'nota': 'invoice',
            'fatura': 'invoice',
            'nf': 'invoice',
            '3': 'purchase',
            'compra': 'purchase',
            'comprar': 'purchase',
            'fazer uma compra': 'purchase',
            '4': 'faq',
            'duvida': 'faq',
            'dúvida': 'faq',
            'duvidas': 'faq',
            'dúvidas': 'faq',
            'faq': 'faq',
            'pergunta': 'faq',
            'perguntas': 'faq',
            'atendente': 'support',
            'humano': 'support',
            'pessoa': 'support',
            'falar': 'support'
        };
        const action = keywordMapping[normalizedBody] || keywordMapping[normalizedBody.split(' ')[0]];
        if (action === 'purchase') {
            // Corrigido: primeiro pergunta sobre catálogo ou WhatsApp
            return {
                response: `Você já conhece nosso catálogo digital?\n\n*1*. Quero ver o catálogo online\n*2*. Continuar comprando pelo WhatsApp\n\nResponda *1* para catálogo ou *2* para WhatsApp.`,
                newStep: 'purchase_ask_catalog',
                data: {
                    ...userState.data,
                    flowType: 'purchase_robust'
                }
            };
        }
        if (action === 'faq') {
            return {
                response: '❓ *Dúvidas Frequentes*\n\nComo posso te ajudar? Escolha uma opção:\n\n*1*. 🕒 Horário e dias de funcionamento\n*2*. 📍 Onde fica a loja?\n*3*. 💳 Formas de pagamento\n*4*. 🚚 Entregas e prazos\n*5*. 🔄 Trocas e devoluções\n*6*. 📞 Outros assuntos\n\nResponda com o número da dúvida!',
                newStep: 'faq_menu',
                data: userState.data
            };
        }
        if (action === 'product_issue') {
            return {
                response: '📋 *Registro de Problema com Produto*\n\nPara agilizar seu atendimento, por favor envie:\n\n1️⃣ *Nota fiscal ou número do pedido*\n(Você pode enviar uma foto da nota fiscal ou apenas digitar o número).',
                newStep: 'product_issue_nf',
                data: {
                    ...userState.data,
                    flowType: 'product_issue'
                }
            };
        }
        if (action === 'invoice') {
            return {
                response: "🧾 A funcionalidade de 'Nota Fiscal' está em desenvolvimento. Por favor, escolha outra opção.\n\n*1*. 🛠️ Problema com produto\n*2*. 🧾 Nota Fiscal\n*3*. 💳 Fazer uma compra\n*4*. ❓ Dúvidas Frequentes",
                newStep: 'awaiting_main_option',
                data: userState.data
            };
        }
        if (action === 'support') {
            const queuePosition = Math.floor(Math.random() * 5) + 1;
            return {
                response: `👨‍💼 *Solicitação de Atendimento*\n\nSua solicitação foi registrada com sucesso!\n\n⏳ *Todos os nossos atendentes estão ocupados no momento.*\nVocê foi adicionado à fila de atendimento. Posição: *${queuePosition}*.\n\nAguarde, em breve um atendente estará com você!`,
                newStep: 'transfer_to_human',
                data: {
                    ...userState.data,
                    queuePosition: queuePosition,
                    flowType: 'human_support'
                }
            };
        }
        // Default: opção inválida
        return {
            response: `❌ Opção inválida. Por favor, escolha uma das opções do menu:\n\n*1*. 🛠️ Problema com produto\n*2*. 🧾 Nota Fiscal\n*3*. 💳 Fazer uma compra\n*4*. ❓ Dúvidas Frequentes\n\nResponda com o *número* ou *palavra-chave* da opção desejada.`,
            newStep: 'awaiting_main_option',
            data: userState.data
        };
    }

    // Novo: escolha do modo de compra
    static async handleCartChooseMode(message, userState) {
        const answer = (message.body || '').trim();
        if (answer === '1' || answer.toLowerCase().includes('carrinho')) {
            return {
                response: 'Ótimo! Vamos montar seu carrinho. Digite "adicionar" para começar a incluir produtos, "ver carrinho" para visualizar, "finalizar" para concluir ou "cancelar" para sair.',
                newStep: 'cart_add_product',
                data: { ...userState.data, cart: [] }
            };
        }
        if (answer === '2' || answer.toLowerCase().includes('rápida') || answer.toLowerCase().includes('rapida')) {
            // Segue para fluxo tradicional
            return await this.handlePurchaseRobust(message, userState);
        }
        return {
            response: 'Por favor, responda *1* para carrinho multi-produto ou *2* para compra rápida.',
            newStep: 'cart_choose_mode',
            data: userState.data
        };
    }
        // (bloco duplicado removido)
    static handleFaqMenu(message, userState) {
        const answerRaw = (message.body || '').trim();
        const answer = answerRaw.toLowerCase();
        const env = process.env;
        // Aceita variações de "menu" e "voltar" para retornar ao menu principal
        if (["menu", "voltar", "início", "inicio", "principal", "volta", "home"].includes(answer)) {
            return {
                response: '🏠 *Inaugura Lar - Atendimento Especializado* 🏠\n\nOlá! Como podemos ajudar você hoje?\n\n*1*. 🛠️ Problema com produto\n*2*. 📄 Nota Fiscal\n*3*. 💳 Fazer uma compra\n*4*. ❓ Dúvidas Frequentes\n\nResponda com o *número* ou *palavra-chave* da opção desejada.',
                newStep: 'awaiting_main_option',
                data: userState.data
            };
        }
        // Se for número válido de FAQ, responde normalmente
        if (["1","2","3","4","5","6"].includes(answer)) {
            let response = '';
            switch (answer) {
                case '1': {
                    const horario = env.BUSINESS_HOURS || 'Seg a Sex: 08:00 às 18:00\nSábado: 08:00 às 12:00\nDomingo: Fechado';
                    const dias = env.BUSINESS_DAYS || 'Segunda a Sábado';
                    response = `🕒 *Horário e Dias de Funcionamento*\n\n${horario}\n${dias}`;
                    break;
                }
                case '2': {
                    const endereco = env.STORE_ADDRESS || 'Endereço não cadastrado.';
                    const latitude = env.STORE_LATITUDE;
                    const longitude = env.STORE_LONGITUDE;
                    response = `📍 *Endereço da Loja*\n\n${endereco}`;
                    if (latitude && longitude && globalThis.client) {
                        globalThis.client.sendMessage(message.from, '', { location: { latitude: Number(latitude), longitude: Number(longitude), name: endereco } });
                        response += '\n\nA localização foi enviada no mapa acima!';
                    }
                    break;
                }
                case '3': {
                    const presencial = env.PAYMENT_PRESENCIAL || 'PIX, Cartão de Crédito/Débito, Dinheiro';
                    const online = env.PAYMENT_ONLINE || 'PIX, Cartão (conforme plataforma), Mercado Pago';
                    response = `💳 *Formas de Pagamento*\n\n• *Presencial:* ${presencial}\n• *Online:* ${online}`;
                    break;
                }
                case '4': {
                    const entrega = env.DELIVERY_INFO || 'Entregamos em toda a cidade e região. Prazo médio: 1 a 3 dias úteis após confirmação do pagamento.';
                    response = `🚚 *Entregas e Prazos*\n\n${entrega}`;
                    break;
                }
                case '5': {
                    const trocas = env.EXCHANGE_POLICY || 'Aceitamos trocas e devoluções em até 7 dias após o recebimento, conforme o CDC. Fale com um atendente para iniciar o processo.';
                    response = `🔄 *Trocas e Devoluções*\n\n${trocas}`;
                    break;
                }
                case '6': {
                    const contato = env.CONTACT_INFO || 'Telefone/WhatsApp: (00) 00000-0000\nEmail: contato@empresa.com';
                    response = `📞 *Outros Assuntos*\n\nEntre em contato conosco:\n${contato}`;
                    break;
                }
            }
            // Sempre sugere voltar ao menu principal ou escolher outra dúvida
            response += '\n\nDigite o número da dúvida, ou *menu* para voltar ao menu principal.';
            return {
                response,
                newStep: 'faq_menu',
                data: userState.data
            };
        }
        // Se não reconhecido, instrui corretamente
        return {
            response: '❓ Opção inválida. Por favor, escolha uma das dúvidas do menu (1 a 6) ou digite *menu* para voltar ao menu principal.',
            newStep: 'faq_menu',
            data: userState.data
        };
    }

    static async handlePurchase(message, userState) {
        const step = userState.step;
        const userData = userState.data || {};
        switch (step) {
            case 'purchase_product_name': {
                const productName = message.body?.trim();
                if (!productName || productName.length < 2) {
                    return {
                        response: '⚠️ Por favor, informe o *nome do produto* que deseja comprar:',
                        newStep: 'purchase_product_name',
                        data: userData
                    };
                }
                userData.productName = productName;
                return {
                    response: '🔗 Se você tiver o *link do produto* do *Mercado Livre*, envie agora.\n\n🏪 *NOSSA LOJA OFICIAL:*\nhttps://www.mercadolivre.com.br/loja/inaugura-lar\n\n📝 *Exemplos de links válidos:*\n• https://produto.mercadolivre.com.br/MLB-xxxxxxx-...\n• https://www.mercadolivre.com.br/produto/p/MLBxxxxxxx\n\n⚠️ Se não tiver o link, responda *"não"* para pular.',
                    newStep: 'purchase_product_link',
                    data: userData
                };
            }
            case 'purchase_product_link': {
                const link = message.body?.trim();
                if (link && (link.toLowerCase() === 'não' || link.toLowerCase() === 'nao')) {
                    userData.productLink = '';
                    return {
                        response: '📸 Por favor, envie uma *foto do produto* que deseja comprar.\n\nSe não tiver foto, responda "não".',
                        newStep: 'purchase_product_photo',
                        data: userData
                    };
                }
                if (link && !/^https?:\/\//.test(link)) {
                    return {
                        response: '⚠️ O link informado não parece válido. Se não tiver o link, responda "não".\n\nSe tiver, envie o link completo (começando com http).',
                        newStep: 'purchase_product_link',
                        data: userData
                    };
                }
                if (link && /^https?:\/\//.test(link)) {
                    try {
                        const validation = await validateMercadoLivreLink(link);
                        if (!validation.isValid) {
                            return {
                                response: validation.message,
                                newStep: 'purchase_product_link',
                                data: userData
                            };
                        }
                        userData.productLink = link;
                        userData.linkValidation = validation.reason;
                        userData.verificationMethod = validation.verificationMethod;
                        let responseMessage = validation.message;
                        if (!validation.warning) {
                            responseMessage = '✅ Link validado com sucesso!\n\n🔢 Quantas unidades desse produto você deseja comprar?';
                        }
                        return {
                            response: responseMessage,
                            newStep: 'purchase_quantity',
                            data: userData
                        };
                    } catch (error) {
                        console.error('❌ Erro na validação assíncrona:', error.message);
                        userData.productLink = link;
                        userData.linkValidation = 'validation_error';
                        userData.verificationError = error.message;
                        return {
                            response: '⚠️ Erro na verificação automática do link, mas foi aceito.\n\nNosso atendente irá confirmar se é da loja oficial.\n\n🔢 Quantas unidades desse produto você deseja comprar?',
                            newStep: 'purchase_quantity',
                            data: userData
                        };
                    }
                }
                return {
                    response: '⚠️ Por favor, envie o *link do produto* da nossa loja do Mercado Livre ou responda "não" para pular.\n\n🏪 *NOSSA LOJA:* https://www.mercadolivre.com.br/loja/inaugura-lar',
                    newStep: 'purchase_product_link',
                    data: userData
                };
            }
            case 'purchase_product_photo': {
                if (message.hasMedia) {
                    userData.productPhoto = `Foto produto compra - ${message.id._serialized}`;
                    return {
                        response: '🔢 Quantas unidades desse produto você deseja comprar?',
                        newStep: 'purchase_quantity',
                        data: userData
                    };
                } else if (message.body && (message.body.trim().toLowerCase() === 'não' || message.body.trim().toLowerCase() === 'nao')) {
                    userData.productPhoto = '';
                    return {
                        response: '🔢 Quantas unidades desse produto você deseja comprar?',
                        newStep: 'purchase_quantity',
                        data: userData
                    };
                } else {
                    return {
                        response: '⚠️ Por favor, envie uma *foto do produto* ou responda "não" para pular.',
                        newStep: 'purchase_product_photo',
                        data: userData
                    };
                }
            }
            case 'purchase_quantity': {
                const qty = parseInt(message.body?.trim());
                if (isNaN(qty) || qty < 1) {
                    return {
                        response: '⚠️ Por favor, informe a *quantidade* desejada (apenas números):',
                        newStep: 'purchase_quantity',
                        data: userData
                    };
                }
                userData.quantity = qty;
                return {
                    response: '❓ Tem alguma dúvida ou observação sobre o produto?\n\nSe sim, escreva agora. Se não, responda "não".',
                    newStep: 'purchase_questions',
                    data: userData
                };
            }
            case 'purchase_questions': {
                const obs = message.body?.trim();
                userData.questions = (obs && (obs.toLowerCase() !== 'não' && obs.toLowerCase() !== 'nao')) ? obs : 'Nenhuma dúvida.';
                const queuePosition = Math.floor(Math.random() * 5) + 1;
                return {
                    response: `👨‍💼 *Solicitação de Compra enviada!*\n\nVocê foi adicionado à fila de atendimento para finalizar sua compra.\n\n📦 Produto: *${userData.productName}*\n${userData.productLink ? '🔗 Link: ' + userData.productLink + '\n' : ''}${userData.productPhoto ? '📸 Foto enviada\n' : ''}🔢 Quantidade: *${userData.quantity}*\n📝 Observação: ${userData.questions}\n\n⏳ Aguarde, em breve um atendente estará com você!\n\n*Sua posição na fila:* ${queuePosition}\n\n💡 *Opções:*\n• Digite *"sair"* para voltar ao menu principal\n• Aguarde sua vez para ser atendido`,
                    newStep: 'transfer_to_human',
                    data: {
                        ...userData,
                        queuePosition: queuePosition,
                        flowType: 'purchase'
                    }
                };
            }
            default:
                return null;
        }
    }
    static handleProductIssue(message, userState) {
        const step = userState.step;
        const userData = userState.data || {};
        
        switch (step) {
            case 'product_issue_nf': {
                const messageBody = message.body?.trim();
                
                if (message.hasMedia) {
                    // Usuário enviou foto da nota fiscal
                    userData.invoicePhoto = `Foto NF - ${message.id._serialized}`;
                    return {
                        response: '📸 *Foto da nota fiscal recebida!*\n\nAgora, por favor, envie uma *foto do produto com defeito*:',
                        newStep: 'product_issue_photo',
                        data: userData
                    };
                } else if (messageBody && messageBody.length >= 3) {
                    // Usuário digitou número do pedido/nota fiscal
                    userData.invoiceNumber = messageBody;
                    return {
                        response: '📋 *Número do pedido/nota fiscal registrado!*\n\nAgora, por favor, envie uma *foto do produto com defeito*:',
                        newStep: 'product_issue_photo',
                        data: userData
                    };
                } else {
                    return {
                        response: '⚠️ Por favor, envie:\n\n• Uma *foto da nota fiscal*, ou\n• Digite o *número do pedido/nota fiscal*\n\n(Mínimo 3 caracteres para o número)',
                        newStep: 'product_issue_nf',
                        data: userData
                    };
                }
            }
            
            case 'product_issue_photo': {
                if (message.hasMedia) {
                    userData.productPhoto = `Foto produto defeituoso - ${message.id._serialized}`;
                    return {
                        response: '📦 *Foto do produto recebida!*\n\nPor favor, envie também uma *foto da caixa/embalagem* (se ainda tiver):',
                        newStep: 'product_issue_box_photo',
                        data: userData
                    };
                } else {
                    return {
                        response: '⚠️ Por favor, envie uma *foto do produto com defeito*:',
                        newStep: 'product_issue_photo',
                        data: userData
                    };
                }
            }
            
            case 'product_issue_box_photo': {
                if (message.hasMedia) {
                    userData.boxPhoto = `Foto caixa/embalagem - ${message.id._serialized}`;
                    return {
                        response: '🏷️ *Foto da caixa recebida!*\n\nPor favor, envie uma *foto da etiqueta de entrega* (se ainda tiver), ou responda "não tenho":',
                        newStep: 'product_issue_label_photo',
                        data: userData
                    };
                } else if (message.body && (message.body.trim().toLowerCase().includes('não') || message.body.trim().toLowerCase().includes('nao'))) {
                    userData.boxPhoto = 'Não possui caixa/embalagem';
                    return {
                        response: '🏷️ Por favor, envie uma *foto da etiqueta de entrega* (se ainda tiver), ou responda "não tenho":',
                        newStep: 'product_issue_label_photo',
                        data: userData
                    };
                } else {
                    return {
                        response: '⚠️ Por favor:\n\n• Envie uma *foto da caixa/embalagem*, ou\n• Responda "não tenho" se não possuir',
                        newStep: 'product_issue_box_photo',
                        data: userData
                    };
                }
            }
            
            case 'product_issue_label_photo': {
                if (message.hasMedia) {
                    userData.labelPhoto = `Foto etiqueta entrega - ${message.id._serialized}`;
                    return {
                        response: '📍 *Foto da etiqueta recebida!*\n\nConfirme seu *endereço completo* para possível troca/devolução:',
                        newStep: 'product_issue_address',
                        data: userData
                    };
                } else if (message.body && (message.body.trim().toLowerCase().includes('não') || message.body.trim().toLowerCase().includes('nao'))) {
                    userData.labelPhoto = 'Não possui etiqueta de entrega';
                    return {
                        response: '📍 Confirme seu *endereço completo* para possível troca/devolução:',
                        newStep: 'product_issue_address',
                        data: userData
                    };
                } else {
                    return {
                        response: '⚠️ Por favor:\n\n• Envie uma *foto da etiqueta de entrega*, ou\n• Responda "não tenho" se não possuir',
                        newStep: 'product_issue_label_photo',
                        data: userData
                    };
                }
            }
            
            case 'product_issue_address': {
                const address = message.body?.trim();
                if (!address || address.length < 10) {
                    return {
                        response: '⚠️ Por favor, informe seu *endereço completo* com:\n\n• Rua/Avenida e número\n• Bairro\n• Cidade\n• CEP',
                        newStep: 'product_issue_address',
                        data: userData
                    };
                }
                userData.address = address;
                return {
                    response: '💬 Por último, descreva brevemente *qual é o problema* com o produto:\n\n(Ex: chegou quebrado, não funciona, cor errada, etc.)',
                    newStep: 'product_issue_comments',
                    data: userData
                };
            }
            
            case 'product_issue_comments': {
                const comments = message.body?.trim();
                if (!comments || comments.length < 5) {
                    return {
                        response: '⚠️ Por favor, descreva *qual é o problema* com o produto:\n\n(Mínimo 5 caracteres)',
                        newStep: 'product_issue_comments',
                        data: userData
                    };
                }
                userData.problemDescription = comments;
                
                // Agora direciona para o atendente
                const queuePosition = Math.floor(Math.random() * 5) + 1;
                
                return {
                    response: `✅ *Problema registrado com sucesso!*\n\nVocê foi adicionado à fila de atendimento especializado.\n\n📋 *Resumo do seu problema:*\n${userData.invoiceNumber ? '🧾 Pedido/NF: ' + userData.invoiceNumber + '\n' : ''}${userData.invoicePhoto ? '📸 Foto da NF enviada\n' : ''}📸 Foto do produto enviada\n${userData.boxPhoto && !userData.boxPhoto.includes('Não possui') ? '📦 Foto da caixa enviada\n' : ''}${userData.labelPhoto && !userData.labelPhoto.includes('Não possui') ? '🏷️ Foto da etiqueta enviada\n' : ''}📍 Endereço confirmado\n💬 Problema: ${comments}\n\n⏳ *Aguarde, em breve um especialista estará com você!*\n\n*Sua posição na fila:* ${queuePosition}\n\n💡 *Opções:*\n• Digite *"sair"* para voltar ao menu principal\n• Aguarde sua vez para ser atendido`,
                    newStep: 'transfer_to_human',
                    data: {
                        ...userData,
                        queuePosition: queuePosition,
                        flowType: 'product_issue'
                    }
                };
            }
            
            default:
                return {
                    response: '📋 *Registro de Problema com Produto*\n\nPara agilizar seu atendimento, por favor envie:\n\n1️⃣ *Nota fiscal ou número do pedido*\n(Você pode enviar uma foto da nota fiscal ou apenas digitar o número).',
                    newStep: 'product_issue_nf',
                    data: {
                        ...userData,
                        flowType: 'product_issue'
                    }
                };
        }
    }

    static handleSatisfaction(message, userState) {
        const step = userState.step;
        const userData = userState.data || {};
        
        switch (step) {
            case 'awaiting_satisfaction_rating': {
                const rating = parseInt(message.body?.trim());
                if (isNaN(rating) || rating < 1 || rating > 5) {
                    return {
                        response: '⚠️ Por favor, responda com um número de 1 a 5.\n\n1 - Muito Ruim 😠\n2 - Ruim 🙁\n3 - Regular 😐\n4 - Bom 🙂\n5 - Excelente 😄',
                        newStep: 'awaiting_satisfaction_rating',
                        data: userData
                    };
                } else {
                    userData.rating = rating;
                    return {
                        response: `⭐ Obrigado pela sua avaliação (${rating}/5)!\n\nPara concluir, você poderia deixar um breve comentário sobre sua experiência?\n\n(Ou responda "não" se preferir pular)`,
                        newStep: 'awaiting_satisfaction_feedback',
                        data: userData
                    };
                }
            }
            
            case 'awaiting_satisfaction_feedback': {
                const normalizedBody = this.normalizeText(message.body);
                userData.feedback = normalizedBody === 'nao' ? 'Sem comentários.' : message.body;
                userData.satisfactionCompletedAt = new Date().toISOString();
                
                return {
                    response: '🙏 *Muito obrigado pelo seu feedback!*\n\n✨ Suas observações são muito valiosas para nossa melhoria contínua.\n\n🏠 *Inaugura Lar* agradece a preferência!\n\nTenha um ótimo dia! 😊',
                    newStep: 'conversation_completed',
                    data: userData,
                    finalizeSession: true
                };
            }
        }
    }
    static handleHumanTransfer(message, userState) {
        const messageBody = this.normalizeText(message.body || '');
        const chatId = message.from;
        
        // Se usuário quer sair da fila
        if (messageBody === 'sair' || messageBody === 'cancelar' || messageBody === 'voltar') {
            SupportQueue.removeFromQueue(chatId);
            return {
                response: '🚪 Você saiu da fila de atendimento.\n\nComo podemos ajudar você hoje?\n\n*1*. 🛠️ Problema com produto\n*2*. 🧾 Nota Fiscal\n*3*. 💳 Fazer uma compra\n\nResponda com o *número* ou *palavra-chave* da opção desejada.',
                newStep: 'awaiting_main_option',
                data: userState.data
            };
        }
        
        // Verificar se já está em atendimento ativo
        if (SupportQueue.activeChats.has(chatId)) {
            return {
                response: '💬 Você está em atendimento com nosso suporte.\n\nSeu atendente responderá em breve.',
                newStep: 'in_human_chat',
                data: userState.data
            };
        }
        
        // Adicionar à fila se não estiver
        const position = SupportQueue.addToQueue(chatId, userState.data);
        
        const waitTime = position === 1 ? '2-5 minutos' : `${position * 3}-${position * 5} minutos`;
        
        return {
            response: `👨‍💼 *Fila de Atendimento Humano*\n\n📍 Sua posição: *${position}º na fila*\n⏰ Tempo estimado: *${waitTime}*\n\n⏳ Aguarde, em breve um atendente estará disponível.\n\n💡 *Opções:*\n• Digite *"sair"* para voltar ao menu principal\n• Aguarde sua vez para ser atendido`,
            newStep: 'transfer_to_human',
            data: {
                ...userState.data,
                queuePosition: position
            }
        };
    }
}

// =========================
// 📊 SISTEMA DE MONITORAMENTO E MÉTRICAS
// =========================

class SystemMonitor {
    static metrics = {
        startTime: Date.now(),
        totalMessages: 0,
        messagesFiltered: 0,
        messagesProcessed: 0,
        errorsCount: 0,
        lastError: null,
        activeUsers: 0,
        peakUsers: 0,
        queueLength: 0,
        peakQueueLength: 0,
        responseTime: [],
        memoryUsage: [],
        cpuUsage: []
    };

    static updateMetrics(type, data = {}) {
        switch (type) {
            case 'message_received':
                this.metrics.totalMessages++;
                break;
            case 'message_filtered':
                this.metrics.messagesFiltered++;
                break;
            case 'message_processed':
                this.metrics.messagesProcessed++;
                break;
            case 'error':
                this.metrics.errorsCount++;
                this.metrics.lastError = {
                    timestamp: new Date().toISOString(),
                    message: data.message || 'Erro desconhecido',
                    stack: data.stack
                };
                break;
            case 'user_activity':
                this.metrics.activeUsers = data.count || 0;
                if (this.metrics.activeUsers > this.metrics.peakUsers) {
                    this.metrics.peakUsers = this.metrics.activeUsers;
                }
                break;
            case 'queue_update':
                this.metrics.queueLength = data.length || 0;
                if (this.metrics.queueLength > this.metrics.peakQueueLength) {
                    this.metrics.peakQueueLength = this.metrics.queueLength;
                }
                break;
            case 'response_time':
                this.metrics.responseTime.push({
                    timestamp: Date.now(),
                    time: data.time
                });
                // Manter apenas as últimas 100 medições
                if (this.metrics.responseTime.length > 100) {
                    this.metrics.responseTime = this.metrics.responseTime.slice(-100);
                }
                break;
        }
    }

    static getMetrics() {
        const uptime = Date.now() - this.metrics.startTime;
        const avgResponseTime = this.metrics.responseTime.length > 0 
            ? this.metrics.responseTime.reduce((acc, r) => acc + r.time, 0) / this.metrics.responseTime.length 
            : 0;

        return {
            ...this.metrics,
            uptime,
            uptimeFormatted: this.formatUptime(uptime),
            avgResponseTime: Math.round(avgResponseTime),
            messagesPerMinute: this.metrics.totalMessages / (uptime / 60000),
            errorRate: this.metrics.totalMessages > 0 
                ? ((this.metrics.errorsCount / this.metrics.totalMessages) * 100).toFixed(2) 
                : 0,
            filterEfficiency: this.metrics.totalMessages > 0 
                ? ((this.metrics.messagesFiltered / this.metrics.totalMessages) * 100).toFixed(2) 
                : 0,
            timestamp: new Date().toISOString()
        };
    }

    static formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    static resetMetrics() {
        this.metrics = {
            startTime: Date.now(),
            totalMessages: 0,
            messagesFiltered: 0,
            messagesProcessed: 0,
            errorsCount: 0,
            lastError: null,
            activeUsers: 0,
            peakUsers: 0,
            queueLength: 0,
            peakQueueLength: 0,
            responseTime: [],
            memoryUsage: [],
            cpuUsage: []
        };
    }

    static startPerformanceMonitoring() {
        setInterval(() => {
            const memUsage = process.memoryUsage();
            const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

            this.metrics.memoryUsage.push({
                timestamp: Date.now(),
                usage: memPercent,
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal
            });

            // Manter apenas as últimas 60 medições (1 hora com intervalo de 1 minuto)
            if (this.metrics.memoryUsage.length > 60) {
                this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-60);
            }

            // Atualizar contadores de usuários ativos
            const activeUserCount = Object.keys(userStates).length;
            this.updateMetrics('user_activity', { count: activeUserCount });

            // Atualizar tamanho da fila
            const queueLength = SupportQueue.queue.length;
            this.updateMetrics('queue_update', { length: queueLength });

        }, 60000); // A cada minuto
    }
}

// =========================
// 🛡️ SISTEMA DE SEGURANÇA E RATE LIMITING
// =========================

class SecurityManager {
    static requestCounts = new Map();
    static blockedIPs = new Set();
    static suspiciousActivity = new Map();

    static rateLimitMiddleware(maxRequests = 100, windowMs = 60000) {
        return (req, res, next) => {
            const clientIP = req.ip || req.connection.remoteAddress;
            const now = Date.now();
            const windowStart = now - windowMs;

            // Verificar se IP está bloqueado
            if (this.blockedIPs.has(clientIP)) {
                return res.status(429).json({
                    error: 'IP bloqueado por atividade suspeita',
                    retryAfter: 3600 // 1 hora
                });
            }

            // Inicializar contador para IP se não existir
            if (!this.requestCounts.has(clientIP)) {
                this.requestCounts.set(clientIP, []);
            }

            const requests = this.requestCounts.get(clientIP);
            
            // Remover requisições antigas
            const recentRequests = requests.filter(timestamp => timestamp > windowStart);
            this.requestCounts.set(clientIP, recentRequests);

            // Verificar limite
            if (recentRequests.length >= maxRequests) {
                // Marcar como atividade suspeita
                this.markSuspiciousActivity(clientIP, 'rate_limit_exceeded');
                
                return res.status(429).json({
                    error: 'Muitas requisições. Tente novamente em um minuto.',
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            // Adicionar requisição atual
            recentRequests.push(now);
            this.requestCounts.set(clientIP, recentRequests);

            next();
        };
    }

    static markSuspiciousActivity(ip, reason) {
        if (!this.suspiciousActivity.has(ip)) {
            this.suspiciousActivity.set(ip, []);
        }

        const activity = this.suspiciousActivity.get(ip);
        activity.push({
            timestamp: Date.now(),
            reason: reason
        });

        // Se muitas atividades suspeitas, bloquear IP
        const recentActivity = activity.filter(a => a.timestamp > Date.now() - 300000); // 5 minutos
        if (recentActivity.length >= 5) {
            this.blockedIPs.add(ip);
            console.warn(`🚨 IP bloqueado por atividade suspeita: ${ip}`);
        }

        this.suspiciousActivity.set(ip, activity);
    }

    static getSecurityStats() {
        return {
            totalIPs: this.requestCounts.size,
            blockedIPs: this.blockedIPs.size,
            suspiciousIPs: this.suspiciousActivity.size,
            timestamp: new Date().toISOString()
        };
    }

    static unblockIP(ip) {
        this.blockedIPs.delete(ip);
        this.suspiciousActivity.delete(ip);
        this.requestCounts.delete(ip);
        console.log(`✅ IP desbloqueado: ${ip}`);
    }
}

// =========================
// 🔧 SISTEMA DE CONFIGURAÇÃO DINÂMICA
// =========================

class ConfigManager {
    static config = {
        filter: FILTER_CONFIG,
        monitoring: {
            enabled: true,
            performanceInterval: 60000,
            alertThresholds: {
                memoryUsage: 80,
                errorRate: 5,
                queueLength: 20,
                responseTime: 5000
            }
        },
        security: {
            rateLimitEnabled: true,
            maxRequestsPerMinute: 100,
            autoBlockSuspicious: true
        },
        bot: {
            sessionTimeout: SESSION_TIMEOUT_MS,
            autoSaveInterval: 300000, // 5 minutos
            maxConcurrentUsers: 1000
        }
    };

    static updateConfig(path, value) {
        const keys = path.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        this.saveConfig();
        
        console.log(`⚙️ Configuração atualizada: ${path} = ${JSON.stringify(value)}`);
    }

    static getConfig(path) {
        const keys = path.split('.');
        let current = this.config;
        
        for (const key of keys) {
            if (!current[key]) return null;
            current = current[key];
        }
        
        return current;
    }

    static saveConfig() {
        try {
            fs.writeFileSync('./system-config.json', JSON.stringify(this.config, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar configuração:', error.message);
        }
    }

    static loadConfig() {
        try {
            if (fs.existsSync('./system-config.json')) {
                const data = fs.readFileSync('./system-config.json', 'utf8');
                this.config = { ...this.config, ...JSON.parse(data) };
                console.log('⚙️ Configuração carregada do arquivo');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar configuração:', error.message);
        }
    }
}

// =========================
// 🔔 SISTEMA DE ALERTAS
// =========================

class AlertManager {
    static alerts = [];
    static webhooks = [];

    static addAlert(type, message, severity = 'info', data = {}) {
        const alert = {
            id: Date.now().toString(),
            type,
            message,
            severity,
            data,
            timestamp: new Date().toISOString(),
            acknowledged: false
        };

        this.alerts.unshift(alert);
        
        // Manter apenas os últimos 100 alertas
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(0, 100);
        }

        // Enviar para webhooks se crítico
        if (severity === 'critical' || severity === 'warning') {
            this.sendToWebhooks(alert);
        }

        console.log(`🔔 [${severity.toUpperCase()}] ${message}`);
        return alert.id;
    }

    static acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = new Date().toISOString();
        }
    }

    static getAlerts(severity = null, limit = 50) {
        let filteredAlerts = this.alerts;
        
        if (severity) {
            filteredAlerts = this.alerts.filter(a => a.severity === severity);
        }

        return filteredAlerts.slice(0, limit);
    }

    static addWebhook(url, events = ['critical', 'warning']) {
        this.webhooks.push({ url, events });
    }

    static async sendToWebhooks(alert) {
        for (const webhook of this.webhooks) {
            if (webhook.events.includes(alert.severity)) {
                try {
                    await axios.post(webhook.url, {
                        alert: alert,
                        system: 'WhatsApp Bot',
                        timestamp: new Date().toISOString()
                    }, { timeout: 5000 });
                } catch (error) {
                    console.error(`❌ Erro ao enviar alerta para webhook: ${error.message}`);
                }
            }
        }
    }

    static checkSystemHealth() {
        const metrics = SystemMonitor.getMetrics();
        const config = ConfigManager.config.monitoring;

        // Verificar uso de memória
        if (metrics.memoryUsage.length > 0) {
            const latestMemory = metrics.memoryUsage[metrics.memoryUsage.length - 1];
            if (latestMemory.usage > config.alertThresholds.memoryUsage) {
                this.addAlert(
                    'high_memory',
                    `Uso de memória alto: ${latestMemory.usage.toFixed(1)}%`,
                    'warning',
                    { memoryUsage: latestMemory.usage }
                );
            }
        }

        // Verificar taxa de erro
        if (parseFloat(metrics.errorRate) > config.alertThresholds.errorRate) {
            this.addAlert(
                'high_error_rate',
                `Taxa de erro alta: ${metrics.errorRate}%`,
                'warning',
                { errorRate: metrics.errorRate }
            );
        }

        // Verificar tamanho da fila
        if (metrics.queueLength > config.alertThresholds.queueLength) {
            this.addAlert(
                'queue_overflow',
                `Fila de atendimento lotada: ${metrics.queueLength} usuários`,
                'critical',
                { queueLength: metrics.queueLength }
            );
        }

        // Verificar tempo de resposta
        if (metrics.avgResponseTime > config.alertThresholds.responseTime) {
            this.addAlert(
                'slow_response',
                `Tempo de resposta lento: ${metrics.avgResponseTime}ms`,
                'warning',
                { responseTime: metrics.avgResponseTime }
            );
        }
    }
}

// Cliente WhatsApp com LocalAuth para persistência
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

let isReady = false;
let qrCodeString = '';

// Event Handlers do WhatsApp
client.on('qr', async (qr) => {
    console.log('📱 QR Code gerado! Escaneie com seu WhatsApp:');
    qrCodeString = qr;
    
    try {
        // Gerar QR Code no terminal
        qrcodeTerminal.generate(qr, { small: true });
        
        // Salvar QR Code como string para uso posterior
        qrCodeString = await qrcode.toDataURL(qr);
        console.log('🔗 QR Code também disponível em: http://localhost:' + PORT + '/qr');
    } catch (err) {
        console.error('Erro ao gerar QR Code:', err);
    }
});

client.on('ready', async () => {
    console.log('✅ WhatsApp Web.js conectado com sucesso!');
    isReady = true;
    qrCodeString = '';
    await stateManager.loadStates(); // Carregar estados salvos
});

client.on('auth_failure', () => {
    console.error('❌ Falha na autenticação do WhatsApp');
    isReady = false;
});

client.on('disconnected', (reason) => {
    console.log('🔌 WhatsApp desconectado:', reason);
    isReady = false;
});

// Escutar mensagens e processar com estado
client.on('message', async (message) => {
    try {
        // Validar se a mensagem é válida
        if (!message?.id || !message?.from) {
            console.warn('⚠️ Mensagem inválida recebida, ignorando...');
            return;
        }

        // =========================
        // 🔍 APLICAR FILTROS DE MENSAGEM
        // =========================
        
        // Verificar se a mensagem deve ser processada
        if (!messageFilter.shouldProcessMessage(message)) {
            // Mensagem foi filtrada/bloqueada
            return;
        }

        const from = message.from;
        console.log('📨 Nova mensagem PERMITIDA recebida de:', from);
        console.log('📝 Conteúdo:', message.body ? message.body.substring(0, 50) + '...' : '[sem texto]');
        console.log('📋 Tipo:', message.type);
        console.log('👥 É grupo:', message.isGroupMsg ? 'Sim' : 'Não');

        // Preparar dados da mensagem para n8n (incluindo estado do usuário)
        const messageData = {
            id: message.id._serialized,
            from: from,
            to: message.to,
            body: message.body,
            type: message.type,
            timestamp: message.timestamp,
            hasMedia: message.hasMedia,
            author: message.author,
            isGroupMsg: message.isGroupMsg
        };

        // Tentar obter dados do chat de forma segura
        try {
            const chat = await message.getChat();
            messageData.chat = {
                id: chat.id._serialized,
                name: chat.name,
                isGroup: chat.isGroup
            };
        } catch (chatError) {
            console.warn('⚠️ Não foi possível obter dados do chat:', chatError.message);
            messageData.chat = { id: from };
        }

        // Se tem mídia, verificar com antivírus ANTES de baixar/processar
        if (message.hasMedia) {
            try {
                console.log('🔒 Verificando mídia recebida com antivírus...');
                const mediaInfo = await message.downloadMedia();
                if (!mediaInfo?.data) {
                    await client.sendMessage(from, '⚠️ Não foi possível processar o arquivo enviado. Tente novamente.');
                    return;
                }
                // Converter base64 para Buffer
                const buffer = Buffer.from(mediaInfo.data, 'base64');
                const filename = mediaInfo.filename || 'arquivo_recebido';
                // Verificar com Scanii (apenas)
                const scaniiResult = await checkWithScanii(buffer, filename);
                if (!scaniiResult.clean) {
                    await client.sendMessage(from, '🚫 Arquivo bloqueado: detectamos possível ameaça de vírus ou conteúdo malicioso. Envie outro arquivo ou entre em contato com o suporte.');
                    return;
                }
                // Se passou, faz upload para o Gofile
                const chatName = messageData.chat?.name || from.replace('@c.us', '');
                const now = new Date();
                const dateFolder = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}-${now.getMinutes().toString().padStart(2,'0')}`;
                const folderName = `${chatName}_${dateFolder}`;
                const gofileResult = await uploadToGofile(buffer, filename, folderName);
                if (gofileResult.success) {
                    messageData.mediaData = {
                        mimetype: mediaInfo.mimetype,
                        data: mediaInfo.data,
                        filename: mediaInfo.filename || 'unknown',
                        gofileUrl: gofileResult.url
                    };
                    await client.sendMessage(from, `✅ Arquivo salvo com sucesso! Link seguro: ${gofileResult.url}`);
                } else {
                    messageData.mediaData = {
                        mimetype: mediaInfo.mimetype,
                        data: mediaInfo.data,
                        filename: mediaInfo.filename || 'unknown',
                        gofileError: gofileResult.error
                    };
                    await client.sendMessage(from, `⚠️ Arquivo limpo, mas não foi possível salvar no Gofile: ${gofileResult.error}`);
                }
            } catch (mediaError) {
                console.error('❌ Erro ao baixar/verificar mídia:', mediaError.message);
                await client.sendMessage(from, '❌ Erro ao processar/verificar o arquivo enviado. Tente novamente.');
                messageData.mediaError = mediaError.message;
                return;
            }
        }        // Carregar estado do usuário
        const userState = await stateManager.getUserState(from);
        messageData.userState = userState;

        // PROCESSAR FLUXO CONVERSACIONAL LOCALMENTE
        try {
            const startTime = Date.now();

            const flowResult = await ConversationFlow.processMessage(message, userState);

            // Envio multimídia se solicitado pelo fluxo
            if (userState?.data?._sendMedia || flowResult?.data?._sendMedia) {
                const mediaInfo = flowResult?.data?._sendMedia || userState?.data?._sendMedia;
                if (mediaInfo?.file) {
                    await sendMediaWithFallback(client, from, mediaInfo.file, mediaInfo.caption, '[Card visual não suportado]');
                }
                // Limpa flag para não reenviar
                if (flowResult?.data) delete flowResult.data._sendMedia;
            }
            // Feedback instantâneo se solicitado
            if (flowResult?.data?._sendFeedback) {
                await sendInstantFeedback(client, from, 'like');
                delete flowResult.data._sendFeedback;
            }

            // Atualizar estado do usuário se necessário
            if (flowResult.newStep) {
                await stateManager.setUserState(from, {
                    step: flowResult.newStep,
                    data: flowResult.data || {}
                });
            }
            // Finalizar sessão se solicitado
            if (flowResult.finalizeSession) {
                await stateManager.deleteUserState(from);
            }

            // Logar mensagem
            addToMessageLog({
                ...messageData,
                response: flowResult.response,
                step: flowResult.newStep || userState?.step || 'start',
                processedAt: new Date().toISOString()
            });

            // Atualizar métricas
            SystemMonitor.updateMetrics('message_processed');
            SystemMonitor.updateMetrics('response_time', { time: Date.now() - startTime });

            // Enviar resposta ao usuário
            if (flowResult.response) {
                await client.sendMessage(from, flowResult.response);
            }

            // Encaminhar para atendente se necessário
            if (flowResult.forwardToAttendant) {
                // Integração com painel de atendimento humano via webhook
                try {
                    const attendantPayload = {
                        user: {
                            id: from,
                            name: userState?.data?.name || '',
                            firstName: userState?.data?.firstName || '',
                            step: flowResult.newStep || userState?.step || 'start',
                            ...userState?.data
                        },
                        message: {
                            id: message.id._serialized,
                            body: message.body,
                            type: message.type,
                            timestamp: message.timestamp,
                            hasMedia: message.hasMedia,
                            mediaData: messageData.mediaData || null
                        },
                        queue: {
                            position: userState?.data?.queuePosition || null,
                            flowType: userState?.data?.flowType || null
                        },
                        context: {
                            chat: messageData.chat || {},
                            processedAt: new Date().toISOString()
                        }
                    };
                    // URL do painel de atendimento humano (ajuste conforme necessário)
                    const PANEL_WEBHOOK_URL = process.env.PANEL_WEBHOOK_URL || 'http://localhost:3002/webhook/attendant';
                    const axiosConfig = { timeout: 5000 };
                    await axios.post(PANEL_WEBHOOK_URL, attendantPayload, axiosConfig);
                    console.log('➡️ Mensagem encaminhada ao painel de atendimento humano:', attendantPayload);
                } catch (panelError) {
                    console.error('❌ Falha ao encaminhar para painel de atendimento humano:', panelError.message);
                    AlertManager.addAlert('panel_forward_error', `Erro ao encaminhar para painel: ${panelError.message}`, 'warning', { from });
                }
            }
        } catch (flowError) {
            SystemMonitor.updateMetrics('error', { message: flowError.message, stack: flowError.stack });
            AlertManager.addAlert('flow_error', `Erro no fluxo conversacional: ${flowError.message}`, 'warning', { from });
            await client.sendMessage(from, '❌ Ocorreu um erro ao processar sua mensagem. Tente novamente ou aguarde suporte.');
        }
    } catch (err) {
        SystemMonitor.updateMetrics('error', { message: err.message, stack: err.stack });
        AlertManager.addAlert('message_error', `Erro ao processar mensagem: ${err.message}`, 'warning');
    }
});

// Inicializar cliente WhatsApp
console.log('🚀 Inicializando cliente WhatsApp...');
client.initialize();

// Iniciar servidor Express
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    // Carregar configuração do arquivo
    ConfigManager.loadConfig();
    
    // Iniciar monitoramento de desempenho
    SystemMonitor.startPerformanceMonitoring();
    
    // Limpeza automática de estados antigos (intervalo inicial de 10 minutos)
    setInterval(() => {
        stateManager.cleanupOldStates();
    }, 10 * 60 * 1000);
    
    console.log('🧹 Limpeza automática de estados antigos iniciada (10 em 10 minutos)');
});

// Rota para exibir QR Code (opcional)
app.get('/qr', (req, res) => {
    if (!qrCodeString) {
        return res.status(404).send('QR Code não disponível');
    }
    res.send(`<img src="${qrCodeString}" />`);
});

// Rota para obter métricas do sistema
app.get('/metrics', (req, res) => {
    const metrics = SystemMonitor.getMetrics();
    res.json(metrics);
});

// Rota para obter status da fila de atendimento
app.get('/queue-status', (req, res) => {
    const status = SupportQueue.getDetailedQueueStatus();
    res.json(status);
});

// Rota para testes diversos
app.post('/test', async (req, res) => {
    const { chatId, message } = req.body;
    
    if (!chatId || !message) {
        return res.status(400).json({ error: 'Parâmetros chatId e message são obrigatórios' });
    }
    
    try {
        // Enviar mensagem de teste
        await client.sendMessage(chatId, message);
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao enviar mensagem de teste:', error.message);
        res.status(500).json({ error: 'Erro ao enviar mensagem de teste' });
    }
});


// Webhook para n8n (receber mensagens processadas)
app.post('/webhook/whatsapp-messages', async (req, res) => {
    const { messages } = req.body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Corpo da requisição inválido. Esperado um array de mensagens.' });
    }
    
    try {
        for (const message of messages) {
            // Aqui você pode implementar lógica para processar cada mensagem recebida do n8n
            // Exemplo: salvar em banco, enviar para atendente, etc.
            console.log('Mensagem recebida do n8n:', message);
        }
        
        res.json({ success: true, processedCount: messages.length });
    } catch (error) {
        console.error('Erro ao processar mensagens do n8n:', error.message);
        res.status(500).json({ error: 'Erro ao processar mensagens' });
    }
});


// Rota para testes de carga (exemplo)
app.post('/test-load', async (req, res) => {
    const { count } = req.body;
    
    if (!count || isNaN(count) || count < 1) {
        return res.status(400).json({ error: 'Parâmetro count é obrigatório e deve ser um número positivo' });
    }
    
    const messages = [];
    for (let i = 0; i < count; i++) {
        messages.push({
            id: `test_${i}`,
            from: `551199999${i.toString().padStart(4, '0')}@c.us`,
            to: `551198888${i.toString().padStart(4, '0')}@c.us`,
            body: `Mensagem de teste número ${i + 1}`,
            type: 'text',
            timestamp: Date.now(),
            hasMedia: false,
            author: `551199999${i.toString().padStart(4, '0')}@c.us`,
            isGroupMsg: false
        });
    }
    
    // Enviar todas as mensagens em paralelo
    try {
        await Promise.all(messages.map(msg => client.sendMessage(msg.to, msg.body)));
        res.json({ success: true, sentCount: count });
    } catch (error) {
        console.error('Erro ao enviar mensagens de teste:', error.message);
        res.status(500).json({ error: 'Erro ao enviar mensagens de teste' });
    }
});

// Rota para obter alertas do sistema
app.get('/alerts', (req, res) => {
    const { severity, limit } = req.query;
    const alerts = AlertManager.getAlerts(severity, parseInt(limit) || 50);
    res.json(alerts);
});

// Rota para confirmar alerta
app.post('/alerts/:alertId/acknowledge', (req, res) => {
    const { alertId } = req.params;
    AlertManager.acknowledgeAlert(alertId);
    res.json({ success: true, alertId });
});

// Rota para obter configurações
app.get('/config', (req, res) => {
    const config = ConfigManager.getAll ? ConfigManager.getAll() : ConfigManager.config;
    res.json(config);
});

// Rota para atualizar configurações
app.post('/config', (req, res) => {
    const { path, value } = req.body;
    if (!path) {
        return res.status(400).json({ error: 'Parâmetro path é obrigatório' });
    }
    
    let success = false;
    if (ConfigManager.updateConfig) {
        success = ConfigManager.updateConfig(path, value);
    } else if (ConfigManager.set) {
        success = ConfigManager.set(path, value);
    }
    
    res.json({ success, path, value });
});

// Rota para obter estatísticas de segurança
app.get('/security/stats', (req, res) => {
    const stats = SecurityManager.getSecurityStats();
    res.json(stats);
});

// Rota para desbloquear IP
app.post('/security/unblock-ip', (req, res) => {
    const { ip } = req.body;
    if (!ip) {
        return res.status(400).json({ error: 'Parâmetro ip é obrigatório' });
    }
    
    SecurityManager.unblockIP(ip);
    res.json({ success: true, ip });
});

// Rota para obter log de mensagens
app.get('/messages/log', (req, res) => {
    const { limit } = req.query;
    const limitNum = parseInt(limit) || 50;
    const logs = messageLog.slice(0, limitNum);
    res.json({ logs, total: messageLog.length });
});

// Rota para obter estatísticas do filtro
app.get('/filter/stats', (req, res) => {
    const stats = messageFilter.getStats();
    res.json(stats);
});

// Rota para resetar estatísticas do filtro
app.post('/filter/reset-stats', (req, res) => {
    messageFilter.resetStats();
    res.json({ success: true });
});

// Rota para gerenciar grupos permitidos
app.get('/groups/allowed', (req, res) => {
    const stats = allowedGroupsManager.getStats();
    res.json(stats);
});

app.post('/groups/allowed', (req, res) => {
    const { groupId, groupName } = req.body;
    if (!groupId) {
        return res.status(400).json({ error: 'Parâmetro groupId é obrigatório' });
    }
    
    const added = allowedGroupsManager.addGroup(groupId, groupName);
    res.json({ success: added, groupId, groupName });
});

app.delete('/groups/allowed/:groupId', (req, res) => {
    const { groupId } = req.params;
    const removed = allowedGroupsManager.removeGroup(groupId);
    res.json({ success: removed, groupId });
});

// ==========================================
// SISTEMA DE USUÁRIOS E AUTENTICAÇÃO
// ==========================================
app.use('/api', userAPI);

// APIs para Sistema de Atendimento Humano
app.get('/api/support-queue', userManager.requireAuth(), userManager.requirePermission('view_dashboard'), (req, res) => {
    const status = SupportQueue.getDetailedQueueStatus();
    res.json(status);
});

app.post('/api/support-queue/register-attendant', userManager.requireAuth(), userManager.requirePermission('manage_attendants'), (req, res) => {
    const { attendantId, attendantName, skills } = req.body;
    
    if (!attendantId || !attendantName) {
        return res.status(400).json({ error: 'attendantId e attendantName são obrigatórios' });
    }
    
    const attendant = SupportQueue.registerAttendant(attendantId, attendantName, skills || []);
    res.json({ success: true, attendant });
});

app.put('/api/support-queue/attendant-status', userManager.requireAuth(), userManager.requirePermission('manage_attendants'), (req, res) => {
    const { attendantId, status } = req.body;
    
    if (!attendantId || !status) {
        return res.status(400).json({ error: 'attendantId e status são obrigatórios' });
    }
    
    const updated = SupportQueue.updateAttendantStatus(attendantId, status);
    res.json({ success: updated, attendantId, status });
});

app.post('/api/support-queue/start-chat', userManager.requireAuth(), userManager.requirePermission('accept_chats'), async (req, res) => {
    const { attendantId, attendantName, chatId } = req.body;
    
    if (!attendantId || !attendantName) {
        return res.status(400).json({ error: 'attendantId e attendantName são obrigatórios' });
    }
    
    try {
        let targetChatId = chatId;
        if (!targetChatId) {
            const nextInQueue = SupportQueue.getNext();
            if (!nextInQueue) {
                return res.status(404).json({ error: 'Nenhum cliente na fila' });
            }
            targetChatId = nextInQueue.chatId;
        }
        
        const chatInfo = SupportQueue.startChat(targetChatId, { id: attendantId, name: attendantName });
        
        // Notificar cliente
        await client.sendMessage(targetChatId, `👋 Olá! Sou *${attendantName}*, seu atendente.\n\nComo posso ajudá-lo(a) hoje?`);
        
        res.json({ success: true, chatInfo });
    } catch (error) {
        console.error('Erro ao iniciar chat:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/support-queue/send-message', userManager.requireAuth(), userManager.requirePermission('send_messages'), async (req, res) => {
    const { chatId, message, attendantId } = req.body;
    
    if (!chatId || !message || !attendantId) {
        return res.status(400).json({ error: 'chatId, message e attendantId são obrigatórios' });
    }
    
    try {
        // Verificar se chat está ativo
        if (!SupportQueue.activeChats.has(chatId)) {
            return res.status(404).json({ error: 'Chat não está ativo' });
        }
        
        await client.sendMessage(chatId, message);
        SupportQueue.addMessageToHistory(chatId, message, true);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/support-queue/end-chat', userManager.requireAuth(), userManager.requirePermission('update_tickets'), async (req, res) => {
    const { chatId, rating, feedback } = req.body;
    
    if (!chatId) {
        return res.status(400).json({ error: 'chatId é obrigatório' });
    }
    
    try {
        const completedChat = SupportQueue.endChat(chatId, rating, feedback);
        
        if (completedChat) {
            // Enviar mensagem de encerramento
            await client.sendMessage(chatId, '✅ Atendimento finalizado!\n\nComo você avalia nosso atendimento?\n\n*1* - Muito Ruim 😠\n*2* - Ruim 🙁\n*3* - Regular 😐\n*4* - Bom 🙂\n*5* - Excelente 😄\n\nResponda com um número de 1 a 5:');
            
            // Atualizar estado do usuário para pesquisa de satisfação
            await stateManager.setUserState(chatId, {
                step: 'awaiting_satisfaction_rating',
                data: completedChat.userData || {}
            });
        }
        
        res.json({ success: true, completedChat });
    } catch (error) {
        console.error('Erro ao finalizar chat:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/support-queue/transfer', userManager.requireAuth(), userManager.requirePermission('transfer_chats'), async (req, res) => {
    const { chatId, fromAttendantId, toAttendantId, reason } = req.body;
    
    if (!chatId || !fromAttendantId || !toAttendantId) {
        return res.status(400).json({ error: 'chatId, fromAttendantId e toAttendantId são obrigatórios' });
    }
    
    try {
        // Verificar se chat está ativo
        const chatInfo = SupportQueue.activeChats.get(chatId);
        if (!chatInfo) {
            return res.status(404).json({ error: 'Chat não está ativo' });
        }
        
        // Verificar se novo atendente existe e está disponível
        const newAttendant = SupportQueue.attendants.get(toAttendantId);
        if (!newAttendant) {
            return res.status(404).json({ error: 'Atendente de destino não encontrado' });
        }
        
        // Atualizar informações do chat
        chatInfo.attendantId = toAttendantId;
        chatInfo.attendantName = newAttendant.name;
        chatInfo.transferredAt = Date.now();
        chatInfo.transferReason = reason;
        
        // Adicionar mensagem ao histórico
        SupportQueue.addMessageToHistory(chatId, `Chat transferido de ${fromAttendantId} para ${toAttendantId}. Motivo: ${reason || 'Não informado'}`, true);
        
        // Notificar cliente
        await client.sendMessage(chatId, `🔄 Seu atendimento foi transferido para *${newAttendant.name}*.\n\nEm breve você será atendido(a)!`);
        
        res.json({ success: true, chatInfo });
    } catch (error) {
        console.error('Erro ao transferir chat:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/support-queue/chat-history/:chatId', userManager.requireAuth(), userManager.requirePermission('view_assigned_tickets'), (req, res) => {
    const { chatId } = req.params;
    const history = SupportQueue.chatHistory.get(chatId) || [];
    const chatInfo = SupportQueue.activeChats.get(chatId);
    
    res.json({
        chatId,
        isActive: !!chatInfo,
        chatInfo,
        history,
        messageCount: history.length
    });
});

app.post('/api/support-queue/auto-assign', userManager.requireAuth(), userManager.requirePermission('manage_attendants'), async (req, res) => {
    try {
        const assignment = SupportQueue.autoAssignToAttendant();
        
        if (!assignment) {
            return res.json({ success: false, message: 'Nenhuma atribuição disponível' });
        }
        
        const { queueItem, attendant } = assignment;
        const chatInfo = SupportQueue.startChat(queueItem.chatId, attendant);
        
        // Notificar cliente
        await client.sendMessage(queueItem.chatId, `👋 Olá! Sou *${attendant.name}*, seu atendente.\n\nComo posso ajudá-lo(a) hoje?`);
        
        res.json({ success: true, assignment: { queueItem, attendant, chatInfo } });
    } catch (error) {
        console.error('Erro na auto-atribuição:', error);
        res.status(500).json({ error: error.message });
    }
});


// Fim do arquivo principal do servidor WhatsApp Web.js + n8n
// (EOF)