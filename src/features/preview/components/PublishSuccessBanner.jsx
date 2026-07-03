import React from 'react';

export default function PublishSuccessBanner({ test }) {
  return (
    <div
      className="success-banner"
      style={{ margin: '4rem auto', maxWidth: '600px', textAlign: 'center' }}
    >
      <div
        className="success-icon"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          marginBottom: '24px',
        }}
      >
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
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: 'var(--heading)',
          marginBottom: '8px',
        }}
      >
        Test Published!
      </h2>
      <p
        style={{
          color: 'var(--body-text)',
          marginBottom: '24px',
          lineHeight: '1.6',
        }}
      >
        Your test <strong>{test?.name}</strong> is now live. Students can
        access and attempt it.
      </p>
      <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>
        Redirecting back to your dashboard...
      </span>
    </div>
  );
}
