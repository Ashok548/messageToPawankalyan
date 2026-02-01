-- CreateTable
CREATE TABLE "visitor_stats" (
    "id" UUID NOT NULL,
    "total_visitors" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "visitor_stats_pkey" PRIMARY KEY ("id")
);
