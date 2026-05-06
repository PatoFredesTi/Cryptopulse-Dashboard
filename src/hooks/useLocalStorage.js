import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
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

  const updateValue = useCallback((nextValue) => {
    setValue((currentValue) => (
      typeof nextValue === 'function' ? nextValue(currentValue) : nextValue
    ));
  }, []);

  return [value, updateValue];
}
