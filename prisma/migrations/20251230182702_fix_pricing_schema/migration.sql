/*
  Warnings:

  - You are about to drop the column `creditsPerDollar` on the `PricingTier` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[minAmount,currency]` on the table `PricingTier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `multiplier` to the `PricingTier` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PricingTier_minAmount_key";

-- AlterTable
ALTER TABLE "PricingTier" DROP COLUMN "creditsPerDollar",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "multiplier" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PricingTier_minAmount_currency_key" ON "PricingTier"("minAmount", "currency");
