import React from 'react';
import TeacherCard from '../TeacherCard/TeacherCard';
import { teachers } from '../../data/teacher';
import './AvailableClass.css';

const AvailableClasses: React.FC = () => {
  return (
    <section className="available-classes">
      <div className="container">
        <h2 className="classes-title">
          Aulas disponíveis <span>perto de você</span>
        </h2>
        
        <div className="teacher-grid">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AvailableClasses;
