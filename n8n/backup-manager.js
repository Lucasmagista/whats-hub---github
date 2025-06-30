/**
 * Gerenciador de Backup e Recuperação
 * Sistema avançado para backup de dados críticos
 */

const fs = require('fs');
const path = require('path');

class BackupManager {
    constructor(config = {}) {
        this.backupDir = config.backupDir || './backups';
        this.maxBackups = config.maxBackups || 10;
        this.backupInterval = config.backupInterval || 30 * 60 * 1000; // 30 minutos
        this.compression = config.compression || false;
        
        this.ensureBackupDirectory();
        this.startAutomaticBackup();
    }
    
    ensureBackupDirectory() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
            console.log(`📁 Diretório de backup criado: ${this.backupDir}`);
        }
    }
    
    async createBackup(data, label = 'system') {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${label}-backup-${timestamp}.json`;
            const filepath = path.join(this.backupDir, filename);
            
            const backupData = {
                timestamp: new Date().toISOString(),
                label: label,
                version: '1.0.0',
                data: data,
                metadata: {
                    size: JSON.stringify(data).length,
                    entries: Array.isArray(data) ? data.length : Object.keys(data).length
                }
            };
            
            fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
            
            console.log(`💾 Backup criado: ${filename}`);
            this.cleanOldBackups(label);
            
            return {
                success: true,
                filename: filename,
                filepath: filepath,
                size: backupData.metadata.size
            };
            
        } catch (error) {
            console.error('❌ Erro ao criar backup:', error);
            return { success: false, error: error.message };
        }
    }
    
    async restoreBackup(filename) {
        try {
            const filepath = path.join(this.backupDir, filename);
            
            if (!fs.existsSync(filepath)) {
                throw new Error(`Arquivo de backup não encontrado: ${filename}`);
            }
            
            const backupContent = fs.readFileSync(filepath, 'utf8');
            const backupData = JSON.parse(backupContent);
            
            console.log(`🔄 Restaurando backup: ${filename}`);
            console.log(`📅 Data do backup: ${backupData.timestamp}`);
            console.log(`🏷️ Label: ${backupData.label}`);
            
            return {
                success: true,
                data: backupData.data,
                metadata: backupData.metadata,
                timestamp: backupData.timestamp
            };
            
        } catch (error) {
            console.error('❌ Erro ao restaurar backup:', error);
            return { success: false, error: error.message };
        }
    }
    
    listBackups(label = null) {
        try {
            const files = fs.readdirSync(this.backupDir);
            const backups = files
                .filter(file => file.endsWith('.json'))
                .filter(file => !label || file.includes(`${label}-backup-`))
                .map(file => {
                    const filepath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filepath);
                    
                    try {
                        const content = fs.readFileSync(filepath, 'utf8');
                        const data = JSON.parse(content);
                        
                        return {
                            filename: file,
                            label: data.label || 'unknown',
                            timestamp: data.timestamp || stats.mtime.toISOString(),
                            size: stats.size,
                            entries: data.metadata?.entries || 0
                        };
                    } catch {
                        return {
                            filename: file,
                            label: 'unknown',
                            timestamp: stats.mtime.toISOString(),
                            size: stats.size,
                            entries: 0,
                            corrupted: true
                        };
                    }
                })
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
            return backups;
            
        } catch (error) {
            console.error('❌ Erro ao listar backups:', error);
            return [];
        }
    }
    
    cleanOldBackups(label) {
        try {
            const backups = this.listBackups(label);
            
            if (backups.length > this.maxBackups) {
                const toDelete = backups.slice(this.maxBackups);
                
                toDelete.forEach(backup => {
                    const filepath = path.join(this.backupDir, backup.filename);
                    fs.unlinkSync(filepath);
                    console.log(`🗑️ Backup antigo removido: ${backup.filename}`);
                });
            }
            
        } catch (error) {
            console.error('❌ Erro ao limpar backups antigos:', error);
        }
    }
    
    startAutomaticBackup() {
        setInterval(() => {
            this.createSystemBackup();
        }, this.backupInterval);
        
        console.log(`⏰ Backup automático configurado para cada ${Math.floor(this.backupInterval / 60000)} minutos`);
    }
    
    createSystemBackup() {
        // Este método será sobrescrito pela aplicação principal
        console.log('🔄 Backup automático executado');
    }
    
    getStorageInfo() {
        try {
            const backups = this.listBackups();
            const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
            
            return {
                totalBackups: backups.length,
                totalSize: totalSize,
                totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
                oldestBackup: backups.length > 0 ? backups[backups.length - 1].timestamp : null,
                newestBackup: backups.length > 0 ? backups[0].timestamp : null
            };
            
        } catch (error) {
            console.error('❌ Erro ao obter informações de armazenamento:', error);
            return null;
        }
    }
    
    async exportBackups(format = 'json') {
        try {
            const backups = this.listBackups();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            
            if (format === 'json') {
                const exportData = {
                    exportTimestamp: new Date().toISOString(),
                    totalBackups: backups.length,
                    backups: backups
                };
                
                const filename = `backup-export-${timestamp}.json`;
                const filepath = path.join(this.backupDir, filename);
                
                fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
                
                return {
                    success: true,
                    filename: filename,
                    filepath: filepath,
                    totalBackups: backups.length
                };
            }
            
            throw new Error(`Formato de exportação não suportado: ${format}`);
            
        } catch (error) {
            console.error('❌ Erro ao exportar backups:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = BackupManager;
