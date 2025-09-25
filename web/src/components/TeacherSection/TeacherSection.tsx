import React from 'react';
import { CalendarRange, MonitorPlay, NotebookPen, ShieldCheck, Sparkles } from 'lucide-react';
import './TeacherSection.css';

const TeacherSection: React.FC = () => {
  return (
    <section className="teacher-section" id="oferecer-aula">
      <div className="container">
        <div className="teacher-shell">
          <div className="teacher-copy">
            <span className="teacher-eyebrow">
              <Sparkles />
              Transforme conhecimento em impacto real
            </span>
            <h2>
              É professor? <span>Ofereça suas aulas no FarolEdu</span>.
            </h2>
            <p>
              Crie seu perfil, defina disponibilidade, modalidades (online ou presencial) e receba solicitações de alunos que combinam com a sua experiência.
            </p>

            <ul className="teacher-highlights">
              <li>
                <NotebookPen />
                Perfil completo com portfólio, disciplinas e valores personalizados.
              </li>
              <li>
                <CalendarRange />
                Agenda inteligente para controlar horários e confirmar aulas.
              </li>
              <li>
                <MonitorPlay />
                Suporte a aulas híbridas com ferramentas digitais integradas.
              </li>
            </ul>

            <button className="teacher-cta">
              Cadastrar minha aula
            </button>
          </div>

          <div className="teacher-visual">
            <div className="teacher-card">
              <div className="teacher-card-header">
                <span className="teacher-avatar">CM</span>
                <div>
                  <strong>Camila Martins</strong>
                  <small>Matemática & ENEM</small>
                </div>
              </div>

              <div className="teacher-card-body">
                <div className="teacher-stat">
                  <ShieldCheck />
                  <span>Perfil verificado</span>
                </div>
                <p>+120 alunos aprovados no último ano com aulas online personalizadas.</p>
              </div>

              <div className="teacher-card-footer">
                <div>
                  <strong>R$ 65</strong>
                  <span>/hora</span>
                </div>
                <button type="button">Solicitar aula</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherSection;
