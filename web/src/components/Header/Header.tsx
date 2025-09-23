import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="logo">
            <div className="logo-icon">🏠</div>
            <span className="logo-text">FarolEdu</span>
          </div>

          <ul className="nav-links">
            <li><a href="#inicio" className="nav-link">Início</a></li>
            <li><a href="#oferecer-aula" className="nav-link">Oferecer Aula</a></li>
            <li><a href="#sobre" className="nav-link">Sobre</a></li>
            <li><a href="#contato" className="nav-link">Contato</a></li>
          </ul>

          <Link to="/login">
            <button className="btn btn-yellow">
              Entrar / Cadastrar
            </button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
