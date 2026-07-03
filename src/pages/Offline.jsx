import React from 'react';
import Button from '../components/common/Button';

export default function Offline() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '24px',
      textAlign: 'center',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: '440px',
        padding: '40px 32px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #e5e7eb'
      }}>
        {/* Offline Graphic (wifi-slash icon styled beautifully) */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(91, 92, 235, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#5b5ceb'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l22 22"></path>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.5"></path>
            <path d="M5 12.5a10.94 10.94 0 0 1 5.17-2.39"></path>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <path d="M12 20h.01"></path>
          </svg>
        </div>

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '12px'
        }}>
          You are offline
        </h1>
        
        <p style={{
          fontSize: '0.95rem',
          color: '#6b7280',
          lineHeight: '1.6',
          marginBottom: '28px'
        }}>
          Please check your network connection. PrepRoute will automatically reconnect you once the internet is restored.
        </p>

        <Button
          onClick={handleRetry}
          variant="primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '12px 24px',
            fontSize: '0.95rem',
            fontWeight: '600'
          }}
        >
          Try Reconnecting
        </Button>
      </div>
    </div>
  );
}
