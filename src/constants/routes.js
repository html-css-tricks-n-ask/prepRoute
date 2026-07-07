/**
 * Application route constants.
 * Use these everywhere instead of hardcoding path strings.
 */
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  TEST_CREATE: '/test/create',
  TEST_EDIT: (id) => `/test/edit/${id}`,
  TEST_QUESTIONS: (id) => `/test/${id}/questions`,
  TEST_PREVIEW: (id) => `/test/${id}/preview`,
};
