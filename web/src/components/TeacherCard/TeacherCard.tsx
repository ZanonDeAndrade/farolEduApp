import React from 'react';
import type { TeacherCardProps } from '../../types/teacher';
import styles from './TeacherCard.module.css';

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher }) => {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <img 
          src={teacher.image} 
          alt={teacher.name}
          className={styles.teacherImage}
          onError={(e) => {
            e.currentTarget.src = '/images/default-avatar.svg';
          }}
        />
        <div className={styles.subjectInfo}>
          <h3 className={styles.subject}>{teacher.subject}</h3>
          {teacher.level && <span className={styles.level}>- {teacher.level}</span>}
          {teacher.description && <span className={styles.description}>{teacher.description}</span>}
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <h4 className={styles.teacherName}>Prof. {teacher.name}</h4>
        <a 
          href={teacher.profileUrl} 
          className="btn btn-secondary"
        >
          Ver Aula
        </a>
      </div>
    </div>
  );
};

export default TeacherCard;