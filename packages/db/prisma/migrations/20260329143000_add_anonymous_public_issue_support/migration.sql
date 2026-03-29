-- Allow anonymous browser-based support identities for public issues.
ALTER TABLE "public_issue_supports"
    ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "public_issue_supports"
    ADD COLUMN "anonymous_supporter_key" VARCHAR(64);

CREATE INDEX "public_issue_supports_anonymous_supporter_key_idx"
    ON "public_issue_supports"("anonymous_supporter_key");

CREATE UNIQUE INDEX "public_issue_supports_issue_id_anonymous_supporter_key_key"
    ON "public_issue_supports"("issue_id", "anonymous_supporter_key");

ALTER TABLE "public_issue_supports"
    ADD CONSTRAINT "public_issue_supports_identity_check"
    CHECK (
        ("user_id" IS NOT NULL AND "anonymous_supporter_key" IS NULL)
        OR ("user_id" IS NULL AND "anonymous_supporter_key" IS NOT NULL)
    );