import React from 'react';
import { Mail, MessageCircle, PhoneCall, Send } from 'lucide-react';
import './ContactSection.css';

const ContactSection: React.FC = () => {
  return (
    <section className="contact-section" id="contato">
      <div className="container">
        <div className="contact-shell">
          <div className="contact-copy">
            <span className="contact-eyebrow">
              <Send className="contact-eyebrow-icon" />
              Fale com a FarolEdu
            </span>
            <h2>Vamos iluminar seu próximo passo?</h2>
            <p>
              Nossa equipe está disponível para orientar alunos, professores e instituições interessadas em parcerias. Escolha o canal que preferir e respondemos rapidinho.
            </p>

            <div className="contact-actions">
              <a className="contact-cta" href="mailto:contato@faroledu.com">
                Enviar email
              </a>
              <a className="contact-cta secondary" href="tel:+5508000000000">
                Falar por telefone
              </a>
            </div>
          </div>

          <div className="contact-cards">
            <article className="contact-card">
              <Mail className="contact-card-icon" />
              <strong>Atendimento por email</strong>
              <span>contato@faroledu.com</span>
              <p>Retornamos em até 24 horas úteis com o suporte que você precisa.</p>
            </article>

            <article className="contact-card">
              <PhoneCall className="contact-card-icon" />
              <strong>Central Farol</strong>
              <span>0800 000 0000</span>
              <p>Segunda a sexta, das 8h às 18h, com atendimento humanizado.</p>
            </article>

            <article className="contact-card">
              <MessageCircle className="contact-card-icon" />
              <strong>WhatsApp</strong>
              <span>(11) 97777-0000</span>
              <p>Suporte rápido para dúvidas sobre planos, pagamentos ou aulas.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
