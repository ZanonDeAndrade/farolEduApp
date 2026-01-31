import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Garante trust proxy ativo durante os testes (simula ambiente de produção)
process.env.TRUST_PROXY = "1";

vi.mock("../src/modules/bookingModel", () => {
  return {
    createBooking: vi.fn(),
    listBookingsByUser: vi.fn(),
    cancelBookingByActor: vi.fn(),
    legacyMigrateSchedule: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("../src/infra/firebase", () => {
  const chain = () => ({
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    set: vi.fn(),
    get: vi.fn().mockResolvedValue({ empty: true, docs: [], data: () => ({}) }),
  });

  return {
    firestore: {
      collection: vi.fn().mockReturnValue(chain()),
      runTransaction: vi.fn(),
    },
    firebaseAuth: {
      verifyIdToken: vi.fn(),
    },
  };
});

vi.mock("../src/controller/authController", () => ({
  login: vi.fn((req, res) => res.status(200).json({ ok: true })),
  loginWithGoogle: vi.fn((req, res) => res.status(200).json({ ok: true })),
}));

import { app } from "../src/server";

describe("Server hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 413 para payload JSON maior que 10mb e usa handler customizado", async () => {
    const bigString = "a".repeat(11 * 1024 * 1024); // ~11mb

    const res = await request(app).post("/api/ai/suggest").send({ data: bigString });

    expect(res.status).toBe(413);
    expect(res.body).toEqual({ message: "Payload muito grande" });
  });

  it("não lança ValidationError do express-rate-limit quando X-Forwarded-For está presente", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("X-Forwarded-For", "203.0.113.10")
      .send({ email: "test@example.com", password: "secret" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
