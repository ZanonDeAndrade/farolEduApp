import React, { useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, ChevronDown, Clock, LayoutDashboard, Settings2 } from "lucide-react";
import Avatar from "../common/Avatar";
import AvatarUploader from "../auth/AvatarUploader";
import { fetchMyBookings, type Booking } from "../../services/bookings";
import {
  formatBookingDateShort,
  formatBookingTimeRange,
  getBookingStartSortValue,
  normalizeStatusLabel,
} from "../../utils/dateTime";
import type { StoredProfile } from "../../utils/profile";
import "./ProfileMenu.css";

type ProfileMenuProps = {
  profile: StoredProfile;
  displayName: string;
  onPhotoUploaded(url: string): void;
  primaryActionLabel: string;
  onPrimaryAction(): void;
  secondaryActionLabel?: string;
  onSecondaryAction?(): void;
};

const MAX_BOOKINGS_IN_MENU = 4;

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  profile,
  displayName,
  onPhotoUploaded,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const role = (profile.role ?? "").toLowerCase();
  const isTeacher = role === "teacher";

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const now = new Date();
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    setIsLoading(true);
    setError(null);

    fetchMyBookings({ from: now.toISOString(), to: in60Days.toISOString() })
      .then(data => {
        const sorted = (data ?? [])
          .slice()
          .sort((a, b) => getBookingStartSortValue(a) - getBookingStartSortValue(b))
          .slice(0, MAX_BOOKINGS_IN_MENU);
        setBookings(sorted);
      })
      .catch(err => {
        console.error("Erro ao carregar aulas do menu de perfil:", err);
        setBookings([]);
        setError("Nao foi possivel carregar suas aulas agora.");
      })
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  const roleLabel = useMemo(() => {
    if (isTeacher) return "Professor";
    if (role === "student") return "Aluno";
    return "Conta";
  }, [isTeacher, role]);

  const emailLabel = profile.email?.trim() || roleLabel;
  const PrimaryActionIcon = isTeacher ? Settings2 : CalendarRange;
  const SecondaryActionIcon = LayoutDashboard;

  return (
    <div className="profile-menu" ref={rootRef}>
      <button
        type="button"
        className={`profile-menu__trigger ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Abrir menu do perfil"
      >
        <Avatar name={displayName} photoUrl={profile.photoUrl} size={42} />
        <span className="profile-menu__chevron" aria-hidden="true">
          <ChevronDown size={16} />
        </span>
      </button>

      {isOpen ? (
        <div className="profile-menu__panel" role="dialog" aria-label="Menu do perfil">
          <div className="profile-menu__header">
            <Avatar name={displayName} photoUrl={profile.photoUrl} size={54} />
            <div className="profile-menu__identity">
              <span className="profile-menu__eyebrow">{roleLabel}</span>
              <strong>{displayName}</strong>
              <span>{emailLabel}</span>
            </div>
          </div>

          <div className="profile-menu__section">
            <div className="profile-menu__section-head">
              <div>
                <p className="profile-menu__section-eyebrow">Agenda rapida</p>
                <h3>Aulas marcadas</h3>
              </div>
              <span className="profile-menu__section-count">{bookings.length}</span>
            </div>

            {isLoading ? (
              <div className="profile-menu__status">Carregando aulas...</div>
            ) : error ? (
              <div className="profile-menu__status is-error">{error}</div>
            ) : bookings.length === 0 ? (
              <div className="profile-menu__status">Nenhuma aula marcada nos proximos dias.</div>
            ) : (
              <ul className="profile-menu__list">
                {bookings.map(item => {
                  const counterpart = isTeacher ? item.student?.name : item.teacher?.name;
                  const counterpartLabel = isTeacher
                    ? counterpart
                      ? `Aluno: ${counterpart}`
                      : "Aluno nao identificado"
                    : counterpart
                    ? `Prof. ${counterpart}`
                    : "Professor nao identificado";

                  return (
                    <li key={item.id} className="profile-menu__item">
                      <div className="profile-menu__item-top">
                        <div>
                          <strong>{item.offer?.title ?? "Aula agendada"}</strong>
                          <p>{counterpartLabel}</p>
                        </div>
                        <span className={`profile-menu__badge status-${(item.status ?? "pending").toLowerCase()}`}>
                          {normalizeStatusLabel(item.status)}
                        </span>
                      </div>

                      <div className="profile-menu__item-meta">
                        <span>
                          <CalendarRange size={14} />
                          {formatBookingDateShort(item.date)}
                        </span>
                        <span>
                          <Clock size={14} />
                          {formatBookingTimeRange(item.startTime, item.endTime)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="profile-menu__actions">
            <AvatarUploader label="Trocar foto do perfil" onUploaded={onPhotoUploaded} />
            <div className={`profile-menu__action-grid ${secondaryActionLabel ? "has-secondary" : ""}`}>
              <button
                type="button"
                className="profile-menu__primary-action"
                onClick={() => {
                  setIsOpen(false);
                  onPrimaryAction();
                }}
              >
                <PrimaryActionIcon size={16} />
                {primaryActionLabel}
              </button>

              {secondaryActionLabel && onSecondaryAction ? (
                <button
                  type="button"
                  className="profile-menu__secondary-action"
                  onClick={() => {
                    setIsOpen(false);
                    onSecondaryAction();
                  }}
                >
                  <SecondaryActionIcon size={16} />
                  {secondaryActionLabel}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileMenu;
