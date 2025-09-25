import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LogoImage from '../../assets/Logo.png';
import './Header.css';

const NAV_ITEMS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Oferecer Aula', href: '#oferecer-aula' }
  
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="header">
      <div className="container">
        <nav className="nav" aria-label="Navegação principal">
          <Link to="/" className="logo" aria-label="FarolEdu" onClick={closeMenu}>
            <img src={LogoImage} alt="FarolEdu" className="logo-icon" />
          </Link>

          <ul className={`nav-links ${isMenuOpen ? 'is-open' : ''}`} id="primary-navigation">
            {NAV_ITEMS.map(item => (
              <li key={item.href}>
                <a href={item.href} className="nav-link" onClick={closeMenu}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <Link to="/login" className="nav-login" onClick={closeMenu}>
            Entrar / Cadastrar
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
        </nav>
      </div>
    </header>
  );
};

export default Header;
