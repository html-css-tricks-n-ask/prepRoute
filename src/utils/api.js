const BASE_URL = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-unauthorized'));
    throw new Error('Unauthorized');
  }

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Request failed');
  }

  return result.data;
}

export const api = {
  login: async (userId, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId, password })
    });
    return data; // returns { token, user }
  },
  
  getSubjects: () => request('/subjects'),
  
  getTopics: (subjectId) => request(`/topics/subject/${subjectId}`),
  
  getSubTopics: (topicId) => request(`/sub-topics/topic/${topicId}`),
  
  getSubTopicsMulti: (topicIds) => request('/sub-topics/multi-topics', {
    method: 'POST',
    body: JSON.stringify({ topicIds })
  }),
  
  getTests: () => request('/tests'),
  
  createTest: (testData) => request('/tests', {
    method: 'POST',
    body: JSON.stringify(testData)
  }),
  
  updateTest: (id, testData) => request(`/tests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(testData)
  }),
  
  getTestById: (id) => request(`/tests/${id}`),
  
  deleteTest: (id) => request(`/tests/${id}`, {
    method: 'DELETE'
  }),
  
  createQuestionsBulk: (questions) => request('/questions/bulk', {
    method: 'POST',
    body: JSON.stringify({ questions })
  }),
  
  fetchQuestionsBulk: (questionIds) => request('/questions/fetchBulk', {
    method: 'POST',
    body: JSON.stringify({ question_ids: questionIds })
  })
};
