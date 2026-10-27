"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/currentUser";
import { Prisma } from "@prisma/client";

export async function getInventoryData(searchParams: { search?: string; page?: string }) {
    const user = await getCurrentUser();
    if (!user) throw new Error("User not Authenticated");

    const searchQuery = (searchParams.search ?? "").trim();
    const userId = user.id;
    const pageSize = 5;
    const page = Math.max(1, Number(searchParams.page ?? 1));

    const where: Prisma.ProductWhereInput = {
        userId,
        ...(searchQuery ? { name: { contains: searchQuery, mode: "insensitive" } } : {}),
    };

    const [totalCount, items] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
        items,
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        searchQuery,
    };
}