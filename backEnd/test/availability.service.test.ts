import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  availabilityRepository: {
    createAvailability: vi.fn(),
    getByTeacher: vi.fn(),
    getByTeacherAndDay: vi.fn(),
    deleteAvailability: vi.fn(),
  },
  bookingRepository: {
    findBlockingBookingsByTeacherInRange: vi.fn(),
  },
  offerDocGet: vi.fn(),
}));

vi.mock("../src/repositories/firestore/availabilityRepository", () => ({
  FirestoreAvailabilityRepository: vi.fn().mockImplementation(() => mocks.availabilityRepository),
}));

vi.mock("../src/repositories/firestore/bookingRepository", () => ({
  FirestoreBookingRepository: vi.fn().mockImplementation(() => mocks.bookingRepository),
}));

vi.mock("../src/repositories/firestore/helpers", () => ({
  getCollection: vi.fn(() => ({
    doc: vi.fn(() => ({
      get: mocks.offerDocGet,
    })),
  })),
}));

import {
  AvailabilityServiceError,
  createAvailabilityForTeacher,
  getAvailableSlots,
} from "../src/services/availabilityService";

describe("availabilityService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria disponibilidade valida para o professor", async () => {
    mocks.availabilityRepository.getByTeacherAndDay.mockResolvedValueOnce([]);
    mocks.availabilityRepository.createAvailability.mockResolvedValueOnce({
      id: "slot-1",
      teacherId: 7,
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "12:00",
      slotDuration: 60,
    });

    const created = await createAvailabilityForTeacher(7, {
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "12:00",
      slotDuration: 60,
    });

    expect(created.id).toBe("slot-1");
    expect(mocks.availabilityRepository.createAvailability).toHaveBeenCalledWith({
      teacherId: 7,
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "12:00",
      slotDuration: 60,
    });
  });

  it("bloqueia overlap de disponibilidade no mesmo dia", async () => {
    mocks.availabilityRepository.getByTeacherAndDay.mockResolvedValueOnce([
      {
        id: "existing",
        teacherId: 7,
        dayOfWeek: 1,
        startTime: "14:00",
        endTime: "18:00",
        slotDuration: 60,
      },
    ]);

    await expect(
      createAvailabilityForTeacher(7, {
        dayOfWeek: 1,
        startTime: "17:00",
        endTime: "20:00",
        slotDuration: 60,
      }),
    ).rejects.toMatchObject<Partial<AvailabilityServiceError>>({
      code: "AVAILABILITY_CONFLICT",
      statusCode: 409,
    });
  });

  it("permite multiplos blocos no mesmo dia quando nao ha sobreposicao", async () => {
    mocks.availabilityRepository.getByTeacherAndDay.mockResolvedValueOnce([
      {
        id: "morning",
        teacherId: 7,
        dayOfWeek: 1,
        startTime: "08:00",
        endTime: "12:00",
        slotDuration: 60,
      },
    ]);
    mocks.availabilityRepository.createAvailability.mockResolvedValueOnce({
      id: "afternoon",
      teacherId: 7,
      dayOfWeek: 1,
      startTime: "13:00",
      endTime: "18:00",
      slotDuration: 60,
    });

    const created = await createAvailabilityForTeacher(7, {
      dayOfWeek: 1,
      startTime: "13:00",
      endTime: "18:00",
      slotDuration: 60,
    });

    expect(created.id).toBe("afternoon");
  });

  it("gera slots sem extrapolar a janela e remove horarios ocupados", async () => {
    mocks.offerDocGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        teacherId: 7,
        durationMinutes: 60,
      }),
    });
    mocks.availabilityRepository.getByTeacherAndDay.mockResolvedValueOnce([
      {
        id: "window",
        teacherId: 7,
        dayOfWeek: 1,
        startTime: "14:00",
        endTime: "15:30",
        slotDuration: 60,
      },
    ]);
    mocks.bookingRepository.findBlockingBookingsByTeacherInRange.mockResolvedValueOnce([]);

    const slots = await getAvailableSlots(7, "2026-03-23", { offerId: 11 });

    expect(slots).toEqual(["14:00"]);
  });
});
