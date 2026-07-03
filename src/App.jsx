import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PWAController from './components/pwa/PWAController';
import Offline from './pages/Offline';

// Lazy load pages for code splitting and performance optimization
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateEditTest = lazy(() => import('./pages/CreateEditTest'));
const AddQuestions = lazy(() => import('./pages/AddQuestions'));
const PreviewPublish = lazy(() => import('./pages/PreviewPublish'));

// Loader component for Suspense placeholder
function PageLoader() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '400px',
      width: '100%'
    }}>
      <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
    </div>
  );
}

export default function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  if (isOffline) {
    return (
      <>
        <PWAController onOfflineStatusChange={setIsOffline} />
        <Offline />
      </>
    );
  }

  return (
    <BrowserRouter>
      <PWAController onOfflineStatusChange={setIsOffline} />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            borderRadius: '8px',
            padding: '12px 16px'
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
              },
            },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated Dashboard & Test Creator Flow */}
          <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="test/create" element={<CreateEditTest />} />
            <Route path="test/edit/:id" element={<CreateEditTest />} />
            <Route path="test/:id/questions" element={<AddQuestions />} />
            <Route path="test/:id/preview" element={<PreviewPublish />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
