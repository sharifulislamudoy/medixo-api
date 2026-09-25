/*
  Warnings:

  - You are about to drop the column `reserved` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the `AwardedOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bid` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcurementItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcurementOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcurementRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AwardedOrder" DROP CONSTRAINT "AwardedOrder_procurementItemId_fkey";

-- DropForeignKey
ALTER TABLE "AwardedOrder" DROP CONSTRAINT "AwardedOrder_productId_fkey";

-- DropForeignKey
ALTER TABLE "AwardedOrder" DROP CONSTRAINT "AwardedOrder_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_procurementItemId_fkey";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "ProcurementItem" DROP CONSTRAINT "ProcurementItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProcurementItem" DROP CONSTRAINT "ProcurementItem_requestId_fkey";

-- DropForeignKey
ALTER TABLE "ProcurementOrder" DROP CONSTRAINT "ProcurementOrder_orderId_fkey";

-- DropForeignKey
ALTER TABLE "ProcurementOrder" DROP CONSTRAINT "ProcurementOrder_procurementId_fkey";

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "reserved";

-- DropTable
DROP TABLE "AwardedOrder";

-- DropTable
DROP TABLE "Bid";

-- DropTable
DROP TABLE "ProcurementItem";

-- DropTable
DROP TABLE "ProcurementOrder";

-- DropTable
DROP TABLE "ProcurementRequest";

-- DropEnum
DROP TYPE "BidStatus";

-- DropEnum
DROP TYPE "ProcurementItemStatus";

-- DropEnum
DROP TYPE "ProcurementStatus";
