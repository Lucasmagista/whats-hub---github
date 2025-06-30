@echo off
cls
echo ===========================================
echo 🤖 WhatsApp Bot - Modo Desenvolvimento
echo ===========================================
echo.

:: Verificar se o nodemon está instalado
where nodemon >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Nodemon não encontrado. Instalando...
    npm install -g nodemon
    if %errorlevel% neq 0 (
        echo ❌ Erro ao instalar nodemon. Tentando instalação local...
        npm install --save-dev nodemon
    )
)

:: Criar diretórios necessários se não existirem
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "backups" mkdir backups
if not exist "sessions" mkdir sessions

:: Configurar variáveis de ambiente para desenvolvimento
set NODE_ENV=development
set DEBUG=true

echo ✅ Ambiente configurado
echo 📂 Diretórios criados
echo 🔧 Variáveis de ambiente definidas
echo.
echo 🚀 Iniciando servidor...
echo.
echo 💡 Comandos disponíveis:
echo    - rs + Enter: Restart manual
echo    - Ctrl+C: Parar servidor
echo.

:: Executar com configuração específica
nodemon --watch "*.js" --watch "modules/**/*.js" --watch "database/**/*.js" --ignore "userStates.json" --ignore "callbacks.json" --ignore "logs/" --ignore "uploads/" --ignore "backups/" --ignore "sessions/" --ignore ".wwebjs_auth/" --ignore ".wwebjs_cache/" --delay 2 whatsapp-webjs-server-complete.js

echo.
echo 👋 Servidor encerrado
pause
