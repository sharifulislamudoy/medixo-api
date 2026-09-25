/*
  Warnings:

  - Added the required column `updatedAt` to the `Advertisement` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `Advertisement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Advertisement" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;

-- DropEnum
DROP TYPE "BannerCategory";
