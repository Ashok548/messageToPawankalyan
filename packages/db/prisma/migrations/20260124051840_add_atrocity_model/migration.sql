-- CreateTable
CREATE TABLE "atrocities" (
    "id" UUID NOT NULL,
    "leader_name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "atrocities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "atrocities_created_at_idx" ON "atrocities"("created_at");
