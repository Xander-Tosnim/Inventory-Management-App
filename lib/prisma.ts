import { PrismaClient } from "@prisma/client";

const globalFroPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalFroPrisma.prisma ?? new PrismaClient();

if(process.env.NODE_ENV !== "production") globalFroPrisma.prisma = prisma;