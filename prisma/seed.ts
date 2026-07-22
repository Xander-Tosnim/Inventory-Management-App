import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const demoUserId = 'a73bf113-d995-46b9-b131-c9dfb0cbf187';
    console.log("Seeding started..."); // Friendly reminder

    // Create sample products
    await prisma.product.createMany({
        data: Array.from({ length: 25 }).map((_, i) => ({
            userId      : demoUserId,
            name        : `Product ${i + 1}`,
            price       : (Math.random() * 90 + 10).toFixed(2),
            quantity    : Math.floor(Math.random() * 20),
            lowStockAt  : 5,
            createdAt   : new Date(Date.now() - 1000 * 60 * 60 * 24 * (i * 5)),
        })),
    });

    console.log("Seeding finished successfully!");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});