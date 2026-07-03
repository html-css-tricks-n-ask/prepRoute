import React from 'react';
import Card from '../../../components/common/Card';
import EmptyState from '../../../components/empty/EmptyState';
import Badge from '../../../components/common/Badge';

export default function QuestionsPreviewList({ questions }) {
  return (
    <div>
      <h2 className="section-title mb-4">
        Questions Preview ({questions.length})
      </h2>

      {questions.length === 0 ? (
        <Card style={{ padding: '48px', textAlign: 'center' }}>
          <EmptyState
            title="No questions added"
            description="Please click 'Edit Questions' to add questions."
            icon={
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            }
          />
        </Card>
      ) : (
        <div>
          {questions.map((q, index) => (
            <Card key={q.id || index} className="mb-4">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '12px',
                  marginBottom: '16px',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  Question {index + 1}
                </span>
                <Badge
                  status="draft"
                  style={{ textTransform: 'capitalize' }}
                >
                  Difficulty: {q.difficulty || 'medium'}
                </Badge>
              </div>

              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  marginBottom: '20px',
                  color: 'var(--heading)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {q.question}
              </div>

              {q.media_url && (
                <div
                  style={{
                    marginBottom: '20px',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    maxWidth: '350px',
                  }}
                >
                  <img
                    src={q.media_url}
                    alt={`Question ${index + 1} reference visual`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="options-grid">
                <div
                  className={`option-preview ${q.correct_option === 'option1' ? 'correct' : ''}`}
                >
                  <strong>A:</strong> {q.option1}
                </div>
                <div
                  className={`option-preview ${q.correct_option === 'option2' ? 'correct' : ''}`}
                >
                  <strong>B:</strong> {q.option2}
                </div>
                <div
                  className={`option-preview ${q.correct_option === 'option3' ? 'correct' : ''}`}
                >
                  <strong>C:</strong> {q.option3}
                </div>
                <div
                  className={`option-preview ${q.correct_option === 'option4' ? 'correct' : ''}`}
                >
                  <strong>D:</strong> {q.option4}
                </div>
              </div>

              {q.explanation && (
                <div
                  style={{
                    marginTop: '20px',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <strong
                    style={{
                      fontSize: '13px',
                      color: 'var(--primary)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Solution Explanation:
                  </strong>
                  <span
                    style={{ fontSize: '14px', color: 'var(--body-text)' }}
                  >
                    {q.explanation}
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
