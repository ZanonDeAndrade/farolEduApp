import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarRange, Clock, MapPin, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './StudentHome.css';
import { fetchMyBookings, type Booking } from '../../services/bookings';
import { fetchPublicTeacherClasses, type PublicTeacherClassResponse } from '../../services/teacherClasses';
import type { SearchFilters } from '../../types/search';
import Avatar from '../common/Avatar';

type StudentHomeProps = {
  profileRole: string | null;
};

const DEFAULT_FILTERS: SearchFilters = {
  subject: '',
  location: '',
  nearby: false,
  online: false,
};

const StudentHome: React.FC<StudentHomeProps> = ({ profileRole }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [modalities, setModalities] = useState<{ online: boolean; hybrid: boolean; presencial: boolean }>({
    online: true,
    hybrid: true,
    presencial: true,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [offers, setOffers] = useState<PublicTeacherClassResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);

  const isStudent = (profileRole ?? '').toLowerCase() === 'student';

  const handleInputChange = (field: keyof SearchFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [field]: value } as SearchFilters));
  };

  const loadData = useCallback(
    async (opts?: { isRefresh?: boolean }) => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      if (opts?.isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      setOfferError(null);

      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const from = now.toISOString();
      const to = in30Days.toISOString();

      const offerQuery = {
        q: filters.subject.trim() || undefined,
        city: filters.location.trim() || undefined,
        take: 6,
      };

      const [bookingsResult, offersResult] = await Promise.allSettled([
        fetchMyBookings({ from, to }),
        fetchPublicTeacherClasses(offerQuery),
      ]);

      if (bookingsResult.status === 'fulfilled') {
        const upcoming = (bookingsResult.value ?? [])
          .filter(item => {
            const start = new Date(item.startTime).getTime();
            return start >= now.getTime() && start <= in30Days.getTime();
          })
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        setBookings(upcoming);
      } else {
        console.error('Erro ao carregar bookings:', bookingsResult.reason);
        setBookings([]);
        setError('Não foi possível carregar seus próximos horários.');
      }

      if (offersResult.status === 'fulfilled') {
        const selectedModalities: string[] = [];
        if (modalities.online) selectedModalities.push('ONLINE');
        if (modalities.hybrid) selectedModalities.push('AMBOS');
        if (modalities.presencial) selectedModalities.push('PRESENCIAL');

        const allowed = selectedModalities.length ? new Set(selectedModalities) : null;
        const filtered = (offersResult.value ?? []).filter(item => {
          const mode = (item.modality ?? '').toUpperCase();
          return !allowed || allowed.has(mode);
        });
        setOffers(filtered);
      } else {
        console.error('Erro ao carregar ofertas:', offersResult.reason);
        setOffers([]);
        setOfferError('Não foi possível carregar as sugestões.');
      }

      setIsLoading(false);
      setIsRefreshing(false);
    },
    [filters.location, filters.subject, modalities.hybrid, modalities.online, modalities.presencial, navigate],
  );

  useEffect(() => {
    if (!isStudent) return;
    loadData();
  }, [isStudent, loadData]);

  const handleSearch = () => {
    const term = filters.subject.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  };

  const modalityOptions: Array<{ label: string; value: 'online' | 'hybrid' | 'presencial' }> = [
    { label: 'Online', value: 'online' },
    { label: 'Híbrido', value: 'hybrid' },
    { label: 'Presencial', value: 'presencial' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    window.dispatchEvent(new Event('faroledu-auth-change'));
    navigate('/login');
  };

  const handleNavigateOffers = () => {
    navigate('/search');
  };

  const handleNavigateCalendar = () => {
    navigate('/calendar');
  };

  const offerCards = useMemo(() => {
    return offers.map(item => {
      const price =
        item.priceCents !== null && item.priceCents !== undefined
          ? `R$ ${(item.priceCents / 100).toFixed(2)}`
          : item.price !== null && item.price !== undefined
          ? `R$ ${Number(item.price).toFixed(2)}`
          : 'Valor a combinar';
      const city = item.teacher?.profile?.city ?? item.teacher?.profile?.region ?? 'Local não informado';
      return (
        <div className="student-offer-card" key={item.id}>
          <div className="student-offer-head">
            <div>
              <h4>{item.title}</h4>
              {item.subject ? <p className="student-offer-subject">{item.subject}</p> : null}
            </div>
            <span className="student-offer-modality">{item.modality}</span>
          </div>
          {item.teacher?.name ? (
            <div className="student-offer-teacher">
              <Avatar
                name={item.teacher.name}
                photoUrl={item.teacher.photoUrl ?? item.teacher.profile?.profilePhoto ?? null}
                size={36}
              />
              <div className="student-offer-teacher-meta">
                <span className="student-offer-teacher-name">{item.teacher.name}</span>
                <span className="student-offer-teacher-city">{city}</span>
              </div>
            </div>
          ) : null}
          {item.description ? <p className="student-offer-desc">{item.description}</p> : null}
          <div className="student-offer-meta">
            <span>
              <MapPin size={14} /> {city}
            </span>
            <span className="student-offer-price">{price}</span>
          </div>
          {item.teacher?.id ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/teachers/${item.teacher?.id}?offerId=${item.id}`)}
            >
              Ver detalhes e agendar
            </button>
          ) : null}
        </div>
      );
    });
  }, [offers]);

  return (
    <div className="student-home">
      <section className="student-hero">
        <div className="student-hero-content">
          <div className="student-hero-text">
            <span className="student-eyebrow">
              <Sparkles size={16} />
              Bem-vindo(a) de volta
            </span>
            <h1>Encontre sua próxima aula particular</h1>
            <p>Busque por matéria ou professor e acompanhe seus próximos horários.</p>
          </div>
          <div className="student-search">
            <div className="student-search-row">
              <div className="student-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Matemática, inglês, música..."
                  value={filters.subject}
                  onChange={e => handleInputChange('subject', e.target.value)}
                />
              </div>
              <div className="student-input">
                <MapPin size={16} />
                <input
                  type="text"
                  placeholder="Cidade ou online"
                  value={filters.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                />
              </div>
              <button type="button" className="btn btn-primary" onClick={handleSearch} disabled={isRefreshing}>
                {isRefreshing ? 'Atualizando...' : 'Pesquisar'}
              </button>
            </div>
            <div className="student-filters">
              {modalityOptions.map(option => {
                const isActive = modalities[option.value];
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`student-filter-pill ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      setModalities(prev => ({ ...prev, [option.value]: !prev[option.value] }));
                      loadData({ isRefresh: true });
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="student-section">
        <div className="student-section-head">
          <h2>Próximas aulas</h2>
          <div className="student-section-actions">
            <button className="student-link" type="button" onClick={handleNavigateCalendar}>
              Ver agenda
            </button>
            <button className="student-link" type="button" onClick={() => loadData({ isRefresh: true })}>
              Atualizar
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="student-status">Carregando sua agenda...</div>
        ) : error ? (
          <div className="student-status error">
            {error}{' '}
            <button type="button" className="student-retry" onClick={() => loadData()}>
              Tentar novamente
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="student-status">
            Você ainda não tem aulas agendadas. Pesquise uma aula e agende com um professor.
          </div>
        ) : (
          <div className="student-bookings">
            {bookings.map(item => (
              <div key={item.id} className="student-booking-card">
                <div className="student-booking-head">
                  <span className={`student-badge status-${(item.status || 'pending').toLowerCase()}`}>
                    {item.status || 'PENDING'}
                  </span>
                  <strong>{formatDate(item.startTime)}</strong>
                </div>
                <div className="student-booking-row">
                  <Clock size={16} />
                  <span>
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                  </span>
                </div>
                <div className="student-booking-row">
                  <CalendarRange size={16} />
                  <span>{item.offer?.title ?? 'Aula agendada'}</span>
                </div>
                {item.teacher ? (
                  <div className="student-booking-row">
                    <Sparkles size={16} />
                    <span>Prof. {item.teacher.name}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="student-section">
        <div className="student-section-head">
          <h2>Sugestões para você</h2>
          <button className="student-link" type="button" onClick={handleNavigateOffers}>
            Ver mais aulas
          </button>
        </div>
        {isLoading ? (
          <div className="student-status">Buscando ofertas...</div>
        ) : offerError ? (
          <div className="student-status error">
            {offerError}{' '}
            <button type="button" className="student-retry" onClick={() => loadData()}>
              Tentar novamente
            </button>
          </div>
        ) : offers.length === 0 ? (
          <div className="student-status">Nenhuma oferta encontrada agora. Tente outro termo.</div>
        ) : (
          <div className="student-offers">{offerCards}</div>
        )}
      </section>

      <div className="student-footer-actions">
        <button className="student-link" type="button" onClick={handleLogout}>
          Sair da conta
        </button>
      </div>
    </div>
  );
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export default StudentHome;
