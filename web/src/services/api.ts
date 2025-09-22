// API service functions
import type { Teacher } from '../types/teacher';
import type { ContactForm } from '../types/contact';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Generic fetch wrapper with error handling
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Teacher-related API calls
 */
export const teacherService = {
  /**
   * Get all teachers
   */
  getAllTeachers: async (): Promise<Teacher[]> => {
    // Simulate API call - replace with actual API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: 'Ana Souza',
            subject: 'Matemática',
            level: 'Ensino Médio',
            image: '/placeholder.jpg',
            profileUrl: '/professor/ana-souza'
          }
        ]);
      }, 1000);
    });
  },

  /**
   * Search teachers by subject or name
   */
  searchTeachers: async (query: string): Promise<Teacher[]> => {
    console.log('Searching for:', query);
    return teacherService.getAllTeachers();
  }
};

/**
 * Contact-related API calls
 */
export const contactService = {
  /**
   * Submit contact form
   */
  submitContactForm: async (contactData: ContactForm): Promise<{ success: boolean; message: string }> => {
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('Contact form submitted:', contactData);
        resolve({ success: true, message: 'Mensagem enviada com sucesso!' });
      }, 1000);
    });
  }
};