import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Offline from '../pages/Offline';

// Lazy-loaded pages for code splitting
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const CreateEditTest = lazy(() => import('../pages/CreateEditTest'));
const AddQuestions = lazy(() => import('../pages/AddQuestions'));
const PreviewPublish = lazy(() => import('../pages/PreviewPublish'));

function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        width: '100%',
      }}
    >
      <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }} />
    </div>
  );
}

export default function AppRoutes({ isOffline }) {
  if (isOffline) {
    return <Offline />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated shell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="test/create" element={<CreateEditTest />} />
          <Route path="test/edit/:id" element={<CreateEditTest />} />
          <Route path="test/:id/questions" element={<AddQuestions />} />
          <Route path="test/:id/preview" element={<PreviewPublish />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
