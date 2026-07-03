import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useGetTestByIdQuery,
  useFetchQuestionsBulkQuery,
  useUpdateTestMutation,
} from '../../../store/apiSlice';

export function usePreviewPublish() {
  const navigate = useNavigate();
  const { id: testId } = useParams();

  // RTK Query fetches
  const {
    data: test,
    isLoading: testLoading,
    error: testError,
  } = useGetTestByIdQuery(testId);
  const { data: questions = [], isLoading: questionsLoading } =
    useFetchQuestionsBulkQuery(test?.questions, {
      skip: !test?.questions?.length,
    });

  const [updateTest, { isLoading: isPublishing }] = useUpdateTestMutation();
  const [isPublished, setIsPublished] = useState(false);

  const handlePublish = async () => {
    try {
      await updateTest({ id: testId, status: 'live' }).unwrap();
      setIsPublished(true);
      toast.success('Test published successfully!');

      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error(
        err.data?.message || err.message || 'Failed to publish test.'
      );
    }
  };

  const loading = testLoading || questionsLoading;

  return {
    navigate,
    testId,
    test,
    testError,
    questions,
    loading,
    isPublishing,
    isPublished,
    handlePublish
  };
}
