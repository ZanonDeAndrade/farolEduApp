import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStorage: Record<string, string> = {};

const GLOBAL_PREFIX = '__farol_';

const setMemory = (key: string, value: string) => {
  memoryStorage[key] = value;
  if (typeof globalThis !== 'undefined') {
    (globalThis as Record<string, unknown>)[`${GLOBAL_PREFIX}${key}`] = value;
  }
};

const clearMemory = (key: string) => {
  delete memoryStorage[key];
  if (typeof globalThis !== 'undefined') {
    delete (globalThis as Record<string, unknown>)[`${GLOBAL_PREFIX}${key}`];
  }
};

export const persistValue = async (key: string, value: string) => {
  try {
    setMemory(key, value);
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Não foi possível armazenar ${key}:`, error);
  }
};

export const getPersistedValue = async (key: string): Promise<string | undefined> => {
  if (Object.prototype.hasOwnProperty.call(memoryStorage, key)) {
    return memoryStorage[key];
  }

  try {
    const stored = await AsyncStorage.getItem(key);
    if (typeof stored === 'string') {
      setMemory(key, stored);
      return stored;
    }
  } catch (error) {
    console.warn(`Não foi possível ler ${key}:`, error);
  }

  if (typeof globalThis !== 'undefined') {
    const fallback = (globalThis as Record<string, unknown>)[`${GLOBAL_PREFIX}${key}`];
    if (typeof fallback === 'string') {
      setMemory(key, fallback);
      return fallback;
    }
  }

  return undefined;
};

export const removePersistedValue = async (key: string) => {
  try {
    clearMemory(key);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`Não foi possível remover ${key}:`, error);
  }
};
