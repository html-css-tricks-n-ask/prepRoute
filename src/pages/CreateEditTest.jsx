import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  useGetSubjectsQuery, 
  useGetTopicsQuery, 
  useGetSubTopicsMultiMutation, 
  useGetTestByIdQuery, 
  useCreateTestMutation, 
  useUpdateTestMutation 
} from '../store/apiSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

// Zod validation schema
const testSchema = z.object({
  name: z.string().trim().min(1, 'Test Name is required.'),
  subject: z.string().trim().min(1, 'Please select a Subject.'),
  type: z.enum(['chapterwise', 'pyq', 'mock']),
  topics: z.array(z.string()).min(1, 'Select at least one Topic.'),
  sub_topics: z.array(z.string()).min(1, 'Select at least one Sub-topic.'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  correct_marks: z.number().min(0, 'Correct Marks must be 0 or more.'),
  wrong_marks: z.number(),
  unattempt_marks: z.number(),
  total_time: z.number({ invalid_type_error: 'Duration is required.' }).min(1, 'Duration must be greater than 0 minutes.'),
  total_questions: z.number({ invalid_type_error: 'Number of Questions is required.' }).min(1, 'Number of Questions must be greater than 0.'),
  total_marks: z.number().optional()
});

export default function CreateEditTest() {
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
  const selectedTopicsKey = JSON.stringify(selectedTopics);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopicsKey, getSubTopicsMulti]);

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

  if (loading) {
    return (
      <div className="skeleton-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="skeleton-line" style={{ width: '40%', height: '32px' }}></div>
          <div className="skeleton-line" style={{ width: '25%', height: '16px' }}></div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="skeleton-line" style={{ width: '30%', height: '14px' }}></div>
              <div className="skeleton-line" style={{ width: '100%', height: '48px' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="skeleton-line" style={{ width: '30%', height: '14px' }}></div>
              <div className="skeleton-line" style={{ width: '100%', height: '48px' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stepper Node Indicator */}
      <div className="steps-indicator">
        <div className="step-node active">
          1
          <span className="step-label">Test Details</span>
        </div>
        <div className="step-node">
          2
          <span className="step-label">Add Questions</span>
        </div>
        <div className="step-node">
          3
          <span className="step-label">Preview & Publish</span>
        </div>
      </div>

      {/* Tab Group */}
      <div className="tab-group mb-5">
        <button 
          type="button" 
          className={`tab-btn ${type === 'chapterwise' ? 'active' : ''}`}
          onClick={() => setValue('type', 'chapterwise')}
        >
          Chapterwise
        </button>
        <button 
          type="button" 
          className={`tab-btn ${type === 'pyq' ? 'active' : ''}`}
          onClick={() => setValue('type', 'pyq')}
        >
          PYQ
        </button>
        <button 
          type="button" 
          className={`tab-btn ${type === 'mock' ? 'active' : ''}`}
          onClick={() => setValue('type', 'mock')}
        >
          Mock Test
        </button>
      </div>

      {/* Form */}
      <form onSubmit={(e) => e.preventDefault()}>
        <Card title={isEditMode ? 'Edit Test Details' : 'Create New Test'} className="mb-6">
          <div className="form-grid-two-col">
            
            {/* Left Column */}
            <div className="form-column">
              
              {/* Subject Dropdown */}
              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subject</label>
                <select
                  id="subject"
                  className={`form-control ${errors.subject ? 'error' : ''}`}
                  value={subject}
                  onChange={(e) => {
                    setValue('subject', e.target.value);
                    setValue('topics', []);
                    setValue('sub_topics', []);
                  }}
                  disabled={submitting}
                >
                  <option value="" disabled hidden>Choose from Drop-down</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.subject && <span className="form-error">{errors.subject.message}</span>}
              </div>

              {/* Topic Dropdown */}
              <div className="form-group">
                <label className="form-label" htmlFor="topic">Topic</label>
                <select
                  id="topic"
                  className={`form-control ${errors.topics ? 'error' : ''}`}
                  value={selectedTopics[0] || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setValue('topics', [e.target.value]);
                      setValue('sub_topics', []);
                    } else {
                      setValue('topics', []);
                    }
                  }}
                  disabled={submitting || !subject || topicsLoading}
                >
                  <option value="" disabled hidden>
                    {topicsLoading ? 'Loading Topics...' : 'Choose from Drop-down'}
                  </option>
                  {availableTopics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {errors.topics && <span className="form-error">{errors.topics.message}</span>}
              </div>

              {/* Duration (Minutes) */}
              <Input
                label="Duration (Minutes)"
                id="totalTime"
                type="number"
                placeholder="Enter the time"
                error={errors.total_time?.message}
                disabled={submitting}
                {...register('total_time', { valueAsNumber: true })}
              />

              {/* Marking Scheme Section */}
              <div className="marking-scheme-section mt-4">
                <h3 className="small-text" style={{ fontWeight: 600, color: 'var(--heading)', marginBottom: '12px' }}>Marking Scheme</h3>
                <div className="marking-scheme-grid">
                  
                  {/* Wrong Answer */}
                  <div className="marking-input-wrapper">
                    <label className="caption">Wrong Answer</label>
                    <div className="marking-stepper-control">
                      <input
                        type="text"
                        readOnly
                        value={wrongMarks > 0 ? `+${wrongMarks}` : wrongMarks === 0 ? '+0' : wrongMarks}
                      />
                      <div className="stepper-arrows">
                        <div className="stepper-arrow-btn" onClick={() => adjustWrongMarks(1)}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        </div>
                        <div className="stepper-arrow-btn" onClick={() => adjustWrongMarks(-1)}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Unattempted */}
                  <div className="marking-input-wrapper">
                    <label className="caption">Unattempted</label>
                    <div className="marking-stepper-control">
                      <input
                        type="text"
                        readOnly
                        value={unattemptMarks > 0 ? `+${unattemptMarks}` : unattemptMarks === 0 ? '+0' : unattemptMarks}
                      />
                      <div className="stepper-arrows">
                        <div className="stepper-arrow-btn" onClick={() => adjustUnattemptMarks(1)}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        </div>
                        <div className="stepper-arrow-btn" onClick={() => adjustUnattemptMarks(-1)}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div className="marking-input-wrapper">
                    <label className="caption">Correct Answer</label>
                    <div className="marking-stepper-control">
                      <input
                        type="text"
                        readOnly
                        value={correctMarks > 0 ? `+${correctMarks}` : correctMarks === 0 ? '+0' : correctMarks}
                      />
                      <div className="stepper-arrows">
                        <div className="stepper-arrow-btn" onClick={() => adjustCorrectMarks(1)}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="18 15 12 9 6 15"></polyline>
                          </svg>
                        </div>
                        <div className="stepper-arrow-btn" onClick={() => adjustCorrectMarks(-1)}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="form-column">
              
              {/* Name of Test */}
              <Input
                label="Name of Test"
                id="testName"
                placeholder="Enter name of Test"
                error={errors.name?.message}
                disabled={submitting}
                {...register('name')}
              />

              {/* Sub Topic Dropdown */}
              <div className="form-group">
                <label className="form-label" htmlFor="subtopic">Sub Topic</label>
                <select
                  id="subtopic"
                  className={`form-control ${errors.sub_topics ? 'error' : ''}`}
                  value={selectedSubTopics[0] || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setValue('sub_topics', [e.target.value]);
                    } else {
                      setValue('sub_topics', []);
                    }
                  }}
                  disabled={submitting || selectedTopics.length === 0 || subTopicsLoading}
                >
                  <option value="" disabled hidden>
                    {subTopicsLoading ? 'Loading Sub-topics...' : 'Choose from Drop-down'}
                  </option>
                  {availableSubTopics.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
                {errors.sub_topics && <span className="form-error">{errors.sub_topics.message}</span>}
              </div>

              {/* Difficulty Level */}
              <div className="form-group">
                <label className="form-label">Test Difficulty Level</label>
                <div className="difficulty-radio-group">
                  <label className="difficulty-radio-option">
                    <input
                      type="radio"
                      name="difficulty"
                      value="easy"
                      checked={difficulty === 'easy'}
                      onChange={() => setValue('difficulty', 'easy')}
                      disabled={submitting}
                    />
                    Easy
                  </label>
                  <label className="difficulty-radio-option">
                    <input
                      type="radio"
                      name="difficulty"
                      value="medium"
                      checked={difficulty === 'medium'}
                      onChange={() => setValue('difficulty', 'medium')}
                      disabled={submitting}
                    />
                    Medium
                  </label>
                  <label className="difficulty-radio-option">
                    <input
                      type="radio"
                      name="difficulty"
                      value="hard"
                      checked={difficulty === 'hard'}
                      onChange={() => setValue('difficulty', 'hard')}
                      disabled={submitting}
                    />
                    Difficult
                  </label>
                </div>
                {errors.difficulty && <span className="form-error">{errors.difficulty.message}</span>}
              </div>

              {/* Number of Questions */}
              <Input
                label="No of Questions"
                id="totalQuestions"
                type="number"
                placeholder="Enter number of questions"
                error={errors.total_questions?.message}
                disabled={submitting}
                {...register('total_questions', { valueAsNumber: true })}
              />

              {/* Total Marks */}
              <div className="form-group">
                <label className="form-label" htmlFor="totalMarks" style={{ color: 'var(--muted-text)' }}>Total Marks</label>
                <input
                  type="text"
                  id="totalMarks"
                  className="form-control"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--body-text)', cursor: 'not-allowed' }}
                  placeholder="Ex: 250 Marks"
                  value={totalMarks > 0 ? `${totalMarks} Marks` : ''}
                  readOnly
                />
              </div>

            </div>

          </div>
        </Card>

        {/* Footer Actions */}
        <div className="form-actions-footer">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            disabled={submitting}
          >
            Cancel
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleSubmit((values) => handleFormSubmit(values, false))}
            disabled={submitting}
            style={{ marginRight: '12px' }}
          >
            Save as Draft
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSubmit((values) => handleFormSubmit(values, true))}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Next'}
          </Button>
        </div>
      </form>
    </div>
  );
}
