/*
  Warnings:

  - You are about to drop the column `lowStock` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "lowStock",
ADD COLUMN     "lowStockAt" INTEGER;
