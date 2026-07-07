import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PWAController from './components/pwa/PWAController';
import AppRoutes from './routes/AppRoutes';

const TOAST_STYLE = {
  background: '#ffffff',
  color: '#111827',
  border: '1px solid #e5e7eb',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.9rem',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
  borderRadius: '8px',
  padding: '12px 16px',
};

export default function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  return (
    <BrowserRouter>
      <PWAController onOfflineStatusChange={setIsOffline} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: TOAST_STYLE,
          success: { iconTheme: { primary: '#22c55e', secondary: '#ffffff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
        }}
      />
      <AppRoutes isOffline={isOffline} />
    </BrowserRouter>
  );
}
