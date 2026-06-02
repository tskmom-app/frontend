import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { Login } from './pages/admin/Login';
import { QuestsPage } from './pages/admin/Quests';
import { Settings } from './pages/admin/Settings';
import { StudentDetail } from './pages/admin/StudentDetail';
import { Students } from './pages/admin/Students';
import { Submissions } from './pages/admin/Submissions';
import { NotFound } from './pages/NotFound';
import { Signup } from './pages/Signup';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Signup />} />
      <Route path="/admin/login" element={<Login />} />

      {/* Admin (protected) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="quests" element={<QuestsPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
