import { z } from 'zod';

// Tipos e Esquemas
export type WorkflowCategory = 'customer_service' | 'sales' | 'support' | 'automation' | 'integration';

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: WorkflowCategory;
    version: string;
    author: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    workflow: {
        nodes: any[];
        connections: any[];
        settings: any;
    };
    metadata: {
        useCount: number;
        rating: number;
        reviews: number;
        isPublic: boolean;
        requirements: string[];
        compatibility: string[];
    };
    preview: {
        screenshot?: string;
        description: string;
        examples: any[];
    };
}

const WorkflowTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    category: z.enum(['customer_service', 'sales', 'support', 'automation', 'integration']),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Versão deve estar no formato x.y.z'),
    author: z.string().min(1, 'Autor é obrigatório'),
    createdAt: z.preprocess(arg => new Date(arg as string), z.date()),
    updatedAt: z.preprocess(arg => new Date(arg as string), z.date()),
    tags: z.array(z.string()),
    workflow: z.object({
        nodes: z.array(z.any()),
        connections: z.array(z.any()),
        settings: z.any()
    }),
    metadata: z.object({
        useCount: z.number().min(0),
        rating: z.number().min(0).max(5),
        reviews: z.number().min(0),
        isPublic: z.boolean(),
        requirements: z.array(z.string()),
        compatibility: z.array(z.string())
    }),
    preview: z.object({
        screenshot: z.string().url().optional(),
        description: z.string(),
        examples: z.array(z.any())
    })
});

export class WorkflowTemplateManager {
    private templates: Map<string, WorkflowTemplate> = new Map();
    private categories: Set<WorkflowCategory> = new Set();

    /**
     * Valida um template usando o esquema zod.
     */
    private validateTemplate(templateData: Record<string, unknown>): { isValid: boolean; errors: string[] } {
        const result = WorkflowTemplateSchema.safeParse(templateData);
        if (!result.success) {
            return {
                isValid: false,
                errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
            };
        }
        return { isValid: true, errors: [] };
    }

    /**
     * Clona profundamente um objeto.
     */
    private deepClone<T>(obj: T): T {
        return structuredClone ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));
    }

    /**
     * Cria um novo template a partir de um existente.
     */
    async cloneTemplate(templateId: string, newName: string): Promise<string> {
        const originalTemplate = this.templates.get(templateId);
        if (!originalTemplate) throw new Error(`Template ${templateId} não encontrado`);
        const clonedTemplate = this.deepClone(originalTemplate);
        clonedTemplate.name = newName;
        clonedTemplate.version = '1.0.0';
        clonedTemplate.author = 'Sistema';
        clonedTemplate.id = this.generateId();
        clonedTemplate.createdAt = new Date();
        clonedTemplate.updatedAt = new Date();
        clonedTemplate.metadata = {
            ...clonedTemplate.metadata,
            useCount: 0,
            rating: 0,
            reviews: 0,
            isPublic: false
        };
        const validation = this.validateTemplate(clonedTemplate as any);
        if (!validation.isValid) {
            throw new Error(`Erro de validação ao clonar template: ${validation.errors.join('; ')}`);
        }
        await this.createTemplate(clonedTemplate);
        return clonedTemplate.id;
    }

    /**
     * Serializa templates para JSON, convertendo datas para string ISO.
     */
    private serializeTemplates(): string {
        return JSON.stringify(
            Array.from(this.templates.values()).map(t => ({
                ...t,
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString()
            }))
        );
    }

    /**
     * Desserializa templates de JSON, convertendo datas para objetos Date.
     */
    private deserializeTemplates(json: string): WorkflowTemplate[] {
        const arr = JSON.parse(json);
        return arr.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt)
        }));
    }

    /**
     * Salva todos os templates no localStorage.
     */
    private async saveTemplates(): Promise<void> {
        try {
            localStorage.setItem('workflowTemplates', this.serializeTemplates());
        } catch (error) {
            this.logError('Erro ao salvar templates', error);
        }
    }

    /**
     * Inicializa o gerenciador, carregando templates do localStorage.
     */
    async initialize(): Promise<void> {
        try {
            const savedTemplates = localStorage.getItem('workflowTemplates');
            if (savedTemplates) {
                const templates = this.deserializeTemplates(savedTemplates);
                templates.forEach((template: WorkflowTemplate) => {
                    this.templates.set(template.id, template);
                    this.categories.add(template.category);
                });
            }
            if (this.templates.size === 0) {
                await this.loadDefaultTemplates();
            }
            this.logInfo(`✅ WorkflowTemplateManager inicializado com ${this.templates.size} templates`);
        } catch (error) {
            this.logError('Erro ao inicializar WorkflowTemplateManager', error);
        }
    }

    /**
     * Cria um novo template e salva.
     */
    async createTemplate(template: WorkflowTemplate): Promise<string> {
        const validation = this.validateTemplate(template as any);
        if (!validation.isValid) {
            throw new Error(`Erro de validação: ${validation.errors.join('; ')}`);
        }
        this.templates.set(template.id, template);
        this.categories.add(template.category);
        await this.saveTemplates();
        return template.id;
    }

    /**
     * Retorna todos os templates.
     */
    getAllTemplates(): WorkflowTemplate[] {
        return Array.from(this.templates.values());
    }

    /**
     * Gera um ID único.
     */
    private generateId(): string {
        return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);
    }

    /**
     * Carrega templates padrão (stub).
     */
    private async loadDefaultTemplates(): Promise<void> {
        // Implemente aqui o carregamento de templates padrão, se necessário.
        this.logInfo('Carregando templates padrão...');
    }

    /**
     * Logging estruturado.
     */
    private logInfo(message: string) {
        console.info(`[WorkflowTemplateManager] ${message}`);
    }
    private logError(message: string, error: unknown) {
        console.error(`[WorkflowTemplateManager] ${message}`, error);
    }
}
