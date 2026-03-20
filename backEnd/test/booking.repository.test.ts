import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryFilter = {
  field: string;
  op: "==" | "<" | "<=" | ">" | ">=";
  value: unknown;
};

type QueryRef = {
  kind: "query";
  collectionName: string;
  filters: QueryFilter[];
  where(field: string, op: QueryFilter["op"], value: unknown): QueryRef;
  orderBy(field: string, direction?: "asc" | "desc"): QueryRef;
  get(): Promise<{ docs: Array<{ id: string; data(): any; ref: any }>; empty: boolean }>;
};

type DocRef = {
  kind: "doc";
  collectionName: string;
  id: string;
  get(): Promise<{ id: string; exists: boolean; data(): any; ref: DocRef }>;
};

const state = vi.hoisted(() => ({
  collections: new Map<string, Map<string, any>>(),
  nextId: vi.fn(),
  txGet: vi.fn(),
  txSet: vi.fn(),
  runTransaction: vi.fn(),
}));

const ensureCollection = (name: string) => {
  if (!state.collections.has(name)) {
    state.collections.set(name, new Map());
  }
  return state.collections.get(name)!;
};

const matchesFilter = (candidate: any, filter: QueryFilter) => {
  const current = candidate[filter.field];
  switch (filter.op) {
    case "==":
      return current === filter.value;
    case "<":
      return current < filter.value;
    case "<=":
      return current <= filter.value;
    case ">":
      return current > filter.value;
    case ">=":
      return current >= filter.value;
    default:
      return false;
  }
};

const makeDocRef = (collectionName: string, id: string): DocRef => ({
  kind: "doc",
  collectionName,
  id,
  async get() {
    const data = ensureCollection(collectionName).get(id);
    return {
      id,
      exists: data !== undefined,
      data: () => data,
      ref: makeDocRef(collectionName, id),
    };
  },
});

const queryDocs = (collectionName: string, filters: QueryFilter[]) => {
  return Array.from(ensureCollection(collectionName).entries())
    .map(([id, data]) => ({ id, data }))
    .filter(entry => filters.every(filter => matchesFilter(entry.data, filter)))
    .sort((left, right) => {
      const leftStart = left.data.startAtUtc ?? left.data.createdAt ?? new Date(0);
      const rightStart = right.data.startAtUtc ?? right.data.createdAt ?? new Date(0);
      return leftStart.getTime() - rightStart.getTime();
    })
    .map(entry => ({
      id: entry.id,
      data: () => entry.data,
      ref: makeDocRef(collectionName, entry.id),
    }));
};

const makeQueryRef = (collectionName: string, filters: QueryFilter[] = []): QueryRef => ({
  kind: "query",
  collectionName,
  filters,
  where(field: string, op: QueryFilter["op"], value: unknown) {
    return makeQueryRef(collectionName, [...filters, { field, op, value }]);
  },
  orderBy() {
    return this;
  },
  async get() {
    const docs = queryDocs(collectionName, filters);
    return { docs, empty: docs.length === 0 };
  },
});

const makeCollectionRef = (collectionName: string) => ({
  doc: (id?: string) => makeDocRef(collectionName, String(id)),
  where: (field: string, op: QueryFilter["op"], value: unknown) =>
    makeQueryRef(collectionName, [{ field, op, value }]),
  async get() {
    const docs = queryDocs(collectionName, []);
    return { docs, empty: docs.length === 0 };
  },
});

const resolveTarget = async (target: DocRef | QueryRef) => {
  if (target.kind === "doc") {
    return target.get();
  }

  return target.get();
};

vi.mock("../src/infra/firebase", () => ({
  firestore: {
    runTransaction: state.runTransaction,
    batch: vi.fn(() => ({
      set: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));

vi.mock("../src/repositories/firestore/helpers", () => ({
  fromTimestamp: (value: unknown) => (value instanceof Date ? value : null),
  getCollection: (path: string) => makeCollectionRef(path),
  getNextId: state.nextId,
}));

import { FirestoreBookingRepository } from "../src/repositories/firestore/bookingRepository";

const seedDoc = (collectionName: string, id: string, data: any) => {
  ensureCollection(collectionName).set(id, data);
};

const buildExistingBooking = (overrides?: Partial<Record<string, any>>) => {
  const startAtUtc = new Date("2026-03-23T17:00:00.000Z");
  const endAtUtc = new Date("2026-03-23T18:00:00.000Z");
  return {
    id: 77,
    offerId: 11,
    studentId: 9,
    teacherId: 7,
    date: "2026-03-23",
    startTime: "14:00",
    endTime: "15:00",
    startAtUtc,
    endAtUtc,
    status: "PENDING",
    notes: null,
    respondedAt: null,
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
    updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    ...overrides,
  };
};

describe("FirestoreBookingRepository", () => {
  beforeEach(() => {
    state.collections.clear();
    state.nextId.mockResolvedValue(101);
    state.txGet.mockImplementation(resolveTarget);
    state.txSet.mockImplementation((ref: DocRef, payload: any) => {
      ensureCollection(ref.collectionName).set(ref.id, payload);
    });
    state.runTransaction.mockImplementation(async (callback: (tx: any) => Promise<unknown>) =>
      callback({
        get: state.txGet,
        set: state.txSet,
      }),
    );

    seedDoc("teacherClasses", "11", {
      id: 11,
      teacherId: 7,
      active: true,
      durationMinutes: 60,
      title: "Violao",
      subject: "Musica",
      modality: "ONLINE",
    });
    seedDoc("users", "7", { id: 7, name: "Prof Ana", email: "ana@example.com" });
    seedDoc("users", "15", { id: 15, name: "Aluno Leo", email: "leo@example.com" });
    seedDoc("teacher_availability", "availability-1", {
      teacherId: 7,
      dayOfWeek: 1,
      startTime: "14:00",
      endTime: "18:00",
      slotDuration: 60,
    });
  });

  it("cria booking dentro da disponibilidade usando transaction", async () => {
    const repository = new FirestoreBookingRepository();

    const booking = await repository.createBooking({
      studentId: 15,
      offerId: 11,
      date: "2026-03-23",
      startTime: "14:00",
    });

    expect(state.runTransaction).toHaveBeenCalledTimes(1);
    expect(booking.status).toBe("PENDING");
    expect(booking.date).toBe("2026-03-23");
    expect(booking.startTime).toBe("14:00");
    expect(booking.endTime).toBe("15:00");
    expect(ensureCollection("schedules").get("101")).toMatchObject({
      teacherId: 7,
      studentId: 15,
      startTime: "14:00",
      endTime: "15:00",
    });
  });

  it("bloqueia booking fora da disponibilidade", async () => {
    const repository = new FirestoreBookingRepository();

    await expect(
      repository.createBooking({
        studentId: 15,
        offerId: 11,
        date: "2026-03-23",
        startTime: "19:00",
      }),
    ).rejects.toMatchObject({ code: "SLOT_OUTSIDE_AVAILABILITY" });
  });

  it("bloqueia conflito global por teacherId", async () => {
    seedDoc("schedules", "77", buildExistingBooking());
    const repository = new FirestoreBookingRepository();

    await expect(
      repository.createBooking({
        studentId: 15,
        offerId: 11,
        date: "2026-03-23",
        startTime: "14:00",
      }),
    ).rejects.toMatchObject({ code: "BOOKING_CONFLICT" });
  });

  it("nao deixa booking cancelado ou rejeitado bloquear agenda", async () => {
    seedDoc("schedules", "77", buildExistingBooking({ status: "CANCELLED" }));
    seedDoc("schedules", "78", buildExistingBooking({ status: "REJECTED", studentId: 99 }));
    const repository = new FirestoreBookingRepository();

    const booking = await repository.createBooking({
      studentId: 15,
      offerId: 11,
      date: "2026-03-23",
      startTime: "14:00",
    });

    expect(booking.id).toBe(101);
    expect(state.txGet).toHaveBeenCalled();
  });
});
