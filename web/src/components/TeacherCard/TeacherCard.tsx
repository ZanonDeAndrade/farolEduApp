import React from 'react';
import './TeacherCard.css';

export type TeacherClassCard = {
  id: number;
  title: string;
  subject?: string | null;
  description?: string | null;
  modality: string;
  price?: number | null;
  teacherName?: string | null;
  teacherEmail?: string | null;
  city?: string | null;
};

type TeacherCardProps = {
  data: TeacherClassCard;
};

const TeacherCard: React.FC<TeacherCardProps> = ({ data }) => {
  const initial = (data.subject || data.title || 'A').trim().charAt(0).toUpperCase();
  const modalityLabel =
    data.modality === 'online'
      ? 'Aulas online'
      : data.modality === 'home'
      ? 'Na casa do professor'
      : data.modality === 'travel'
      ? 'Professor vai até você'
      : data.modality === 'hybrid'
      ? 'Modelo híbrido'
      : 'Aulas presenciais';

  const priceLabel =
    data.price !== null && data.price !== undefined
      ? `R$ ${Number(data.price).toFixed(2)}`
      : 'Valor a combinar';

  return (
    <div className="teacher-card">
      <div className="card-header">
        <div className="teacher-avatar">{initial}</div>
        <div className="subject-info">
          <h3 className="subject">{data.subject || data.title}</h3>
          <span className="level">{modalityLabel}</span>
          {data.description ? <span className="description">{data.description}</span> : null}
        </div>
      </div>

      <div className="card-body">
        <div className="card-meta">
          {data.teacherName ? (
            <div className="meta-item">
              <span className="meta-label">Professor</span>
              <span className="meta-value">{data.teacherName}</span>
            </div>
          ) : null}
          {data.city ? (
            <div className="meta-item">
              <span className="meta-label">Local</span>
              <span className="meta-value">{data.city}</span>
            </div>
          ) : null}
          <div className="meta-item">
            <span className="meta-label">Investimento</span>
            <span className="meta-price">{priceLabel}</span>
          </div>
        </div>
        <button className="btn btn-secondary">Ver Aula</button>
      </div>
    </div>
  );
};

export default TeacherCard;
