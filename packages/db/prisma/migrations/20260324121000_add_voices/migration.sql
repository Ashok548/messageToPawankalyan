-- CreateEnum
CREATE TYPE "voice_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW', 'RESOLVED');

-- CreateEnum
CREATE TYPE "voice_category" AS ENUM ('ISSUE', 'OPINION', 'SUGGESTION', 'COMPLAINT', 'FEEDBACK', 'OTHER');

-- CreateTable
CREATE TABLE "voices" (
    "id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT NOT NULL,
    "category" "voice_category" NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "constituency" VARCHAR(80),
    "mandal" VARCHAR(80),
    "village" VARCHAR(80),
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "video_url" TEXT,
    "audio_url" TEXT,
    "status" "voice_status" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "rejection_reason" TEXT,
    "submitted_by_id" UUID NOT NULL,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "voices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "voices_status_idx" ON "voices"("status");

-- CreateIndex
CREATE INDEX "voices_category_idx" ON "voices"("category");

-- CreateIndex
CREATE INDEX "voices_district_idx" ON "voices"("district");

-- CreateIndex
CREATE INDEX "voices_created_at_idx" ON "voices"("created_at");

-- CreateIndex
CREATE INDEX "voices_status_created_at_idx" ON "voices"("status", "created_at");

-- CreateIndex
CREATE INDEX "voices_submitted_by_id_created_at_idx" ON "voices"("submitted_by_id", "created_at");

-- AddForeignKey
ALTER TABLE "voices" ADD CONSTRAINT "voices_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voices" ADD CONSTRAINT "voices_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;