# 🔒 Sistema de Bloqueio de Tela - WhatsApp Hub

## 📋 Visão Geral

O sistema de bloqueio de tela do WhatsApp Hub fornece uma camada adicional de segurança, permitindo que os usuários protejam o acesso ao sistema com uma senha personalizada. O sistema inclui:

- ✅ Configuração de senha com confirmação
- ✅ Perfil do usuário (nome e foto) para a tela de bloqueio
- ✅ Bloqueio automático após período de inatividade
- ✅ Bloqueio manual
- ✅ Tela de bloqueio elegante e moderna
- ✅ Senha criptografada com SHA-256 + salt
- ✅ Configurações persistentes no localStorage

## 🚀 Como Usar

### 1. Ativando o Bloqueio de Tela

1. Abra as **Configurações** do sistema (ícone de engrenagem)
2. Navegue até a aba **"Segurança"**
3. Na seção **"Bloqueio de Tela"**, ative o switch **"Ativar Bloqueio de Tela"**
4. Um modal será aberto para configurar:
   - **Senha**: Digite uma senha segura (mínimo 6 caracteres)
   - **Confirmar Senha**: Digite novamente para confirmar
   - **Nome do Usuário**: Seu nome que aparecerá na tela de bloqueio
   - **Foto do Perfil**: Escolha entre avatares padrão ou faça upload de uma imagem
   - **Tempo de Bloqueio**: Configure quando o sistema deve bloquear automaticamente

### 2. Configurações de Tempo de Bloqueio

Você pode escolher entre diferentes opções de tempo para o bloqueio automático:

- **Nunca**: Apenas bloqueio manual
- **1 minuto**: Para máxima segurança
- **5 minutos**: Recomendado para uso pessoal
- **10 minutos**: Padrão recomendado
- **30 minutos**: Para uso em ambiente confiável
- **1 hora**: Para uso prolongado

### 3. Bloqueio Manual

Após ativar o sistema, você pode:
- Usar o botão **"Bloquear"** nas configurações de segurança
- O sistema bloqueia automaticamente após o tempo configurado de inatividade

### 4. Desbloqueando o Sistema

Quando o sistema estiver bloqueado:
1. A tela de bloqueio será exibida com seu nome e foto
2. Digite sua senha no campo indicado
3. Clique em **"Desbloquear"** ou pressione **Enter**
4. O sistema será desbloqueado se a senha estiver correta

### 5. Alterando Configurações

Para modificar as configurações do bloqueio:
1. Acesse **Configurações > Segurança**
2. Use o botão **"Alterar"** para redefinir senha, nome ou foto
3. Ajuste o tempo de bloqueio automático conforme necessário
4. Use **"Bloquear"** para ativar imediatamente

### 6. Desativando o Bloqueio

Para desativar completamente:
1. Acesse **Configurações > Segurança**
2. Desative o switch **"Ativar Bloqueio de Tela"**
3. Todas as configurações e senha serão removidas

## 🔒 Segurança

### Criptografia
- As senhas são protegidas com hash SHA-256
- Utiliza salt único para cada instalação
- Hash e salt são armazenados separadamente
- Não é possível recuperar a senha original

### Proteção de Dados
- Configurações armazenadas localmente no navegador
- Nenhuma informação é enviada para servidores externos
- Dados são limpos completamente ao desativar o sistema

### Tentativas de Acesso
- Sistema detecta tentativas incorretas de senha
- Após 3 tentativas incorretas, há um delay de 30 segundos
- Contador de tentativas é exibido para o usuário

## 🎨 Interface

### Tela de Bloqueio
A tela de bloqueio apresenta:
- **Design moderno** com gradientes e efeitos visuais
- **Relógio em tempo real** com data completa
- **Avatar do usuário** com nome personalizado
- **Campo de senha** com opção de mostrar/ocultar
- **Indicadores visuais** de erro e carregamento
- **Elementos decorativos** animados

### Configurações
A interface de configuração inclui:
- **Switches intuitivos** para ativar/desativar
- **Seletor de tempo** com opções predefinidas
- **Preview do perfil** configurado
- **Botões de ação** claramente identificados

## 🔧 Componentes Técnicos

### Hooks Utilizados
- `useScreenLock`: Gerencia estado e operações do bloqueio
- `useIdleTimer`: Detecta inatividade do usuário

### Componentes
- `LockScreen`: Tela de bloqueio principal
- `PasswordSetupModal`: Modal de configuração inicial
- Integração no `SettingsModal`: Configurações de segurança

### Armazenamento
- `whatsapp-hub-security`: Configurações do sistema
- `whatsapp-hub-password-hash`: Hash da senha
- `whatsapp-hub-last-activity`: Timestamp da última atividade

## 🚨 Importante

⚠️ **ATENÇÃO**: Se você esquecer sua senha, não há como recuperá-la. Você precisará desativar o bloqueio nas configurações (se ainda tiver acesso) ou limpar os dados do navegador.

⚠️ **BACKUP**: Recomendamos anotar sua senha em local seguro, especialmente para ambientes de produção.

## 🐛 Solução de Problemas

### O bloqueio não está funcionando
- Verifique se o switch está ativado nas configurações
- Confirme se a senha foi configurada corretamente
- Verifique o console do navegador para erros

### Não consigo desbloquear
- Verifique se está digitando a senha correta
- Aguarde o tempo de bloqueio após tentativas incorretas
- Se necessário, limpe os dados do navegador (último recurso)

### Configurações não são salvas
- Verifique se o localStorage está habilitado no navegador
- Confirme se há espaço suficiente no armazenamento local
- Tente atualizar a página e configurar novamente

## 🎯 Próximas Funcionalidades

Funcionalidades planejadas para futuras versões:
- [ ] Autenticação biométrica (quando disponível)
- [ ] Múltiplos perfis de usuário
- [ ] Logs de acesso e tentativas
- [ ] Configurações avançadas de segurança
- [ ] Integração com autenticação externa

---

**Desenvolvido com segurança e usabilidade em mente para o WhatsApp Hub** 🚀
