/*
  Warnings:

  - Added the required column `message` to the `Test` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "number" TEXT NOT NULL;
