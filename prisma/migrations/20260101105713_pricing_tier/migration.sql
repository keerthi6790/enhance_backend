/*
  Warnings:

  - A unique constraint covering the columns `[stripeSessionId]` on the table `Recharge` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `credits` to the `Recharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Recharge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RechargeStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Recharge" ADD COLUMN     "credits" INTEGER NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "status" "RechargeStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "stripeSessionId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Recharge_stripeSessionId_key" ON "Recharge"("stripeSessionId");
