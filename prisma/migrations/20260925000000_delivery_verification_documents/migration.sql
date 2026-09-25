CREATE TABLE "VerificationDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VerificationDocument_userId_type_key" ON "VerificationDocument"("userId", "type");
CREATE INDEX "VerificationDocument_userId_idx" ON "VerificationDocument"("userId");
ALTER TABLE "VerificationDocument" ADD CONSTRAINT "VerificationDocument_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
