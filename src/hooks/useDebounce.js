import { useState, useEffect } from 'react';

/**
 * Delays updating a value until the user stops typing for `delay` ms.
 * Useful for search inputs to avoid firing on every keystroke.
 *
 * @param {*} value - The value to debounce
 * @param {number} delay - Debounce delay in milliseconds (default: 300)
 * @returns {*} The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
