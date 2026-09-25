/*
  Warnings:

  - You are about to drop the column `availableStock` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `reservedStock` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the `AwardedOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bid` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcurementItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcurementRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcurementRequestSupplier` table. If the table is not empty, all the data it contains will be lost.

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
ALTER TABLE "ProcurementItem" DROP CONSTRAINT "ProcurementItem_procurementId_fkey";

-- DropForeignKey
ALTER TABLE "ProcurementItem" DROP CONSTRAINT "ProcurementItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProcurementRequestSupplier" DROP CONSTRAINT "ProcurementRequestSupplier_requestId_fkey";

-- DropForeignKey
ALTER TABLE "ProcurementRequestSupplier" DROP CONSTRAINT "ProcurementRequestSupplier_supplierId_fkey";

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "availableStock",
DROP COLUMN "reservedStock",
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "AwardedOrder";

-- DropTable
DROP TABLE "Bid";

-- DropTable
DROP TABLE "ProcurementItem";

-- DropTable
DROP TABLE "ProcurementRequest";

-- DropTable
DROP TABLE "ProcurementRequestSupplier";
