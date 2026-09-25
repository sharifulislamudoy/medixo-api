-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availability" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;
