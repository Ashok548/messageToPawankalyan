-- CreateEnum
CREATE TYPE "issue_category" AS ENUM ('MISCONDUCT', 'POLICY_VIOLATION', 'ETHICAL_BREACH', 'INSUBORDINATION', 'FINANCIAL_IRREGULARITY', 'PUBLIC_STATEMENT_VIOLATION', 'OTHER');

-- CreateEnum
CREATE TYPE "issue_source" AS ENUM ('INTERNAL_COMPLAINT', 'EXTERNAL_COMPLAINT', 'MEDIA_REPORT', 'PARTY_OBSERVATION', 'LEGAL_NOTICE');

-- CreateEnum
CREATE TYPE "case_status" AS ENUM ('UNDER_REVIEW', 'CLARIFICATION_REQUIRED', 'REVIEW_COMPLETED', 'ACTION_TAKEN', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "action_outcome" AS ENUM ('NO_ACTION', 'WARNING', 'TEMPORARY_SUSPENSION', 'PERMANENT_SUSPENSION', 'POSITION_REVOKED', 'MEMBERSHIP_REVOKED');

-- CreateEnum
CREATE TYPE "case_visibility" AS ENUM ('INTERNAL_ONLY', 'PUBLIC', 'RESTRICTED');

-- CreateTable
CREATE TABLE "disciplinary_cases" (
    "id" UUID NOT NULL,
    "case_number" VARCHAR(50) NOT NULL,
    "leader_id" UUID NOT NULL,
    "leader_name" VARCHAR(100) NOT NULL,
    "position" VARCHAR(100) NOT NULL,
    "constituency" VARCHAR(50),
    "issue_category" "issue_category" NOT NULL,
    "issue_description" TEXT NOT NULL,
    "issue_source" "issue_source" NOT NULL,
    "initiation_date" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "review_start_date" TIMESTAMPTZ(3),
    "decision_date" TIMESTAMPTZ(3),
    "effective_from" TIMESTAMPTZ(3),
    "effective_to" TIMESTAMPTZ(3),
    "initiated_by" UUID NOT NULL,
    "review_authority" UUID,
    "decision_authority" UUID,
    "status" "case_status" NOT NULL DEFAULT 'UNDER_REVIEW',
    "action_outcome" "action_outcome",
    "visibility" "case_visibility" NOT NULL DEFAULT 'INTERNAL_ONLY',
    "internal_notes" TEXT,
    "evidence_urls" TEXT[],
    "image_urls" TEXT[],
    "decision_rationale" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "disciplinary_cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "disciplinary_cases_case_number_key" ON "disciplinary_cases"("case_number");

-- CreateIndex
CREATE INDEX "disciplinary_cases_leader_id_idx" ON "disciplinary_cases"("leader_id");

-- CreateIndex
CREATE INDEX "disciplinary_cases_status_idx" ON "disciplinary_cases"("status");

-- CreateIndex
CREATE INDEX "disciplinary_cases_visibility_idx" ON "disciplinary_cases"("visibility");

-- CreateIndex
CREATE INDEX "disciplinary_cases_initiation_date_idx" ON "disciplinary_cases"("initiation_date");

-- CreateIndex
CREATE INDEX "disciplinary_cases_case_number_idx" ON "disciplinary_cases"("case_number");

-- AddForeignKey
ALTER TABLE "disciplinary_cases" ADD CONSTRAINT "disciplinary_cases_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "leaders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplinary_cases" ADD CONSTRAINT "disciplinary_cases_initiated_by_fkey" FOREIGN KEY ("initiated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplinary_cases" ADD CONSTRAINT "disciplinary_cases_review_authority_fkey" FOREIGN KEY ("review_authority") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disciplinary_cases" ADD CONSTRAINT "disciplinary_cases_decision_authority_fkey" FOREIGN KEY ("decision_authority") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
