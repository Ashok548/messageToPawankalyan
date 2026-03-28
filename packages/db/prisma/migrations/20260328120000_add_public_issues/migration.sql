-- CreateEnum
CREATE TYPE "public_issue_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public_issue_category" AS ENUM (
    'CORRUPTION',
    'LAND_MAFIA',
    'INDUSTRIAL_POLLUTION',
    'POLICY_CONCERN',
    'PUBLIC_SERVICES',
    'INFRASTRUCTURE',
    'OTHER'
);

-- CreateTable
CREATE TABLE "public_issues" (
    "id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public_issue_category" NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "constituency" VARCHAR(80),
    "mandal" VARCHAR(80),
    "village" VARCHAR(80),
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "public_issue_status" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "rejection_reason" TEXT,
    "submitted_by_id" UUID,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "public_issues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "public_issues_status_idx" ON "public_issues"("status");

-- CreateIndex
CREATE INDEX "public_issues_category_idx" ON "public_issues"("category");

-- CreateIndex
CREATE INDEX "public_issues_district_idx" ON "public_issues"("district");

-- CreateIndex
CREATE INDEX "public_issues_created_at_idx" ON "public_issues"("created_at");

-- CreateIndex
CREATE INDEX "public_issues_status_created_at_idx" ON "public_issues"("status", "created_at");

-- CreateIndex
CREATE INDEX "public_issues_submitted_by_id_created_at_idx" ON "public_issues"("submitted_by_id", "created_at");

-- AddForeignKey
ALTER TABLE "public_issues" ADD CONSTRAINT "public_issues_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_issues" ADD CONSTRAINT "public_issues_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;