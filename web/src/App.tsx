import React from "react";
import "./App.css";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import TeacherSection from "./components/TeacherSection/TeacherSection";
import AvailableClasses from "./components/AvailableClasses/AvailableClasses";
import Footer from "./components/Footer/Footer";


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
