/*
  Warnings:

  - The primary key for the `SalesSummary` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `salesSumary` on the `SalesSummary` table. All the data in the column will be lost.
  - Added the required column `salesSummary` to the `SalesSummary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalesSummary" DROP CONSTRAINT "SalesSummary_pkey",
DROP COLUMN "salesSumary",
ADD COLUMN     "salesSummary" TEXT NOT NULL,
ADD CONSTRAINT "SalesSummary_pkey" PRIMARY KEY ("salesSummary");
