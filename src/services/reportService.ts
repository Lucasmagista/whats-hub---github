import { emailService } from './emailService';

export interface ReportData {
  id?: string;
  type: string;
  priority: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  frequency: string;
  impact: string;
  category: string;
  tags: string[];
  attachments: Array<{
    file: File;
    name: string;
    size: number;
    type: string;
    preview?: string;
  }>;
  userInfo: {
    name: string;
    email: string;
    phone: string;
    company: string;
    role: string;
    experience: string;
  };
  systemInfo: {
    userAgent: string;
    platformInfo: string;
    language: string;
    screenResolution: string;
    timestamp: string;
    url: string;
    browserInfo: {
      name: string;
      version: string;
      engine: string;
    };
    deviceInfo: {
      type: 'desktop' | 'mobile' | 'tablet';
      os: string;
      screen: string;
      memory?: number;
      cores?: number;
    };
    networkInfo: {
      connection?: string;
      downlink?: number;
      effectiveType?: string;
    };
    performanceInfo: {
      loadTime: number;
      renderTime: number;
    };
  };
  satisfaction: number;
  improvements: string;
  contact: boolean;
  estimatedResolution?: string;
  submittedAt?: string;
  status?: string;
}

export interface ReportApiResponse {
  success: boolean;
  data?: unknown;
  message?: string;
  reportId?: string;
}

export class ReportService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl = '/api', timeout = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  // Enviar relatório via API backend
  async submitReportToAPI(reportData: ReportData): Promise<ReportApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { 
        success: true, 
        data: result,
        reportId: result.id || result.reportId
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
  // Enviar relatório com fallback (tenta API primeiro, depois email)
  async submitReport(reportData: ReportData): Promise<ReportApiResponse> {
    try {
      // Tentar enviar via API primeiro
      const apiResponse = await this.submitReportToAPI(reportData);
      return apiResponse;
    } catch (apiError) {
      console.warn('Falha no envio via API, tentando email:', apiError);
      
      // Se a API falhar, usar o novo emailService
      try {
        const emailResponse = await emailService.sendReportEmail(reportData);
        return {
          success: emailResponse.success,
          message: (emailResponse.message || '') + ' (API indisponível, enviado por email)',
          reportId: reportData.id,
          data: emailResponse.data
        };
      } catch (emailError) {
        return {
          success: false,
          message: 'Erro ao enviar relatório tanto via API quanto por email. Tente novamente mais tarde.'
        };
      }
    }
  }

  // Enviar anexos via FormData (para APIs que suportam upload)
  async submitReportWithAttachments(reportData: ReportData): Promise<ReportApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout * 2); // Timeout maior para uploads

    try {
      const formData = new FormData();
      
      // Adicionar dados do relatório
      formData.append('reportData', JSON.stringify({
        ...reportData,
        attachments: undefined // Remover attachments do JSON
      }));

      // Adicionar arquivos
      reportData.attachments.forEach((attachment, index) => {
        formData.append(`attachment_${index}`, attachment.file, attachment.name);
      });

      const response = await fetch(`${this.baseUrl}/reports/with-attachments`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { 
        success: true, 
        data: result,
        reportId: result.id || result.reportId
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Upload timeout');
      }
      throw error;
    }  }

  // Utilitários privados
  private getSatisfactionText(rating: number): string {
    const ratings = {
      0: "Nao avaliado",
      1: "Muito insatisfeito",
      2: "Insatisfeito", 
      3: "Neutro",
      4: "Satisfeito",
      5: "Muito satisfeito"
    };
    return ratings[rating as keyof typeof ratings] || "Nao avaliado";
  }

  private getPriorityClass(priority: string): string {
    const priorityClasses = {
      'low': 'priority-baixa',
      'medium': 'priority-media',
      'high': 'priority-alta',
      'critical': 'priority-alta'
    };
    return priorityClasses[priority as keyof typeof priorityClasses] || '';
  }
  private formatSystemInfo(systemInfo: ReportData['systemInfo']): string {
    if (!systemInfo) {
      return 'Informações do sistema não disponíveis';
    }

    try {
      return `Browser: ${systemInfo.browserInfo?.name || 'Desconhecido'} ${systemInfo.browserInfo?.version || ''}
OS: ${systemInfo.deviceInfo?.os || 'Desconhecido'}
Dispositivo: ${systemInfo.deviceInfo?.type || 'Desconhecido'}
Resolução: ${systemInfo.screenResolution || 'Não informada'}
Idioma: ${systemInfo.language || 'Não informado'}
URL: ${systemInfo.url || 'Não informada'}
Timestamp: ${systemInfo.timestamp || 'Não informado'}
User Agent: ${systemInfo.userAgent || 'Não informado'}`.trim();
    } catch (error) {
      return 'Erro ao formatar informações do sistema';
    }
  }

  // Configurações
  setApiBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }
}

// Instância padrão do serviço
export const reportService = new ReportService();
