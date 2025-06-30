/**
 * Sistema de Controle de Bot por Atendente
 * Permite que atendentes pausem/retomem o bot em chats específicos
 */

class BotControl {
    constructor() {
        this.pausedChats = new Map(); // chatId -> { attendantId, pausedAt, reason }
        this.controlCommands = new Map(); // token -> { attendantId, command, chatId }
        this.loadPausedChats();
    }

    /**
     * Carrega chats pausados de arquivo (persistência)
     */
    loadPausedChats() {
        try {
            const fs = require('fs');
            const filePath = './botControlStates.json';
            
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                const parsed = JSON.parse(data);
                
                this.pausedChats = new Map(parsed.pausedChats || []);
                console.log(`✅ ${this.pausedChats.size} chats pausados carregados`);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar estados de controle do bot:', error.message);
        }
    }

    /**
     * Salva estados de controle em arquivo
     */
    savePausedChats() {
        try {
            const fs = require('fs');
            const data = {
                pausedChats: Array.from(this.pausedChats.entries()),
                lastUpdated: new Date().toISOString()
            };
            
            fs.writeFileSync('./botControlStates.json', JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar estados de controle:', error.message);
        }
    }

    /**
     * Gera comando especial para atendente assumir conversa
     * Este comando é invisível para o cliente
     */
    generateTakeOverCommand(attendantId, chatId) {
        const token = require('crypto').randomBytes(16).toString('hex');
        const command = `#ASSUMIR_${token}`;
        
        this.controlCommands.set(token, {
            attendantId,
            command: 'takeover',
            chatId,
            createdAt: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000) // Expira em 5 minutos
        });

        // Limpa comandos expirados
        this.cleanExpiredCommands();

        return command;
    }

    /**
     * Gera comando especial para atendente finalizar conversa
     * Este comando é invisível para o cliente
     */
    generateEndCommand(attendantId, chatId) {
        const token = require('crypto').randomBytes(16).toString('hex');
        const command = `#FINALIZAR_${token}`;
        
        this.controlCommands.set(token, {
            attendantId,
            command: 'end',
            chatId,
            createdAt: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000) // Expira em 5 minutos
        });

        // Limpa comandos expirados
        this.cleanExpiredCommands();

        return command;
    }

    /**
     * Verifica se uma mensagem é um comando de controle
     */
    isControlCommand(messageBody) {
        if (!messageBody || typeof messageBody !== 'string') return false;
        
        return messageBody.startsWith('#ASSUMIR_') || messageBody.startsWith('#FINALIZAR_');
    }

    /**
     * Processa comando de controle
     */
    processControlCommand(messageBody, chatId) {
        try {
            let token = null;
            let commandType = null;

            if (messageBody.startsWith('#ASSUMIR_')) {
                token = messageBody.replace('#ASSUMIR_', '');
                commandType = 'takeover';
            } else if (messageBody.startsWith('#FINALIZAR_')) {
                token = messageBody.replace('#FINALIZAR_', '');
                commandType = 'end';
            }

            if (!token) {
                return { success: false, message: 'Comando inválido' };
            }

            const commandData = this.controlCommands.get(token);
            
            if (!commandData) {
                return { success: false, message: 'Comando não encontrado ou expirado' };
            }

            if (commandData.chatId !== chatId) {
                return { success: false, message: 'Comando não corresponde ao chat' };
            }

            if (Date.now() > commandData.expiresAt) {
                this.controlCommands.delete(token);
                return { success: false, message: 'Comando expirado' };
            }

            // Processa o comando
            if (commandType === 'takeover') {
                return this.pauseBotForChat(chatId, commandData.attendantId, 'Atendente assumiu conversa');
            } else if (commandType === 'end') {
                return this.resumeBotForChat(chatId, commandData.attendantId);
            }

            return { success: false, message: 'Tipo de comando desconhecido' };

        } catch (error) {
            console.error('❌ Erro ao processar comando de controle:', error.message);
            return { success: false, message: 'Erro interno ao processar comando' };
        }
    }

    /**
     * Pausa o bot para um chat específico
     */
    pauseBotForChat(chatId, attendantId, reason = 'Atendimento humano') {
        try {
            this.pausedChats.set(chatId, {
                attendantId,
                pausedAt: new Date().toISOString(),
                reason,
                status: 'paused'
            });

            this.savePausedChats();

            console.log(`⏸️ Bot pausado para ${chatId} por ${attendantId}`);

            return {
                success: true,
                message: 'Bot pausado com sucesso',
                chatId,
                attendantId,
                status: 'paused'
            };
        } catch (error) {
            console.error('❌ Erro ao pausar bot:', error.message);
            return { success: false, message: 'Erro ao pausar bot' };
        }
    }

    /**
     * Retoma o bot para um chat específico
     */
    resumeBotForChat(chatId, attendantId) {
        try {
            const pausedInfo = this.pausedChats.get(chatId);
            
            if (!pausedInfo) {
                return { success: false, message: 'Chat não estava pausado' };
            }

            // Verificar se o atendente tem permissão para retomar
            if (pausedInfo.attendantId !== attendantId) {
                return { success: false, message: 'Apenas o atendente que pausou pode retomar' };
            }

            this.pausedChats.delete(chatId);
            this.savePausedChats();

            console.log(`▶️ Bot retomado para ${chatId} por ${attendantId}`);

            return {
                success: true,
                message: 'Bot retomado com sucesso',
                chatId,
                attendantId,
                status: 'resumed',
                pausedDuration: new Date() - new Date(pausedInfo.pausedAt)
            };
        } catch (error) {
            console.error('❌ Erro ao retomar bot:', error.message);
            return { success: false, message: 'Erro ao retomar bot' };
        }
    }

    /**
     * Verifica se o bot está pausado para um chat
     */
    isBotPaused(chatId) {
        return this.pausedChats.has(chatId);
    }

    /**
     * Obtém informações de pausa de um chat
     */
    getPauseInfo(chatId) {
        return this.pausedChats.get(chatId) || null;
    }

    /**
     * Lista todos os chats com bot pausado
     */
    getPausedChats() {
        const pausedList = [];
        this.pausedChats.forEach((info, chatId) => {
            pausedList.push({
                chatId,
                ...info
            });
        });
        return pausedList;
    }

    /**
     * Remove comandos expirados
     */
    cleanExpiredCommands() {
        const now = Date.now();
        for (const [token, commandData] of this.controlCommands.entries()) {
            if (now > commandData.expiresAt) {
                this.controlCommands.delete(token);
            }
        }
    }

    /**
     * Obtém estatísticas do controle de bot
     */
    getStats() {
        this.cleanExpiredCommands();
        
        return {
            pausedChats: this.pausedChats.size,
            activeCommands: this.controlCommands.size,
            pausedChatsList: this.getPausedChats()
        };
    }

    /**
     * Força retomada de um chat (apenas admins)
     */
    forceResume(chatId, adminId) {
        try {
            if (this.pausedChats.has(chatId)) {
                this.pausedChats.delete(chatId);
                this.savePausedChats();
                
                console.log(`🔓 Bot retomado forçadamente para ${chatId} por admin ${adminId}`);
                
                return {
                    success: true,
                    message: 'Bot retomado forçadamente',
                    chatId,
                    adminId
                };
            } else {
                return { success: false, message: 'Chat não estava pausado' };
            }
        } catch (error) {
            console.error('❌ Erro ao forçar retomada:', error.message);
            return { success: false, message: 'Erro ao forçar retomada' };
        }
    }
}

// Instância singleton
const botControl = new BotControl();

module.exports = botControl;
