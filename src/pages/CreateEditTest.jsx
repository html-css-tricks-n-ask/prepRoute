import React from 'react';
import { useTestForm } from '../features/tests/hooks/useTestForm';
import MarkingSchemeSection from '../features/tests/components/MarkingSchemeSection';
import StepIndicator from '../components/stepper/StepIndicator';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';

export default function CreateEditTest() {
  const {
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
    totalMarks,
    adjustCorrectMarks,
    adjustWrongMarks,
    adjustUnattemptMarks,
    handleFormSubmit
  } = useTestForm();

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
      <StepIndicator activeStep={1} testId={id} navigate={navigate} />

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
              <MarkingSchemeSection
                wrongMarks={wrongMarks}
                unattemptMarks={unattemptMarks}
                correctMarks={correctMarks}
                adjustWrongMarks={adjustWrongMarks}
                adjustUnattemptMarks={adjustUnattemptMarks}
                adjustCorrectMarks={adjustCorrectMarks}
              />

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

        <div className="form-actions-footer">
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            disabled={submitting}
          >
            Cancel
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSubmit((values) => handleFormSubmit(values, false))}
            disabled={submitting}
            style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.2)', marginRight: '1rem' }}
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
