-- CreateEnum
CREATE TYPE "analysis_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "analyses" (
    "id" UUID NOT NULL,
    "issue_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "reviewed_by_id" UUID,
    "problem_understanding" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "observations" TEXT NOT NULL,
    "considerations" TEXT,
    "status" "analysis_status" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "rejection_reason" TEXT,
    "reviewed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analyses_issue_id_idx" ON "analyses"("issue_id");

-- CreateIndex
CREATE INDEX "analyses_status_idx" ON "analyses"("status");

-- CreateIndex
CREATE INDEX "analyses_issue_id_status_idx" ON "analyses"("issue_id", "status");

-- CreateIndex
CREATE INDEX "analyses_created_by_id_idx" ON "analyses"("created_by_id");

-- CreateIndex
CREATE INDEX "analyses_created_at_idx" ON "analyses"("created_at");

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "public_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
