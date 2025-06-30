/**
 * Exemplo de como integrar o sistema de usuários no servidor principal
 * Adicione este código no seu whatsapp-webjs-server-complete.js
 */

// ==========================================
// 1. IMPORTAR OS MÓDULOS NO INÍCIO DO ARQUIVO
// ==========================================
const userManager = require('./user-management');
const userAPI = require('./user-api');

// ==========================================
// 2. ADICIONAR AS ROTAS DE API (após as outras rotas)
// ==========================================

// Usar as rotas de gerenciamento de usuários
app.use('/api', userAPI);

// ==========================================
// 3. PROTEGER ROTAS EXISTENTES COM AUTENTICAÇÃO
// ==========================================

// Exemplo: Proteger o dashboard de suporte
app.get('/support-dashboard', userManager.requireAuth(), userManager.requirePermission('view_support_dashboard'), (req, res) => {
    // Código existente do dashboard...
});

// Exemplo: Proteger APIs de fila de suporte
app.get('/api/support-queue', userManager.requireAuth(), userManager.requirePermission('view_dashboard'), (req, res) => {
    // Código existente...
});

app.post('/api/support-queue/register-attendant', 
    userManager.requireAuth(), 
    userManager.requirePermission('manage_attendants'), 
    (req, res) => {
    // Código existente...
});

// ==========================================
// 4. EXEMPLO DE USO COMPLETO
// ==========================================

/**
 * Como testar o sistema:
 */

// 1. Fazer login
// POST http://localhost:3001/api/auth/login
// {
//   "username": "admin",
//   "password": "admin123"
// }

// 2. Usar o token retornado nas próximas requisições
// Authorization: Bearer SEU_TOKEN_AQUI

// 3. Listar usuários (apenas admins)
// GET http://localhost:3001/api/users
// Authorization: Bearer SEU_TOKEN_AQUI

// 4. Adicionar novo usuário
// POST http://localhost:3001/api/users
// Authorization: Bearer SEU_TOKEN_AQUI
// {
//   "username": "carlos",
//   "password": "carlos123",
//   "role": "attendant"
// }

// ==========================================
// 5. MIDDLEWARE PARA PÁGINAS WEB COM AUTENTICAÇÃO
// ==========================================

// Middleware para verificar autenticação em páginas web
function requireWebAuth(req, res, next) {
    // Verificar se tem token no cookie ou session
    const token = req.cookies?.authToken || req.session?.token;
    
    if (!token) {
        return res.redirect('/login.html');
    }

    const verification = userManager.verifyToken(token);
    if (!verification.valid) {
        return res.redirect('/login.html');
    }

    req.user = verification.user;
    next();
}

// Exemplo: Proteger página do dashboard
app.get('/dashboard', requireWebAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// ==========================================
// 6. PÁGINA DE LOGIN SIMPLES (criar login.html)
// ==========================================

const loginHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Login - Sistema de Atendimento</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 50px; background: #f5f5f5; }
        .login-form { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .error { color: red; margin-top: 10px; }
        .success { color: green; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="login-form">
        <h2>Login do Sistema</h2>
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Usuário:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Senha:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Entrar</button>
            <div id="message"></div>
        </form>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Salvar token e redirecionar
                    localStorage.setItem('authToken', result.token);
                    document.cookie = 'authToken=' + result.token + '; path=/';
                    messageDiv.innerHTML = '<div class="success">Login realizado com sucesso! Redirecionando...</div>';
                    setTimeout(() => {
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    messageDiv.innerHTML = '<div class="error">' + result.message + '</div>';
                }
            } catch (error) {
                messageDiv.innerHTML = '<div class="error">Erro de conexão</div>';
            }
        });
    </script>
</body>
</html>
`;

// Servir página de login
app.get('/login', (req, res) => {
    res.send(loginHTML);
});

// ==========================================
// 7. INFORMAÇÕES DOS USUÁRIOS CRIADOS
// ==========================================

console.log(`
🎯 SISTEMA DE USUÁRIOS CONFIGURADO!

📋 Usuários disponíveis (definidos no .env):
• admin:admin123:admin - Administrador total
• lucas:lucas123:admin - Seu usuário admin
• maria:maria123:supervisor - Supervisora
• joao:joao123:attendant - Atendente  
• ana:ana123:viewer - Visualizador

🔐 Para alterar usuários, edite a variável SYSTEM_USERS no .env

🌐 URLs importantes:
• Login: http://localhost:3001/login
• Dashboard: http://localhost:3001/dashboard
• Support Dashboard: http://localhost:3001/support-dashboard

📡 APIs disponíveis:
• POST /api/auth/login - Fazer login
• POST /api/auth/logout - Fazer logout
• GET /api/users - Listar usuários (admin)
• POST /api/users - Adicionar usuário (admin)
• DELETE /api/users/:username - Remover usuário (admin)
• PUT /api/users/:username/role - Alterar role (admin)
• PUT /api/users/:username/password - Alterar senha

🎭 Roles e Permissões:
• admin: Acesso total
• supervisor: Gerenciar fila, atendentes, relatórios
• attendant: Atender clientes, aceitar chats
• viewer: Apenas visualizar
`);

module.exports = {
    userManager,
    userAPI,
    requireWebAuth
};
