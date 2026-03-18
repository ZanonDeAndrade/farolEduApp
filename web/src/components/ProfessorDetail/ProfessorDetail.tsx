import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MapPin, Phone, Sparkles } from "lucide-react";
import "./ProfessorDetail.css";
import { fetchPublicTeacher, type PublicTeacherClass, type PublicTeacherResponse } from "../../services/professors";
import Avatar from "../common/Avatar";

const formatPrice = (price?: number | null, priceCents?: number | null) => {
  if (priceCents !== null && priceCents !== undefined) {
    return `R$ ${(priceCents / 100).toFixed(2)}`;
  }
  if (price !== null && price !== undefined) {
    return `R$ ${Number(price).toFixed(2)}`;
  }
  return "Valor a combinar";
};

const ProfessorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<PublicTeacherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    fetchPublicTeacher(Number(id))
      .then((data) => setTeacher(data))
      .catch((err) => {
        console.error("Erro ao carregar professor:", err);
        setError("Não foi possível carregar o perfil do professor.");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const classList: PublicTeacherClass[] = useMemo(() => {
    if (teacher?.classes) return teacher.classes;
    const legacyClasses = (teacher as { teacherClasses?: PublicTeacherClass[] } | null)?.teacherClasses;
    return legacyClasses ?? [];
  }, [teacher]);

  const location = useMemo(() => {
    if (!teacher?.teacherProfile) return "Local não informado";
    return teacher.teacherProfile.city || teacher.teacherProfile.region || "Local não informado";
  }, [teacher]);

  const initialOfferId = useMemo(() => {
    const fromSearch = search.get("offerId");
    if (fromSearch) return Number(fromSearch);
    return classList.find((cls: PublicTeacherClass) => cls.active !== false)?.id ?? classList[0]?.id;
  }, [search, classList]);

  const handleSchedule = (klass: PublicTeacherClass) => {
    if (!klass.id) return;
    const query = new URLSearchParams({
      offerId: String(klass.id),
      teacherId: id ?? "",
      teacherName: teacher?.name ?? "",
      offerTitle: klass.title,
      durationMinutes: String(klass.durationMinutes ?? ""),
    });
    navigate(`/schedule?${query.toString()}`);
  };

  if (isLoading) {
    return <div className="professor-detail-state">Carregando perfil...</div>;
  }

  if (error) {
    return <div className="professor-detail-state error">{error}</div>;
  }

  if (!teacher) {
    return <div className="professor-detail-state">Professor não encontrado.</div>;
  }

  const teacherPhoto = teacher.photoUrl ?? teacher.teacherProfile?.profilePhoto ?? null;

  return (
    <div className="professor-detail">
      <section className="professor-header">
        <Avatar name={teacher.name} photoUrl={teacherPhoto} size={76} className="professor-avatar" />
        <div className="professor-head-copy">
          <h1>{teacher.name}</h1>
          <p className="professor-subtitle">{teacher.teacherProfile?.experience || "Professor"}</p>
          <div className="professor-meta">
            <span>
              <MapPin size={16} />
              {location}
            </span>
            {teacher.teacherProfile?.phone ? (
              <span>
                <Phone size={16} />
                {teacher.teacherProfile.phone}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="professor-actions">
        <div>
          <p className="professor-actions-title">Agende com {teacher.name.split(" ")[0] ?? "o professor"}</p>
          <p className="professor-actions-subtitle">Escolha uma das aulas ativas e confirme o horário.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!initialOfferId}
          onClick={() => {
            const klass = classList.find((c: PublicTeacherClass) => c.id === initialOfferId);
            if (klass) handleSchedule(klass);
          }}
        >
          {initialOfferId ? "Agendar agora" : "Cadastre uma aula para agendar"}
        </button>
      </section>

      <section className="professor-classes">
        <h2>Aulas oferecidas</h2>
          {classList.length ? (
          classList.map((klass: PublicTeacherClass) => {
            const priceLabel = formatPrice(klass.price, klass.priceCents);
            return (
              <div key={klass.id} className="professor-class-card">
                <div className="professor-class-head">
                  <div className="professor-class-title">
                    <h3>{klass.title}</h3>
                    {klass.subject ? <p className="professor-class-subject">{klass.subject}</p> : null}
                    <div className="professor-class-teacher">
                      <Avatar name={teacher.name} photoUrl={teacherPhoto} size={36} />
                      <span>{teacher.name}</span>
                    </div>
                  </div>
                  <span className={`professor-class-modality ${klass.active === false ? "is-inactive" : ""}`}>
                    {klass.modality}
                  </span>
                </div>
                {klass.description ? <p className="professor-class-desc">{klass.description}</p> : null}
                <div className="professor-class-meta">
                  <span>Duração: {klass.durationMinutes} min</span>
                  <span>{priceLabel}</span>
                  {klass.location ? <span>{klass.location}</span> : null}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={klass.active === false}
                  onClick={() => handleSchedule(klass)}
                >
                  {klass.active === false ? "Oferta pausada" : "Agendar esta aula"}
                </button>
              </div>
            );
          })
        ) : (
          <div className="professor-detail-state">Nenhuma aula cadastrada para este professor.</div>
        )}
      </section>

      <section className="professor-footer">
        <Sparkles size={18} />
        <p>Horários confirmados seguem para sua agenda. Conflitos retornam erro 409 conforme o app.</p>
      </section>
    </div>
  );
};

export default ProfessorDetail;
