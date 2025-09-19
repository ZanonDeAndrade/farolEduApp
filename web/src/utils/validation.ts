// Validation utility functions

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates required field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      message: `${fieldName} é obrigatório`
    };
  }
  return { isValid: true };
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Email deve ter um formato válido'
    };
  }
  return { isValid: true };
};

/**
 * Validates minimum length
 */
export const validateMinLength = (
  value: string, 
  minLength: number, 
  fieldName: string
): ValidationResult => {
  if (value.length < minLength) {
    return {
      isValid: false,
      message: `${fieldName} deve ter pelo menos ${minLength} caracteres`
    };
  }
  return { isValid: true };
};

/**
 * Validates maximum length
 */
export const validateMaxLength = (
  value: string, 
  maxLength: number, 
  fieldName: string
): ValidationResult => {
  if (value.length > maxLength) {
    return {
      isValid: false,
      message: `${fieldName} deve ter no máximo ${maxLength} caracteres`
    };
  }
  return { isValid: true };
};

/**
 * Validates phone number (Brazilian format)
 */
export const validatePhone = (phone: string): ValidationResult => {
  const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
  const numbersOnly = phone.replace(/\D/g, '');
  
  if (numbersOnly.length < 10 || numbersOnly.length > 11) {
    return {
      isValid: false,
      message: 'Telefone deve ter 10 ou 11 dígitos'
    };
  }
  
  if (!phoneRegex.test(phone)) {
    return {
      isValid: false,
      message: 'Telefone deve estar no formato (XX) XXXXX-XXXX'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates CPF (Brazilian document)
 */
export const validateCPF = (cpf: string): ValidationResult => {
  const numbersOnly = cpf.replace(/\D/g, '');
  
  if (numbersOnly.length !== 11) {
    return {
      isValid: false,
      message: 'CPF deve ter 11 dígitos'
    };
  }
  
  // Check if all digits are the same
  if (/^(\d)\1+$/.test(numbersOnly)) {
    return {
      isValid: false,
      message: 'CPF inválido'
    };
  }
  
  // Validate CPF algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbersOnly[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbersOnly[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  if (parseInt(numbersOnly[9]) !== digit1 || parseInt(numbersOnly[10]) !== digit2) {
    return {
      isValid: false,
      message: 'CPF inválido'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): ValidationResult => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Senha deve ter pelo menos 8 caracteres'
    };
  }
  
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Senha deve ter pelo menos uma letra maiúscula'
    };
  }
  
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Senha deve ter pelo menos uma letra minúscula'
    };
  }
  
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Senha deve ter pelo menos um número'
    };
  }
  
  return { isValid: true };
};