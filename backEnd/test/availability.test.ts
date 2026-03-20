import request from "supertest";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/services/availabilityService", () => {
  class AvailabilityServiceError extends Error {
    code: string;
    statusCode: number;

    constructor(message: string, code: string, statusCode = 400) {
      super(message);
      this.code = code;
      this.statusCode = statusCode;
    }
  }

  return {
    AvailabilityServiceError,
    createAvailabilityForTeacher: vi.fn(),
    listAvailabilityByTeacher: vi.fn(),
    deleteAvailabilityByTeacher: vi.fn(),
    getAvailableSlots: vi.fn(),
  };
});

vi.mock("../src/modules/bookingModel", () => {
  return {
    createBooking: vi.fn(),
    listBookingsByUser: vi.fn(),
    cancelBookingByActor: vi.fn(),
    legacyMigrateSchedule: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("../src/infra/firebase", () => {
  return {
    firestore: {
      collection: vi.fn().mockReturnValue({
        doc: vi.fn().mockReturnThis(),
        set: vi.fn(),
        get: vi.fn(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
      }),
      runTransaction: vi.fn(),
    },
  };
});

import { app } from "../src/server";
import {
  createAvailabilityForTeacher,
  getAvailableSlots,
} from "../src/services/availabilityService";

const signToken = (role: string) => jwt.sign({ id: 123, role }, "secret_key");

describe("Availability API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("permite que professor cadastre disponibilidade", async () => {
    const createAvailabilityMock = createAvailabilityForTeacher as unknown as vi.Mock;
    createAvailabilityMock.mockResolvedValueOnce({
      id: "availability-1",
      teacherId: 123,
      dayOfWeek: 1,
      startTime: "14:00",
      endTime: "18:00",
      slotDuration: 60,
    });

    const token = signToken("teacher");
    const response = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${token}`)
      .send({
        dayOfWeek: 1,
        startTime: "14:00",
        endTime: "18:00",
        slotDuration: 60,
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe("availability-1");
  });

  it("retorna slots publicos do professor por data", async () => {
    const getAvailableSlotsMock = getAvailableSlots as unknown as vi.Mock;
    getAvailableSlotsMock.mockResolvedValueOnce(["14:00", "15:00"]);

    const response = await request(app).get(
      "/api/teachers/123/available-slots?date=2026-03-23&offerId=55",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(["14:00", "15:00"]);
  });
});
