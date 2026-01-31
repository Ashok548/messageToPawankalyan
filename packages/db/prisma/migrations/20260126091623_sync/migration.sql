/*
  Warnings:

  - A unique constraint covering the columns `[mobile]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mobile` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "atrocity_type" AS ENUM ('TO_JSP_LEADER', 'TO_JANASENA_PARTY');

-- CreateEnum
CREATE TYPE "leader_status" AS ENUM ('PENDING', 'APPROVED', 'HIDDEN', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "submitted_by" AS ENUM ('SELF', 'SUPPORTER', 'ANONYMOUS');

-- AlterTable
ALTER TABLE "atrocities" ADD COLUMN     "atrocity_by" VARCHAR(100),
ADD COLUMN     "atrocity_type" "atrocity_type" NOT NULL DEFAULT 'TO_JSP_LEADER',
ADD COLUMN     "subject" VARCHAR(200),
ALTER COLUMN "position" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mobile" TEXT NOT NULL,
ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otp_expires_at" TIMESTAMP(3),
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER',
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "leaders" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "mandal" VARCHAR(50),
    "reason" TEXT NOT NULL,
    "serviceAreas" TEXT[],
    "values" TEXT[],
    "photo" TEXT,
    "submitted_by" "submitted_by" NOT NULL,
    "status" "leader_status" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "leaders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leaders_status_idx" ON "leaders"("status");

-- CreateIndex
CREATE INDEX "leaders_district_idx" ON "leaders"("district");

-- CreateIndex
CREATE INDEX "leaders_created_at_idx" ON "leaders"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- CreateIndex
CREATE INDEX "users_mobile_idx" ON "users"("mobile");
