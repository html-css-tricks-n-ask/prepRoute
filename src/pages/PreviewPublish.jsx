import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  useGetTestByIdQuery, 
  useFetchQuestionsBulkQuery, 
  useUpdateTestMutation 
} from '../store/apiSlice';

export default function PreviewPublish() {
  const navigate = useNavigate();
  const { id: testId } = useParams();
  
  // RTK Query fetches
  const { data: test, isLoading: testLoading, error: testError } = useGetTestByIdQuery(testId);
  const { data: questions = [], isLoading: questionsLoading } = useFetchQuestionsBulkQuery(
    test?.questions, 
    { skip: !test?.questions?.length }
  );

  const [updateTest, { isLoading: isPublishing }] = useUpdateTestMutation();
  const [isPublished, setIsPublished] = useState(false);

  const handlePublish = async () => {
    try {
      // Endpoint 10: Publish Test -> PUT /tests/:id with { status: "live" }
      await updateTest({ id: testId, status: 'live' }).unwrap();
      setIsPublished(true);
      toast.success('Test published successfully!');
      
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || err.message || 'Failed to publish test.');
    }
  };

  const loading = testLoading || questionsLoading;

  if (loading) {
    return (
      <div className="skeleton-pulse" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px', margin: '0 auto' }}>
        {/* Stepper skeleton */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
          <div className="skeleton-line" style={{ width: '150px', height: '24px' }}></div>
          <div className="skeleton-line" style={{ width: '150px', height: '24px' }}></div>
          <div className="skeleton-line" style={{ width: '150px', height: '24px' }}></div>
        </div>
        {/* Detail card skeleton */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '24px' }}>
          <div className="skeleton-line" style={{ width: '50%', height: '32px' }}></div>
          <div className="skeleton-line" style={{ width: '30%', height: '16px' }}></div>
          <div className="skeleton-line" style={{ width: '100%', height: '120px' }}></div>
        </div>
      </div>
    );
  }

  if (testError || !test) {
    return (
      <div style={{
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: 'var(--radius-md)',
        color: '#fca5a5',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        Failed to load test details for review.
      </div>
    );
  }

  if (isPublished) {
    return (
      <div className="success-banner" style={{ margin: '4rem auto', maxWidth: '600px' }}>
        <div className="success-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Test Published!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
          Your test <strong>{test?.name}</strong> is now live. Students can access and attempt it.
        </p>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Redirecting back to your dashboard...
        </span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Wizard Steps Indicator */}
      <div className="steps-indicator">
        <div className="step-node completed" onClick={() => navigate(`/test/edit/${testId}`)} style={{ cursor: 'pointer' }}>
          1
          <span className="step-label">Test Details</span>
        </div>
        <div className="step-node completed" onClick={() => navigate(`/test/${testId}/questions`)} style={{ cursor: 'pointer' }}>
          2
          <span className="step-label">Add Questions</span>
        </div>
        <div className="step-node active">
          3
          <span className="step-label">Preview & Publish</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Section 1: Overview Summary */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <span className={`badge badge-${test.status || 'draft'}`} style={{ marginBottom: '0.5rem' }}>
                {test.status}
              </span>
              <h1 style={{ fontSize: '1.75rem', color: '#111827' }}>{test.name}</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Subject: <strong style={{ color: '#111827' }}>{test.subject}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate(`/test/edit/${testId}`)}
                disabled={isPublishing}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Edit Details
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate(`/test/${testId}/questions`)}
                disabled={isPublishing}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Edit Questions
              </button>
            </div>
          </div>

          <div className="grid-3" style={{ background: '#EEF2FF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #C7D2FE' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Parameters</span>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem', color: '#111827' }}>
                Type: <span style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{test.type}</span> <br/>
                Difficulty: <span style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{test.difficulty}</span>
              </div>
            </div>
            
            <div>
              <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Marking Scheme</span>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem', color: '#111827' }}>
                Correct: <span style={{ color: 'var(--success)' }}>+{test.correct_marks}</span> <br/>
                Incorrect: <span style={{ color: 'var(--error)' }}>{test.wrong_marks}</span> <br/>
                Unattempted: <span style={{ color: 'var(--text-secondary)' }}>{test.unattempt_marks}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Totals Summary</span>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem', color: '#111827' }}>
                Questions: <span style={{ color: 'var(--primary)' }}>{questions.length} Qs</span> <br/>
                Time Limit: <span style={{ color: 'var(--primary)' }}>{test.total_time} mins</span> <br/>
                Max Score: <span style={{ color: 'var(--primary)' }}>{test.total_marks} Marks</span>
              </div>
            </div>
          </div>

          {test.topics && test.topics.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                Targeted Topics & Sub-topics
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {test.topics.map((t, i) => (
                  <span key={`t-${i}`} style={{ background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid var(--border-color)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                    {t}
                  </span>
                ))}
                {test.sub_topics && test.sub_topics.map((st, i) => (
                  <span key={`st-${i}`} style={{ background: 'var(--secondary-glow)', color: 'var(--secondary)', border: '1px solid var(--border-color)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
                    {st}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Questions Preview List */}
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#111827', fontWeight: 700 }}>Questions Preview ({questions.length})</h3>
          
          {questions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No questions found. Please click "Edit Questions" to add questions.
            </div>
          ) : (
            <div>
              {questions.map((q, index) => (
                <div key={q.id || index} className="card" style={{ marginBottom: '1.5rem', background: '#ffffff', borderColor: '#EEF2F7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Question {index + 1}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize', fontWeight: 600 }}>
                      Difficulty: {q.difficulty || 'medium'}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.25rem', color: '#111827', whiteSpace: 'pre-wrap' }}>
                    {q.question}
                  </div>

                  {q.media_url && (
                    <div style={{ marginBottom: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', maxWidth: '350px' }}>
                      <img 
                        src={q.media_url} 
                        alt={`Question ${index + 1} reference visual`}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

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

                  {q.explanation && (
                    <div style={{ marginTop: '1.25rem', background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>Solution Explanation:</strong>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{q.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', marginBottom: '2rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/')}
            disabled={isPublishing}
          >
            Exit to Dashboard
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handlePublish}
            disabled={isPublishing || questions.length === 0}
            style={{ minWidth: '180px' }}
          >
            {isPublishing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <span className="loading-spinner" style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent' }}></span> Publishing...
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                Publish Test
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </div>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
