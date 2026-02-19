import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ProtectedRoute } from './components/common/ProtectedRoute';

const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })),
);
const SessionDetail = lazy(() =>
  import('./pages/SessionDetail').then((m) => ({ default: m.SessionDetail })),
);
const CommentPage = lazy(() =>
  import('./pages/CommentPage').then((m) => ({ default: m.CommentPage })),
);
const Overlay = lazy(() =>
  import('./pages/Overlay').then((m) => ({ default: m.Overlay })),
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/session/:id"
          element={
            <ProtectedRoute>
              <SessionDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/comment/:sessionId" element={<CommentPage />} />
        <Route path="/overlay/:sessionId" element={<Overlay />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
