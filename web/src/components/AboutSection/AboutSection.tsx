import React from 'react';
import { Compass, Users, ShieldCheck, Clock3, Award } from 'lucide-react';
import './AboutSection.css';

const AboutSection: React.FC = () => {
  return (
    <section className="about-section" id="sobre">
      <div className="container">
        <div className="about-shell">
          <div className="about-intro">
            <span className="about-eyebrow">
              <Compass className="about-eyebrow-icon" />
              Sobre o FarolEdu
            </span>
            <h2>
              Um ecossistema feito para conectar pessoas que ensinam e aprendem.
            </h2>
            <p>
              Apoiamos professores independentes e instituições locais a construírem experiências de ensino inspiradoras enquanto estudantes encontram caminhos personalizados para evoluir rápido.
            </p>

            <div className="about-stats">
              <div className="about-stat">
                <strong>35 mil+</strong>
                <span>alunos impactados</span>
              </div>
              <div className="about-stat">
                <strong>2.800</strong>
                <span>professores cadastrados</span>
              </div>
              <div className="about-stat">
                <strong>120</strong>
                <span>cidades com aulas</span>
              </div>
            </div>
          </div>

          <div className="about-grid">
            <article className="about-card">
              <Users className="about-card-icon" />
              <h3>Foco na relação humana</h3>
              <p>
                Usamos dados para sugerir o melhor encontro entre aluno e professor, priorizando afinidade, objetivos e ritmo de aprendizagem.
              </p>
            </article>
            <article className="about-card">
              <ShieldCheck className="about-card-icon" />
              <h3>Segurança e qualidade</h3>
              <p>
                Perfis são verificados, com avaliações recorrentes e suporte dedicado para garantir aulas confiáveis em qualquer modalidade.
              </p>
            </article>
            <article className="about-card">
              <Clock3 className="about-card-icon" />
              <h3>Flexibilidade real</h3>
              <p>
                Agenda inteligente, aulas presenciais ou online e pacotes personalizados para encaixar o aprendizado na rotina de cada pessoa.
              </p>
            </article>
            <article className="about-card">
              <Award className="about-card-icon" />
              <h3>Resultados comprovados</h3>
              <p>
                Programas especiais para vestibulares, certificações e desenvolvimento profissional com acompanhamento próximo de progresso.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
