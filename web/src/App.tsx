import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import AboutSection from './components/AboutSection/AboutSection';
import TeacherSection from './components/TeacherSection/TeacherSection';
import AvailableClasses from './components/AvailableClass/AvailableClass';
import Footer from './components/Footer/Footer';
import LoginScreen from './components/Login/LoginScreen';
import './App.css';
import RegisterScreen from './components/Register/RegisterScreen';

const HomePage: React.FC = () => (
  <>
    <Hero />
    <AvailableClasses />
    <AboutSection />
    <TeacherSection />
  </>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
