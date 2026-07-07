import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { 
  useGetSubjectsQuery, 
  useGetTopicsQuery, 
  useGetSubTopicsMultiMutation, 
  useGetTestByIdQuery, 
  useCreateTestMutation, 
  useUpdateTestMutation 
} from '../../../store/apiSlice';
import { testSchema } from '../constants/testSchema';

export function useTestForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // RTK Query hooks
  const { data: subjects = [], isLoading: subjectsLoading } = useGetSubjectsQuery();
  const { data: testData, isLoading: testLoading } = useGetTestByIdQuery(id, { skip: !isEditMode });
  const [createTest, { isLoading: isCreating }] = useCreateTestMutation();
  const [updateTest, { isLoading: isUpdating }] = useUpdateTestMutation();
  const [getSubTopicsMulti, { data: availableSubTopics = [], isLoading: subTopicsLoading }] = useGetSubTopicsMultiMutation();

  // React Hook Form initialization
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(testSchema),
    defaultValues: {
      name: '',
      subject: '',
      type: 'chapterwise',
      topics: [],
      sub_topics: [],
      difficulty: 'easy',
      correct_marks: 5,
      wrong_marks: -1,
      unattempt_marks: 0,
      total_time: '',
      total_questions: '',
      total_marks: 0
    }
  });

  const subject = watch('subject');
  const type = watch('type');
  const selectedTopics = watch('topics') || [];
  const selectedSubTopics = watch('sub_topics') || [];
  const correctMarks = watch('correct_marks') || 0;
  const wrongMarks = watch('wrong_marks') || 0;
  const unattemptMarks = watch('unattempt_marks') || 0;
  const difficulty = watch('difficulty');
  const totalQuestions = watch('total_questions') || 0;

  // Query topics based on selected subject
  const { data: availableTopics = [], isLoading: topicsLoading } = useGetTopicsQuery(subject, { skip: !subject });

  // Reset form when editing test details
  useEffect(() => {
    if (isEditMode && testData) {
      reset({
        name: testData.name,
        subject: testData.subject_id || testData.subject,
        type: testData.type || 'chapterwise',
        topics: testData.topic_ids || testData.topics || [],
        sub_topics: testData.sub_topic_ids || testData.sub_topics || [],
        difficulty: testData.difficulty || 'medium',
        correct_marks: testData.correct_marks !== undefined ? Number(testData.correct_marks) : 5,
        wrong_marks: testData.wrong_marks !== undefined ? Number(testData.wrong_marks) : -1,
        unattempt_marks: testData.unattempt_marks !== undefined ? Number(testData.unattempt_marks) : 0,
        total_time: testData.total_time ? Number(testData.total_time) : '',
        total_questions: testData.total_questions ? Number(testData.total_questions) : '',
        total_marks: testData.total_marks || 0
      });
    }
  }, [isEditMode, testData, reset]);

  // Fetch subtopics dynamically when topics array changes
  useEffect(() => {
    if (selectedTopics.length > 0) {
      getSubTopicsMulti(selectedTopics);
    }
    // selectedTopics is serialized to avoid referential inequality triggering re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedTopics), getSubTopicsMulti]);

  // Calculate total marks dynamically
  const totalMarks = Number(totalQuestions) * Number(correctMarks);
  useEffect(() => {
    setValue('total_marks', totalMarks);
  }, [totalQuestions, correctMarks, totalMarks, setValue]);

  // Handle wrong, unattempted and correct answer steppers
  const adjustCorrectMarks = (amount) => {
    setValue('correct_marks', Math.max(0, Number(correctMarks) + amount));
  };
  const adjustWrongMarks = (amount) => {
    setValue('wrong_marks', Number(wrongMarks) + amount);
  };
  const adjustUnattemptMarks = (amount) => {
    setValue('unattempt_marks', Number(unattemptMarks) + amount);
  };

  // Submit test configuration
  const handleFormSubmit = async (values, shouldRedirectToQuestions) => {
    const payload = {
      name: values.name,
      type: values.type,
      subject: values.subject,
      topics: values.topics,
      sub_topics: values.sub_topics,
      correct_marks: Number(values.correct_marks),
      wrong_marks: Number(values.wrong_marks),
      unattempt_marks: Number(values.unattempt_marks),
      difficulty: values.difficulty,
      total_time: Number(values.total_time),
      total_questions: Number(values.total_questions),
      total_marks: Number(values.total_marks),
      status: testData?.status || 'draft'
    };

    try {
      let savedTest;
      if (isEditMode) {
        savedTest = await updateTest({ id, ...payload }).unwrap();
        toast.success('Test details updated successfully.');
      } else {
        savedTest = await createTest(payload).unwrap();
        toast.success('Test created as draft.');
      }

      if (shouldRedirectToQuestions) {
        navigate(`/test/${isEditMode ? id : savedTest.id}/questions`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || err.message || 'Failed to save test configurations.');
    }
  };

  const loading = subjectsLoading || (isEditMode && testLoading);
  const submitting = isCreating || isUpdating;

  return {
    navigate,
    id,
    isEditMode,
    subjects,
    availableTopics,
    availableSubTopics,
    loading,
    submitting,
    topicsLoading,
    subTopicsLoading,
    register,
    handleSubmit,
    setValue,
    errors,
    subject,
    type,
    selectedTopics,
    selectedSubTopics,
    correctMarks,
    wrongMarks,
    unattemptMarks,
    difficulty,
    totalQuestions,
    totalMarks,
    adjustCorrectMarks,
    adjustWrongMarks,
    adjustUnattemptMarks,
    handleFormSubmit
  };
}
