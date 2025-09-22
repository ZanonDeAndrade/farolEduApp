import React from 'react';
import './TeacherSection.css';

const TeacherSection: React.FC = () => {
  return (
    <section className="teacher-section">
      <div className="container">
        <div className="teacher-content">
          <div className="text-content">
            <h2 className="teacher-title">
              É professor?<br />
              Ofereça suas aulas no FarolEdu.
            </h2>
            <p className="teacher-description">
              Você cria seu perfil, define horários, modalidades (online/presencial) 
              e conecta-se a novos alunos.
            </p>
            <button className="btn btn-primary">
              Cadastrar Aula
            </button>
          </div>
          
          <div className="image-content">
            <div className="teacher-image-placeholder">
              <div className="teacher-icon">👨‍🏫</div>
              <p className="teacher-image-text">Professores Online</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherSection;