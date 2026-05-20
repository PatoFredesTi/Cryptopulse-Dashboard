import { useCallback, useEffect, useState } from 'react';

type SetValue<T> = T | ((currentValue: T) => T);

export function useLocalStorage<T>(key: string, initialValue: T): [T, (nextValue: SetValue<T>) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) as T : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage can fail in private mode. The app keeps working with in-memory state.
    }
  }, [key, value]);

  const updateValue = useCallback((nextValue: SetValue<T>) => {
    setValue((currentValue) => (
      typeof nextValue === 'function' ? (nextValue as (currentValue: T) => T)(currentValue) : nextValue
    ));
  }, []);

  return [value, updateValue];
}
