import { PrismaClient } from "@prisma/client";

// Solución al problema de RAM: Instancia global de Prisma
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
