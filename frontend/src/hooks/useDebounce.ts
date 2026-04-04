import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * Delays updating a value until a certain period of time has passed since
 * the last change. Essential for preventing excessive API calls during typing.
 *
 * @param value The value to debounce
 * @param delay Delay in milliseconds (default: 500ms)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancel the timeout if value changes (or component unmounts)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
