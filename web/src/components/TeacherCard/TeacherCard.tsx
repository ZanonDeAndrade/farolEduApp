import React from 'react';
import type { TeacherCardProps } from '../../types/teacher';
import './TeacherCard.css';

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher }) => {
  return (
    <div className="teacher-card">
      <div className="card-header">
        <div className="teacher-avatar">
          {teacher.subject.charAt(0)}
        </div>
        <div className="subject-info">
          <h3 className="subject">{teacher.subject}</h3>
          {teacher.level && <span className="level">- {teacher.level}</span>}
          {teacher.description && <span className="description">{teacher.description}</span>}
        </div>
      </div>
      
      <div className="card-body">
        <h4 className="teacher-name">Prof. {teacher.name}</h4>
        <button className="btn btn-secondary">
          Ver Aula
        </button>
      </div>
    </div>
  );
};

export default TeacherCard;