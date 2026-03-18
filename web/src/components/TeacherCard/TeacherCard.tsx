import React from "react";
import Avatar from "../common/Avatar";
import "./TeacherCard.css";

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
  teacherPhotoUrl?: string | null;
  city?: string | null;
};

type TeacherCardProps = {
  data: TeacherClassCard;
  onView?: (data: TeacherClassCard) => void;
};

const TeacherCard: React.FC<TeacherCardProps> = ({ data, onView }) => {
  const modalityNormalized = (data.modality || "").toLowerCase();
  const modalityLabel =
    modalityNormalized === "online"
      ? "Aulas online"
      : modalityNormalized === "home"
      ? "Na casa do professor"
      : modalityNormalized === "travel"
      ? "Professor vai até você"
      : modalityNormalized === "hybrid" || modalityNormalized === "ambos"
      ? "Modelo híbrido"
      : "Aulas presenciais";

  const priceLabel =
    data.price !== null && data.price !== undefined
      ? `R$ ${Number(data.price).toFixed(2)}`
      : "Valor a combinar";

  return (
    <div className="teacher-card">
      <div className="card-header">
        <Avatar
          name={data.teacherName || data.title || "Professor"}
          photoUrl={data.teacherPhotoUrl}
          size={64}
          className="teacher-card__avatar"
        />
        <div className="subject-info">
          <h3 className="subject">{data.title}</h3>
          {data.subject ? <span className="level">{data.subject}</span> : null}
          <div className="teacher-card__teacher">
            {data.teacherName ? <span className="teacher-card__teacher-name">{data.teacherName}</span> : null}
            <span className="teacher-card__teacher-modality">{modalityLabel}</span>
          </div>
          {data.description ? <span className="description">{data.description}</span> : null}
        </div>
        <span className="modality-pill">{data.modality}</span>
      </div>

      <div className="card-body">
        <div className="card-meta">
          {data.teacherName ? (
            <div className="meta-item meta-teacher">
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
