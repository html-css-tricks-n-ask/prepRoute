import React from 'react';
import Button from '../../../components/common/Button';

export default function QuestionPreviewCard({
  q,
  idx,
  handleEditQuestion,
  handleDeleteQuestion,
  allTopics
}) {
  return (
    <div className="question-preview-card">
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
  );
}
