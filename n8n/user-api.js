/**
 * APIs REST para Gerenciamento de Usuários
 * Endpoints para login, logout, gestão de usuários e permissões
 */

const express = require('express');
const userManager = require('./user-management');

const router = express.Router();

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

/**
 * POST /auth/login
 * Faz login de um usuário
 */
router.post('/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username e password são obrigatórios' 
            });
        }

        const result = userManager.authenticate(username, password);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                user: result.user,
                token: result.token
            });
        } else {
            res.status(401).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

/**
 * POST /auth/logout
 * Faz logout de um usuário
 */
router.post('/auth/logout', userManager.requireAuth(), (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const result = userManager.logout(token);
        
        res.json(result);
    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

/**
 * GET /auth/verify
 * Verifica se o token é válido
 */
router.get('/auth/verify', userManager.requireAuth(), (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});

// ==========================================
// ROTAS DE GERENCIAMENTO DE USUÁRIOS
// ==========================================

/**
 * GET /users
 * Lista todos os usuários (apenas admins)
 */
router.get('/users', 
    userManager.requireAuth(), 
    userManager.requirePermission('manage_users'),
    (req, res) => {
        try {
            const users = userManager.listUsers();
            res.json({
                success: true,
                users: users
            });
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }
);

/**
 * POST /users
 * Adiciona novo usuário (apenas admins)
 */
router.post('/users',
    userManager.requireAuth(),
    userManager.requirePermission('manage_users'),
    (req, res) => {
        try {
            const { username, password, role } = req.body;

            if (!username || !password || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Username, password e role são obrigatórios'
                });
            }

            const result = userManager.addUser(username, password, role);
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Erro ao adicionar usuário:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }
);

/**
 * DELETE /users/:username
 * Remove um usuário (apenas admins)
 */
router.delete('/users/:username',
    userManager.requireAuth(),
    userManager.requirePermission('manage_users'),
    (req, res) => {
        try {
            const { username } = req.params;
            
            // Impede remoção do próprio usuário
            if (username === req.user.username) {
                return res.status(400).json({
                    success: false,
                    message: 'Você não pode remover seu próprio usuário'
                });
            }

            const result = userManager.removeUser(username);
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(404).json(result);
            }
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }
);

/**
 * PUT /users/:username/role
 * Altera role de um usuário (apenas admins)
 */
router.put('/users/:username/role',
    userManager.requireAuth(),
    userManager.requirePermission('manage_users'),
    (req, res) => {
        try {
            const { username } = req.params;
            const { role } = req.body;

            if (!role) {
                return res.status(400).json({
                    success: false,
                    message: 'Role é obrigatória'
                });
            }

            const result = userManager.changeUserRole(username, role);
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Erro ao alterar role:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }
);

/**
 * PUT /users/:username/password
 * Altera senha de um usuário
 */
router.put('/users/:username/password',
    userManager.requireAuth(),
    (req, res) => {
        try {
            const { username } = req.params;
            const { newPassword } = req.body;

            // Só admins podem alterar senha de outros usuários
            if (username !== req.user.username && !userManager.hasPermission(req.user.role, 'manage_users')) {
                return res.status(403).json({
                    success: false,
                    message: 'Você só pode alterar sua própria senha'
                });
            }

            if (!newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Nova senha é obrigatória'
                });
            }

            const result = userManager.changePassword(username, newPassword);
            
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }
);

// ==========================================
// ROTAS DE INFORMAÇÕES E ESTATÍSTICAS
// ==========================================

/**
 * GET /users/stats
 * Obtém estatísticas dos usuários
 */
router.get('/users/stats',
    userManager.requireAuth(),
    userManager.requirePermission('view_reports'),
    (req, res) => {
        try {
            const stats = userManager.getStats();
            res.json({
                success: true,
                stats: stats
            });
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }
);

/**
 * GET /users/roles
 * Lista as roles disponíveis
 */
router.get('/users/roles', userManager.requireAuth(), (req, res) => {
    res.json({
        success: true,
        roles: [
            {
                id: 'admin',
                name: 'Administrador',
                description: 'Acesso total ao sistema'
            },
            {
                id: 'supervisor',
                name: 'Supervisor',
                description: 'Gerenciamento de equipe e relatórios'
            },
            {
                id: 'attendant',
                name: 'Atendente',
                description: 'Atendimento aos clientes'
            },
            {
                id: 'viewer',
                name: 'Visualizador',
                description: 'Apenas visualização'
            }
        ]
    });
});

/**
 * GET /users/permissions/:role
 * Lista permissões de uma role
 */
router.get('/users/permissions/:role', userManager.requireAuth(), (req, res) => {
    const { role } = req.params;
    
    const allPermissions = [
        'view_dashboard',
        'manage_queue',
        'assign_tickets',
        'view_reports',
        'manage_attendants',
        'view_support_dashboard',
        'transfer_chats',
        'view_assigned_tickets',
        'update_tickets',
        'send_messages',
        'accept_chats',
        'view_queue',
        'view_basic_stats',
        'manage_users'
    ];

    const permissions = allPermissions.filter(permission => 
        userManager.hasPermission(role, permission)
    );

    res.json({
        success: true,
        role: role,
        permissions: permissions
    });
});

module.exports = router;
