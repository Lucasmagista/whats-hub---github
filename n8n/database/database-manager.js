const { Pool } = require('pg');

class DatabaseManager {
    constructor() {
        this.pool = null;
        this.config = {
            user: process.env.POSTGRES_USER || 'postgres',
            host: process.env.POSTGRES_HOST || 'localhost',
            database: process.env.POSTGRES_DB || 'whats_hub',
            password: process.env.POSTGRES_PASSWORD || 'postgres',
            port: parseInt(process.env.POSTGRES_PORT) || 5432,
            max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS) || 10,
            idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT) || 30000,
            connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECTION_TIMEOUT) || 5000,
            ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false
        };
    }

    // Adiciona o método connect para inicializar o pool de conexões
    async connect() {
        if (!this.pool) {
            this.pool = new Pool(this.config);
            try {
                await this.pool.query('SELECT 1'); // Testa conexão
                console.log('✅ Conectado ao PostgreSQL');
            } catch (error) {
                console.error('❌ Erro na conexão com PostgreSQL:', error.message);
                throw error;
            }
        }
    }

    // Atualiza dados do cliente no pedido (nome/endereço)
    async updateOrderCustomerData(orderId, { name, address }) {
        // Cria colunas se não existirem
        const alterTableQuery = `
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
        `;
        try {
            await this.query(alterTableQuery);
        } catch (error) {
            // Pode ignorar erro se já existe
        }
        // Atualiza o pedido
        try {
            await this.query(
                `UPDATE orders SET customer_name = $1, customer_address = $2 WHERE id = $3`,
                [name, address, orderId]
            );
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar dados do cliente no pedido:', error.message);
            return false;
        }
    }

    // Cria um novo pedido vindo do catálogo web
    async createOrderFromCatalog({ chatId, payload, status = 'aguardando_dados_cliente', createdAt = new Date() }) {
        // Cria tabela orders se não existir (agora com colunas para pagamento e comprovante)
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(255) NOT NULL,
                payload TEXT,
                status VARCHAR(50) DEFAULT 'aguardando_dados_cliente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                customer_name VARCHAR(255),
                customer_address TEXT,
                payment_status VARCHAR(50) DEFAULT 'aguardando_pagamento',
                payment_proof TEXT,
                payment_proof_uploaded_at TIMESTAMP,
                payment_validated BOOLEAN DEFAULT FALSE,
                payment_validation_result TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_orders_chat_id ON orders(chat_id);
            CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
            CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
        `;
        try {
            await this.query(createTableQuery);
        } catch (error) {
            console.error('❌ Erro ao criar tabela orders:', error.message);
            throw error;
        }

        // Insere o pedido
        try {
            const result = await this.query(
                `INSERT INTO orders (chat_id, payload, status, created_at) VALUES ($1, $2, $3, $4) RETURNING *`,
                [chatId, payload, status, createdAt]
            );
            return result.rows[0];
        } catch (error) {
            console.error('❌ Erro ao inserir pedido do catálogo:', error.message);
            throw error;
        }
    }

    // Atualiza comprovante e status de pagamento do pedido
    async updateOrderPaymentProof(orderId, { paymentStatus, paymentProof, uploadedAt = new Date(), validated = false, validationResult = null }) {
        // Adiciona colunas se não existirem (idempotente)
        const alterTableQuery = `
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'aguardando_pagamento';
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof TEXT;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof_uploaded_at TIMESTAMP;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_validated BOOLEAN DEFAULT FALSE;
            ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_validation_result TEXT;
        `;
        try {
            await this.query(alterTableQuery);
        } catch (error) {}
        // Atualiza o pedido
        try {
            await this.query(
                `UPDATE orders SET payment_status = $1, payment_proof = $2, payment_proof_uploaded_at = $3, payment_validated = $4, payment_validation_result = $5 WHERE id = $6`,
                [paymentStatus, paymentProof, uploadedAt, validated, validationResult, orderId]
            );
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar comprovante do pedido:', error.message);
            return false;
        }
    }

    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            console.log('🔌 PostgreSQL desconectado');
        }
    }

    async query(text, params) {
        if (!this.pool) {
            throw new Error('Banco de dados não conectado');
        }
        
        try {
            const start = Date.now();
            const res = await this.pool.query(text, params);
            const duration = Date.now() - start;
            
            // Log apenas em desenvolvimento
            if (process.env.NODE_ENV === 'development') {
                console.log(`🗄️ Query executada em ${duration}ms: ${text.substring(0, 50)}...`);
            }
            
            return res;
        } catch (error) {
            console.error('❌ Erro na query PostgreSQL:', error.message);
            console.error('Query:', text);
            console.error('Params:', params);
            throw error;
        }
    }

    async getClient() {
        if (!this.pool) {
            throw new Error('Banco de dados não conectado');
        }
        return await this.pool.connect();
    }

    // Métodos específicos para callbacks
    async createCallbacksTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS callbacks (
                id SERIAL PRIMARY KEY,
                callback_id INTEGER NOT NULL UNIQUE,
                chat_id VARCHAR(255) NOT NULL,
                user_name VARCHAR(255),
                user_data JSONB,
                scheduled_time TIMESTAMP NOT NULL,
                message TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_callbacks_chat_id ON callbacks(chat_id);
            CREATE INDEX IF NOT EXISTS idx_callbacks_scheduled_time ON callbacks(scheduled_time);
            CREATE INDEX IF NOT EXISTS idx_callbacks_status ON callbacks(status);
            CREATE INDEX IF NOT EXISTS idx_callbacks_callback_id ON callbacks(callback_id);
        `;

        try {
            await this.query(createTableQuery);
            console.log('✅ Tabela callbacks criada/verificada');
        } catch (error) {
            console.error('❌ Erro ao criar tabela callbacks:', error.message);
            throw error;
        }
    }    // Métodos específicos para estados dos usuários
    async createUserStatesTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS user_states (
                id SERIAL PRIMARY KEY,
                chat_id VARCHAR(255) NOT NULL UNIQUE,
                user_step VARCHAR(100) NOT NULL DEFAULT 'start',
                user_data JSONB DEFAULT '{}',
                last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_user_states_chat_id ON user_states(chat_id);
            CREATE INDEX IF NOT EXISTS idx_user_states_step ON user_states(user_step);
            CREATE INDEX IF NOT EXISTS idx_user_states_last_interaction ON user_states(last_interaction);
            
            -- Trigger para atualizar updated_at automaticamente
            CREATE OR REPLACE FUNCTION update_user_states_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_user_states_updated_at'
                ) THEN
                    CREATE TRIGGER trigger_user_states_updated_at
                        BEFORE UPDATE ON user_states
                        FOR EACH ROW
                        EXECUTE FUNCTION update_user_states_updated_at();
                END IF;
            END$$;
        `;

        try {
            await this.query(createTableQuery);
            console.log('✅ Tabela user_states criada/verificada');
        } catch (error) {
            console.error('❌ Erro ao criar tabela user_states:', error.message);
            throw error;
        }
    }

    // Métodos para gerenciar estados dos usuários
    async saveUserState(chatId, step, data) {
        try {
            await this.query(`
                INSERT INTO user_states (chat_id, user_step, user_data, last_interaction) 
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
                ON CONFLICT (chat_id) 
                DO UPDATE SET 
                    user_step = $2,
                    user_data = $3,
                    last_interaction = CURRENT_TIMESTAMP
            `, [chatId, step, JSON.stringify(data || {})]);
        } catch (error) {
            console.error('❌ Erro ao salvar estado do usuário:', error.message);
            throw error;
        }
    }

    async getUserState(chatId) {
        try {
            const result = await this.query(`
                SELECT user_step, user_data, last_interaction 
                FROM user_states 
                WHERE chat_id = $1
            `, [chatId]);

            if (result.rows.length > 0) {
                const row = result.rows[0];
                return {
                    step: row.user_step,
                    data: row.user_data || {},
                    lastInteraction: row.last_interaction.getTime()
                };
            }
            return null;
        } catch (error) {
            console.error('❌ Erro ao carregar estado do usuário:', error.message);
            return null;
        }
    }

    async deleteUserState(chatId) {
        try {
            await this.query('DELETE FROM user_states WHERE chat_id = $1', [chatId]);
        } catch (error) {
            console.error('❌ Erro ao deletar estado do usuário:', error.message);
            throw error;
        }
    }

    async cleanupOldUserStates(timeoutMs = 1800000) { // 30 minutos padrão
        try {
            const cutoffTime = new Date(Date.now() - timeoutMs);
            const result = await this.query(`
                DELETE FROM user_states 
                WHERE last_interaction < $1
            `, [cutoffTime]);
            
            if (result.rowCount > 0) {
                console.log(`🧹 ${result.rowCount} estados de usuário antigos removidos`);
            }
            return result.rowCount;
        } catch (error) {
            console.error('❌ Erro ao limpar estados antigos:', error.message);
            return 0;
        }
    }

    // Métodos específicos para mensagens (opcional - para histórico)
    async createMessagesTable() {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                message_id VARCHAR(255) NOT NULL,
                chat_id VARCHAR(255) NOT NULL,
                sender_id VARCHAR(255),
                message_body TEXT,
                message_type VARCHAR(50) DEFAULT 'text',
                has_media BOOLEAN DEFAULT FALSE,
                media_data JSONB,
                timestamp_sent TIMESTAMP NOT NULL,
                timestamp_received TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sent_to_n8n BOOLEAN DEFAULT FALSE,
                flow_result JSONB,
                user_state JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
            CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp_sent);
            CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
            CREATE INDEX IF NOT EXISTS idx_messages_n8n ON messages(sent_to_n8n);
        `;

        try {
            await this.query(createTableQuery);
            console.log('✅ Tabela messages criada/verificada');
        } catch (error) {
            console.error('❌ Erro ao criar tabela messages:', error.message);
            throw error;
        }
    }

    async saveMessage(messageData) {
        try {
            await this.query(`
                INSERT INTO messages (
                    message_id, chat_id, sender_id, message_body, message_type, 
                    has_media, media_data, timestamp_sent, sent_to_n8n, 
                    flow_result, user_state
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
                messageData.id,
                messageData.from,
                messageData.author || messageData.from,
                messageData.body || null,
                messageData.type || 'text',
                messageData.hasMedia || false,
                messageData.mediaData ? JSON.stringify(messageData.mediaData) : null,
                new Date(messageData.timestamp),
                messageData.sentToN8n || false,
                messageData.flowResult ? JSON.stringify(messageData.flowResult) : null,
                messageData.userState ? JSON.stringify(messageData.userState) : null
            ]);
        } catch (error) {
            console.error('❌ Erro ao salvar mensagem:', error.message);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        try {
            await this.query('SELECT 1 as health_check');
            return { healthy: true, timestamp: new Date().toISOString() };
        } catch (error) {
            return { healthy: false, error: error.message, timestamp: new Date().toISOString() };
        }
    }
}

module.exports = DatabaseManager;
