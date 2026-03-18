"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const globalForPrisma = globalThis;
const prismaClient = globalForPrisma.__prismaClient__ ?? new client_1.PrismaClient();
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prismaClient__ = prismaClient;
}
exports.prisma = prismaClient;
