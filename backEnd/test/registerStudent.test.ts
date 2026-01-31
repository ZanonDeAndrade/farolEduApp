import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.TRUST_PROXY = "1";

const createUserMock = vi.fn();

vi.mock("../src/modules/bookingModel", () => {
  return {
    createBooking: vi.fn(),
    listBookingsByUser: vi.fn(),
    cancelBookingByActor: vi.fn(),
    legacyMigrateSchedule: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("../src/modules/userModel", () => {
  return {
    createUser: (...args: unknown[]) => createUserMock(...args),
    findUserByEmail: vi.fn(),
    findUserById: vi.fn(),
    getAllUsers: vi.fn(),
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

import { app } from "../src/server";

describe("Registro de estudante", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createUserMock.mockResolvedValue({
      id: 1,
      name: "User",
      email: "user@example.com",
      role: "student",
    });
  });

  it("retorna 400 para payload inválido", async () => {
    const res = await request(app).post("/api/users/register").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("retorna 409 quando e-mail já existe", async () => {
    createUserMock.mockRejectedValueOnce(Object.assign(new Error("duplicate"), { code: "P2002" }));

    const res = await request(app)
      .post("/api/users/register")
      .send({ name: "Test", email: "dup@example.com", password: "123456" });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/e-mail já cadastrado/i);
  });

  it("retorna 413 quando payload excede 10mb", async () => {
    const bigString = "a".repeat(11 * 1024 * 1024); // ~11mb

    const res = await request(app)
      .post("/api/users/register")
      .send({ name: "Big", email: "big@example.com", password: "123456", blob: bigString });

    expect(res.status).toBe(413);
    expect(res.body.message).toMatch(/Payload muito grande/i);
    expect(createUserMock).not.toHaveBeenCalled();
  });
});
