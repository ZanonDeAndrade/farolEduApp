import React from 'react';
import './TeacherCard.css';

export type TeacherClassCard = {
  id: number;
  teacherId?: number | null;
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
  onView?: (data: TeacherClassCard) => void;
};

const TeacherCard: React.FC<TeacherCardProps> = ({ data, onView }) => {
  const initial = (data.subject || data.title || 'A').trim().charAt(0).toUpperCase();
  const modalityNormalized = (data.modality || '').toLowerCase();
  const modalityLabel =
    modalityNormalized === 'online'
      ? 'Aulas online'
      : modalityNormalized === 'home'
      ? 'Na casa do professor'
      : modalityNormalized === 'travel'
      ? 'Professor vai até você'
      : modalityNormalized === 'hybrid' || modalityNormalized === 'ambos'
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
        {onView ? (
          <button className="btn btn-primary teacher-card-cta" onClick={() => onView(data)}>
            Ver detalhes e agendar
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default TeacherCard;
