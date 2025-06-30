// src/hooks/useLocalStorage.ts
// Hook otimizado para localStorage

import { useState, useEffect, useCallback } from 'react';
import { ErrorHandler } from '@/utils/errorHandler';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      ErrorHandler.logError(new Error(`Failed to read localStorage key "${key}"`));
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      ErrorHandler.logError(new Error(`Failed to set localStorage key "${key}"`));
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      ErrorHandler.logError(new Error(`Failed to remove localStorage key "${key}"`));
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}