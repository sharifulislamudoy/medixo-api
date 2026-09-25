/*
  Warnings:

  - A unique constraint covering the columns `[deliveryCodeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deliveryCodeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_deliveryCodeId_key" ON "User"("deliveryCodeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_deliveryCodeId_fkey" FOREIGN KEY ("deliveryCodeId") REFERENCES "DeliveryCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
