/**
 * Type-safe localStorage helpers.
 * Centralizes all read/write/remove operations used across authSlice and feature hooks.
 */
export const storage = {
  /** Read a raw string value. Returns null if the key is absent. */
  get: (key) => localStorage.getItem(key),

  /** Write a raw string value. */
  set: (key, value) => localStorage.setItem(key, value),

  /** Remove a key. */
  remove: (key) => localStorage.removeItem(key),

  /** Parse a JSON value. Returns null on parse failure. */
  getJSON: (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /** Serialize and store a value as JSON. */
  setJSON: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
};
