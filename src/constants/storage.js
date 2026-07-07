/**
 * localStorage key constants.
 * Centralizes all storage key strings to prevent typos and duplication.
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  /** Returns the per-test draft questions key */
  unsavedQuestions: (testId) => `unsaved_questions_${testId}`,
};
