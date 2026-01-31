/*
  Warnings:

  - You are about to drop the column `leader_id` on the `disciplinary_cases` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "disciplinary_cases" DROP CONSTRAINT "disciplinary_cases_leader_id_fkey";

-- DropIndex
DROP INDEX "disciplinary_cases_leader_id_idx";

-- AlterTable
ALTER TABLE "disciplinary_cases" DROP COLUMN "leader_id",
ADD COLUMN     "district" VARCHAR(50);
