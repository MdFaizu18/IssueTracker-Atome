import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import DashboardPage from './pages/Dashboard';
import ProjectsPage from './pages/Projects';
import ProjectDetailsPage from './pages/ProjectDetails';
import IssuesPage from './pages/Issues';
import IssueDetailsPage from './pages/IssueDetails';
import UsersPage from './pages/Users';
import UserProfilePage from './pages/UserProfile';
import MyIssuesPage from './pages/MyIssues';

function RoleBasedDefaultRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ASSIGNEE') return <Navigate to="/my-issues" replace />;
  if (user.role === 'PROJECT_OWNER') return <Navigate to="/projects" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/users" replace />;

  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* App Routes with Layout */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<RoleBasedDefaultRedirect />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailsPage />} />
            <Route path="issues" element={<IssuesPage />} />
            <Route path="issues/:id" element={<IssueDetailsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserProfilePage />} />
            <Route path="my-issues" element={<MyIssuesPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<RoleBasedDefaultRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
