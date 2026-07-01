import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import {
  useGetTestByIdQuery,
  useGetTopicsQuery,
  useGetSubTopicsMultiMutation,
  useFetchQuestionsBulkQuery,
  useCreateQuestionsBulkMutation,
  useUpdateTestMutation,
} from '../store/apiSlice';
import RichTextEditor from '../components/RichTextEditor';

// Question Zod schema
const questionSchema = z.object({
  question: z.string().trim().min(1, 'Question text is required.'),
  option1: z.string().trim().min(1, 'Option 1 is required.'),
  option2: z.string().trim().min(1, 'Option 2 is required.'),
  option3: z.string().trim().min(1, 'Option 3 is required.'),
  option4: z.string().trim().min(1, 'Option 4 is required.'),
  correct_option: z.enum(['option1', 'option2', 'option3', 'option4']),
  explanation: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic_id: z.string().optional(),
  sub_topic_id: z.string().optional(),
  media_url: z.string().url('Invalid URL format for Media URL.').or(z.literal('')).optional()
});

export default function AddQuestions() {
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
  const [questionsList, setQuestionsList] = useState([]);
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

  // Load existing questions
  useEffect(() => {
    if (fetchedQuestions) {
      setQuestionsList(fetchedQuestions);
    }
  }, [fetchedQuestions]);

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
        return updated;
      });
      setEditingIndex(null);
      toast.success('Question details updated.');
    } else {
      setQuestionsList(prev => [...prev, questionData]);
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
    console.log('Delete button clicked, index:', index);
    // Open confirmation modal instead of immediate confirm
    setDeleteIdx(index);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    console.log('Confirm delete, deleteIdx:', deleteIdx);
    if (deleteIdx === null) return;
    setQuestionsList(prev => prev.filter((_, idx) => idx !== deleteIdx));
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

      toast.success('Questions saved successfully!');
      navigate(`/test/${testId}/preview`);
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || err.message || 'Failed to save questions.');
    }
  };

  const loading = testLoading;
  const submitting = isBulkSaving || isTestUpdating;

  if (loading) {
    return (
      <div className="skeleton-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Stepper skeleton */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
          <div className="skeleton-line" style={{ width: '150px', height: '24px' }}></div>
          <div className="skeleton-line" style={{ width: '150px', height: '24px' }}></div>
          <div className="skeleton-line" style={{ width: '150px', height: '24px' }}></div>
        </div>
        {/* Active session card skeleton */}
        <div className="card" style={{ height: '100px' }}></div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '2rem' }}>
          {/* Left builder skeleton */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '24px' }}>
            <div className="skeleton-line" style={{ width: '40%', height: '24px' }}></div>
            <div className="skeleton-line" style={{ width: '100%', height: '120px' }}></div>
            <div className="skeleton-line" style={{ width: '100%', height: '48px' }}></div>
            <div className="skeleton-line" style={{ width: '100%', height: '48px' }}></div>
          </div>
          {/* Right questions list skeleton */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '24px' }}>
            <div className="skeleton-line" style={{ width: '50%', height: '24px' }}></div>
            <div className="skeleton-line" style={{ width: '100%', height: '60px' }}></div>
            <div className="skeleton-line" style={{ width: '100%', height: '60px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const errorsList = Object.values(errors).map(e => e.message);

  return (
    <div>
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={false}
      />
      {/* Wizard Steps Indicator */}
      <div className="steps-indicator">
        <div className="step-node completed" onClick={() => navigate(`/test/edit/${testId}`)} style={{ cursor: 'pointer' }}>
          1
          <span className="step-label">Test Details</span>
        </div>
        <div className="step-node active">
          2
          <span className="step-label">Add Questions</span>
        </div>
        <div className="step-node">
          3
          <span className="step-label">Preview & Publish</span>
        </div>
      </div>

      {/* Test details banner */}
      {test && (
        <div className="card" style={{ marginBottom: '2rem', background: '#EEF2FF', borderColor: '#C7D2FE' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div>
              <span className="badge" style={{ marginBottom: '0.5rem', background: '#5B5CEB', color: 'white' }}>
                Active Session
              </span>
              <h2 style={{ fontSize: '1.4rem', margin: 0, color: '#111827', fontWeight: 700 }}>{test.name}</h2>
              <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Subject: <strong style={{ color: '#111827' }}>{test.subject}</strong> | Difficulty: <strong style={{ color: '#111827' }}>{test.difficulty}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', borderLeft: '1px solid #C7D2FE', paddingLeft: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>MAPPING SCHEME</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>+{test.correct_marks} / {test.wrong_marks}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>DURATION</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>{test.total_time} mins</div>
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>TOTAL Qs</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#5B5CEB' }}>{questionsList.length} Qs</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>
        
        {/* Left Side: Question Builder Form */}
        <div id="question-form-container" className="card">
          <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
            {editingIndex !== null ? '📝 Edit Question details' : '➕ Question Builder'}
          </h3>

          {errorsList.length > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              color: '#fca5a5',
              padding: '0.75rem',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                {errorsList.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Question text rich editor */}
          <RichTextEditor 
            value={questionValue}
            onChange={val => setValue('question', val)}
            label="Question Text"
            placeholder="Type question content here..."
            required={true}
            disabled={submitting}
          />

          {/* Options input */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem', marginTop: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Option 1 <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="Option 1"
                {...register('option1')}
                disabled={submitting}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Option 2 <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="Option 2"
                {...register('option2')}
                disabled={submitting}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Option 3 <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="Option 3"
                {...register('option3')}
                disabled={submitting}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Option 4 <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="Option 4"
                {...register('option4')}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Correct Option */}
          <div className="form-group">
            <label className="form-label">
              Correct Answer Option <span className="required">*</span>
            </label>
            <select
              className="form-control"
              value={correctOption}
              onChange={(e) => setValue('correct_option', e.target.value)}
              disabled={submitting}
            >
              <option value="option1">Option 1: {option1 || '(Empty)'}</option>
              <option value="option2">Option 2: {option2 || '(Empty)'}</option>
              <option value="option3">Option 3: {option3 || '(Empty)'}</option>
              <option value="option4">Option 4: {option4 || '(Empty)'}</option>
            </select>
          </div>

          {/* Optional details collapse/section */}
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#38bdf8', fontWeight: 500 }}>
            Optional Question Metadata
          </h4>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Topic</label>
              <select
                className="form-control"
                value={questionTopic}
                onChange={(e) => {
                  setValue('topic_id', e.target.value);
                  setValue('sub_topic_id', '');
                }}
                disabled={submitting}
              >
                <option value="">-- Select Topic --</option>
                {testTopics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sub-topic</label>
              <select
                className="form-control"
                value={questionSubTopic}
                onChange={(e) => setValue('sub_topic_id', e.target.value)}
                disabled={submitting}
              >
                <option value="">-- Select Subtopic --</option>
                {testSubTopics
                  .filter(st => !questionTopic || st.topic_id === questionTopic)
                  .map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))
                }
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select
                className="form-control"
                value={difficulty}
                onChange={(e) => setValue('difficulty', e.target.value)}
                disabled={submitting}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Media URL</label>
              <input
                type="text"
                className={`form-control ${errors.media_url ? 'border-red-500' : ''}`}
                placeholder="Image/diagram URL"
                {...register('media_url')}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Explanation rich editor */}
          <RichTextEditor 
            value={explanationValue}
            onChange={val => setValue('explanation', val)}
            label="Solution Explanation"
            placeholder="Explain the correct answer steps..."
            required={false}
            disabled={submitting}
          />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSubmit(handleAddQuestion)}
              disabled={submitting}
            >
              {editingIndex !== null ? 'Update Question' : 'Add Question'}
            </button>
            {editingIndex !== null && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingIndex(null);
                  reset();
                }}
                disabled={submitting}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Questions Preview Queue */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ minHeight: '400px' }}>
            <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Questions List</span>
              <span className="badge badge-live" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>
                {questionsList.length} Added
              </span>
            </h3>

            {questionsList.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-muted)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
                <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>No questions added yet.</div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Use the builder on the left to write questions.</div>
              </div>
            ) : (
              <div style={{ maxHeight: '720px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {questionsList.map((q, idx) => (
                  <div key={idx} className="question-item">
                    <div className="question-header">
                      <span className="question-number">Question {idx + 1}</span>
                      <div className="question-actions">
                        <button
                          className="btn btn-secondary btn-icon"
                          onClick={() => handleEditQuestion(idx)}
                          title="Edit"
                          style={{ padding: '0.25rem' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => handleDeleteQuestion(idx)}
                          title="Delete"
                          style={{ padding: '0.25rem' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="question-text">{q.question}</div>

                    <div className="options-grid">
                      <div className={`option-preview ${q.correct_option === 'option1' ? 'correct' : ''}`}>
                        <strong>A:</strong> {q.option1}
                      </div>
                      <div className={`option-preview ${q.correct_option === 'option2' ? 'correct' : ''}`}>
                        <strong>B:</strong> {q.option2}
                      </div>
                      <div className={`option-preview ${q.correct_option === 'option3' ? 'correct' : ''}`}>
                        <strong>C:</strong> {q.option3}
                      </div>
                      <div className={`option-preview ${q.correct_option === 'option4' ? 'correct' : ''}`}>
                        <strong>D:</strong> {q.option4}
                      </div>
                    </div>

                    <div className="question-meta">
                      {q.difficulty && (
                        <span className="meta-pill" style={{ textTransform: 'capitalize' }}>
                          Difficulty: {q.difficulty}
                        </span>
                      )}
                      {q.topic_id && (
                        <span className="meta-pill">
                          Topic: {allTopics.find(t => t.id === q.topic_id)?.name || 'Custom'}
                        </span>
                      )}
                      {q.media_url && (
                        <span className="meta-pill" style={{ color: '#0ea5e9' }}>
                          📎 Has Media Attachment
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="card" style={{ marginTop: '2rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(`/test/edit/${testId}`)}
          disabled={submitting}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Details
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/')}
            disabled={submitting}
          >
            Exit to Dashboard
          </button>
          
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveAndContinue}
            disabled={submitting}
            style={{ minWidth: '160px' }}
          >
            {submitting ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <span className="loading-spinner" style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent' }}></span> Saving...
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                Save & Continue
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
