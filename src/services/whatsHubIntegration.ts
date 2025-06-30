/**
 * 🚀 WhatsHub N8N Integration Service - FASE 1 COMPLETA
 * Serviço principal que implementa todos os recursos da FASE 1 de integração
 */

import { WhatsHubN8nIntegration } from './n8nApiService';

// Instância principal da integração - Singleton
export const whatsHubIntegration = new WhatsHubN8nIntegration();

// Inicialização automática quando o serviço for importado
whatsHubIntegration.connectSystems().then(results => {
  console.log('🔗 Sistemas conectados:', results);
}).catch(error => {
  console.error('❌ Erro na inicialização da integração:', error);
});

// Re-export para facilitar uso
export { WhatsHubN8nIntegration } from './n8nApiService';
export * from './n8nApiService';

// Verificar e expor status da integração
export const getIntegrationStatus = () => {
  return whatsHubIntegration.getIntegratedStatus();
};

// Método para testar conectividade
export const testConnectivity = () => {
  return whatsHubIntegration.testConnection();
};

// Método para sincronizar configurações
export const syncConfigurations = () => {
  return whatsHubIntegration.syncConfigurations();
};

// Método para executar workflows
export const executeWorkflow = (workflowId: string, data: any) => {
  return whatsHubIntegration.executeWorkflow(workflowId, data);
};

// Método para obter informações do ambiente
export const getEnvironment = () => {
  return whatsHubIntegration.getEnvironmentInfo();
};

export default whatsHubIntegration;
