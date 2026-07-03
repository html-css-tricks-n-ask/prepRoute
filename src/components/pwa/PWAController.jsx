import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Button from '../common/Button';

export default function PWAController({ onOfflineStatusChange }) {
  // PWA SW hooks
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error) {
      console.error('SW Registration Error: ', error);
    },
  });

  // Connection status states
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  // Installation prompt state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      if (onOfflineStatusChange) onOfflineStatusChange(false);
      
      const timer = setTimeout(() => {
        setShowOnlineToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowOnlineToast(false);
      if (onOfflineStatusChange) onOfflineStatusChange(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (onOfflineStatusChange) {
      onOfflineStatusChange(!navigator.onLine);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onOfflineStatusChange]);

  // Listen for beforeinstallprompt for native install promting
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      console.log('App was successfully installed.');
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const closeInstallBanner = () => {
    setShowInstallBanner(false);
  };

  return (
    <>
      {/* 1. Connection Drop Notification (Persistent red bar) */}
      {isOffline && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#ef4444',
          color: '#ffffff',
          padding: '8px 16px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '0.875rem',
          zIndex: 10000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          You are currently offline. Running in offline mode.
        </div>
      )}

      {/* 2. Connection Restored Notification (Brief green toast) */}
      {showOnlineToast && (
        <div style={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#22c55e',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '9999px',
          fontWeight: '600',
          fontSize: '0.875rem',
          zIndex: 10000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeInOut 4s ease forwards'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Back online! Syncing data...
        </div>
      )}

      {/* 3. New Update Notification toast */}
      {needRefresh && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#ffffff',
          color: '#111827',
          padding: '20px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb',
          zIndex: 10000,
          maxWidth: '350px',
          fontFamily: "'Inter', sans-serif"
        }}>
          <h4 style={{ fontWeight: '700', fontSize: '0.975rem', marginBottom: '4px' }}>Update Available</h4>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px', lineHeight: '1.4' }}>
            A new version of PrepRoute is available. Update now to get the latest features.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="primary"
              onClick={() => updateServiceWorker(true)}
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              Update & Reload
            </Button>
            <Button
              variant="secondary"
              onClick={() => setNeedRefresh(false)}
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* 4. Install App floating banner */}
      {showInstallBanner && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          backgroundColor: '#ffffff',
          color: '#111827',
          padding: '20px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb',
          zIndex: 10000,
          maxWidth: '350px',
          fontFamily: "'Inter', sans-serif"
        }}>
          <h4 style={{ fontWeight: '700', fontSize: '0.975rem', marginBottom: '4px' }}>Install PrepRoute</h4>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px', lineHeight: '1.4' }}>
            Install the PrepRoute application on your device for quick access and full offline support.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="primary"
              onClick={handleInstallClick}
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              Install App
            </Button>
            <Button
              variant="secondary"
              onClick={closeInstallBanner}
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              Later
            </Button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -20px); }
        }
      `}</style>
    </>
  );
}
