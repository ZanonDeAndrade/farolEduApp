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
  const [profile, setProfile] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [hasRedirectedToDashboard, setHasRedirectedToDashboard] = useState(false);

  const activeHash = useMemo(() => {
    if (location.pathname !== '/') {
      return null;
    }
    return location.hash || '#inicio';
  }, [location.hash, location.pathname]);

  const readProfile = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setProfile(null);
        return;
      }
      const rawProfile = localStorage.getItem('profile');
      if (!rawProfile) {
        setProfile(null);
        return;
      }
      const parsed = JSON.parse(rawProfile);
      if (parsed && typeof parsed === 'object') {
        setProfile(parsed);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.warn('Não foi possível carregar o perfil salvo.', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    readProfile();

    const handleStorageChange = () => readProfile();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('faroledu-auth-change', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('faroledu-auth-change', handleStorageChange as EventListener);
    };
  }, [readProfile]);

  const displayName = useMemo(() => {
    if (!profile) return null;
    const name = profile.name?.trim();
    if (name) return name;
    const email = profile.email?.trim();
    if (email) {
      const nickname = email.split('@')[0];
      return nickname || 'Minha conta';
    }
    return 'Minha conta';
  }, [profile]);

  const profileTarget = useMemo(() => {
    if (!profile) return '/';
    return (profile.role ?? '').toLowerCase() === 'teacher' ? '/dashboard' : '/';
  }, [profile]);

  const isAuthenticated = Boolean(displayName);
  const isTeacher = (profile?.role ?? '').toLowerCase() === 'teacher';

  useEffect(() => {
    if (isTeacher && location.pathname !== '/dashboard' && !hasRedirectedToDashboard) {
      setHasRedirectedToDashboard(true);
      navigate('/dashboard');
    }
    if (!isTeacher && hasRedirectedToDashboard) {
      setHasRedirectedToDashboard(false);
    }
  }, [isTeacher, location.pathname, navigate, hasRedirectedToDashboard]);

  const handleLogout = useCallback(() => {
    setIsMenuOpen(false);
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    setProfile(null);
    setHasRedirectedToDashboard(false);
    window.dispatchEvent(new Event('faroledu-auth-change'));
    navigate('/', { replace: false });
  }, [navigate]);

  const handleProfileClick = useCallback(() => {
    setIsMenuOpen(false);
    navigate(profileTarget, { replace: false });
  }, [navigate, profileTarget]);

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
      if (hash === '#oferecer-aula' && isTeacher) {
        setIsMenuOpen(false);
        navigate('/dashboard', { replace: false });
        return;
      }

      closeMenu();

      if (location.pathname !== '/') {
        navigate('/', { replace: false });
        setTimeout(() => scrollToHash(hash), 180);
        return;
      }

      scrollToHash(hash);
    },
    [closeMenu, isTeacher, location.pathname, navigate, scrollToHash],
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
            <li className="navbar__mobile-actions">
              {isAuthenticated ? (
                <div className="navbar__mobile-profile">
                  <button
                    type="button"
                    className="navbar__mobile-action navbar__mobile-profile-button"
                    onClick={handleProfileClick}
                  >
                    {displayName}
                  </button>
                  <button
                    type="button"
                    className="navbar__mobile-action navbar__mobile-action--secondary"
                    onClick={handleLogout}
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="navbar__mobile-action" onClick={closeMenu}>
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="navbar__mobile-action navbar__mobile-action--primary"
                    onClick={closeMenu}
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </li>
          </ul>

          <div className="navbar__actions">
            {isAuthenticated ? (
              <div className="navbar__profile">
                <button type="button" className="navbar__profile-pill" onClick={handleProfileClick}>
                  {displayName}
                </button>
                <button type="button" className="navbar__logout" onClick={handleLogout}>
                  Sair
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="navbar__action" onClick={closeMenu}>
                  Entrar
                </Link>
                <Link to="/register" className="navbar__action navbar__action--primary" onClick={closeMenu}>
                  Cadastrar
                </Link>
              </>
            )}
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
