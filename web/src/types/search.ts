export interface SearchFilters {
  subject: string;
  location: string;
  nearby: boolean;
  online: boolean;
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  subject: '',
  location: '',
  nearby: false,
  online: false,
};
