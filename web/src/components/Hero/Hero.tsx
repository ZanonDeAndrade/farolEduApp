import React, { useState } from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Procurando por:', searchQuery);
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Encontre a aula certa para você.
            </h1>
            <p className="hero-subtitle">
              Conectamos alunos e professores<br />
              em qualquer lugar do Brasil.
            </p>
            
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="O que você quer aprender?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-yellow">
                Procurar
              </button>
            </form>
          </div>
          
          <div className="hero-image">
            <div className="lighthouse">
              <div className="lighthouse-icon">🏠</div>
              <p className="lighthouse-text">Seu guia educacional</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;