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
    return apiRequest<Teacher[]>('/teachers');
  },

  /**
   * Get teacher by ID
   */
  getTeacherById: async (id: string): Promise<Teacher> => {
    return apiRequest<Teacher>(`/teachers/${id}`);
  },

  /**
   * Search teachers by subject or name
   */
  searchTeachers: async (query: string): Promise<Teacher[]> => {
    return apiRequest<Teacher[]>(`/teachers/search?q=${encodeURIComponent(query)}`);
  },

  /**
   * Create new teacher profile
   */
  createTeacher: async (teacherData: Omit<Teacher, 'id'>): Promise<Teacher> => {
    return apiRequest<Teacher>('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
  },

  /**
   * Update teacher profile
   */
  updateTeacher: async (id: string, teacherData: Partial<Teacher>): Promise<Teacher> => {
    return apiRequest<Teacher>(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData),
    });
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
    return apiRequest<{ success: boolean; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }
};

/**
 * Authentication service (placeholder for future implementation)
 */
export const authService = {
  /**
   * User login
   */
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    return apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * User registration
   */
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'teacher';
  }): Promise<{ token: string; user: any }> => {
    return apiRequest<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
    // Call API to invalidate token if needed
  }
};