import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="footer-logo-icon">🏠</div>
            <span className="footer-logo-text">FarolEdu</span>
          </div>
          
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook">
              <span>📘</span>
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <span>🐦</span>
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              <span>💼</span>
            </a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">
            © 2024 FarolEdu. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;