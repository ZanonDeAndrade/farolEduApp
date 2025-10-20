import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import LogoImage from '../../assets/Logo.png';
import './Navbar.css';

type NavItem = {
  label: string;
  hash: `#${string}`;
};

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: 'Início', hash: '#inicio' },
  { label: 'Sobre', hash: '#sobre' },
  { label: 'Oferecer aula', hash: '#oferecer-aula' },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeHash = useMemo(() => {
    if (location.pathname !== '/') {
      return null;
    }
    return location.hash || '#inicio';
  }, [location.hash, location.pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const scrollToHash = useCallback((hash: string) => {
    requestAnimationFrame(() => {
      const target = document.querySelector(hash);
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  const handleSectionNavigate = useCallback(
    (hash: string) => {
      closeMenu();

      if (location.pathname !== '/') {
        navigate('/', { replace: false });
        setTimeout(() => scrollToHash(hash), 180);
        return;
      }

      scrollToHash(hash);
    },
    [closeMenu, location.pathname, navigate, scrollToHash],
  );

  const handleLogoClick = useCallback(() => {
    closeMenu();

    if (location.pathname !== '/') {
      navigate('/', { replace: false });
      return;
    }

    scrollToHash('#inicio');
  }, [closeMenu, location.pathname, navigate, scrollToHash]);

  return (
    <header className="navbar">
      <div className="container">
        <nav className="navbar__inner" aria-label="Navegação principal">
          <button
            type="button"
            className="navbar__logo-button"
            onClick={handleLogoClick}
            aria-label="Ir para a página inicial"
          >
            <img src={LogoImage} alt="FarolEdu" className="navbar__logo" />
          </button>

          <ul className={`navbar__links ${isMenuOpen ? 'is-open' : ''}`} id="primary-navigation">
            {NAV_ITEMS.map(item => (
              <li key={item.hash}>
                <button
                  type="button"
                  className={`navbar__link ${
                    activeHash === item.hash ? 'is-active' : ''
                  }`.trim()}
                  onClick={() => handleSectionNavigate(item.hash)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="navbar__actions">
            <Link to="/login" className="navbar__action" onClick={closeMenu}>
              Entrar
            </Link>
            <Link to="/register" className="navbar__action navbar__action--primary" onClick={closeMenu}>
              Cadastrar
            </Link>
          </div>

          <button
            type="button"
            className="navbar__toggle"
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

export default Navbar;
