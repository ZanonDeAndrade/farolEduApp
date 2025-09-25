import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LogoImage from '../../assets/Logo.png';
import './Header.css';

const NAV_ITEMS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Oferecer Aula', href: '#oferecer-aula' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Contato', href: '#contato' },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="nav-brand">
            <Link to="/" className="logo" aria-label="FarolEdu" onClick={closeMenu}>
              <img src={LogoImage} alt="FarolEdu" className="logo-icon" />
            </Link>

            <button
              type="button"
              className="nav-toggle"
              aria-expanded={isMenuOpen}
              aria-controls="primary-navigation"
              aria-label={isMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          <div className={`nav-menu ${isMenuOpen ? 'is-open' : ''}`} id="primary-navigation">
            <ul className="nav-links">
              {NAV_ITEMS.map(item => (
                <li key={item.href}>
                  <a href={item.href} className="nav-link" onClick={closeMenu}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <Link to="/login" className="nav-login" onClick={closeMenu}>
              <button className="btn btn-yellow" type="button">
                Entrar / Cadastrar
              </button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
