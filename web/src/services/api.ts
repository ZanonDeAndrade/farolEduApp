// src/services/api.ts
import type { Teacher } from '../types/teacher';
import type { ContactForm } from '../types/contact';

// URL base do backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Função genérica para requisições à API com tratamento de erros
 */
const apiRequest = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`Falha na requisição API: ${endpoint}`, error);
    throw error;
  }
};

/**
 * Serviços relacionados a professores
 */
export const teacherService = {
  /**
   * Buscar todos os professores
   */
  getAllTeachers: async (): Promise<Teacher[]> => {
    return apiRequest<Teacher[]>('/teachers', { method: 'GET' });
  },

  /**
   * Buscar professores por nome ou matéria
   */
  searchTeachers: async (query: string): Promise<Teacher[]> => {
    const encodedQuery = encodeURIComponent(query);
    return apiRequest<Teacher[]>(`/teachers?search=${encodedQuery}`, { method: 'GET' });
  }
};

/**
 * Serviços relacionados a contato
 */
export const contactService = {
  /**
   * Enviar formulário de contato
   */
  submitContactForm: async (contactData: ContactForm): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }
};
