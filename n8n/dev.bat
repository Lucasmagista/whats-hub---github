@echo off
echo 🚀 Iniciando servidor em modo desenvolvimento...
echo.
echo 📋 Configurações:
echo   - Arquivo: whatsapp-webjs-server-complete.js
echo   - Porta: 3001
echo   - Modo: Desenvolvimento
echo   - Auto-restart: Habilitado
echo.
echo 💡 Para parar o servidor: Ctrl+C
echo 💡 Para restart manual: digite 'rs' e pressione Enter
echo.

nodemon --config nodemon.json whatsapp-webjs-server-complete.js
