/*
  Warnings:

  - You are about to drop the column `location` on the `atrocities` table. All the data in the column will be lost.
  - You are about to alter the column `leader_name` on the `atrocities` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `position` on the `atrocities` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - Added the required column `constituency` to the `atrocities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `atrocities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mandal` to the `atrocities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `atrocities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `village` to the `atrocities` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "atrocities" DROP COLUMN "location",
ADD COLUMN     "constituency" VARCHAR(50) NOT NULL,
ADD COLUMN     "district" VARCHAR(50) NOT NULL,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mandal" VARCHAR(50) NOT NULL,
ADD COLUMN     "state" VARCHAR(50) NOT NULL,
ADD COLUMN     "village" VARCHAR(50) NOT NULL,
ALTER COLUMN "leader_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "position" SET DATA TYPE VARCHAR(100);

-- CreateIndex
CREATE INDEX "atrocities_is_verified_idx" ON "atrocities"("is_verified");

-- CreateIndex
CREATE INDEX "atrocities_state_idx" ON "atrocities"("state");
