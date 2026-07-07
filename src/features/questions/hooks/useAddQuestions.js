import { useState, useEffect, useCallback } from 'react';
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
import { storage } from '../../../utils/storage';
import { STORAGE_KEYS } from '../../../constants/storage';
import { ROUTES } from '../../../constants/routes';

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
    return storage.getJSON(STORAGE_KEYS.unsavedQuestions(testId)) ?? [];
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

  // Load existing questions from the backend if there are no unsaved changes
  useEffect(() => {
    const hasUnsaved = storage.get(STORAGE_KEYS.unsavedQuestions(testId)) !== null;
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

  const handleAddQuestion = useCallback((values) => {
    const questionData = {
      ...values,
      test_id: testId,
      id: editingIndex !== null ? questionsList[editingIndex].id : undefined,
      created_at: editingIndex !== null ? questionsList[editingIndex].created_at : undefined,
    };

    if (editingIndex !== null) {
      setQuestionsList(prev => {
        const updated = [...prev];
        updated[editingIndex] = questionData;
        storage.setJSON(STORAGE_KEYS.unsavedQuestions(testId), updated);
        return updated;
      });
      setEditingIndex(null);
      toast.success('Question details updated.');
    } else {
      setQuestionsList(prev => {
        const updated = [...prev, questionData];
        storage.setJSON(STORAGE_KEYS.unsavedQuestions(testId), updated);
        return updated;
      });
      toast.success('Question added to test list.');
    }

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
  }, [editingIndex, questionsList, testId, reset]);

  const handleEditQuestion = useCallback((index) => {
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
    document.getElementById('question-form-container')?.scrollIntoView({ behavior: 'smooth' });
  }, [questionsList, reset]);

  const handleDeleteQuestion = useCallback((index) => {
    setDeleteIdx(index);
    setIsDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteIdx === null) return;
    setQuestionsList(prev => {
      const updated = prev.filter((_, idx) => idx !== deleteIdx);
      storage.setJSON(STORAGE_KEYS.unsavedQuestions(testId), updated);
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
  }, [deleteIdx, editingIndex, testId, reset]);

  const cancelDelete = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setDeleteIdx(null);
  }, []);

  const handleSaveAndContinue = useCallback(async () => {
    if (questionsList.length === 0) {
      toast.error('Minimum 1 question is required before saving and continuing.');
      return;
    }

    try {
      const savedQuestions = await createQuestionsBulk(questionsList).unwrap();
      const questionIds = savedQuestions.map(q => q.id);
      const calculatedTotalMarks = questionsList.length * (test?.correct_marks || 5);

      await updateTest({
        id: testId,
        questions: questionIds,
        total_questions: questionsList.length,
        total_marks: calculatedTotalMarks
      }).unwrap();

      storage.remove(STORAGE_KEYS.unsavedQuestions(testId));
      toast.success('Questions saved successfully!');
      navigate(ROUTES.TEST_PREVIEW(testId));
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || err.message || 'Failed to save questions.');
    }
  }, [questionsList, test, testId, createQuestionsBulk, updateTest, navigate]);

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
