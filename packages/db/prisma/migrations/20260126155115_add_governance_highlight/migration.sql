-- CreateEnum
CREATE TYPE "highlight_category" AS ENUM ('INNOVATIVE_INITIATIVE', 'PENDING_ISSUE_ADDRESSED');

-- CreateEnum
CREATE TYPE "highlight_status" AS ENUM ('ADDRESSED', 'IN_PROGRESS', 'FOLLOW_UP_ONGOING');

-- CreateEnum
CREATE TYPE "source_type" AS ENUM ('GOVERNMENT_PORTAL', 'PRESS_RELEASE', 'PUBLIC_RECORD', 'NEWS_REPORT', 'FIELD_VERIFICATION');

-- CreateTable
CREATE TABLE "governance_highlights" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "category" "highlight_category" NOT NULL,
    "description" TEXT NOT NULL,
    "area" VARCHAR(100) NOT NULL,
    "department" VARCHAR(100),
    "state" VARCHAR(50) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "constituency" VARCHAR(50),
    "mandal" VARCHAR(50),
    "village" VARCHAR(50),
    "yearStarted" INTEGER,
    "yearCompleted" INTEGER NOT NULL,
    "period" VARCHAR(50),
    "status" "highlight_status" NOT NULL DEFAULT 'ADDRESSED',
    "sourceType" "source_type" NOT NULL,
    "sourceUrl" VARCHAR(500) NOT NULL,
    "sourceTitle" VARCHAR(200),
    "issueContext" TEXT,
    "image" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "admin_notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "governance_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "governance_highlights_category_idx" ON "governance_highlights"("category");

-- CreateIndex
CREATE INDEX "governance_highlights_is_verified_idx" ON "governance_highlights"("is_verified");

-- CreateIndex
CREATE INDEX "governance_highlights_is_visible_idx" ON "governance_highlights"("is_visible");

-- CreateIndex
CREATE INDEX "governance_highlights_yearCompleted_idx" ON "governance_highlights"("yearCompleted");

-- CreateIndex
CREATE INDEX "governance_highlights_state_idx" ON "governance_highlights"("state");

-- CreateIndex
CREATE INDEX "governance_highlights_district_idx" ON "governance_highlights"("district");
