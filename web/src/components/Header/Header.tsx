import React from 'react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className="container">
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <img src="/images/lighthouse.svg" alt="FarolEdu" className={styles.logoIcon} />
            <span className={styles.logoText}>FarolEdu</span>
          </div>
          
          <ul className={styles.navLinks}>
            <li><a href="#inicio" className={styles.navLink}>Início</a></li>
            <li><a href="#oferecer-aula" className={styles.navLink}>Oferecer Aula</a></li>
            <li><a href="#sobre" className={styles.navLink}>Sobre</a></li>
            <li><a href="#contato" className={styles.navLink}>Contato</a></li>
          </ul>
          
          <a href="#login" className="btn btn-yellow">
            Entrar / Cadastrar
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;