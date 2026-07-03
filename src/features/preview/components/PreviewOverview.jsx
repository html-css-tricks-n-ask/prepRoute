import React from 'react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';

export default function PreviewOverview({
  test,
  questionsLength,
  navigate,
  isPublishing,
  testId
}) {
  return (
    <Card>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '24px',
          marginBottom: '24px',
        }}
      >
        <div>
          <Badge
            status={test.status || 'draft'}
            style={{ marginBottom: '8px' }}
          />
          <h1 className="page-title" style={{ margin: '0 0 8px 0' }}>{test.name}</h1>
          <div className="secondary-info">
            Subject: <strong className="primary-value">{test.subject}</strong>
          </div>
        </div>

        <div className="preview-header-actions">
          <Button
            variant="secondary"
            onClick={() => navigate(`/test/edit/${testId}`)}
            disabled={isPublishing}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '6px' }}
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Edit Details
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/test/${testId}/questions`)}
            disabled={isPublishing}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: '6px' }}
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Edit Questions
          </Button>
        </div>
      </div>

      <div
        className="preview-summary-grid"
        style={{
          background: '#f8fafc',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div className="preview-summary-column">
          <span className="card-heading" style={{ marginBottom: '16px' }}>Parameters</span>
          <div className="preview-summary-list">
            <div className="preview-summary-item">
              <span className="field-label">Subject</span>
              <span className="primary-value">{test.subject}</span>
            </div>
            <div className="preview-summary-item">
              <span className="field-label">Type</span>
              <span className="primary-value" style={{ textTransform: 'capitalize' }}>{test.type}</span>
            </div>
            <div className="preview-summary-item">
              <span className="field-label">Difficulty</span>
              <span
                className={`primary-value status-${test.difficulty?.toLowerCase()}`}
                style={{ textTransform: 'capitalize' }}
              >
                {test.difficulty}
              </span>
            </div>
          </div>
        </div>

        <div className="preview-summary-column">
          <span className="card-heading" style={{ marginBottom: '16px' }}>Marking Scheme</span>
          <div className="preview-summary-list">
            <div className="preview-summary-item">
              <span className="field-label">Correct</span>
              <span className="primary-value status-easy">+{test.correct_marks}</span>
            </div>
            <div className="preview-summary-item">
              <span className="field-label">Incorrect</span>
              <span className="primary-value status-hard">{test.wrong_marks}</span>
            </div>
            <div className="preview-summary-item">
              <span className="field-label">Unattempted</span>
              <span className="primary-value">{test.unattempt_marks}</span>
            </div>
          </div>
        </div>

        <div className="preview-summary-column">
          <span className="card-heading" style={{ marginBottom: '16px' }}>Totals Summary</span>
          <div className="preview-summary-list">
            <div className="preview-summary-item">
              <span className="field-label">Questions</span>
              <span className="primary-value">{questionsLength} Qs</span>
            </div>
            <div className="preview-summary-item">
              <span className="field-label">Time Limit</span>
              <span className="primary-value">{test.total_time} mins</span>
            </div>
            <div className="preview-summary-item">
              <span className="field-label">Max Score</span>
              <span className="primary-value">{test.total_marks} Marks</span>
            </div>
          </div>
        </div>
      </div>

      {test.topics && test.topics.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <span
            className="secondary-info"
            style={{
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Targeted Topics & Sub-topics
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {test.topics.map((t, i) => (
              <Badge
                key={`t-${i}`}
                status="draft"
                className="topic-chip"
                style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(91,92,235,0.15)',
                }}
              >
                {t}
              </Badge>
            ))}
            {test.sub_topics &&
              test.sub_topics.map((st, i) => (
                <Badge
                  key={`st-${i}`}
                  status="draft"
                  className="topic-chip"
                  style={{
                    background: 'rgba(124, 58, 237, 0.1)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(124, 58, 237, 0.1)',
                  }}
                >
                  {st}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </Card>
  );
}
