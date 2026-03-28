-- AlterTable: add support fields to public_issues
ALTER TABLE "public_issues" ADD COLUMN "support_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "public_issues" ADD COLUMN "is_high_priority" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: public_issue_supports
CREATE TABLE "public_issue_supports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "issue_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_issue_supports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "public_issue_supports_issue_id_idx" ON "public_issue_supports"("issue_id");
CREATE INDEX "public_issue_supports_user_id_idx" ON "public_issue_supports"("user_id");
CREATE UNIQUE INDEX "public_issue_supports_issue_id_user_id_key" ON "public_issue_supports"("issue_id", "user_id");
CREATE INDEX "public_issues_support_count_idx" ON "public_issues"("support_count");

-- AddForeignKey
ALTER TABLE "public_issue_supports" ADD CONSTRAINT "public_issue_supports_issue_id_fkey"
    FOREIGN KEY ("issue_id") REFERENCES "public_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public_issue_supports" ADD CONSTRAINT "public_issue_supports_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
