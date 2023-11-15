import { Route, Routes } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/Login';
import Home from './pages/Home';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import SignupPage from './pages/Signup';
import { AuthProvider } from './hooks/useAuth';
import { CookiesProvider } from 'react-cookie';
import Projects from './pages/Projects';
import Users from './pages/Users';

function App() {
  return (
    <CookiesProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="users" element={<Users />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </CookiesProvider>
  );
}

export default App;

function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center">
      <h1>Oops !!</h1>
      <div>The page your are looking for does not exist.</div>
    </div>
  );
}
