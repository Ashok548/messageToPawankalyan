-- AlterTable
ALTER TABLE "leaders" ADD COLUMN     "gallery" TEXT[],
ADD COLUMN     "nominatedPost" TEXT,
ADD COLUMN     "otherPlatforms" JSONB,
ADD COLUMN     "partyPosition" TEXT,
ADD COLUMN     "partyYears" INTEGER,
ADD COLUMN     "primaryPlatform" TEXT,
ADD COLUMN     "primaryProfileUrl" TEXT;
