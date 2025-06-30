-- ===========================================
-- 🏠 INAUGURA LAR - INICIALIZAÇÃO PostgreSQL
-- ===========================================

-- Criação da tabela para callbacks
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

-- Índices para melhor performance nos callbacks
CREATE INDEX IF NOT EXISTS idx_callbacks_chat_id ON callbacks(chat_id);
CREATE INDEX IF NOT EXISTS idx_callbacks_scheduled_time ON callbacks(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_callbacks_status ON callbacks(status);
CREATE INDEX IF NOT EXISTS idx_callbacks_callback_id ON callbacks(callback_id);

-- Criação da tabela para estados dos usuários
CREATE TABLE IF NOT EXISTS user_states (
    id SERIAL PRIMARY KEY,
    chat_id VARCHAR(255) NOT NULL UNIQUE,
    user_step VARCHAR(100) NOT NULL DEFAULT 'start',
    user_data JSONB DEFAULT '{}',
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance nos estados
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

CREATE TRIGGER trigger_user_states_updated_at
    BEFORE UPDATE ON user_states
    FOR EACH ROW
    EXECUTE FUNCTION update_user_states_updated_at();

-- Criação da tabela para histórico de mensagens (opcional)
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

-- Índices para melhor performance nas mensagens
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp_sent);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_n8n ON messages(sent_to_n8n);

-- Inserir dados iniciais se necessário
INSERT INTO user_states (chat_id, user_step, user_data) 
VALUES ('system', 'initialized', '{"initialized_at": "now"}')
ON CONFLICT (chat_id) DO NOTHING;

-- Função para limpeza automática de estados antigos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_user_states(timeout_minutes INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_states 
    WHERE chat_id != 'system' 
    AND last_interaction < (CURRENT_TIMESTAMP - INTERVAL '1 minute' * timeout_minutes);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Comentários explicativos
COMMENT ON TABLE callbacks IS 'Tabela para armazenar callbacks agendados do sistema';
COMMENT ON TABLE user_states IS 'Tabela para armazenar estados de conversação dos usuários';
COMMENT ON TABLE messages IS 'Tabela para histórico de mensagens (opcional)';

-- Verificação final
SELECT 'PostgreSQL inicializado com sucesso para o Inaugura Lar Bot!' as status;

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_callbacks_updated_at 
    BEFORE UPDATE ON callbacks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE callbacks IS 'Tabela para armazenar callbacks/agendamentos de retorno do bot WhatsApp';
COMMENT ON COLUMN callbacks.callback_id IS 'ID único do callback (gerado pela aplicação)';
COMMENT ON COLUMN callbacks.chat_id IS 'ID do chat no WhatsApp';
COMMENT ON COLUMN callbacks.user_name IS 'Nome do usuário';
COMMENT ON COLUMN callbacks.user_data IS 'Dados do usuário em formato JSON';
COMMENT ON COLUMN callbacks.scheduled_time IS 'Data e hora agendada para o callback';
COMMENT ON COLUMN callbacks.message IS 'Mensagem do callback';
COMMENT ON COLUMN callbacks.status IS 'Status do callback: pending, completed, cancelled';
