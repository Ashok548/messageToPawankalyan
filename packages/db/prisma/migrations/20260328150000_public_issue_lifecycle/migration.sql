-- Add new lifecycle status values to the public_issue_status enum
ALTER TYPE "public_issue_status" ADD VALUE 'TAKEN_UP';
ALTER TYPE "public_issue_status" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "public_issue_status" ADD VALUE 'RESOLVED';

-- Add lifecycle timestamp columns to public_issues table
ALTER TABLE "public_issues" ADD COLUMN "approved_at" TIMESTAMPTZ(3);
ALTER TABLE "public_issues" ADD COLUMN "taken_up_at" TIMESTAMPTZ(3);
ALTER TABLE "public_issues" ADD COLUMN "in_progress_at" TIMESTAMPTZ(3);
ALTER TABLE "public_issues" ADD COLUMN "resolved_at" TIMESTAMPTZ(3);
