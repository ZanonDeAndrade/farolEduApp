const memoryStorage: Record<string, string> = {};

export const persistValue = async (key: string, value: string) => {
  try {
    memoryStorage[key] = value;
    if (typeof globalThis !== 'undefined') {
      (globalThis as Record<string, unknown>)[`__farol_${key}`] = value;
    }
  } catch (error) {
    console.warn(`Não foi possível armazenar ${key}:`, error);
  }
};

export const getPersistedValue = (key: string): string | undefined => {
  if (Object.prototype.hasOwnProperty.call(memoryStorage, key)) {
    return memoryStorage[key];
  }

  if (typeof globalThis !== 'undefined') {
    const fallback = (globalThis as Record<string, unknown>)[`__farol_${key}`];
    if (typeof fallback === 'string') {
      memoryStorage[key] = fallback;
      return fallback;
    }
  }

  return undefined;
};
