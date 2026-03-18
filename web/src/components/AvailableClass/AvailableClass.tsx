import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherCard, { type TeacherClassCard } from '../TeacherCard/TeacherCard';
import {
  fetchPublicTeacherClasses,
  type PublicTeacherClassResponse,
} from '../../services/teacherClasses';
import type { SearchFilters } from '../../types/search';
import './AvailableClass.css';

type AvailableClassesProps = {
  filters: SearchFilters;
};

const mapToCard = (item: PublicTeacherClassResponse): TeacherClassCard => {
  const price =
    item.priceCents !== null && item.priceCents !== undefined
      ? item.priceCents / 100
      : item.price !== null && item.price !== undefined
      ? Number(item.price)
      : null;

  return {
    id: item.id,
    title: item.title,
    subject: item.subject,
    description: item.description,
    modality: item.modality,
    price,
    teacherName: item.teacher?.name ?? null,
    teacherEmail: item.teacher?.email ?? null,
    teacherPhotoUrl: item.teacher?.photoUrl ?? item.teacher?.profile?.profilePhoto ?? null,
    city: item.teacher?.profile?.city ?? item.teacher?.profile?.region ?? null,
    teacherId: item.teacher?.id ?? null,
  };
};

const AvailableClasses: React.FC<AvailableClassesProps> = ({ filters }) => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<TeacherClassCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const query = {
      q: filters.subject.trim() || undefined,
      city: filters.location.trim() || undefined,
      modality: filters.online ? 'ONLINE' : undefined,
      take: 12,
    };

    setIsLoading(true);
    setError(null);

    fetchPublicTeacherClasses(query)
      .then(data => {
        if (!isCurrent) return;
        setClasses(data.map(mapToCard));
      })
      .catch(err => {
        if (!isCurrent) return;
        console.error('Erro ao buscar aulas públicas:', err);
        setError('Não foi possível carregar as aulas neste momento. Tente novamente em instantes.');
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.subject.trim().length > 0 ||
      filters.location.trim().length > 0 ||
      filters.online ||
      filters.nearby
    );
  }, [filters]);

  return (
    <section className="available-classes">
      <div className="container">
        <h2 className="classes-title">
          Aulas disponíveis <span>perto de você</span>
        </h2>

        {hasActiveFilters ? (
          <div className="classes-summary">
            <span className="summary-label">Filtros aplicados:</span>
            {filters.subject ? (
              <span className="summary-pill">Assunto · {filters.subject.trim()}</span>
            ) : null}
            {filters.location ? (
              <span className="summary-pill">Local · {filters.location.trim()}</span>
            ) : null}
            {filters.online ? <span className="summary-pill highlight">Online</span> : null}
            {filters.nearby ? <span className="summary-pill highlight">Perto de mim</span> : null}
          </div>
        ) : null}

        {isLoading ? (
          <div className="classes-status">Carregando aulas...</div>
        ) : error ? (
          <div className="classes-status error">{error}</div>
        ) : classes.length === 0 ? (
          <div className="classes-status">Nenhuma aula encontrada para os filtros selecionados.</div>
        ) : (
          <div className="teacher-grid">
            {classes.map(item => (
              <TeacherCard
                key={item.id}
                data={item}
                onView={() => {
                  if (!item.teacherId) return;
                  navigate(`/teachers/${item.teacherId}?offerId=${item.id}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AvailableClasses;
