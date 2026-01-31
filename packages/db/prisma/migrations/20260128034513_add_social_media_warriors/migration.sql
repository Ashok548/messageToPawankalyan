-- CreateEnum
CREATE TYPE "warrior_status" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN', 'ARCHIVED');

-- CreateTable
CREATE TABLE "social_media_warriors" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "mandal" VARCHAR(50),
    "reason" TEXT NOT NULL,
    "digitalContributions" TEXT[],
    "engagementStyle" TEXT[],
    "photo" TEXT,
    "gallery" TEXT[],
    "partyYears" INTEGER,
    "partyPosition" TEXT,
    "nominatedPost" TEXT,
    "primaryPlatform" TEXT,
    "primaryProfileUrl" TEXT,
    "otherPlatforms" JSONB,
    "submitted_by" "submitted_by" NOT NULL,
    "status" "warrior_status" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "social_media_warriors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "social_media_warriors_status_idx" ON "social_media_warriors"("status");

-- CreateIndex
CREATE INDEX "social_media_warriors_district_idx" ON "social_media_warriors"("district");

-- CreateIndex
CREATE INDEX "social_media_warriors_created_at_idx" ON "social_media_warriors"("created_at");
