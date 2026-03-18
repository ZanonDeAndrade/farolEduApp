import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Search, Sparkles, Wifi } from "lucide-react";
import "./SearchPage.css";
import Avatar from "../common/Avatar";
import {
  fetchPublicTeacherClasses,
  type PublicTeacherClassQuery,
  type PublicTeacherClassResponse,
} from "../../services/teacherClasses";

type Filters = {
  subject: string;
  city: string;
  modality: "online" | "presencial" | "hybrid" | "ambos";
};

const DEFAULT_FILTERS: Filters = {
  subject: "",
  city: "",
  modality: "online",
};

const mapModality = (value: Filters["modality"]) => {
  if (value === "hybrid" || value === "ambos") return "AMBOS";
  if (value === "presencial") return "PRESENCIAL";
  return "ONLINE";
};

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    subject: params.get("q") ?? DEFAULT_FILTERS.subject,
  }));
  const [results, setResults] = useState<PublicTeacherClassResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.get("q")) {
      setFilters((prev) => ({ ...prev, subject: params.get("q") ?? "" }));
    }
  }, [params]);

  const loadResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const query: PublicTeacherClassQuery = {
      q: filters.subject.trim() || undefined,
      city: filters.city.trim() || undefined,
      modality: mapModality(filters.modality),
      take: 30,
    };

    try {
      const data = await fetchPublicTeacherClasses(query);
      setResults(data);
    } catch (err) {
      console.error("Erro ao buscar aulas:", err);
      setError("Não foi possível carregar as aulas agora. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [filters.city, filters.modality, filters.subject]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleChange = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleViewTeacher = useCallback(
    (teacherId?: number | null, offerId?: number) => {
      if (!teacherId) return;
      const qs = offerId ? `?offerId=${offerId}` : "";
      navigate(`/teachers/${teacherId}${qs}`);
    },
    [navigate]
  );

  const subtitle = useMemo(() => {
    if (filters.subject.trim()) {
      return `Aulas de ${filters.subject.trim()}`;
    }
    return "Buscar professores e aulas";
  }, [filters.subject]);

  return (
    <div className="search-page">
      <section className="search-hero">
        <div className="search-hero-copy">
          <span className="search-eyebrow">
            <Sparkles size={16} />
            Encontre a aula certa
          </span>
          <h1>{subtitle}</h1>
          <p>Filtre por modalidade, cidade ou matéria e abra o perfil do professor para agendar.</p>
        </div>

        <div className="search-filters">
          <div className="search-input">
            <Search size={18} />
            <input
              value={filters.subject}
              onChange={(event) => handleChange("subject", event.target.value)}
              placeholder="Matemática, inglês, reforço..."
            />
          </div>
          <div className="search-input">
            <MapPin size={18} />
            <input
              value={filters.city}
              onChange={(event) => handleChange("city", event.target.value)}
              placeholder="Cidade ou região"
            />
          </div>
          <div className="search-chips">
            {(["online", "presencial", "hybrid"] as Filters["modality"][]).map((value) => {
              const isActive = filters.modality === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={`search-chip ${isActive ? "is-active" : ""}`}
                  onClick={() => handleChange("modality", value)}
                >
                  {value === "online" ? <Wifi size={14} /> : <MapPin size={14} />}
                  {value === "online" ? "Online" : value === "presencial" ? "Presencial" : "Híbrido"}
                </button>
              );
            })}
          </div>
          <button type="button" className="btn btn-primary" onClick={loadResults} disabled={isLoading}>
            {isLoading ? "Buscando..." : "Buscar aulas"}
          </button>
        </div>
      </section>

      <section className="search-results">
        {isLoading ? (
          <div className="search-status">Carregando aulas...</div>
        ) : error ? (
          <div className="search-status error">{error}</div>
        ) : results.length === 0 ? (
          <div className="search-status">Nenhuma aula encontrada para os filtros selecionados.</div>
        ) : (
          <div className="search-grid">
            {results.map((item) => {
              const price =
                item.priceCents !== null && item.priceCents !== undefined
                  ? `R$ ${(item.priceCents / 100).toFixed(2)}`
                  : item.price !== null && item.price !== undefined
                  ? `R$ ${Number(item.price).toFixed(2)}`
                  : "Valor a combinar";
              const city =
                item.teacher?.profile?.city || item.teacher?.profile?.region || "Local não informado";
              const teacherPhoto = item.teacher?.photoUrl ?? item.teacher?.profile?.profilePhoto ?? null;

              return (
                <div key={item.id} className="search-card">
                  <div className="search-card-head">
                    <div>
                      <h3>{item.title}</h3>
                      {item.subject ? <p className="search-card-subject">{item.subject}</p> : null}
                    </div>
                    <span className="search-card-modality">{item.modality}</span>
                  </div>
                  {item.teacher?.name ? (
                    <div className="search-card-teacher">
                      <Avatar name={item.teacher.name} photoUrl={teacherPhoto} size={46} />
                      <div className="search-card-teacher-meta">
                        <p className="search-card-teacher-name">{item.teacher.name}</p>
                        <p className="search-card-teacher-city">{city}</p>
                      </div>
                    </div>
                  ) : null}
                  {item.description ? <p className="search-card-desc">{item.description}</p> : null}
                  <div className="search-card-meta">
                    <span>
                      <MapPin size={14} />
                      {city}
                    </span>
                    <span className="search-card-price">{price}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleViewTeacher(item.teacherId, item.id)}
                  >
                    Ver detalhes e agendar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchPage;
