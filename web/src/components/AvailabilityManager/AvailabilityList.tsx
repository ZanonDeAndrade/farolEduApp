import React from "react";
import TimeRangePicker from "./TimeRangePicker";
import type { AvailabilityDraft } from "./types";

type AvailabilityListProps = {
  dayLabel: string;
  items: AvailabilityDraft[];
  onAdd(): void;
  onChange(localId: string, patch: Partial<AvailabilityDraft>): void;
  onRemove(localId: string): void;
};

const AvailabilityList: React.FC<AvailabilityListProps> = ({
  dayLabel,
  items,
  onAdd,
  onChange,
  onRemove,
}) => (
  <div className="availability-manager__list">
    <div className="availability-manager__list-header">
      <div>
        <p className="availability-manager__eyebrow">Dia selecionado</p>
        <h3>{dayLabel}</h3>
      </div>
      <button type="button" className="availability-manager__ghost" onClick={onAdd}>
        + adicionar horario
      </button>
    </div>

    {items.length ? (
      <div className="availability-manager__range-list">
        {items.map(item => (
          <TimeRangePicker
            key={item.localId}
            value={item}
            onChange={onChange}
            onRemove={onRemove}
          />
        ))}
      </div>
    ) : (
      <div className="availability-manager__empty">
        Nenhum horario cadastrado para este dia. Adicione um intervalo para liberar novos slots.
      </div>
    )}
  </div>
);

export default AvailabilityList;
