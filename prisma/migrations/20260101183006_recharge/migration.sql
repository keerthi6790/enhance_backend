/*
  Warnings:

  - You are about to drop the column `stripeSessionId` on the `Recharge` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[razorpayOrderId]` on the table `Recharge` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[razorpayPaymentId]` on the table `Recharge` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Recharge_stripeSessionId_key";

-- AlterTable
ALTER TABLE "Recharge" DROP COLUMN "stripeSessionId",
ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT,
ADD COLUMN     "razorpaySignature" TEXT;

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pagename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recharge_razorpayOrderId_key" ON "Recharge"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Recharge_razorpayPaymentId_key" ON "Recharge"("razorpayPaymentId");
