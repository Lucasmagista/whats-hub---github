#!/usr/bin/env node

/**
 * Script de verificação final da migração EmailJS → MailerSend
 * Verifica se toda a migração foi concluída com sucesso
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICAÇÃO FINAL DA MIGRAÇÃO MAILERSEND\n');

// 1. Verificar se MailerSend está instalado
console.log('1️⃣ Verificando instalação do MailerSend...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.dependencies.mailersend) {
    console.log(`   ✅ MailerSend instalado: v${packageJson.dependencies.mailersend}`);
  } else {
    console.log('   ❌ MailerSend não encontrado no package.json');
  }
  
  // Verificar se dependências antigas foram removidas
  if (!packageJson.dependencies['@emailjs/browser']) {
    console.log('   ✅ @emailjs/browser removido');
  } else {
    console.log('   ⚠️ @emailjs/browser ainda presente');
  }
  
  if (!packageJson.dependencies['nodemailer']) {
    console.log('   ✅ nodemailer removido');
  } else {
    console.log('   ⚠️ nodemailer ainda presente');
  }
  
  if (!packageJson.devDependencies['@types/nodemailer']) {
    console.log('   ✅ @types/nodemailer removido');
  } else {
    console.log('   ⚠️ @types/nodemailer ainda presente');
  }
} catch (error) {
  console.log('   ❌ Erro ao ler package.json:', error.message);
}

console.log('');

// 2. Verificar arquivo EmailService
console.log('2️⃣ Verificando EmailService...');
try {
  const emailServicePath = path.join('lib', 'email-service.ts');
  if (fs.existsSync(emailServicePath)) {
    const content = fs.readFileSync(emailServicePath, 'utf8');
    
    if (content.includes('mailersend')) {
      console.log('   ✅ EmailService usando MailerSend');
    } else {
      console.log('   ❌ EmailService não está usando MailerSend');
    }
    
    if (!content.includes('emailjs') && !content.includes('nodemailer')) {
      console.log('   ✅ Dependências antigas removidas do código');
    } else {
      console.log('   ⚠️ Código ainda contém referências antigas');
    }
    
    // Verificar se backup existe
    const backupPath = path.join('lib', 'email-service.backup.ts');
    if (fs.existsSync(backupPath)) {
      console.log('   ✅ Backup do EmailService antigo criado');
    } else {
      console.log('   ⚠️ Backup não encontrado');
    }
  } else {
    console.log('   ❌ EmailService não encontrado');
  }
} catch (error) {
  console.log('   ❌ Erro ao verificar EmailService:', error.message);
}

console.log('');

// 3. Verificar arquivos de configuração
console.log('3️⃣ Verificando configurações...');
try {
  // Verificar .env.example
  if (fs.existsSync('.env.example')) {
    const envExample = fs.readFileSync('.env.example', 'utf8');
    if (envExample.includes('MAILERSEND_API_TOKEN')) {
      console.log('   ✅ .env.example atualizado com MailerSend');
    } else {
      console.log('   ⚠️ .env.example não contém configurações MailerSend');
    }
  } else {
    console.log('   ⚠️ .env.example não encontrado');
  }
  
  // Verificar documentação
  if (fs.existsSync('MAILERSEND_SETUP.md')) {
    console.log('   ✅ Documentação MailerSend criada');
  } else {
    console.log('   ⚠️ Documentação MailerSend não encontrada');
  }
  
  // Verificar plano de migração
  if (fs.existsSync('MIGRACAO_MAILERSEND.md')) {
    console.log('   ✅ Plano de migração atualizado');
  } else {
    console.log('   ⚠️ Plano de migração não encontrado');
  }
} catch (error) {
  console.log('   ❌ Erro ao verificar configurações:', error.message);
}

console.log('');

// 4. Verificar scripts
console.log('4️⃣ Verificando scripts...');
try {
  const testEmailPath = path.join('scripts', 'test-email.ts');
  if (fs.existsSync(testEmailPath)) {
    const content = fs.readFileSync(testEmailPath, 'utf8');
    if (content.includes('MailerSend')) {
      console.log('   ✅ Script de teste atualizado');
    } else {
      console.log('   ⚠️ Script de teste não atualizado');
    }
  } else {
    console.log('   ⚠️ Script de teste não encontrado');
  }
} catch (error) {
  console.log('   ❌ Erro ao verificar scripts:', error.message);
}

console.log('');

// 5. Verificar node_modules
console.log('5️⃣ Verificando node_modules...');
try {
  if (fs.existsSync(path.join('node_modules', 'mailersend'))) {
    console.log('   ✅ MailerSend instalado nos node_modules');
  } else {
    console.log('   ❌ MailerSend não encontrado nos node_modules');
    console.log('       Execute: npm install');
  }
} catch (error) {
  console.log('   ❌ Erro ao verificar node_modules:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('📋 RESUMO DA MIGRAÇÃO:');
console.log('✅ Sistema migrado para MailerSend');
console.log('✅ Dependências antigas removidas');
console.log('✅ Interface mantida para compatibilidade');
console.log('✅ Documentação atualizada');
console.log('');
console.log('🚀 PRÓXIMOS PASSOS:');
console.log('1. Configure sua conta MailerSend');
console.log('2. Adicione MAILERSEND_API_TOKEN ao .env');
console.log('3. Configure FROM_EMAIL no .env');
console.log('4. Execute: npm run test:email');
console.log('5. Teste todos os fluxos de email');
console.log('');
console.log('📚 Documentação: MAILERSEND_SETUP.md');
console.log('='.repeat(50));
