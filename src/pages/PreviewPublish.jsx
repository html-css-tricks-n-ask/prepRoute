import React from 'react';
import { usePreviewPublish } from '../features/preview/hooks/usePreviewPublish';
import PublishSuccessBanner from '../features/preview/components/PublishSuccessBanner';
import PreviewOverview from '../features/preview/components/PreviewOverview';
import QuestionsPreviewList from '../features/preview/components/QuestionsPreviewList';
import StepIndicator from '../components/stepper/StepIndicator';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function PreviewPublish() {
  const {
    navigate,
    testId,
    test,
    testError,
    questions,
    loading,
    isPublishing,
    isPublished,
    handlePublish
  } = usePreviewPublish();

  if (loading) {
    return (
      <div
        className="skeleton-pulse"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          maxWidth: '850px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginBottom: '1rem',
          }}
        >
          <div
            className="skeleton-line"
            style={{ width: '150px', height: '24px' }}
          ></div>
          <div
            className="skeleton-line"
            style={{ width: '150px', height: '24px' }}
          ></div>
          <div
            className="skeleton-line"
            style={{ width: '150px', height: '24px' }}
          ></div>
        </div>
      </div>
    );
  }

  if (testError || !test) {
    return (
      <div
        style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#fca5a5',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        Failed to load test details for review.
      </div>
    );
  }

  if (isPublished) {
    return <PublishSuccessBanner test={test} />;
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Wizard Steps Indicator */}
      <StepIndicator activeStep={3} testId={testId} navigate={navigate} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Overview Summary */}
        <PreviewOverview
          test={test}
          questionsLength={questions.length}
          navigate={navigate}
          isPublishing={isPublishing}
          testId={testId}
        />

        {/* Section 2: Questions Preview List */}
        <QuestionsPreviewList questions={questions} />

        {/* Action Footer */}
        <Card style={{ padding: '16px 24px', marginBottom: '32px' }}>
          <div className="preview-footer-actions">
            <Button
              variant="secondary"
              onClick={() => navigate('/')}
              disabled={isPublishing}
            >
              Exit to Dashboard
            </Button>
            <Button
              variant="primary"
              onClick={handlePublish}
              disabled={isPublishing || questions.length === 0}
              style={{ minWidth: '180px' }}
            >
              {isPublishing ? (
                <span>Publishing...</span>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    justifyContent: 'center',
                  }}
                >
                  Publish Test
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </div>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
