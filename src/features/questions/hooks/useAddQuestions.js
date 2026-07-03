import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  useGetTestByIdQuery,
  useGetTopicsQuery,
  useGetSubTopicsMultiMutation,
  useFetchQuestionsBulkQuery,
  useCreateQuestionsBulkMutation,
  useUpdateTestMutation,
} from '../../../store/apiSlice';
import { questionSchema } from '../constants/questionSchema';

export function useAddQuestions() {
  const navigate = useNavigate();
  const { id: testId } = useParams();

  // Test data and question queries
  const { data: test, isLoading: testLoading } = useGetTestByIdQuery(testId);
  const { data: allTopics = [] } = useGetTopicsQuery(test?.subject_id, { skip: !test?.subject_id });
  const [getSubTopicsMulti, { data: allSubTopics = [] }] = useGetSubTopicsMultiMutation();
  const { data: fetchedQuestions } = useFetchQuestionsBulkQuery(test?.questions, { skip: !test?.questions?.length });

  // Bulk save and update mutations
  const [createQuestionsBulk, { isLoading: isBulkSaving }] = useCreateQuestionsBulkMutation();
  const [updateTest, { isLoading: isTestUpdating }] = useUpdateTestMutation();

  // State management
  const [questionsList, setQuestionsList] = useState(() => {
    try {
      const stored = localStorage.getItem(`unsaved_questions_${testId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error parsing stored questions:', e);
    }
    return [];
  });
  const [editingIndex, setEditingIndex] = useState(null);
  // Delete confirmation state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState(null);

  // Bind topics and subtopics
  useEffect(() => {
    if (test?.topic_ids?.length > 0) {
      getSubTopicsMulti(test.topic_ids);
    }
  }, [test?.topic_ids, getSubTopicsMulti]);

  // Load existing questions from the backend if there are no unsaved changes in localStorage
  useEffect(() => {
    const hasUnsaved = localStorage.getItem(`unsaved_questions_${testId}`) !== null;
    if (fetchedQuestions && !hasUnsaved) {
      setQuestionsList(fetchedQuestions);
    }
  }, [fetchedQuestions, testId]);

  // Form Setup
  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    reset,
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct_option: 'option1',
      explanation: '',
      difficulty: 'medium',
      topic_id: '',
      sub_topic_id: '',
      media_url: ''
    }
  });

  const questionValue = watch('question');
  const explanationValue = watch('explanation');
  const option1 = watch('option1');
  const option2 = watch('option2');
  const option3 = watch('option3');
  const option4 = watch('option4');
  const correctOption = watch('correct_option');
  const questionTopic = watch('topic_id');
  const questionSubTopic = watch('sub_topic_id');
  const difficulty = watch('difficulty');

  // Filter topics and subtopics for this test subject
  const testTopics = allTopics.filter(t => test?.topic_ids?.includes(t.id));
  const testSubTopics = allSubTopics.filter(st => test?.sub_topic_ids?.includes(st.id));

  // Add/Update single question in the local list
  const handleAddQuestion = (values) => {
    const questionData = {
      ...values,
      test_id: testId,
      // Keep ID and created date if editing
      id: editingIndex !== null ? questionsList[editingIndex].id : undefined,
      created_at: editingIndex !== null ? questionsList[editingIndex].created_at : undefined
    };

    if (editingIndex !== null) {
      setQuestionsList(prev => {
        const updated = [...prev];
        updated[editingIndex] = questionData;
        localStorage.setItem(`unsaved_questions_${testId}`, JSON.stringify(updated));
        return updated;
      });
      setEditingIndex(null);
      toast.success('Question details updated.');
    } else {
      setQuestionsList(prev => {
        const updated = [...prev, questionData];
        localStorage.setItem(`unsaved_questions_${testId}`, JSON.stringify(updated));
        return updated;
      });
      toast.success('Question added to test list.');
    }

    // Reset Form Fields
    reset({
      question: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct_option: 'option1',
      explanation: '',
      difficulty: 'medium',
      topic_id: '',
      sub_topic_id: '',
      media_url: ''
    });
  };

  const handleEditQuestion = (index) => {
    const q = questionsList[index];
    reset({
      question: q.question,
      option1: q.option1,
      option2: q.option2,
      option3: q.option3,
      option4: q.option4,
      correct_option: q.correct_option || 'option1',
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'medium',
      topic_id: q.topic_id || '',
      sub_topic_id: q.sub_topic_id || '',
      media_url: q.media_url || ''
    });
    setEditingIndex(index);
    
    const formContainer = document.getElementById('question-form-container');
    if (formContainer) {
      formContainer.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteQuestion = (index) => {
    setDeleteIdx(index);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteIdx === null) return;
    setQuestionsList(prev => {
      const updated = prev.filter((_, idx) => idx !== deleteIdx);
      localStorage.setItem(`unsaved_questions_${testId}`, JSON.stringify(updated));
      return updated;
    });
    if (editingIndex === deleteIdx) {
      setEditingIndex(null);
      reset();
    } else if (editingIndex !== null && editingIndex > deleteIdx) {
      setEditingIndex(prev => prev - 1);
    }
    toast.success('Question removed.');
    setIsDeleteConfirmOpen(false);
    setDeleteIdx(null);
  };

  const cancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setDeleteIdx(null);
  };

  const handleSaveAndContinue = async () => {
    if (questionsList.length === 0) {
      toast.error('Minimum 1 question is required before saving and continuing.');
      return;
    }

    try {
      // 1. Bulk Save/Update Questions
      const savedQuestions = await createQuestionsBulk(questionsList).unwrap();
      const questionIds = savedQuestions.map(q => q.id);

      // 2. Compute total marks dynamically
      const calculatedTotalMarks = questionsList.length * (test?.correct_marks || 5);

      // 3. Update test metadata
      await updateTest({
        id: testId,
        questions: questionIds,
        total_questions: questionsList.length,
        total_marks: calculatedTotalMarks
      }).unwrap();

      localStorage.removeItem(`unsaved_questions_${testId}`);
      toast.success('Questions saved successfully!');
      navigate(`/test/${testId}/preview`);
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || err.message || 'Failed to save questions.');
    }
  };

  const loading = testLoading;
  const submitting = isBulkSaving || isTestUpdating;

  return {
    navigate,
    testId,
    test,
    allTopics,
    questionsList,
    editingIndex,
    setEditingIndex,
    isDeleteConfirmOpen,
    confirmDelete,
    cancelDelete,
    handleSaveAndContinue,
    register,
    handleSubmit,
    setValue,
    reset,
    errors,
    questionValue,
    explanationValue,
    option1,
    option2,
    option3,
    option4,
    correctOption,
    questionTopic,
    questionSubTopic,
    difficulty,
    testTopics,
    testSubTopics,
    handleAddQuestion,
    handleEditQuestion,
    handleDeleteQuestion,
    loading,
    submitting
  };
}
