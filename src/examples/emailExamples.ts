// 🚀 EXEMPLOS PRÁTICOS DE USO DO SISTEMA DE EMAIL EMAILJS
// Sistema 100% funcional - use estes exemplos em seu código

import { emailService } from '@/services/emailService';
import { dashboardNotificationService } from '@/services/dashboardNotificationService';

// =============================================================================
// 1. CONFIGURAÇÃO INICIAL (Execute uma vez)
// =============================================================================

export const configurarEmailJS = () => {
  // Placeholder: configuração não é necessária para MailerSend
  return true;
};

// =============================================================================
// 2. EXEMPLOS DE USO - RELATÓRIOS DE PROBLEMAS
// =============================================================================

export const exemploRelatorioProblema = async () => {
  const dadosRelatorio = {
    id: 'REP-' + Date.now(),
    type: 'bug',
    priority: 'high',
    title: 'Erro na tela de login',
    description: 'Usuário não consegue fazer login no sistema',
    userInfo: {
      name: 'João Silva',
      email: 'joao@email.com',
      company: 'Empresa ABC'
    },
    systemInfo: {
      browser: 'Chrome 122',
      os: 'Windows 11',
      url: window.location.href
    }
  };

  try {
    const resultado = await emailService.sendReportEmail(dadosRelatorio);
    
    if (resultado.success) {
      console.log('📧 Relatório enviado!', resultado.emailId);
      // Auto-resposta será enviada automaticamente se configurada
    }
    
    return resultado;
  } catch (error) {
    console.error('❌ Erro ao enviar relatório:', error);
  }
};

// =============================================================================
// 3. EXEMPLOS DE USO - NOTIFICAÇÕES DE BOTS
// =============================================================================

export const exemploNotificacoesBots = async () => {
  // Bot conectado
  await dashboardNotificationService.notifyBotConnected('bot123', 'MeuBot WhatsApp');

  // Bot desconectado
  await dashboardNotificationService.notifyBotDisconnected('bot123', 'MeuBot WhatsApp', 'Conexão perdida');

  // Nova mensagem recebida
  await dashboardNotificationService.notifyNewMessage('bot123', '+5511999999999', 'Olá, preciso de ajuda');

  // Erro no bot
  await dashboardNotificationService.notifyError('WhatsApp API', new Error('Falha na conexão'), 'bot123');

  console.log('🔔 Notificações de bot enviadas!');
};

// =============================================================================
// 4. EXEMPLOS DE USO - EMAILS DE BOAS-VINDAS
// =============================================================================

export const exemploBoasVindas = async (novoUsuario: { email: string, nome: string }) => {
  try {
    const resultado = await emailService.sendWelcomeEmail(
      novoUsuario.email,
      novoUsuario.nome,
      {
        getting_started_link: 'https://seusite.com/inicio',
        support_email: 'suporte@seusite.com'
      }
    );

    if (resultado.success) {
      console.log('🎉 Email de boas-vindas enviado para', novoUsuario.nome);
    }

    return resultado;
  } catch (error) {
    console.error('❌ Erro ao enviar boas-vindas:', error);
  }
};

// =============================================================================
// 5. EXEMPLOS DE USO - ALERTAS DE SEGURANÇA
// =============================================================================

export const exemploAlertaSeguranca = async (usuarioEmail: string) => {
  try {
    const resultado = await emailService.sendSecurityNotification(
      usuarioEmail,
      'Login de Novo Dispositivo',
      'Detectamos um login de um dispositivo não reconhecido em sua conta',
      true // Requer ação do usuário
    );

    if (resultado.success) {
      console.log('🔒 Alerta de segurança enviado!');
    }

    return resultado;
  } catch (error) {
    console.error('❌ Erro ao enviar alerta de segurança:', error);
  }
};

// =============================================================================
// 6. EXEMPLOS DE USO - EMAILS AGENDADOS
// =============================================================================

export const exemploEmailAgendado = () => {
  // Agendar email para 1 hora no futuro
  const dataAgendamento = new Date();
  dataAgendamento.setHours(dataAgendamento.getHours() + 1);

  const emailId = emailService.scheduleEmail(
    'template_welcome',
    {
      user_name: 'Maria Santos',
      welcome_date: new Date().toLocaleDateString('pt-BR'),
      getting_started_link: 'https://seusite.com/inicio'
    },
    'maria@email.com',
    dataAgendamento,
    8 // Alta prioridade
  );

  console.log('⏰ Email agendado:', emailId, 'para', dataAgendamento.toLocaleString());
  
  return emailId;
};

// =============================================================================
// 7. EXEMPLOS DE USO - CAMPANHAS DE EMAIL
// =============================================================================

export const exemploCampanha = async () => {
  // Criar campanha
  const campanhaId = emailService.createCampaign(
    'Newsletter Semanal',
    'Nossa newsletter com as últimas novidades',
    'template_newsletter',
    [
      'usuario1@email.com',
      'usuario2@email.com', 
      'usuario3@email.com'
    ]
  );

  console.log('📢 Campanha criada:', campanhaId);

  // Enviar campanha
  try {
    const sucesso = await emailService.sendCampaign(campanhaId, {
      newsletter_title: 'Novidades da Semana',
      newsletter_content: 'Confira as últimas atualizações e melhorias...',
      newsletter_date: new Date().toLocaleDateString('pt-BR')
    });

    if (sucesso) {
      console.log('📧 Campanha enviada com sucesso!');
    }

    return sucesso;
  } catch (error) {
    console.error('❌ Erro ao enviar campanha:', error);
  }
};

// =============================================================================
// 8. EXEMPLOS DE USO - AUTO-RESPOSTAS
// =============================================================================

export const exemploAutoRespostas = () => {
  // Configurar auto-resposta para satisfação baixa
  const regraId1 = emailService.createAutoResponseRule(
    'Resposta para Satisfação Baixa',
    'error_report',
    'template_confirmation',
    10, // 10 minutos de delay
    'satisfaction < 3'
  );

  // Configurar auto-resposta para novos usuários
  const regraId2 = emailService.createAutoResponseRule(
    'Follow-up Boas-vindas',
    'new_user',
    'template_welcome',
    24 * 60, // 24 horas = 1440 minutos
    '' // Sem condição específica
  );

  console.log('🤖 Auto-respostas configuradas:', { regraId1, regraId2 });

  return { regraId1, regraId2 };
};

// =============================================================================
// 9. EXEMPLOS DE USO - MONITORAMENTO E ANALYTICS
// =============================================================================

export const exemploAnalytics = () => {
  // Obter estatísticas básicas
  const stats = emailService.getEmailStats();
  console.log('📊 Estatísticas básicas:', stats);

  // Obter relatório avançado
  const relatorioAvancado = emailService.getAdvancedEmailReport();
  console.log('📈 Relatório avançado:', relatorioAvancado);

  // Obter templates disponíveis
  const templates = emailService.getAvailableTemplates();
  console.log('📝 Templates disponíveis:', templates.length);

  // Obter campanhas
  const campanhas = emailService.getCampaigns();
  console.log('📢 Campanhas:', campanhas.length);

  return {
    stats,
    relatorioAvancado,
    totalTemplates: templates.length,
    totalCampanhas: campanhas.length
  };
};

// =============================================================================
// 10. EXEMPLOS DE USO - RELATÓRIOS AUTOMÁTICOS DO SISTEMA
// =============================================================================

export const exemploRelatoriosAutomaticos = async () => {
  try {
    // Enviar relatório diário
    const relatorioDiario = await dashboardNotificationService.sendDailyReport();
    console.log('📊 Relatório diário:', relatorioDiario ? 'Enviado' : 'Falhou');

    // Enviar relatório de performance semanal
    const relatorioSemanal = await dashboardNotificationService.sendWeeklyPerformanceReport();
    console.log('📈 Relatório semanal:', relatorioSemanal ? 'Enviado' : 'Falhou');

    return { relatorioDiario, relatorioSemanal };
  } catch (error) {
    console.error('❌ Erro ao enviar relatórios automáticos:', error);
  }
};

// =============================================================================
// 11. EXEMPLOS DE USO - INTEGRAÇÃO COM EVENTOS DO SISTEMA
// =============================================================================

export const exemploIntegracaoEventos = async () => {
  // Quando usuário faz login
  const onUserLogin = async (userId: string, userAgent: string) => {
    await dashboardNotificationService.notifyUserLogin(userId, userAgent);
  };

  // Quando há um alerta de segurança
  const onSecurityAlert = async (alertType: string, description: string) => {
    await dashboardNotificationService.notifySecurityAlert(alertType, description, 'warning');
  };

  // Quando manutenção é iniciada
  const onMaintenanceStart = async (duration: string, reason: string) => {
    await dashboardNotificationService.notifyMaintenanceStarted(duration, reason);
  };

  // Quando manutenção termina
  const onMaintenanceEnd = async (actualDuration: string) => {
    await dashboardNotificationService.notifyMaintenanceEnded(actualDuration);
  };

  console.log('🔗 Funções de integração configuradas');

  return {
    onUserLogin,
    onSecurityAlert,
    onMaintenanceStart,
    onMaintenanceEnd
  };
};

// =============================================================================
// 12. EXEMPLO COMPLETO - FLUXO DE NOVO USUÁRIO
// =============================================================================

export const exemploFluxoNovoUsuario = async (dadosUsuario: {
  nome: string;
  email: string;
  empresa?: string;
}) => {
  console.log('🚀 Iniciando fluxo completo para novo usuário:', dadosUsuario.nome);

  try {
    // 1. Enviar email de boas-vindas imediato
    const boasVindas = await exemploBoasVindas(dadosUsuario);
    
    // 2. Executar auto-resposta para novos usuários
    await emailService.executeAutoResponse('new_user', {
      userEmail: dadosUsuario.email,
      userName: dadosUsuario.nome,
      registrationDate: new Date().toISOString()
    });

    // 3. Agendar email de follow-up para 3 dias
    const dataFollowUp = new Date();
    dataFollowUp.setDate(dataFollowUp.getDate() + 3);
    
    const followUpId = emailService.scheduleEmail(
      'template_confirmation',
      {
        user_email: dadosUsuario.email,
        action_performed: 'Cadastro realizado com sucesso',
        confirmation_date: new Date().toLocaleDateString('pt-BR'),
        follow_up: true
      },
      dadosUsuario.email,
      dataFollowUp
    );

    // 4. Registrar evento no sistema
    await dashboardNotificationService.notifyUserLogin(
      dadosUsuario.email,
      navigator.userAgent
    );

    console.log('✅ Fluxo completo executado:', {
      boasVindas: boasVindas?.success,
      followUpAgendado: followUpId
    });

    return {
      success: true,
      boasVindasId: boasVindas?.emailId,
      followUpId
    };

  } catch (error) {
    console.error('❌ Erro no fluxo do novo usuário:', error);
    return { success: false, error };
  }
};

// =============================================================================
// 13. UTILITÁRIOS PARA TESTES
// =============================================================================

export const testarSistemaCompleto = async () => {
  console.log('🧪 Iniciando teste completo do sistema de email...');

  const resultados = {
    configuracao: false,
    relatorio: false,
    boasVindas: false,
    seguranca: false,
    agendamento: false,
    analytics: false
  };

  try {
    // Teste 1: Configuração
    resultados.configuracao = emailService.isConfigured();
    console.log('1️⃣ Configuração:', resultados.configuracao ? '✅' : '❌');

    if (!resultados.configuracao) {
      console.log('⚠️ Configure o EmailJS primeiro!');
      return resultados;
    }

    // Teste 2: Relatório básico
    const relatorio = await emailService.testEmailConfiguration();
    resultados.relatorio = relatorio.success;
    console.log('2️⃣ Teste básico:', resultados.relatorio ? '✅' : '❌');

    // Teste 3: Email de boas-vindas
    const boasVindas = await emailService.sendWelcomeEmail(
      'teste@email.com',
      'Usuário Teste'
    );
    resultados.boasVindas = boasVindas.success;
    console.log('3️⃣ Boas-vindas:', resultados.boasVindas ? '✅' : '❌');

    // Teste 4: Alerta de segurança
    const seguranca = await emailService.sendSecurityNotification(
      'teste@email.com',
      'Teste de Segurança',
      'Este é um teste do sistema de alertas',
      false
    );
    resultados.seguranca = seguranca.success;
    console.log('4️⃣ Segurança:', resultados.seguranca ? '✅' : '❌');

    // Teste 5: Email agendado
    const agendado = exemploEmailAgendado();
    resultados.agendamento = !!agendado;
    console.log('5️⃣ Agendamento:', resultados.agendamento ? '✅' : '❌');

    // Teste 6: Analytics
    const analytics = exemploAnalytics();
    resultados.analytics = !!analytics;
    console.log('6️⃣ Analytics:', resultados.analytics ? '✅' : '❌');

    console.log('🎉 Teste completo finalizado!', resultados);
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }

  return resultados;
};

// =============================================================================
// EXPORTAÇÕES PARA USO FÁCIL
// =============================================================================

export const EmailExamples = {
  configurar: configurarEmailJS,
  relatorio: exemploRelatorioProblema,
  bots: exemploNotificacoesBots,
  boasVindas: exemploBoasVindas,
  seguranca: exemploAlertaSeguranca,
  agendado: exemploEmailAgendado,
  campanha: exemploCampanha,
  autoRespostas: exemploAutoRespostas,
  analytics: exemploAnalytics,
  relatoriosAuto: exemploRelatoriosAutomaticos,
  integracaoEventos: exemploIntegracaoEventos,
  fluxoCompleto: exemploFluxoNovoUsuario,
  testarTudo: testarSistemaCompleto
};

// Como usar:
// import { EmailExamples } from './emailExamples';
// 
// // Configurar uma vez
// EmailExamples.configurar();
// 
// // Usar as funcionalidades
// EmailExamples.boasVindas({ email: 'user@email.com', nome: 'João' });
// EmailExamples.testarTudo();

export default EmailExamples;
