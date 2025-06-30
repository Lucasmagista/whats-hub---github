// src/utils/validation.ts
// Utilitários de validação

import { VALIDATION_RULES } from './constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validator {
  static validateBotName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Nome do bot é obrigatório');
    } else {
      if (name.length < VALIDATION_RULES.BOT_NAME.MIN_LENGTH) {
        errors.push(`Nome deve ter pelo menos ${VALIDATION_RULES.BOT_NAME.MIN_LENGTH} caracteres`);
      }
      if (name.length > VALIDATION_RULES.BOT_NAME.MAX_LENGTH) {
        errors.push(`Nome deve ter no máximo ${VALIDATION_RULES.BOT_NAME.MAX_LENGTH} caracteres`);
      }
      if (!VALIDATION_RULES.BOT_NAME.PATTERN.test(name)) {
        errors.push('Nome contém caracteres inválidos');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validatePhoneNumber(phone: string): ValidationResult {
    const errors: string[] = [];

    if (!phone || phone.trim().length === 0) {
      errors.push('Número de telefone é obrigatório');
    } else if (!VALIDATION_RULES.PHONE_NUMBER.PATTERN.test(phone)) {
      errors.push('Formato de telefone inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email || email.trim().length === 0) {
      errors.push('Email é obrigatório');
    } else if (!VALIDATION_RULES.EMAIL.PATTERN.test(email)) {
      errors.push('Formato de email inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUrl(url: string): ValidationResult {
    const errors: string[] = [];

    if (!url || url.trim().length === 0) {
      errors.push('URL é obrigatória');
    } else if (!VALIDATION_RULES.URL.PATTERN.test(url)) {
      errors.push('Formato de URL inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateRequired(value: unknown, fieldName: string): ValidationResult {
    const errors: string[] = [];

    if (value === null || value === undefined || value === '') {
      errors.push(`${fieldName} é obrigatório`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateLength(
    value: string, 
    min: number, 
    max: number, 
    fieldName: string
  ): ValidationResult {
    const errors: string[] = [];

    if (value.length < min) {
      errors.push(`${fieldName} deve ter pelo menos ${min} caracteres`);
    }
    if (value.length > max) {
      errors.push(`${fieldName} deve ter no máximo ${max} caracteres`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static combineValidations(...validations: ValidationResult[]): ValidationResult {
    const allErrors = validations.flatMap(v => v.errors);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }
}