import React from 'react';
import TeacherCard from '../TeacherCard/TeacherCard';
import { teachers } from '../../data/teachers';
import styles from './AvailableClasses.module.css';

const AvailableClasses: React.FC = () => {
  return (
    <section className={styles.availableClasses}>
      <div className="container">
        <h2 className={styles.title}>Aulas disponíveis perto de você</h2>
        
        <div className={styles.teacherGrid}>
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AvailableClasses;