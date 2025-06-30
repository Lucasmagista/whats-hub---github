@echo off
echo ===========================================
echo 🏠 INAUGURA LAR - INSTALACAO POSTGRESQL
echo ===========================================
echo.

echo 🔍 Verificando se o PostgreSQL está instalado...
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ PostgreSQL não encontrado. 
    echo.
    echo 📥 Por favor, instale o PostgreSQL manualmente:
    echo 1. Acesse: https://www.postgresql.org/download/windows/
    echo 2. Baixe e instale o PostgreSQL 15 ou superior
    echo 3. Durante a instalação, defina uma senha para o usuário 'postgres'
    echo 4. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo ✅ PostgreSQL encontrado!
echo.

echo 🔐 Digite a senha do usuário 'postgres':
set /p POSTGRES_PASSWORD=Senha: 

echo.
echo 🗄️ Criando banco de dados 'whats_hub'...
psql -U postgres -h localhost -c "CREATE DATABASE whats_hub;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Banco de dados criado com sucesso!
) else (
    echo ℹ️ Banco de dados já existe ou erro na criação
)

echo.
echo 🔧 Executando script de inicialização...
if exist "database\init.sql" (
    psql -U postgres -h localhost -d whats_hub -f database\init.sql
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Script de inicialização executado com sucesso!
    ) else (
        echo ⚠️ Erro ao executar script de inicialização
    )
) else (
    echo ⚠️ Arquivo database\init.sql não encontrado
)

echo.
echo 📝 Criando arquivo .env...
if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo ✅ Arquivo .env criado a partir do .env.example
    echo.
    echo 🔧 Por favor, edite o arquivo .env e configure:
    echo - POSTGRES_PASSWORD=%POSTGRES_PASSWORD%
    echo - Outras configurações necessárias
) else (
    echo ℹ️ Arquivo .env já existe
)

echo.
echo 📦 Instalando dependências do Node.js...
npm install

echo.
echo 🚀 Executando migração para PostgreSQL...
node migrate-to-postgresql.js

echo.
echo ===========================================
echo ✅ INSTALAÇÃO CONCLUÍDA!
echo ===========================================
echo.
echo 📋 Próximos passos:
echo 1. Edite o arquivo .env com suas configurações
echo 2. Execute: npm start
echo 3. Acesse: http://localhost:3001
echo.
echo 🗄️ Banco de dados: whats_hub
echo 👤 Usuário: postgres
echo 🔑 Senha: %POSTGRES_PASSWORD%
echo.
pause
