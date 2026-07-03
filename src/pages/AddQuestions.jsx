import React from 'react';
import ConfirmationModal from '../components/modal/ConfirmationModal';
import { useAddQuestions } from '../features/questions/hooks/useAddQuestions';
import ActiveSessionBanner from '../features/questions/components/ActiveSessionBanner';
import QuestionForm from '../features/questions/components/QuestionForm';
import QuestionPreviewList from '../features/questions/components/QuestionPreviewList';
import StepIndicator from '../components/stepper/StepIndicator';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function AddQuestions() {
  const {
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
  } = useAddQuestions();

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
      <StepIndicator activeStep={2} testId={testId} navigate={navigate} />

      {/* Test details banner */}
      <ActiveSessionBanner test={test} questionsCount={questionsList.length} />

      <div className="form-grid-two-col" style={{ alignItems: 'start', gap: '24px' }}>
        
        {/* Left Side: Question Builder Form */}
        <QuestionForm
          register={register}
          handleSubmit={handleSubmit}
          setValue={setValue}
          reset={reset}
          errors={errors}
          questionValue={questionValue}
          explanationValue={explanationValue}
          option1={option1}
          option2={option2}
          option3={option3}
          option4={option4}
          correctOption={correctOption}
          questionTopic={questionTopic}
          questionSubTopic={questionSubTopic}
          difficulty={difficulty}
          testTopics={testTopics}
          testSubTopics={testSubTopics}
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
          submitting={submitting}
          handleAddQuestion={handleAddQuestion}
        />

        {/* Right Side: Questions Preview Queue */}
        <div style={{ flex: 1 }}>
          <QuestionPreviewList
            questionsList={questionsList}
            handleEditQuestion={handleEditQuestion}
            handleDeleteQuestion={handleDeleteQuestion}
            allTopics={allTopics}
          />
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
