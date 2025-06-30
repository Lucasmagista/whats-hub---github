// src/utils/constants.ts
// Constantes globais da aplicação

export const APP_CONFIG = {
  NAME: 'WhatsHub',
  VERSION: '2.0.0',
  DESCRIPTION: 'Sistema Avançado de Gestão de Bots WhatsApp',
  AUTHOR: 'Lucas Magista'
} as const;

export const STORAGE_KEYS = {
  BOTS: 'whats_hub_bots',
  CHATS: 'whats_hub_chats',
  TICKETS: 'whats_hub_tickets',
  QUEUE: 'whats_hub_queue',
  TEMPLATES: 'whats_hub_templates',
  INTEGRATIONS: 'whats_hub_integrations',
  WORKFLOWS: 'whats_hub_workflows',
  SETTINGS: 'whats_hub_settings',
  THEME: 'whats_hub_theme',
  SCREEN_LOCK: 'whatsapp-hub-security',
  USER_PREFERENCES: 'whats_hub_user_preferences'
} as const;

export const API_ENDPOINTS = {
  BOTS: '/api/bots',
  CHATS: '/api/chats',
  MESSAGES: '/api/messages',
  TICKETS: '/api/tickets',
  QUEUE: '/api/queue',
  INTEGRATIONS: '/api/integrations',
  WORKFLOWS: '/api/workflows',
  METRICS: '/api/metrics',
  HEALTH: '/api/health'
} as const;

export const WEBSOCKET_EVENTS = {
  BOT_STATUS_UPDATE: 'botStatusUpdate',
  NEW_MESSAGE: 'newMessage',
  QUEUE_UPDATE: 'queueUpdate',
  TICKET_UPDATE: 'ticketUpdate',
  METRIC_UPDATE: 'metricUpdate'
} as const;

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
} as const;

export const VALIDATION_RULES = {
  BOT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9\s\-_]+$/
  },
  PHONE_NUMBER: {
    PATTERN: /^\+?[1-9]\d{1,14}$/
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  URL: {
    PATTERN: /^https?:\/\/.+/
  }
} as const;

export const DEFAULT_TIMEOUTS = {
  API_REQUEST: 30000,
  WEBSOCKET_CONNECT: 5000,
  RETRY_DELAY: 1000,
  DEBOUNCE_DELAY: 300
} as const;

export const THEME_PRESETS = {
  DARK: {
    primaryColor: '#25D366',
    secondaryColor: '#128C7E',
    accentColor: '#34B7F1',
    darkMode: true
  },
  LIGHT: {
    primaryColor: '#25D366',
    secondaryColor: '#128C7E', 
    accentColor: '#34B7F1',
    darkMode: false
  }
} as const;