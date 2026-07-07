import Card from '../../../components/common/Card';

export default function ActiveSessionBanner({ test, questionsCount }) {
  if (!test) return null;

  return (
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
              <div className="metric-value text-primary">{questionsCount} Qs</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
