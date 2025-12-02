import { apiRequest } from './apiClient';

export type AiSuggestionRequest = {
  subject: string;
  city?: string;
  modality?: string;
};

export const requestAiSuggestion = async (payload: AiSuggestionRequest) => {
  const response = await apiRequest<{ suggestion: string }>('/api/ai/suggest', {
    method: 'POST',
    body: payload,
  });
  return response.suggestion || 'Tente novamente em instantes.';
};
