/*
  Warnings:

  - You are about to drop the column `areaTrCode` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryCode` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryCodeId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "areaTrCode",
DROP COLUMN "deliveryCode";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryCodeId_fkey" FOREIGN KEY ("deliveryCodeId") REFERENCES "DeliveryCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
