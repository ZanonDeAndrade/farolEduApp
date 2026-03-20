import { describe, expect, it } from "vitest";
import { buildTeacherCalendarEvents } from "./calendarAdapters";

describe("calendarAdapters", () => {
  it("gera eventos recorrentes de disponibilidade e eventos reais de booking", () => {
    const events = buildTeacherCalendarEvents(
      [
        {
          id: "availability-1",
          teacherId: 7,
          dayOfWeek: 1,
          startTime: "14:00",
          endTime: "18:00",
          slotDuration: 60,
        },
      ],
      [
        {
          id: 9,
          offerId: 11,
          studentId: 15,
          teacherId: 7,
          date: "2026-03-23",
          startTime: "14:00",
          endTime: "15:00",
          startAtUtc: "2026-03-23T17:00:00.000Z",
          endAtUtc: "2026-03-23T18:00:00.000Z",
          status: "PENDING",
          createdAt: "2026-03-01T10:00:00.000Z",
          updatedAt: "2026-03-01T10:00:00.000Z",
          offer: {
            id: 11,
            title: "Violao",
            modality: "ONLINE",
            durationMinutes: 60,
          },
        },
      ],
      {
        showAvailability: true,
        showPending: true,
        showConfirmed: true,
      },
    );

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      id: "availability:availability-1",
      daysOfWeek: ["1"],
      startTime: "14:00:00",
      endTime: "18:00:00",
    });
    expect(events[1]).toMatchObject({
      id: "booking:9",
      start: "2026-03-23T14:00:00Z",
      end: "2026-03-23T15:00:00Z",
    });
  });

  it("respeita toggles de pendentes e confirmados", () => {
    const events = buildTeacherCalendarEvents(
      [],
      [
        {
          id: 9,
          offerId: 11,
          studentId: 15,
          teacherId: 7,
          date: "2026-03-23",
          startTime: "14:00",
          endTime: "15:00",
          startAtUtc: "2026-03-23T17:00:00.000Z",
          endAtUtc: "2026-03-23T18:00:00.000Z",
          status: "PENDING",
          createdAt: "2026-03-01T10:00:00.000Z",
          updatedAt: "2026-03-01T10:00:00.000Z",
        },
        {
          id: 10,
          offerId: 11,
          studentId: 15,
          teacherId: 7,
          date: "2026-03-24",
          startTime: "10:00",
          endTime: "11:00",
          startAtUtc: "2026-03-24T13:00:00.000Z",
          endAtUtc: "2026-03-24T14:00:00.000Z",
          status: "CONFIRMED",
          createdAt: "2026-03-01T10:00:00.000Z",
          updatedAt: "2026-03-01T10:00:00.000Z",
        },
      ],
      {
        showAvailability: false,
        showPending: false,
        showConfirmed: true,
      },
    );

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      id: "booking:10",
      title: expect.stringContaining("Confirmada"),
    });
  });
});
