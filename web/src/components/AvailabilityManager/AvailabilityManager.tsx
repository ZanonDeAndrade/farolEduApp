import React, { useEffect, useMemo, useState } from "react";
import { Clock3, X } from "lucide-react";
import type { Availability, AvailabilityPayload } from "../../services/availability";
import AvailabilityList from "./AvailabilityList";
import WeekDaySelector from "./WeekDaySelector";
import {
  availabilitySignature,
  createDraftId,
  sortAvailabilityDrafts,
  toDrafts,
  type AvailabilityDraft,
  WEEK_DAYS,
} from "./types";
import "./AvailabilityManager.css";

type AvailabilityManagerProps = {
  isOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  availability: Availability[];
  errorMessage?: string | null;
  onClose(): void;
  onSave(next: AvailabilityPayload[]): Promise<void>;
};

const DEFAULT_RANGE = {
  startTime: "14:00",
  endTime: "18:00",
  slotDuration: 60,
};

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  isOpen,
  isLoading,
  isSaving,
  availability,
  errorMessage,
  onClose,
  onSave,
}) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [drafts, setDrafts] = useState<AvailabilityDraft[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const nextDrafts = toDrafts(availability);
    setDrafts(nextDrafts);
    setLocalError(null);

    const firstAvailableDay = nextDrafts[0]?.dayOfWeek ?? 1;
    setSelectedDay(firstAvailableDay);
  }, [availability, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const countsByDay = useMemo(() => {
    return drafts.reduce<Record<number, number>>((acc, item) => {
      acc[item.dayOfWeek] = (acc[item.dayOfWeek] ?? 0) + 1;
      return acc;
    }, {});
  }, [drafts]);

  const selectedDayDrafts = useMemo(
    () => drafts.filter(item => item.dayOfWeek === selectedDay),
    [drafts, selectedDay],
  );

  const selectedDayLabel =
    WEEK_DAYS.find(day => day.value === selectedDay)?.label ?? "Disponibilidade";

  const setDraftPatch = (localId: string, patch: Partial<AvailabilityDraft>) => {
    setDrafts(prev =>
      sortAvailabilityDrafts(
        prev.map(item => (item.localId === localId ? { ...item, ...patch } : item)),
      ),
    );
  };

  const handleAddRange = () => {
    setDrafts(prev =>
      sortAvailabilityDrafts([
        ...prev,
        {
          localId: createDraftId(),
          dayOfWeek: selectedDay,
          startTime: DEFAULT_RANGE.startTime,
          endTime: DEFAULT_RANGE.endTime,
          slotDuration: DEFAULT_RANGE.slotDuration,
        },
      ]),
    );
    setLocalError(null);
  };

  const handleRemoveRange = (localId: string) => {
    setDrafts(prev => prev.filter(item => item.localId !== localId));
    setLocalError(null);
  };

  const validateDrafts = (items: AvailabilityDraft[]) => {
    const grouped = WEEK_DAYS.map(day => ({
      dayOfWeek: day.value,
      items: items
        .filter(item => item.dayOfWeek === day.value)
        .slice()
        .sort((left, right) => left.startTime.localeCompare(right.startTime)),
    }));

    for (const group of grouped) {
      const signatures = new Set<string>();
      for (const item of group.items) {
        if (!item.startTime || !item.endTime) {
          return "Preencha inicio e fim para todos os horarios.";
        }
        if (item.startTime >= item.endTime) {
          return "A hora final deve ser maior que a hora inicial.";
        }
        if (!Number.isFinite(item.slotDuration) || item.slotDuration <= 0) {
          return "A duracao do slot precisa ser maior que zero.";
        }

        const signature = availabilitySignature(item);
        if (signatures.has(signature)) {
          return "Existem horarios duplicados na sua disponibilidade.";
        }
        signatures.add(signature);
      }

      for (let index = 1; index < group.items.length; index += 1) {
        const previous = group.items[index - 1];
        const current = group.items[index];
        if (current.startTime < previous.endTime) {
          return "Nao e permitido cadastrar horarios sobrepostos no mesmo dia.";
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateDrafts(drafts);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);
    try {
      await onSave(
        drafts.map(item => ({
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          slotDuration: item.slotDuration,
        })),
      );
    } catch {
      // Parent state already exposes the API error message in the modal.
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="availability-manager__overlay"
      onClick={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="availability-manager" role="dialog" aria-modal="true" aria-label="Alterar disponibilidade">
        <div className="availability-manager__header">
          <div>
            <p className="availability-manager__eyebrow">Agenda unica do professor</p>
            <h2>Alterar disponibilidade</h2>
            <p className="availability-manager__subtitle">
              Os horarios definidos aqui valem para todas as aulas deste professor.
            </p>
          </div>

          <button type="button" className="availability-manager__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="availability-manager__summary">
          <div className="availability-manager__summary-icon">
            <Clock3 size={18} />
          </div>
          <div>
            <strong>Disponibilidade semanal</strong>
            <p>Selecione um dia, adicione varios intervalos e defina a duracao de cada slot.</p>
          </div>
        </div>

        <WeekDaySelector
          days={WEEK_DAYS}
          selectedDay={selectedDay}
          counts={countsByDay}
          onSelect={setSelectedDay}
        />

        {isLoading ? (
          <div className="availability-manager__empty">Carregando disponibilidade...</div>
        ) : (
          <AvailabilityList
            dayLabel={selectedDayLabel}
            items={selectedDayDrafts}
            onAdd={handleAddRange}
            onChange={setDraftPatch}
            onRemove={handleRemoveRange}
          />
        )}

        {localError ? (
          <div className="availability-manager__alert is-error">{localError}</div>
        ) : null}
        {errorMessage ? (
          <div className="availability-manager__alert is-error">{errorMessage}</div>
        ) : null}

        <div className="availability-manager__footer">
          <button type="button" className="availability-manager__ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="availability-manager__primary"
            disabled={isLoading || isSaving}
            onClick={handleSave}
          >
            {isSaving ? "Salvando..." : "Salvar disponibilidade"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;
