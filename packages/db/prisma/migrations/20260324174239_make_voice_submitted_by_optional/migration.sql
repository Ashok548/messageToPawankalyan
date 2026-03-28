-- DropForeignKey
ALTER TABLE "voices" DROP CONSTRAINT "voices_submitted_by_id_fkey";

-- AlterTable
ALTER TABLE "voices" ALTER COLUMN "submitted_by_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "voices" ADD CONSTRAINT "voices_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
