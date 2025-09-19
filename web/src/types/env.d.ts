// Environment variables type definitions

declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_API_URL?: string;
    REACT_APP_SITE_NAME?: string;
    REACT_APP_GOOGLE_ANALYTICS_ID?: string;
    REACT_APP_FACEBOOK_PIXEL_ID?: string;
    REACT_APP_ENVIRONMENT?: 'development' | 'staging' | 'production';
  }
}