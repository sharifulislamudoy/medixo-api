ALTER TABLE "VerificationDocument" ALTER COLUMN "data" DROP NOT NULL;
ALTER TABLE "VerificationDocument" ADD COLUMN "publicId" TEXT;
ALTER TABLE "VerificationDocument" ADD COLUMN "resourceType" TEXT;
ALTER TABLE "VerificationDocument" ADD COLUMN "format" TEXT;
