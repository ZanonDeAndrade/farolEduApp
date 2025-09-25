import React from 'react';
import { Linkedin, Instagram, Youtube } from 'lucide-react';
import LogoImage from '../../assets/Logo.png';
import './Footer.css';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo-pill" aria-label="FarolEdu">
              <img src={LogoImage} alt="FarolEdu" className="footer-logo-icon" />
            </div>
            <p className="footer-slogan">
              Conectando alunos e professores com experiências de aprendizado personalizadas.
            </p>
          </div>

          <div className="footer-actions">
            <div className="footer-links">
              <a href="#inicio">Início</a>
              <a href="#oferecer-aula">Oferecer aula</a>
              <a href="#sobre">Sobre</a>
              <a href="#contato">Contato</a>
            </div>

            <div className="footer-social">
              <a href="https://www.linkedin.com" aria-label="LinkedIn">
                <Linkedin />
              </a>
              <a href="https://www.instagram.com" aria-label="Instagram">
                <Instagram />
              </a>
              <a href="https://www.youtube.com" aria-label="YouTube">
                <Youtube />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© {year} FarolEdu. Todos os direitos reservados.</span>
          <div className="footer-legals">
            <a href="#politica">Política de privacidade</a>
            <a href="#termos">Termos de uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
