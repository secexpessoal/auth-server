import { useEffect, useState } from "react";

/**
 * Hook para debouncing de valores.
 * @param value O valor a ser debounced.
 * @param delay O atraso em milissegundos.
 * @returns O valor após o atraso.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
