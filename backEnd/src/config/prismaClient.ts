import { PrismaClient } from "@prisma/client";

type GlobalPrisma = typeof globalThis & {
  __prismaClient__?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalPrisma;
const prismaClient = globalForPrisma.__prismaClient__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prismaClient__ = prismaClient;
}

export const prisma = prismaClient;
