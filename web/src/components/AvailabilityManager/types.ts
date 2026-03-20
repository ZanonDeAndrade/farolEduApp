import type { Availability, AvailabilityPayload } from "../../services/availability";

export type AvailabilityDraft = AvailabilityPayload & {
  localId: string;
  id?: string;
};

export const WEEK_DAYS = [
  { value: 0, label: "Domingo", shortLabel: "Dom" },
  { value: 1, label: "Segunda-feira", shortLabel: "Seg" },
  { value: 2, label: "Terca-feira", shortLabel: "Ter" },
  { value: 3, label: "Quarta-feira", shortLabel: "Qua" },
  { value: 4, label: "Quinta-feira", shortLabel: "Qui" },
  { value: 5, label: "Sexta-feira", shortLabel: "Sex" },
  { value: 6, label: "Sabado", shortLabel: "Sab" },
] as const;

export const createDraftId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const sortAvailabilityDrafts = <T extends AvailabilityPayload>(items: T[]) =>
  items.slice().sort((left, right) => {
    if (left.dayOfWeek !== right.dayOfWeek) {
      return left.dayOfWeek - right.dayOfWeek;
    }

    return left.startTime.localeCompare(right.startTime);
  });

export const toDrafts = (items: Availability[]): AvailabilityDraft[] =>
  sortAvailabilityDrafts(items).map(item => ({
    localId: createDraftId(),
    id: item.id,
    dayOfWeek: item.dayOfWeek,
    startTime: item.startTime,
    endTime: item.endTime,
    slotDuration: item.slotDuration,
  }));

export const availabilitySignature = (item: AvailabilityPayload) =>
  `${item.dayOfWeek}|${item.startTime}|${item.endTime}|${item.slotDuration}`;
