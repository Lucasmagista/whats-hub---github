import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  name: string;
  photoUrl?: string;
  phoneNumber?: string;
}

export interface ScreenLockSettings {
  enabled: boolean;
  autoLockTimeout: number;
  userProfile: UserProfile;
}

export const useScreenLock = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [settings, setSettings] = useState<ScreenLockSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configurações
  useEffect(() => {
    loadSettings();
  }, []);
  const loadSettings = async () => {
    try {
      console.log('🔒 Loading screen lock settings...');
      const saved = localStorage.getItem('whatsapp-hub-security');
      console.log('🔒 Saved settings:', saved);
      
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('🔒 Parsed settings:', parsed);
        setSettings(parsed);
        
        // Verificar se deve estar bloqueado
        const lastActivity = localStorage.getItem('whatsapp-hub-last-activity');
        if (lastActivity && parsed.enabled) {
          const timeSinceActivity = Date.now() - parseInt(lastActivity);
          const timeoutMs = parsed.autoLockTimeout * 60 * 1000;
          
          console.log('🔒 Time check:', {
            timeSinceActivity,
            timeoutMs,
            shouldLock: timeSinceActivity > timeoutMs
          });
          
          if (timeSinceActivity > timeoutMs) {
            console.log('🔒 Setting locked state to true due to timeout');
            setIsLocked(true);
          }
        }
      } else {
        console.log('🔒 No saved settings found');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de segurança:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: ScreenLockSettings) => {
    try {
      localStorage.setItem('whatsapp-hub-security', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };
  const setupScreenLock = async (
    password: string, 
    autoLockTimeout: number,
    userProfile: UserProfile
  ) => {
    try {
      console.log('🔒 Setting up screen lock:', { autoLockTimeout, userProfile });
      // Hash da senha
      const passwordHash = await hashPassword(password);
      
      const newSettings: ScreenLockSettings = {
        enabled: true,
        autoLockTimeout,
        userProfile
      };
      
      console.log('🔒 Saving settings:', newSettings);
      // Salvar hash da senha separadamente por segurança
      localStorage.setItem('whatsapp-hub-password-hash', passwordHash);
      await saveSettings(newSettings);
      
      console.log('🔒 Screen lock setup completed successfully');
      return true;
    } catch (error) {
      console.error('Erro ao configurar bloqueio:', error);
      return false;
    }
  };

  const disableScreenLock = async () => {
    try {
      localStorage.removeItem('whatsapp-hub-password-hash');
      localStorage.removeItem('whatsapp-hub-security');
      localStorage.removeItem('whatsapp-hub-last-activity');
      setSettings(null);
      setIsLocked(false);
      return true;
    } catch (error) {
      console.error('Erro ao desabilitar bloqueio:', error);
      return false;
    }
  };

  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
      const storedHash = localStorage.getItem('whatsapp-hub-password-hash');
      if (!storedHash) return false;
      
      const inputHash = await hashPassword(password);
      return inputHash === storedHash;
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      return false;
    }
  };

  const unlock = async (password: string): Promise<boolean> => {
    const isValid = await verifyPassword(password);
    if (isValid) {
      console.log('🔓 Successfully unlocked - updating activity timestamp');
      setIsLocked(false);
      updateLastActivity();
      return true;
    }
    return false;
  };
  const lock = useCallback(() => {
    console.log('🔒 Lock called, settings:', settings);
    if (settings?.enabled) {
      console.log('🔒 Locking screen now!');
      setIsLocked(true);
      updateLastActivity();
      return true;
    } else {
      console.log('🔒 Lock not enabled, ignoring...');
      return false;
    }
  }, [settings]);

  // Função para forçar bloqueio (compatibilidade)
  const lockScreen = useCallback((customConfig?: {
    message?: string;
    logo?: string;
    backgroundColor?: string;
    textColor?: string;
    showBrand?: boolean;
    enableBlur?: boolean;
  }) => {
    console.log('🔒 LockScreen called with config:', customConfig);
    if (settings?.enabled || customConfig) {
      console.log('🔒 Forcing screen lock...');
      setIsLocked(true);
      updateLastActivity();
      return true;
    } else {
      console.log('🔒 Cannot lock - not configured');
      return false;
    }
  }, [settings]);

  const updateLastActivity = () => {
    localStorage.setItem('whatsapp-hub-last-activity', Date.now().toString());
  };
  // Monitorar inatividade - REMOVIDO: usar useIdleTimer externa
  // useEffect(() => {
  //   ... código do timer removido
  // }, [settings?.enabled, settings?.autoLockTimeout, isLocked, lock]);
  const updateAutoLockTime = async (minutes: number) => {
    if (settings) {
      const updatedSettings = {
        ...settings,
        autoLockTimeout: minutes // Manter em minutos - a conversão será feita no useIdleTimer
      };
      console.log('🔒 Updating auto-lock time to:', minutes, 'minutes');
      await saveSettings(updatedSettings);
    }
  };
  return {
    isLocked,
    settings,
    isLoading,
    setupScreenLock,
    setupLock: setupScreenLock, // Alias for compatibility
    disableScreenLock,
    disableLock: disableScreenLock, // Alias for compatibility
    unlock,
    lock,
    lockScreen,
    updateLastActivity,
    updateAutoLockTime,
    // Compatibility config object for SettingsModal
    config: {
      enabled: settings?.enabled ?? false,
      autoLockTime: settings?.autoLockTimeout ?? 15,
      password: localStorage.getItem('whatsapp-hub-password-hash') ? '•'.repeat(8) : '',
      userName: settings?.userProfile?.name ?? '',
      userPhoto: settings?.userProfile?.photoUrl ?? ''
    }
  };
};

// Função auxiliar para hash da senha
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'whatsapp-hub-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
