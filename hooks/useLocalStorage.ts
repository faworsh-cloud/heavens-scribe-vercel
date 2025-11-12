import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export const useLocalStorage = <T,>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const previousValue = storedValue;
    try {
      const valueToStore = value instanceof Function ? value(previousValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Local storage save error:", error);
      // Revert state on error to keep UI consistent with storage
      setStoredValue(previousValue);
      throw error; // Re-throw the error to be handled by the caller
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
            const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;

            // Use a functional update to get the latest state and prevent unnecessary re-renders.
            setStoredValue(currentValue => {
                if (JSON.stringify(currentValue) === JSON.stringify(newValue)) {
                    return currentValue; // No change
                }
                return newValue;
            });
        } catch (error) {
            console.error(error);
            // On error, revert to initial value as a fallback
            setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue as Dispatch<SetStateAction<T>>];
};
