import React from "react";
import type { AvailabilityDraft } from "./types";

type TimeRangePickerProps = {
  value: AvailabilityDraft;
  onChange(localId: string, patch: Partial<AvailabilityDraft>): void;
  onRemove(localId: string): void;
};

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  value,
  onChange,
  onRemove,
}) => (
  <div className="availability-manager__range-card">
    <label className="availability-manager__field">
      <span>Inicio</span>
      <input
        type="time"
        value={value.startTime}
        onChange={event => onChange(value.localId, { startTime: event.target.value })}
      />
    </label>

    <label className="availability-manager__field">
      <span>Fim</span>
      <input
        type="time"
        value={value.endTime}
        onChange={event => onChange(value.localId, { endTime: event.target.value })}
      />
    </label>

    <label className="availability-manager__field availability-manager__field--duration">
      <span>Duracao</span>
      <input
        type="number"
        min={15}
        step={15}
        value={value.slotDuration}
        onChange={event =>
          onChange(value.localId, { slotDuration: Number(event.target.value) || 0 })
        }
      />
      <small>min</small>
    </label>

    <button
      type="button"
      className="availability-manager__remove"
      onClick={() => onRemove(value.localId)}
    >
      Remover
    </button>
  </div>
);

export default TimeRangePicker;
