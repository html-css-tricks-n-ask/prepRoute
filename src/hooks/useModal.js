import { useState, useCallback } from 'react';

/**
 * Manages modal open/close state and an optional associated data item.
 * Eliminates the repeated `isOpen + item` state pattern across feature hooks.
 *
 * @returns {{ isOpen: boolean, item: *, open: (item?) => void, close: () => void }}
 */
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState(null);

  const open = useCallback((modalItem = null) => {
    setItem(modalItem);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setItem(null);
  }, []);

  return { isOpen, item, open, close };
}
