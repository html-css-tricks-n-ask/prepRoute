import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './authSlice';
import toast from 'react-hot-toast';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Intercept 401 Unauthorized errors to trigger logout
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
    toast.error('Session expired. Please login again.');
    return result;
  }

  // Handle mock server response failure payloads
  if (result.data && result.data.success === false) {
    return {
      error: {
        status: 400,
        data: result.data,
        message: result.data.message || 'Request failed'
      }
    };
  }

  // Extract nested data payload if envelope structure matches
  if (result.data && result.data.success === true && result.data.data !== undefined) {
    return {
      data: result.data.data
    };
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Test', 'Subject', 'Topic', 'SubTopic'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getSubjects: builder.query({
      query: () => '/subjects',
      providesTags: ['Subject'],
    }),
    getTopics: builder.query({
      query: (subjectId) => `/topics/subject/${subjectId}`,
      providesTags: ['Topic'],
    }),
    getSubTopics: builder.query({
      query: (topicId) => `/sub-topics/topic/${topicId}`,
      providesTags: ['SubTopic'],
    }),
    getSubTopicsMulti: builder.mutation({
      query: (topicIds) => ({
        url: '/sub-topics/multi-topics',
        method: 'POST',
        body: { topicIds },
      }),
    }),
    getTests: builder.query({
      query: () => '/tests',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Test', id })),
              { type: 'Test', id: 'LIST' },
            ]
          : [{ type: 'Test', id: 'LIST' }],
    }),
    getTestById: builder.query({
      query: (id) => `/tests/${id}`,
      providesTags: (result, error, id) => [{ type: 'Test', id }],
    }),
    createTest: builder.mutation({
      query: (testData) => ({
        url: '/tests',
        method: 'POST',
        body: testData,
      }),
      invalidatesTags: [{ type: 'Test', id: 'LIST' }],
    }),
    updateTest: builder.mutation({
      query: ({ id, ...testData }) => ({
        url: `/tests/${id}`,
        method: 'PUT',
        body: testData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Test', id },
        { type: 'Test', id: 'LIST' },
      ],
    }),
    deleteTest: builder.mutation({
      query: (id) => ({
        url: `/tests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Test', id: 'LIST' }],
    }),
    createQuestionsBulk: builder.mutation({
      query: (questions) => ({
        url: '/questions/bulk',
        method: 'POST',
        body: { questions },
      }),
    }),
    fetchQuestionsBulk: builder.query({
      query: (questionIds) => ({
        url: '/questions/fetchBulk',
        method: 'POST',
        body: { question_ids: questionIds },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useGetSubjectsQuery,
  useGetTopicsQuery,
  useGetSubTopicsQuery,
  useGetSubTopicsMultiMutation,
  useGetTestsQuery,
  useGetTestByIdQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
  useCreateQuestionsBulkMutation,
  useFetchQuestionsBulkQuery,
  useLazyFetchQuestionsBulkQuery,
} = apiSlice;
