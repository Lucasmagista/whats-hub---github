// ===================================
// SISTEMA DE GERENCIAMENTO DE USUÁRIOS
// ===================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

class UserManager {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.userFilePath = './data/users.json';
        this.sessionsFilePath = './data/sessions.json';
        
        // Criar diretório se não existir
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data');
        }
        
        this.loadUsers();
        this.loadSessions();
    }

    // ===================================
    // INICIALIZAÇÃO E PERSISTÊNCIA
    // ===================================
    
    loadUsers() {
        try {
            // Carregar usuários do arquivo JSON
            if (fs.existsSync(this.userFilePath)) {
                const data = fs.readFileSync(this.userFilePath, 'utf8');
                const usersArray = JSON.parse(data);
                usersArray.forEach(user => {
                    this.users.set(user.username, user);
                });
                console.log(`✅ ${usersArray.length} usuários carregados do arquivo`);
            }
            
            // Carregar usuários das variáveis de ambiente
            this.loadUsersFromEnv();
            
            // Salvar usuários atualizados
            this.saveUsers();
            
        } catch (error) {
            console.error('❌ Erro ao carregar usuários:', error.message);
            this.loadUsersFromEnv(); // Fallback para env
        }
    }

    loadUsersFromEnv() {
        const systemUsers = process.env.SYSTEM_USERS;
        if (!systemUsers) {
            console.log('ℹ️ Nenhum usuário definido em SYSTEM_USERS, criando admin padrão');
            this.createDefaultAdmin();
            return;
        }

        const userEntries = systemUsers.split(';');
        let loadedCount = 0;

        userEntries.forEach(entry => {
            const [username, password, role] = entry.split(':');
            if (username && password && role) {
                if (!this.users.has(username)) {
                    const hashedPassword = bcrypt.hashSync(password, 10);
                    const user = {
                        id: this.generateId(),
                        username: username.trim(),
                        password: hashedPassword,
                        role: role.trim(),
                        createdAt: new Date().toISOString(),
                        lastLogin: null,
                        active: true
                    };
                    this.users.set(username, user);
                    loadedCount++;
                }
            }
        });

        console.log(`✅ ${loadedCount} usuários carregados das variáveis de ambiente`);
    }

    createDefaultAdmin() {
        const defaultPassword = bcrypt.hashSync('admin123', 10);
        const adminUser = {
            id: this.generateId(),
            username: 'admin',
            password: defaultPassword,
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            active: true
        };
        this.users.set('admin', adminUser);
        console.log('✅ Usuário admin padrão criado (username: admin, password: admin123)');
    }

    saveUsers() {
        try {
            const usersArray = Array.from(this.users.values());
            fs.writeFileSync(this.userFilePath, JSON.stringify(usersArray, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar usuários:', error.message);
        }
    }

    loadSessions() {
        try {
            if (fs.existsSync(this.sessionsFilePath)) {
                const data = fs.readFileSync(this.sessionsFilePath, 'utf8');
                const sessionsArray = JSON.parse(data);
                sessionsArray.forEach(session => {
                    this.sessions.set(session.token, session);
                });
            }
        } catch (error) {
            console.error('❌ Erro ao carregar sessões:', error.message);
        }
    }

    saveSessions() {
        try {
            const sessionsArray = Array.from(this.sessions.values());
            fs.writeFileSync(this.sessionsFilePath, JSON.stringify(sessionsArray, null, 2));
        } catch (error) {
            console.error('❌ Erro ao salvar sessões:', error.message);
        }
    }


    // ===================================
    // AUTENTICAÇÃO
    // ===================================
    authenticate(username, password) {
        const user = this.users.get(username);
        if (!user || !user.active) {
            return { success: false, message: 'Usuário não encontrado ou inativo' };
        }
        // Suporte a hash antigo e novo
        let passwordOk = false;
        if (user.password.startsWith('$2b$')) {
            // bcrypt
            passwordOk = bcrypt.compareSync(password, user.password);
        } else {
            // hash antigo (sha256)
            passwordOk = (user.password === this.hashPassword(password));
        }
        if (!passwordOk) {
            return { success: false, message: 'Senha incorreta' };
        }
        // Atualiza último login
        user.lastLogin = new Date().toISOString();
        this.users.set(username, user);
        this.saveUsers();
        // Gera token JWT
        const token = this.generateToken(user);
        // Salva sessão
        this.sessions.set(token, {
            userId: user.id,
            username: user.username,
            role: user.role,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        });
        this.saveSessions();
        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                lastLogin: user.lastLogin
            },
            token: token
        };
    }

    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
            const session = this.sessions.get(token);
            if (!session) {
                return { valid: false, message: 'Sessão não encontrada' };
            }
            // Verifica timeout da sessão
            const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT_MINUTES || '480') * 60 * 1000;
            const lastActivity = new Date(session.lastActivity).getTime();
            const now = Date.now();
            if (now - lastActivity > sessionTimeout) {
                this.sessions.delete(token);
                this.saveSessions();
                return { valid: false, message: 'Sessão expirada' };
            }
            // Atualiza última atividade
            session.lastActivity = new Date().toISOString();
            this.sessions.set(token, session);
            this.saveSessions();
            return {
                valid: true,
                user: {
                    id: decoded.id || session.userId,
                    username: decoded.username || session.username,
                    role: decoded.role || session.role
                }
            };
        } catch (error) {
            return { valid: false, message: 'Token inválido' };
        }
    }

    logout(token) {
        this.sessions.delete(token);
        this.saveSessions();
        return { success: true, message: 'Logout realizado com sucesso' };
    }

    // ===================================
    // GERENCIAMENTO DE USUÁRIOS
    // ===================================
    addUser(username, password, role) {
        if (this.users.has(username)) {
            return { success: false, message: 'Usuário já existe' };
        }
        if (!this.isValidRole(role)) {
            return { success: false, message: 'Role inválida' };
        }
        const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '6');
        if (password.length < minLength) {
            return { success: false, message: `Senha deve ter pelo menos ${minLength} caracteres` };
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = {
            id: this.generateId(),
            username: username,
            password: hashedPassword,
            role: role,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            active: true
        };
        this.users.set(username, user);
        this.saveUsers();
        return { success: true, message: 'Usuário criado com sucesso' };
    }

    changeUserRole(username, newRole) {
        const user = this.users.get(username);
        if (!user) {
            return { success: false, message: 'Usuário não encontrado' };
        }
        if (!this.isValidRole(newRole)) {
            return { success: false, message: 'Role inválida' };
        }
        user.role = newRole;
        this.users.set(username, user);
        this.saveUsers();
        return { success: true, message: 'Role alterada com sucesso' };
    }

    changePassword(username, newPassword) {
        const user = this.users.get(username);
        if (!user) {
            return { success: false, message: 'Usuário não encontrado' };
        }
        const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '6');
        if (newPassword.length < minLength) {
            return { success: false, message: `Senha deve ter pelo menos ${minLength} caracteres` };
        }
        user.password = bcrypt.hashSync(newPassword, 10);
        this.users.set(username, user);
        this.saveUsers();
        return { success: true, message: 'Senha alterada com sucesso' };
    }

    removeUser(username) {
        if (!this.users.has(username)) {
            return { success: false, message: 'Usuário não encontrado' };
        }
        this.users.delete(username);
        this.saveUsers();
        return { success: true, message: 'Usuário removido com sucesso' };
    }

    hasPermission(userRole, permission) {
        const permissions = {
            admin: ['all'], // Admin tem todas as permissões
            supervisor: [
                'view_dashboard',
                'manage_queue',
                'assign_tickets',
                'view_reports',
                'manage_attendants',
                'view_support_dashboard',
                'transfer_chats'
            ],
            attendant: [
                'view_dashboard',
                'view_assigned_tickets',
                'update_tickets',
                'send_messages',
                'view_support_dashboard',
                'accept_chats'
            ],
            viewer: [
                'view_dashboard',
                'view_queue',
                'view_basic_stats'
            ]
        };
        const userPermissions = permissions[userRole] || [];
        return userPermissions.includes('all') || userPermissions.includes(permission);
    }

    // ===================================
    // MIDDLEWARE PARA EXPRESS
    // ===================================
    requireAuth() {
        return (req, res, next) => {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ error: 'Token de autenticação necessário' });
            }
            const verification = this.verifyToken(token);
            if (!verification.valid) {
                return res.status(401).json({ error: verification.message });
            }
            req.user = verification.user;
            next();
        };
    }
    requirePermission(permission) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            if (!this.hasPermission(req.user.role, permission)) {
                return res.status(403).json({ error: 'Permissão insuficiente' });
            }
            next();
        };
    }

    // ===================================
    // UTILITÁRIOS
    // ===================================

    isValidRole(role) {
        const validRoles = ['admin', 'supervisor', 'attendant', 'viewer'];
        return validRoles.includes(role);
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    hashPassword(password) {
        return require('crypto').createHash('sha256').update(password + (process.env.JWT_SECRET || 'salt')).digest('hex');
    }
    generateToken(user) {
        return jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'default-secret',
            { expiresIn: '24h' }
        );
    }

    getAdminCount() {
        return Array.from(this.users.values()).filter(u => u.role === 'admin' && u.active).length;
    }

    sanitizeUser(user) {
        const { password, ...sanitized } = user;
        return sanitized;
    }

    // ===================================
    // ESTATÍSTICAS E RELATÓRIOS
    // ===================================

    getStats() {
        const users = Array.from(this.users.values());
        const activeSessions = Array.from(this.sessions.values());

        return {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.active).length,
            usersByRole: {
                admin: users.filter(u => u.role === 'admin').length,
                supervisor: users.filter(u => u.role === 'supervisor').length,
                attendant: users.filter(u => u.role === 'attendant').length,
                viewer: users.filter(u => u.role === 'viewer').length
            },
            activeSessions: activeSessions.length,
            onlineUsers: activeSessions.map(s => s.username)
        };
    }

    getAllUsers() {
        return Array.from(this.users.values()).map(u => this.sanitizeUser(u));
    }

    // ===================================
    // LIMPEZA AUTOMÁTICA
    // ===================================

    cleanupExpiredSessions() {
        const now = Date.now();
        const timeoutMs = (process.env.SESSION_TIMEOUT_MINUTES || 480) * 60 * 1000;
        let cleaned = 0;

        for (const [token, session] of this.sessions.entries()) {
            const lastActivity = new Date(session.lastActivity).getTime();
            if (now - lastActivity > timeoutMs) {
                this.sessions.delete(token);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            this.saveSessions();
            console.log(`🧹 ${cleaned} sessões expiradas removidas`);
        }

        return cleaned;
    }

    // Executar limpeza automática a cada hora
    startCleanupTask() {
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 60 * 60 * 1000); // 1 hora
    }
}

// ===================================
// INSTÂNCIA GLOBAL
// ===================================
// Instância singleton
const userManager = new UserManager();
userManager.startCleanupTask();
module.exports = userManager;
