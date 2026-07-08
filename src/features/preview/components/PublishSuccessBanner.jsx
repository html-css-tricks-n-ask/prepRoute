import React from 'react';

const bannerStyle = { margin: '4rem auto', maxWidth: '600px', textAlign: 'center' };
const iconStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'var(--primary-light)',
  color: 'var(--primary)',
  marginBottom: '24px',
};
const titleStyle = {
  fontSize: '24px',
  fontWeight: 600,
  color: 'var(--heading)',
  marginBottom: '8px',
};
const bodyStyle = {
  color: 'var(--body-text)',
  marginBottom: '24px',
  lineHeight: '1.6',
};
const redirectStyle = { fontSize: '12px', color: 'var(--muted-text)' };

const PublishSuccessBanner = React.memo(function PublishSuccessBanner({ test }) {
  return (
    <div className="success-banner" style={bannerStyle}>
      <div className="success-icon" style={iconStyle}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h2 style={titleStyle}>Test Published!</h2>
      <p style={bodyStyle}>
        Your test <strong>{test?.name}</strong> is now live. Students can
        access and attempt it.
      </p>
      <span style={redirectStyle}>Redirecting back to your dashboard...</span>
    </div>
  );
});

export default PublishSuccessBanner;
