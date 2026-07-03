import React from 'react';

export default function MarkingSchemeSection({
  wrongMarks,
  unattemptMarks,
  correctMarks,
  adjustWrongMarks,
  adjustUnattemptMarks,
  adjustCorrectMarks
}) {
  return (
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
  );
}
