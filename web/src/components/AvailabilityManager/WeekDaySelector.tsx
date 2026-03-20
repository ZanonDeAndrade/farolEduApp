import React from "react";

type WeekDayOption = {
  value: number;
  label: string;
  shortLabel: string;
};

type WeekDaySelectorProps = {
  days: readonly WeekDayOption[];
  selectedDay: number;
  counts: Record<number, number>;
  onSelect(day: number): void;
};

const WeekDaySelector: React.FC<WeekDaySelectorProps> = ({
  days,
  selectedDay,
  counts,
  onSelect,
}) => (
  <div className="availability-manager__weekday-selector">
    {days.map(day => {
      const count = counts[day.value] ?? 0;
      const isSelected = selectedDay === day.value;

      return (
        <button
          key={day.value}
          type="button"
          className={[
            "availability-manager__weekday-button",
            isSelected ? "is-selected" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSelect(day.value)}
        >
          <span>{day.shortLabel}</span>
          <strong>{count}</strong>
        </button>
      );
    })}
  </div>
);

export default WeekDaySelector;
