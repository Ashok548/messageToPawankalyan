-- Add IssuePriority enum type
CREATE TYPE "issue_priority" AS ENUM ('NORMAL', 'NOTABLE', 'HIGH');

-- Add priority and isHighlighted fields to public_issues table
ALTER TABLE "public_issues" ADD COLUMN "priority" "issue_priority" NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "public_issues" ADD COLUMN "is_highlighted" BOOLEAN NOT NULL DEFAULT false;
