import React from 'react';
import styles from './TeacherSection.module.css';

const TeacherSection: React.FC = () => {
  return (
    <section className={styles.teacherSection}>
      <div className="container">
        <div className={styles.content}>
          <div className={styles.textContent}>
            <h2 className={styles.title}>
              É professor?<br />
              Ofereça suas aulas no FarolEdu.
            </h2>
            <p className={styles.description}>
              Você cria seu perfil, define horários, modalidades (online/presencial) 
              e conecta-se a novos alunos.
            </p>
            <a href="#cadastrar-aula" className="btn btn-primary">
              Cadastrar Aula
            </a>
          </div>
          
          <div className={styles.imageContent}>
            <img 
              src="/images/teacher-video.svg" 
              alt="Professor dando aula online" 
              className={styles.teacherImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherSection;