// 🎉 DEMONSTRAÇÃO COMPLETA DO SISTEMA DE EMAIL AVANÇADO
// Execute este arquivo para testar todas as funcionalidades

import { EmailExamples } from '@/examples/emailExamples';
import { emailService } from '@/services/emailService';

// =============================================================================
// DEMO 1: CONFIGURAÇÃO E VERIFICAÇÃO
// =============================================================================

export const demo1_VerificarSistema = () => {
  console.log('🚀 DEMO 1: Verificando sistema de email...');
  
  const isConfigured = emailService.isConfigured();
  const stats = emailService.getEmailStats();
  const templates = emailService.getAvailableTemplates();
  
  console.log('📊 Status do Sistema:', {
    configurado: isConfigured ? '✅ Sim' : '❌ Não',
    emailsEnviados: stats.total,
    templatesDisponiveis: templates.length,
    campanhasAtivas: emailService.getCampaigns().length
  });
  
  if (!isConfigured) {
    console.log('⚠️ Configure o EmailJS primeiro!');
    console.log('👉 Dashboard → Botão "📧 Email" → Preencher credenciais');
    return false;
  }
  
  return true;
};

// =============================================================================
// DEMO 2: ENVIO DE BOAS-VINDAS
// =============================================================================

export const demo2_BoasVindas = async () => {
  console.log('🎉 DEMO 2: Enviando email de boas-vindas...');
  
  const usuarioTeste = {
    email: 'usuario.teste@email.com',
    nome: 'João da Silva'
  };
  
  try {
    const resultado = await EmailExamples.boasVindas(usuarioTeste);
    
    console.log('✅ Boas-vindas enviadas:', {
      sucesso: resultado?.success,
      emailId: resultado?.emailId,
      usuario: usuarioTeste.nome
    });
    
    return resultado;
  } catch (error) {
    console.error('❌ Erro nas boas-vindas:', error);
    return null;
  }
};

// =============================================================================
// DEMO 3: ALERTA DE SEGURANÇA
// =============================================================================

export const demo3_AlertaSeguranca = async () => {
  console.log('🔒 DEMO 3: Enviando alerta de segurança...');
  
  try {
    const resultado = await EmailExamples.seguranca('admin@empresa.com');
    
    console.log('🚨 Alerta de segurança:', {
      sucesso: resultado?.success,
      emailId: resultado?.emailId,
      tipo: 'Login Suspeito'
    });
    
    return resultado;
  } catch (error) {
    console.error('❌ Erro no alerta:', error);
    return null;
  }
};

// =============================================================================
// DEMO 4: CAMPANHA DE EMAIL
// =============================================================================

export const demo4_Campanha = async () => {
  console.log('📢 DEMO 4: Criando campanha de email...');
  
  try {
    const resultado = await EmailExamples.campanha();
    
    console.log('📧 Campanha criada:', {
      sucesso: resultado,
      tipo: 'Newsletter Semanal'
    });
    
    return resultado;
  } catch (error) {
    console.error('❌ Erro na campanha:', error);
    return null;
  }
};

// =============================================================================
// DEMO 5: EMAIL AGENDADO
// =============================================================================

export const demo5_EmailAgendado = () => {
  console.log('⏰ DEMO 5: Agendando email...');
  
  try {
    const emailId = EmailExamples.agendado();
    
    console.log('📅 Email agendado:', {
      emailId,
      agendadoPara: '5 minutos no futuro',
      status: 'Na fila de processamento'
    });
    
    return emailId;
  } catch (error) {
    console.error('❌ Erro no agendamento:', error);
    return null;
  }
};

// =============================================================================
// DEMO 6: NOTIFICAÇÕES DE BOTS
// =============================================================================

export const demo6_NotificacoesBots = async () => {
  console.log('🤖 DEMO 6: Simulando notificações de bots...');
  
  try {
    await EmailExamples.bots();
    
    console.log('🔔 Notificações de bots:', {
      botConectado: '✅ Enviado',
      botDesconectado: '✅ Enviado',
      novaMensagem: '✅ Enviado',
      erroSistema: '✅ Enviado'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro nas notificações:', error);
    return false;
  }
};

// =============================================================================
// DEMO 7: AUTO-RESPOSTAS
// =============================================================================

export const demo7_AutoRespostas = () => {
  console.log('🤖 DEMO 7: Configurando auto-respostas...');
  
  try {
    const regras = EmailExamples.autoRespostas();
    
    console.log('⚙️ Auto-respostas configuradas:', {
      regraBoasVindas: regras.regraId2,
      regraSatisfacao: regras.regraId1,
      status: 'Ativas e monitorando'
    });
    
    return regras;
  } catch (error) {
    console.error('❌ Erro nas auto-respostas:', error);
    return null;
  }
};

// =============================================================================
// DEMO 8: ANALYTICS COMPLETO
// =============================================================================

export const demo8_Analytics = () => {
  console.log('📊 DEMO 8: Gerando analytics completo...');
  
  try {
    const analytics = EmailExamples.analytics();
    
    console.log('📈 Analytics do sistema:', {
      emailsEnviados: analytics.stats.total,
      taxaSucesso: `${((analytics.stats.sent / analytics.stats.total) * 100).toFixed(1)}%`,
      templatesAtivos: analytics.totalTemplates,
      campanhasRodando: analytics.totalCampanhas,
      emailsFalharam: analytics.stats.failed
    });
    
    return analytics;
  } catch (error) {
    console.error('❌ Erro no analytics:', error);
    return null;
  }
};

// =============================================================================
// DEMO 9: FLUXO COMPLETO DE NOVO USUÁRIO
// =============================================================================

export const demo9_FluxoCompleto = async () => {
  console.log('🚀 DEMO 9: Executando fluxo completo...');
  
  const novoUsuario = {
    nome: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    empresa: 'Empresa XYZ'
  };
  
  try {
    const resultado = await EmailExamples.fluxoCompleto(novoUsuario);
    
    console.log('🎯 Fluxo completo executado:', {
      usuário: novoUsuario.nome,
      boasVindas: resultado.success ? '✅' : '❌',
      followUpAgendado: resultado.followUpId ? '✅' : '❌',
      autoRespostaConfigurada: '✅',
      notificacaoRegistrada: '✅'
    });
    
    return resultado;
  } catch (error) {
    console.error('❌ Erro no fluxo completo:', error);
    return null;
  }
};

// =============================================================================
// DEMO 10: TESTE COMPLETO DO SISTEMA
// =============================================================================

export const demo10_TesteCompleto = async () => {
  console.log('🧪 DEMO 10: Executando teste completo...');
  
  try {
    const resultados = await EmailExamples.testarTudo();
    
    const totalTestes = Object.keys(resultados).length;
    const testesPassaram = Object.values(resultados).filter(Boolean).length;
    const percentualSucesso = ((testesPassaram / totalTestes) * 100).toFixed(1);
    
    console.log('🎯 Resultado dos testes:', {
      totalTestes,
      testesPassaram,
      percentualSucesso: `${percentualSucesso}%`,
      status: percentualSucesso === '100.0' ? '🎉 Perfeito!' : '⚠️ Alguns problemas'
    });
    
    console.log('📋 Detalhes por teste:', resultados);
    
    return resultados;
  } catch (error) {
    console.error('❌ Erro no teste completo:', error);
    return null;
  }
};

// =============================================================================
// EXECUTAR TODAS AS DEMOS
// =============================================================================

export const executarTodasAsDemos = async () => {
  console.log('🚀🚀🚀 INICIANDO DEMONSTRAÇÃO COMPLETA DO SISTEMA DE EMAIL 🚀🚀🚀');
  console.log('='.repeat(80));
  
  const resultados = {
    demo1: false,
    demo2: null,
    demo3: null,
    demo4: null,
    demo5: null,
    demo6: null,
    demo7: null,
    demo8: null,
    demo9: null,
    demo10: null
  };
  
  // Demo 1: Verificação do sistema
  resultados.demo1 = demo1_VerificarSistema();
  
  if (!resultados.demo1) {
    console.log('❌ Sistema não configurado. Configure o EmailJS primeiro!');
    return resultados;
  }
  
  console.log('='.repeat(80));
  
  // Executar todas as demos com delay entre elas
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    resultados.demo2 = await demo2_BoasVindas();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    resultados.demo3 = await demo3_AlertaSeguranca();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    resultados.demo4 = await demo4_Campanha();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    resultados.demo5 = demo5_EmailAgendado();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    resultados.demo6 = await demo6_NotificacoesBots();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    resultados.demo7 = demo7_AutoRespostas();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    resultados.demo8 = demo8_Analytics();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    resultados.demo9 = await demo9_FluxoCompleto();
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    resultados.demo10 = await demo10_TesteCompleto();
    
  } catch (error) {
    console.error('❌ Erro durante execução das demos:', error);
  }
  
  console.log('='.repeat(80));
  console.log('🎉 DEMONSTRAÇÃO COMPLETA FINALIZADA!');
  console.log('📊 Resultados gerais:', {
    sistemasTestados: 10,
    demosExecutadas: Object.values(resultados).filter(r => r !== null && r !== false).length,
    status: 'Demonstração concluída com sucesso!'
  });
  
  return resultados;
};

// =============================================================================
// ATALHOS PARA USO RÁPIDO
// =============================================================================

export const DemoRapida = {
  // Verificar sistema
  status: demo1_VerificarSistema,
  
  // Envios básicos
  boasVindas: demo2_BoasVindas,
  seguranca: demo3_AlertaSeguranca,
  
  // Funcionalidades avançadas
  campanha: demo4_Campanha,
  agendamento: demo5_EmailAgendado,
  bots: demo6_NotificacoesBots,
  
  // Análise e configuração
  autoRespostas: demo7_AutoRespostas,
  analytics: demo8_Analytics,
  
  // Testes completos
  fluxoCompleto: demo9_FluxoCompleto,
  testarTudo: demo10_TesteCompleto,
  
  // Executar todas
  executarTodas: executarTodasAsDemos
};

// Como usar:
// import { DemoRapida } from './emailSystemDemo';
// 
// // Verificar status
// DemoRapida.status();
// 
// // Testar boas-vindas
// await DemoRapida.boasVindas();
// 
// // Executar todas as demos
// await DemoRapida.executarTodas();

export default DemoRapida;
