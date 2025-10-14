import { Platform } from 'react-native';
import Constants from 'expo-constants';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiErrorDetails = {
  message?: string;
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;
  details?: ApiErrorDetails;

  constructor(status: number, message: string, details?: ApiErrorDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const sanitizeURL = (url: string) => url.replace(/\/+$/, '');

const toHost = (value?: string | null) => {
  if (!value) return undefined;
  const [host] = value.split(':');
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return undefined;
  }
  return host;
};

type HostSource = { debuggerHost?: string; hostUri?: string };

const getExpoHost = () => {
  const constantsAny = Constants as Record<string, unknown>;

  const legacyManifest = constantsAny.manifest as HostSource | undefined;
  const legacyHost = toHost(legacyManifest?.debuggerHost ?? legacyManifest?.hostUri);
  if (legacyHost) {
    return legacyHost;
  }

  const manifest2 = constantsAny.manifest2 as
    | (HostSource & { extra?: { expoGo?: HostSource } })
    | undefined;
  const manifest2Host = toHost(
    manifest2?.extra?.expoGo?.debuggerHost ??
      manifest2?.debuggerHost ??
      manifest2?.hostUri,
  );

  if (manifest2Host) {
    return manifest2Host;
  }

  const expoConfig = constantsAny.expoConfig as HostSource | undefined;
  const expoConfigHost = toHost(expoConfig?.hostUri ?? expoConfig?.debuggerHost);
  return expoConfigHost;
};

const getExtraBaseURL = () => {
  const constantsAny = Constants as Record<string, unknown>;
  const candidates = [
    (constantsAny.expoConfig as { extra?: Record<string, unknown> } | undefined)?.extra,
    (constantsAny.manifest as { extra?: Record<string, unknown> } | undefined)?.extra,
    (constantsAny.manifest2 as { extra?: Record<string, unknown> } | undefined)?.extra,
    (
      constantsAny.manifest2 as { extra?: { expoGo?: Record<string, unknown> } } | undefined
    )?.extra?.expoGo,
  ];

  for (const extra of candidates) {
    const value = extra?.apiBaseUrl ?? extra?.apiBaseURL ?? extra?.API_BASE_URL;
    if (typeof value === 'string' && value.trim().length > 0) {
      return sanitizeURL(value.trim());
    }
  }

  return undefined;
};

const getDefaultBaseURL = () => {
  const expoHost = getExpoHost();
  if (expoHost) {
    return `http://${expoHost}:5000`;
  }

  if (Platform.OS === 'android') {
    // 10.0.2.2 aponta para o host quando usando emulador Android
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

const getBaseURL = () => {
  const envURL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envURL) {
    return sanitizeURL(envURL);
  }

  const extraURL = getExtraBaseURL();
  if (extraURL) {
    return extraURL;
  }

  return sanitizeURL(getDefaultBaseURL());
};

const buildURL = (path: string) => {
  const baseURL = getBaseURL();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseURL}${normalizedPath}`;
};

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
};

const toJSON = (value: unknown) => {
  try {
    return value ? JSON.parse(String(value)) : undefined;
  } catch {
    return undefined;
  }
};

export const apiRequest = async <TResponse = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> => {
  const { method = 'GET', body, headers = {}, token } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildURL(path), {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const raw = await response.text();
  const data = toJSON(raw);

  if (!response.ok) {
    const message =
      (typeof data === 'object' && data && 'message' in data
        ? String((data as ApiErrorDetails).message)
        : undefined) ?? 'Não foi possível completar a requisição.';

    throw new ApiError(response.status, message, (data as ApiErrorDetails) ?? undefined);
  }

  return (data as TResponse) ?? ({} as TResponse);
};
