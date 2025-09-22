import React from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import TeacherSection from './components/TeacherSection/TeacherSection';
import AvailableClasses from './components/AvailableClass/AvailableClass';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <TeacherSection />
        <AvailableClasses />
      </main>
      <Footer />
    </div>
  );
}

export default App;