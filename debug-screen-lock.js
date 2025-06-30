// Debug Script para Sistema de Bloqueio de Tela
// Execute no console do navegador para debug

console.log('🔒 Debug do Sistema de Bloqueio de Tela');

// Verificar localStorage
console.log('📦 LocalStorage:');
console.log('- Settings:', localStorage.getItem('whatsapp-hub-security'));
console.log('- Password Hash:', localStorage.getItem('whatsapp-hub-password-hash'));
console.log('- Last Activity:', localStorage.getItem('whatsapp-hub-last-activity'));

// Função para limpar dados (para teste)
window.clearLockData = () => {
  localStorage.removeItem('whatsapp-hub-security');
  localStorage.removeItem('whatsapp-hub-password-hash');
  localStorage.removeItem('whatsapp-hub-last-activity');
  console.log('🧹 Dados do bloqueio limpos! Recarregue a página.');
};

// Função para simular inatividade
window.simulateIdle = () => {
  const lastActivity = Date.now() - (2 * 60 * 1000); // 2 minutos atrás
  localStorage.setItem('whatsapp-hub-last-activity', lastActivity.toString());
  console.log('⏰ Simulada inatividade de 2 minutos. Recarregue a página.');
};

// Função para testar bloqueio manual
window.testManualLock = () => {
  // Disparar evento personalizado para testar
  window.dispatchEvent(new CustomEvent('test-lock'));
  console.log('🔒 Evento de teste de bloqueio manual disparado');
};

console.log('🛠️ Funções disponíveis:');
console.log('- clearLockData() - Limpar dados de teste');
console.log('- simulateIdle() - Simular inatividade');
console.log('- testManualLock() - Testar bloqueio manual');

// Verificar se há React DevTools
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('⚛️ React DevTools detectado');
} else {
  console.log('❌ React DevTools não encontrado');
}

// Status do sistema
console.log('🔒 Para debug em tempo real, abra as Configurações > Segurança');
console.log('📱 Configure o bloqueio de tela e observe os logs no console');
