import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: boolean;
  customLogo: string;
  brandName: string;
  customCSS: string;
  fontFamily: string;
  fontSize: number;
  borderRadius: number;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#25D366',
  secondaryColor: '#128C7E',
  accentColor: '#34B7F1',
  darkMode: true,
  customLogo: '',
  brandName: 'Minha Empresa',
  customCSS: '',
  fontFamily: 'Inter',
  fontSize: 14,
  borderRadius: 8,
};

const ThemeContext = createContext<{
  theme: ThemeSettings;
  setTheme: (theme: ThemeSettings) => void;
  applyTheme: (theme: ThemeSettings) => void;
}>(
  {
    theme: defaultTheme,
    setTheme: () => {},
    applyTheme: () => {},
  }
);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('theme-settings');
    if (!saved) return defaultTheme;
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn('Configuração de tema corrompida, usando padrão.', e);
      localStorage.removeItem('theme-settings');
      return defaultTheme;
    }
  });

  // Função para aplicar tema imediatamente
  const applyTheme = (newTheme: ThemeSettings) => {
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const root = document.documentElement;
    
    // Variáveis Tailwind CSS
    root.style.setProperty('--primary', hexToHsl(newTheme.primaryColor));
    root.style.setProperty('--secondary', hexToHsl(newTheme.secondaryColor));
    root.style.setProperty('--accent', hexToHsl(newTheme.accentColor));
    
    // Variáveis customizadas
    root.style.setProperty('--primary-color', newTheme.primaryColor);
    root.style.setProperty('--secondary-color', newTheme.secondaryColor);
    root.style.setProperty('--accent-color', newTheme.accentColor);
    root.style.setProperty('--font-family', newTheme.fontFamily);
    root.style.setProperty('--font-size', newTheme.fontSize + 'px');
    root.style.setProperty('--border-radius', newTheme.borderRadius + 'px');
    
    // Variáveis WhatsApp específicas
    root.style.setProperty('--whatsapp-green', hexToHsl(newTheme.primaryColor));
    root.style.setProperty('--whatsapp-dark-green', hexToHsl(newTheme.secondaryColor));
    
    // Modo escuro/claro
    if (newTheme.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // CSS customizado
    let styleTag = document.getElementById('custom-css-theme') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'custom-css-theme';
      document.head.appendChild(styleTag);
    }
    
    const customStyles = `
      ${newTheme.customCSS || ''}
      
      .custom-theme-vars {
        --color-primary: ${newTheme.primaryColor};
        --color-secondary: ${newTheme.secondaryColor};
        --color-accent: ${newTheme.accentColor};
      }
      
      .glass-card {
        background: rgba(${newTheme.darkMode ? '255, 255, 255' : '0, 0, 0'}, 0.05);
        border-color: ${newTheme.accentColor}20;
      }
      
      .modern-button:hover {
        background: ${newTheme.primaryColor}15;
        border-color: ${newTheme.primaryColor}30;
      }
      
      .gradient-text {
        background: linear-gradient(135deg, ${newTheme.primaryColor}, ${newTheme.accentColor});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .text-primary {
        color: ${newTheme.primaryColor} !important;
      }
      
      .bg-primary {
        background-color: ${newTheme.primaryColor} !important;
      }
      
      .border-primary {
        border-color: ${newTheme.primaryColor} !important;
      }
      
      body, * {
        font-family: '${newTheme.fontFamily}', Inter, sans-serif !important;
        font-size: ${newTheme.fontSize}px;
      }
      
      .rounded, .rounded-lg, .rounded-xl {
        border-radius: ${newTheme.borderRadius}px !important;
      }
    `;
    
    styleTag.innerHTML = customStyles;
    
    // Atualiza o estado
    setTheme(newTheme);
    
    // Persistência
    localStorage.setItem('theme-settings', JSON.stringify(newTheme));
  };
  useEffect(() => {
    // Converte cores hex para HSL para compatibilidade com Tailwind
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Atualiza variáveis CSS globais
    const root = document.documentElement;
    
    // Variáveis Tailwind CSS
    root.style.setProperty('--primary', hexToHsl(theme.primaryColor));
    root.style.setProperty('--secondary', hexToHsl(theme.secondaryColor));
    root.style.setProperty('--accent', hexToHsl(theme.accentColor));
    
    // Variáveis customizadas para uso direto
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--font-family', theme.fontFamily);
    root.style.setProperty('--font-size', theme.fontSize + 'px');
    root.style.setProperty('--border-radius', theme.borderRadius + 'px');
    
    // Variáveis WhatsApp específicas
    root.style.setProperty('--whatsapp-green', hexToHsl(theme.primaryColor));
    root.style.setProperty('--whatsapp-dark-green', hexToHsl(theme.secondaryColor));
    
    // Aplica modo escuro/claro
    if (theme.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // CSS customizado
    let styleTag = document.getElementById('custom-css-theme') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'custom-css-theme';
      document.head.appendChild(styleTag);
    }
    
    // Adiciona CSS customizado + variáveis para componentes
    const customStyles = `
      ${theme.customCSS || ''}
      
      /* Variáveis customizadas aplicadas automaticamente */
      .custom-theme-vars {
        --color-primary: ${theme.primaryColor};
        --color-secondary: ${theme.secondaryColor};
        --color-accent: ${theme.accentColor};
      }
      
      /* Aplicação automática das cores nos elementos principais */
      .glass-card {
        background: rgba(${theme.darkMode ? '255, 255, 255' : '0, 0, 0'}, 0.05);
        border-color: ${theme.accentColor}20;
      }
      
      .modern-button:hover {
        background: ${theme.primaryColor}15;
        border-color: ${theme.primaryColor}30;
      }
      
      .gradient-text {
        background: linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      /* Cores primárias aplicadas */
      .text-primary {
        color: ${theme.primaryColor} !important;
      }
      
      .bg-primary {
        background-color: ${theme.primaryColor} !important;
      }
      
      .border-primary {
        border-color: ${theme.primaryColor} !important;
      }
      
      /* Font customizada */
      body, * {
        font-family: '${theme.fontFamily}', Inter, sans-serif !important;
        font-size: ${theme.fontSize}px;
      }
      
      /* Border radius customizado */
      .rounded, .rounded-lg, .rounded-xl {
        border-radius: ${theme.borderRadius}px !important;
      }
    `;
    
    styleTag.innerHTML = customStyles;
    
    // Persistência
    localStorage.setItem('theme-settings', JSON.stringify(theme));
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
