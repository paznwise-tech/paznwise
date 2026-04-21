/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Test` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Test_email_key" ON "Test"("email");
