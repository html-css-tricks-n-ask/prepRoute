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
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';

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
    setDeleteIdx(index);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
          <div className="skeleton-line" style={{ width: '150px', height: '24px' }}></div>
          <div className="skeleton-line" style={{ width: '150px', height: '24px' }}></div>
          <div className="skeleton-line" style={{ width: '150px', height: '24px' }}></div>
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
        <Card style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderColor: 'rgba(91,92,235,0.15)', borderLeft: '4px solid var(--primary)', marginBottom: '32px' }}>
          <div className="active-session-summary">
            <div>
              <div className="session-status-badge">
                <span className="pulse-indicator"></span>
                <span className="session-badge">Active Session</span>
              </div>
              <h2 className="session-title">{test.name}</h2>
              <div className="session-meta-tags">
                <span className="meta-tag subject-tag">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                  {test.subject}
                </span>
                <span className={`meta-tag difficulty-tag difficulty-${test.difficulty?.toLowerCase()}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  {test.difficulty}
                </span>
              </div>
            </div>
            
            <div className="active-session-details">
              <div className="metric-box">
                <div className="metric-icon" style={{ color: 'var(--success)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                </div>
                <div>
                  <div className="caption text-muted">MARKING SCHEME</div>
                  <div className="metric-value text-success">+{test.correct_marks} / {test.wrong_marks}</div>
                </div>
              </div>

              <div className="metric-box">
                <div className="metric-icon" style={{ color: 'var(--primary)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="caption text-muted">DURATION</div>
                  <div className="metric-value">{test.total_time} mins</div>
                </div>
              </div>

              <div className="metric-box">
                <div className="metric-icon" style={{ color: 'var(--secondary)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="caption text-muted">TOTAL Qs</div>
                  <div className="metric-value text-primary">{questionsList.length} Qs</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="form-grid-two-col" style={{ alignItems: 'start', gap: '24px' }}>
        
        {/* Left Side: Question Builder Form */}
        <div id="question-form-container" className="card" style={{ padding: '24px' }}>
          <h3 className="card-title mb-4">
            {editingIndex !== null ? '📝 Edit Question details' : '➕ Question Builder'}
          </h3>

          {errorsList.length > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--danger)',
              padding: '12px',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              <ul style={{ paddingLeft: '16px', margin: 0 }}>
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
          <div className="form-row-grid-2" style={{ marginTop: '16px' }}>
            <Input
              label="Option 1"
              placeholder="Option 1"
              disabled={submitting}
              error={errors.option1?.message}
              {...register('option1')}
              style={{ marginBottom: 0 }}
            />
            <Input
              label="Option 2"
              placeholder="Option 2"
              disabled={submitting}
              error={errors.option2?.message}
              {...register('option2')}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div className="form-row-grid-2">
            <Input
              label="Option 3"
              placeholder="Option 3"
              disabled={submitting}
              error={errors.option3?.message}
              {...register('option3')}
              style={{ marginBottom: 0 }}
            />
            <Input
              label="Option 4"
              placeholder="Option 4"
              disabled={submitting}
              error={errors.option4?.message}
              {...register('option4')}
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Correct Option */}
          <div className="form-group">
            <label className="form-label">
              Correct Answer Option
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

          {/* Optional details */}
          <h4 className="small-text mb-3" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Optional Question Metadata
          </h4>

          <div className="form-row-grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
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

            <div className="form-group" style={{ marginBottom: 0 }}>
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

          <div className="form-row-grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
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

            <Input
              label="Media URL"
              placeholder="Image/diagram URL"
              disabled={submitting}
              error={errors.media_url?.message}
              {...register('media_url')}
              style={{ marginBottom: 0 }}
            />
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Button
              variant="primary"
              style={{ flex: 1 }}
              onClick={handleSubmit(handleAddQuestion)}
              disabled={submitting}
            >
              {editingIndex !== null ? 'Update Question' : 'Add Question'}
            </Button>
            {editingIndex !== null && (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingIndex(null);
                  reset();
                }}
                disabled={submitting}
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </div>

        {/* Right Side: Questions Preview Queue */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ minHeight: '400px', padding: '24px' }}>
            <h3 className="card-title mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Questions List</span>
              <Badge status="live" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none' }}>
                {questionsList.length} Added
              </Badge>
            </h3>

            {questionsList.length === 0 ? (
              <EmptyState
                title="No questions added yet"
                description="Use the builder on the left to write questions."
                icon={
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                }
              />
            ) : (
              <div style={{ maxHeight: '720px', overflowY: 'auto', paddingRight: '4px' }}>
                {questionsList.map((q, idx) => (
                  <div key={idx} className="question-preview-card">
                    <div className="question-header">
                      <span className="question-number">Question {idx + 1}</span>
                      <div className="question-actions">
                        <Button
                          variant="secondary"
                          className="btn-icon"
                          onClick={() => handleEditQuestion(idx)}
                          title="Edit"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                        </Button>
                        <Button
                          variant="danger"
                          className="btn-icon"
                          onClick={() => handleDeleteQuestion(idx)}
                          title="Delete"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                          </svg>
                        </Button>
                      </div>
                    </div>

                    <div className="question-text">{q.question}</div>

                    <div className="options-grid">
                      <div className={`option-preview-box ${q.correct_option === 'option1' ? 'correct' : ''}`}>
                        <span className="option-prefix">A</span>
                        <span className="option-value">{q.option1}</span>
                        {q.correct_option === 'option1' && (
                          <svg className="option-correct-badge" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <div className={`option-preview-box ${q.correct_option === 'option2' ? 'correct' : ''}`}>
                        <span className="option-prefix">B</span>
                        <span className="option-value">{q.option2}</span>
                        {q.correct_option === 'option2' && (
                          <svg className="option-correct-badge" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <div className={`option-preview-box ${q.correct_option === 'option3' ? 'correct' : ''}`}>
                        <span className="option-prefix">C</span>
                        <span className="option-value">{q.option3}</span>
                        {q.correct_option === 'option3' && (
                          <svg className="option-correct-badge" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <div className={`option-preview-box ${q.correct_option === 'option4' ? 'correct' : ''}`}>
                        <span className="option-prefix">D</span>
                        <span className="option-value">{q.option4}</span>
                        {q.correct_option === 'option4' && (
                          <svg className="option-correct-badge" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="question-meta-row">
                      {q.difficulty && (
                        <span className={`meta-pill difficulty-pill difficulty-${q.difficulty?.toLowerCase()}`}>
                          Difficulty: {q.difficulty}
                        </span>
                      )}
                      {q.topic_id && (
                        <span className="meta-pill topic-pill">
                          Topic: {allTopics.find(t => t.id === q.topic_id)?.name || 'Custom'}
                        </span>
                      )}
                      {q.media_url && (
                        <span className="meta-pill attachment-pill">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                          </svg>
                          Attachment
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
      <Card style={{ marginTop: '24px', padding: '16px 24px' }}>
        <div className="add-questions-footer">
          <Button
            variant="secondary"
            onClick={() => navigate(`/test/edit/${testId}`)}
            disabled={submitting}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Details
          </Button>

          <div className="add-questions-footer-right">
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
              disabled={submitting}
            >
              Exit to Dashboard
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSaveAndContinue}
              isLoading={submitting}
              className="btn-save-continue"
            >
              Save & Continue
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
