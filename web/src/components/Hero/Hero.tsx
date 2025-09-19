import React, { useState } from 'react';
import styles from './Hero.module.css';

const Hero: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Procurando por:', searchQuery);
    // Implementar lógica de busca
  };

  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Encontre a aula certa para você.
            </h1>
            <p className={styles.heroSubtitle}>
              Conectamos alunos e professores<br />
              em qualquer lugar do Brasil.
            </p>
            
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                placeholder="O que você quer aprender?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={`btn btn-yellow ${styles.searchButton}`}>
                Procurar
              </button>
            </form>
          </div>
          
          <div className={styles.heroImage}>
            <img src="/images/lighthouse.svg" alt="Farol" className={styles.lighthouse} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;