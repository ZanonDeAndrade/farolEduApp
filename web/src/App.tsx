import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const HomePage: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);

  const handleSearch = (next: SearchFilters) => {
    setFilters({ ...next });
  };

  return (
    <>
      <Hero onSearch={handleSearch} initialFilters={filters} />
      <AvailableClasses filters={filters} />
      <AboutSection />
      <TeacherSection />
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/dashboard" element={<TeacherDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
