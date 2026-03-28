-- Add VerificationStatus enum type
CREATE TYPE "verification_status" AS ENUM ('UNVERIFIED', 'BASIC_REVIEWED', 'STRONG_EVIDENCE');

-- Add evidence fields to public_issues table
ALTER TABLE "public_issues" ADD COLUMN "media_urls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "public_issues" ADD COLUMN "verification_status" "verification_status" NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE "public_issues" ADD COLUMN "evidence_note" TEXT;
