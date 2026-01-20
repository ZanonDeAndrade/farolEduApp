import request from "supertest";
import jwt from "jsonwebtoken";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../src/modules/bookingModel", () => {
  return {
    createBooking: vi.fn(),
    listBookingsByUser: vi.fn(),
    cancelBookingByActor: vi.fn(),
    legacyMigrateSchedule: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("../src/infra/firebase", () => {
  // Mock superficial do Firestore para evitar inicialização real
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
import { createBooking } from "../src/modules/bookingModel";

const signToken = (role: string) => jwt.sign({ id: 123, role }, "secret_key");

describe("Bookings API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("retorna 409 quando existir conflito para o professor", async () => {
    const createBookingMock = createBooking as unknown as vi.Mock;
    createBookingMock.mockRejectedValueOnce(
      Object.assign(new Error("Conflito"), { code: "BOOKING_CONFLICT_TEACHER" }),
    );

    const token = signToken("student");
    const response = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        offerId: 1,
        startTime: new Date().toISOString(),
      });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("BOOKING_CONFLICT_TEACHER");
  });

  it("bloqueia professor de criar booking (403)", async () => {
    const token = signToken("teacher");
    const response = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        offerId: 1,
        startTime: new Date().toISOString(),
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBeTruthy();
  });
});
