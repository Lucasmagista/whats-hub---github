#!/bin/bash

# 🚀 Script de Instalação Automática - WhatsApp Web.js + n8n
# Este script configura automaticamente todo o ambiente

echo "🤖 Instalando WhatsApp Web.js + n8n Chatbot..."
echo "=================================================="

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 16+ antes de continuar."
    echo "Download: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versão $NODE_VERSION encontrada. Necessário versão 16 ou superior."
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale npm junto com Node.js."
    exit 1
fi

echo "✅ npm $(npm -v) encontrado"

# Criar diretório se não existir
if [ ! -d "whats-hub" ]; then
    mkdir whats-hub
    echo "📁 Diretório whats-hub criado"
fi

cd whats-hub

# Verificar se já existe package.json
if [ ! -f "package.json" ]; then
    echo "📦 Criando package.json..."
    
cat > package.json << 'EOF'
{
  "name": "whatsapp-webjs-n8n-server",
  "version": "1.0.0",
  "description": "Servidor WhatsApp Web.js para integração com n8n",
  "main": "whatsapp-webjs-server.js",
  "scripts": {
    "start": "node whatsapp-webjs-server.js",
    "dev": "nodemon whatsapp-webjs-server.js"
  },
  "dependencies": {
    "whatsapp-web.js": "^1.23.0",
    "express": "^4.18.2",
    "qrcode": "^1.5.3",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências. Verifique sua conexão com a internet."
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"

# Verificar se os arquivos principais existem
if [ ! -f "whatsapp-webjs-server.js" ]; then
    echo "❌ Arquivo whatsapp-webjs-server.js não encontrado."
    echo "💡 Certifique-se de ter todos os arquivos do projeto na pasta."
    exit 1
fi

if [ ! -f "template-whatsapp-webjs.json" ]; then
    echo "❌ Template do n8n não encontrado."
    echo "💡 Certifique-se de ter o arquivo template-whatsapp-webjs.json na pasta."
    exit 1
fi

# Criar arquivo de configuração .env
if [ ! -f ".env" ]; then
    echo "⚙️ Criando arquivo de configuração..."
    
cat > .env << 'EOF'
# Configurações do WhatsApp Web.js + n8n

# Porta do servidor (padrão: 3001)
PORT=3001

# URL do webhook do n8n (ajuste conforme necessário)
N8N_WEBHOOK_URL=http://localhost:5678/webhook/whatsapp-messages

# Configurações opcionais
NODE_ENV=development
EOF

    echo "✅ Arquivo .env criado"
    echo "💡 Edite o arquivo .env para ajustar as configurações"
fi

# Verificar se n8n está instalado
if ! command -v n8n &> /dev/null; then
    echo "⚠️ n8n não encontrado globalmente."
    echo "📥 Instalando n8n..."
    npm install -g n8n
    
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar n8n globalmente."
        echo "💡 Tente executar: sudo npm install -g n8n"
        echo "💡 Ou instale localmente: npm install n8n"
    else
        echo "✅ n8n instalado globalmente"
    fi
fi

# Criar scripts úteis
echo "📝 Criando scripts úteis..."

# Script para iniciar o servidor
cat > start-server.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando servidor WhatsApp Web.js..."
echo "📱 QR Code estará disponível em: http://localhost:3001/qr"
echo "📊 Status em: http://localhost:3001/status"
echo ""
echo "Para parar o servidor, pressione Ctrl+C"
echo ""
node whatsapp-webjs-server.js
EOF

chmod +x start-server.sh

# Script para iniciar n8n
cat > start-n8n.sh << 'EOF'
#!/bin/bash
echo "🔧 Iniciando n8n..."
echo "🌐 Interface será aberta em: http://localhost:5678"
echo ""
echo "Para parar o n8n, pressione Ctrl+C"
echo ""
n8n
EOF

chmod +x start-n8n.sh

# Script para ver logs
cat > view-logs.sh << 'EOF'
#!/bin/bash
echo "📄 Logs do servidor WhatsApp Web.js..."
echo "Pressione Ctrl+C para sair"
echo ""
tail -f server.log 2>/dev/null || echo "Arquivo de log não encontrado. Inicie o servidor primeiro."
EOF

chmod +x view-logs.sh

# Script para resetar sessão
cat > reset-session.sh << 'EOF'
#!/bin/bash
echo "🔄 Resetando sessão do WhatsApp..."
rm -rf .wwebjs_auth/
rm -rf .wwebjs_cache/
echo "✅ Sessão resetada. Execute o servidor novamente para gerar novo QR Code."
EOF

chmod +x reset-session.sh

echo "✅ Scripts criados:"
echo "   - start-server.sh: Inicia o servidor WhatsApp"
echo "   - start-n8n.sh: Inicia o n8n"
echo "   - view-logs.sh: Visualiza logs em tempo real"
echo "   - reset-session.sh: Reseta sessão do WhatsApp"

# Criar arquivo README com instruções
cat > QUICK-START.md << 'EOF'
# 🚀 Guia Rápido - WhatsApp Web.js + n8n

## ⚡ Início Rápido

### 1. Iniciar n8n (Terminal 1)
```bash
./start-n8n.sh
```
- Acesse: http://localhost:5678
- Importe o template: `template-whatsapp-webjs.json`
- Configure suas credenciais OpenAI
- Ative o workflow

### 2. Iniciar Servidor WhatsApp (Terminal 2)  
```bash
./start-server.sh
```
- Acesse: http://localhost:3001/qr
- Escaneie o QR Code com seu WhatsApp
- Aguarde conexão

### 3. Testar
Envie uma mensagem para o WhatsApp conectado e veja a resposta automática!

## 🔧 Scripts Úteis

- `./start-server.sh` - Inicia servidor WhatsApp
- `./start-n8n.sh` - Inicia n8n  
- `./view-logs.sh` - Ver logs em tempo real
- `./reset-session.sh` - Resetar sessão WhatsApp

## 🆘 Problemas Comuns

**QR Code não aparece:**
```bash
./reset-session.sh
./start-server.sh
```

**Mensagens não chegam:**
- Verifique se n8n está rodando
- Confirme se o workflow está ativo
- Teste: http://localhost:3001/status

**Erro de IA:**
- Configure chaves OpenAI no n8n
- Verifique créditos da conta OpenAI

## 📚 Recursos

- Servidor: http://localhost:3001
- n8n: http://localhost:5678  
- QR Code: http://localhost:3001/qr
- Status: http://localhost:3001/status
EOF

echo ""
echo "🎉 INSTALAÇÃO CONCLUÍDA!"
echo "======================================"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. 🔧 Configurar n8n:"
echo "   ./start-n8n.sh"
echo "   Acesse: http://localhost:5678"
echo "   Importe: template-whatsapp-webjs.json"
echo ""
echo "2. 📱 Iniciar WhatsApp:"
echo "   ./start-server.sh"
echo "   QR Code: http://localhost:3001/qr"
echo ""
echo "3. ✅ Testar:"
echo "   Envie uma mensagem para o WhatsApp conectado"
echo ""
echo "📖 Documentação completa: README-WhatsApp-WebJS.md"
echo "⚡ Guia rápido: QUICK-START.md"
echo ""
echo "🆘 Suporte:"
echo "   - Logs: ./view-logs.sh"
echo "   - Reset: ./reset-session.sh"
echo "   - Status: http://localhost:3001/status"
echo ""
echo "🚀 Boa diversão com seu chatbot WhatsApp!"
EOF

# Script para Windows (batch)
cat > install.bat << 'EOF'
@echo off
echo 🤖 Instalando WhatsApp Web.js + n8n Chatbot...
echo ==================================================

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Instale Node.js 16+ antes de continuar.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado

REM Instalar dependências
echo 📦 Instalando dependências...
npm install

if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências.
    pause
    exit /b 1
)

echo ✅ Dependências instaladas

REM Criar scripts Windows
echo @echo off > start-server.bat
echo echo 🚀 Iniciando servidor WhatsApp Web.js... >> start-server.bat
echo echo 📱 QR Code: http://localhost:3001/qr >> start-server.bat
echo echo 📊 Status: http://localhost:3001/status >> start-server.bat
echo node whatsapp-webjs-server.js >> start-server.bat

echo @echo off > start-n8n.bat
echo echo 🔧 Iniciando n8n... >> start-n8n.bat
echo echo 🌐 Interface: http://localhost:5678 >> start-n8n.bat
echo n8n >> start-n8n.bat

echo @echo off > reset-session.bat
echo echo 🔄 Resetando sessão... >> reset-session.bat
echo rmdir /s /q .wwebjs_auth 2>nul >> reset-session.bat
echo rmdir /s /q .wwebjs_cache 2>nul >> reset-session.bat
echo echo ✅ Sessão resetada >> reset-session.bat

echo.
echo 🎉 INSTALAÇÃO CONCLUÍDA!
echo ======================================
echo.
echo 📋 Próximos passos:
echo.
echo 1. 🔧 start-n8n.bat (Terminal 1)
echo 2. 📱 start-server.bat (Terminal 2)  
echo 3. ✅ Testar mensagens
echo.
pause
EOF

echo ""
echo "🎯 Instalação para Windows também criada: install.bat"
echo ""
echo "Happy coding! 🚀"
