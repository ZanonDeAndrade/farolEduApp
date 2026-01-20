import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import AboutSection from './components/AboutSection/AboutSection';
import TeacherSection from './components/TeacherSection/TeacherSection';
import AvailableClasses from './components/AvailableClass/AvailableClass';
import Footer from './components/Footer/Footer';
import LoginScreen from './components/Login/LoginScreen';
import './App.css';
import RegisterScreen from './components/Register/RegisterScreen';
import TeacherDashboard from './components/TeacherDashboard/TeacherDashboard';
import { DEFAULT_SEARCH_FILTERS, type SearchFilters } from './types/search';
import StudentHome from './components/StudentHome/StudentHome';
import SearchPage from './components/Search/SearchPage';
import ProfessorDetail from './components/ProfessorDetail/ProfessorDetail';
import SchedulePage from './components/Schedule/SchedulePage';
import StudentCalendar from './components/StudentCalendar/StudentCalendar';

const HomePage: React.FC<{ isStudent: boolean }> = ({ isStudent }) => {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);

  const handleSearch = (next: SearchFilters) => {
    setFilters({ ...next });
  };

  return (
    <>
      <Hero onSearch={handleSearch} initialFilters={filters} />
      <AvailableClasses filters={filters} />
      <AboutSection />
      {!isStudent && <TeacherSection />}
    </>
  );
};

const readStoredRole = () => {
  try {
    const rawProfile = localStorage.getItem('profile');
    if (!rawProfile) return null;
    const parsed = JSON.parse(rawProfile);
    const nextRole = (parsed?.role ?? '').toLowerCase();
    return nextRole || null;
  } catch {
    return null;
  }
};

const useProfileRole = () => {
  const [role, setRole] = useState<string | null>(() => readStoredRole());

  useEffect(() => {
    const readProfile = () => {
      setRole(readStoredRole());
    };
    readProfile();
    const handler = () => readProfile();
    window.addEventListener('faroledu-auth-change', handler as EventListener);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('faroledu-auth-change', handler as EventListener);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return role;
};

const HomeGate: React.FC = () => {
  const role = useProfileRole();
  if (role === 'student') return <Navigate to="/student" replace />;
  if (role === 'teacher') return <Navigate to="/dashboard" replace />;
  return <HomePage isStudent={false} />;
};

const StudentGate: React.FC = () => {
  const role = useProfileRole();
  if (role === null) {
    const hasToken = Boolean(localStorage.getItem('token'));
    return hasToken ? <div className="student-loading">Carregando...</div> : <Navigate to="/login" replace />;
  }
  if (role !== 'student') return <Navigate to="/" replace />;
  return <StudentHome profileRole={role} />;
};

const StudentCalendarGate: React.FC = () => {
  const role = useProfileRole();
  if (role === null) {
    const hasToken = Boolean(localStorage.getItem('token'));
    return hasToken ? <div className="student-loading">Carregando...</div> : <Navigate to="/login" replace />;
  }
  if (role !== 'student') return <Navigate to="/" replace />;
  return <StudentCalendar />;
};

const TeacherGate: React.FC = () => {
  const role = useProfileRole();
  if (role === null) {
    const hasToken = Boolean(localStorage.getItem('token'));
    return hasToken ? <div className="student-loading">Carregando...</div> : <Navigate to="/login" replace />;
  }
  if (role !== 'teacher') return <Navigate to="/" replace />;
  return <TeacherDashboard />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomeGate />} />
            <Route path="/student" element={<StudentGate />} />
            <Route path="/calendar" element={<StudentCalendarGate />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/teachers/:id" element={<ProfessorDetail />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/dashboard" element={<TeacherGate />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
