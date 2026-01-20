import React, { useEffect, useMemo, useState } from "react";
import "./StudentCalendar.css";
import { fetchMyBookings, type Booking } from "../../services/bookings";
import { CalendarRange, Clock, Sparkles } from "lucide-react";

const StudentCalendar: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const from = now.toISOString();
    const to = in60Days.toISOString();

    setIsLoading(true);
    setError(null);

    fetchMyBookings({ from, to })
      .then((data) => {
        setBookings(
          (data ?? []).slice().sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        );
      })
      .catch((err) => {
        console.error("Erro ao carregar agenda:", err);
        setError("Não foi possível carregar sua agenda agora.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach((booking) => {
      const key = new Date(booking.startTime).toISOString().split("T")[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(booking);
    });
    return Array.from(map.entries()).sort((a, b) => (a[0] > b[0] ? 1 : -1));
  }, [bookings]);

  return (
    <div className="student-calendar">
      <header className="student-calendar-header">
        <div>
          <p className="student-calendar-eyebrow">
            <Sparkles size={16} />
            Sua agenda
          </p>
          <h1>Próximos agendamentos</h1>
          <p className="student-calendar-subtitle">
            Visualize aulas confirmadas e pendentes. Conflitos são bloqueados pelo backend, como no app.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="student-calendar-state">Carregando agenda...</div>
      ) : error ? (
        <div className="student-calendar-state error">{error}</div>
      ) : groups.length === 0 ? (
        <div className="student-calendar-state">Nenhuma aula agendada nos próximos 60 dias.</div>
      ) : (
        <div className="student-calendar-list">
          {groups.map(([dateKey, list]) => {
            const formatted = new Date(`${dateKey}T00:00:00`).toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            });
            return (
              <div key={dateKey} className="student-calendar-day">
                <div className="student-calendar-day-head">{formatted}</div>
                <ul>
                  {list.map((item) => (
                    <li key={item.id}>
                      <div className="student-calendar-row">
                        <Clock size={16} />
                        <span>
                          {new Date(item.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          {" - "}
                          {new Date(item.endTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="student-calendar-row">
                        <CalendarRange size={16} />
                        <span>{item.offer?.title ?? "Aula agendada"}</span>
                      </div>
                      {item.teacher ? <p className="student-calendar-teacher">Prof. {item.teacher.name}</p> : null}
                      <span className={`student-calendar-status status-${(item.status || "pending").toLowerCase()}`}>
                        {item.status || "PENDING"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCalendar;
