import React, { useEffect, useState } from 'react';
import { Search, MapPin, Sparkles, GraduationCap, Users, Wifi } from 'lucide-react';
import './Hero.css';
import FarolImage from '../../assets/ImagemFarol.png';
import type { SearchFilters } from '../../types/search';

type HeroProps = {
  onSearch?: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
};

const Hero: React.FC<HeroProps> = ({ onSearch, initialFilters }) => {
  const [formData, setFormData] = useState({
    subject: initialFilters?.subject ?? '',
    location: initialFilters?.location ?? '',
  });
  const [filters, setFilters] = useState({
    nearby: initialFilters?.nearby ?? false,
    online: initialFilters?.online ?? false,
  });

  useEffect(() => {
    if (!initialFilters) return;
    setFormData({ subject: initialFilters.subject, location: initialFilters.location });
    setFilters({ nearby: initialFilters.nearby, online: initialFilters.online });
  }, [initialFilters]);

  const handleInputChange = (field: 'subject' | 'location', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFilter = (filter: 'nearby' | 'online') => {
    setFilters(prev => {
      const updated = { ...prev, [filter]: !prev[filter] };
      onSearch?.({
        subject: formData.subject.trim(),
        location: formData.location.trim(),
        nearby: updated.nearby,
        online: updated.online,
      });
      return updated;
    });
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch?.({
      subject: formData.subject.trim(),
      location: formData.location.trim(),
      nearby: filters.nearby,
      online: filters.online,
    });
  };

  return (
    <section className="hero" id="inicio">
      <div className="container">
        <div className="hero-shell">
          <div className="hero-info">
            <span className="hero-eyebrow">
              <Sparkles className="hero-eyebrow-icon" />
              Aprendizado iluminado por bons encontros
            </span>
            <h1 className="hero-title">
              Dê o próximo passo no seu aprendizado com o <span>FarolEdu</span>.
            </h1>
            <p className="hero-subtitle">
              Conectamos alunos e professores particulares em todo o Brasil, com aulas presenciais e online que se encaixam na sua rotina.
            </p>

            <ul className="hero-highlights">
              <li>
                <Sparkles className="hero-highlight-icon" />
                Professores em mais de 100 cidades
              </li>
              <li>
                <GraduationCap className="hero-highlight-icon" />
                Todas as matérias: escolar, idiomas, música e mais
              </li>
              <li>
                <Users className="hero-highlight-icon" />
                Aulas personalizadas para todo nível e orçamento
              </li>
            </ul>

            <form className="hero-search" onSubmit={handleSearch}>
              <div className="hero-field">
                <Search className="hero-field-icon" />
                <input
                  type="text"
                  value={formData.subject}
                  onChange={event => handleInputChange('subject', event.target.value)}
                  placeholder="Busque Matemática, inglês, música..."
                />
              </div>
              <div className="hero-field">
                <MapPin className="hero-field-icon" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={event => handleInputChange('location', event.target.value)}
                  placeholder="Local das aulas ou online"
                />
              </div>
              <button type="submit" className="hero-search-submit">
                Pesquisar
              </button>
            </form>

            <div className="hero-filters">
              <button
                type="button"
                className={`hero-filter ${filters.nearby ? 'is-active' : ''}`}
                onClick={() => toggleFilter('nearby')}
              >
                <MapPin className="hero-filter-icon" />
                Perto de mim
              </button>
              <button
                type="button"
                className={`hero-filter ${filters.online ? 'is-active' : ''}`}
                onClick={() => toggleFilter('online')}
              >
                <Wifi className="hero-filter-icon" />
                Online
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <img
              className="hero-visual-img"
              src={FarolImage}
              alt="Farol apontando caminhos para novos aprendizados"
            />
            <div className="hero-visual-floor" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
