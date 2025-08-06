/*
  Warnings:

  - You are about to drop the column `completed` on the `ChallengeQuest` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `ChallengeQuest` table. All the data in the column will be lost.
  - You are about to drop the column `targetCount` on the `ChallengeQuest` table. All the data in the column will be lost.
  - The `repeat` column on the `ChallengeQuest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Quest` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "REPEAT" AS ENUM ('DAILY', 'ALTERNATE_DAYS', 'WEEKDAYS', 'WEEKENDS', 'WEEKLY');

-- DropForeignKey
ALTER TABLE "Quest" DROP CONSTRAINT "Quest_profileId_fkey";

-- AlterTable
ALTER TABLE "ChallengeQuest" DROP COLUMN "completed",
DROP COLUMN "day",
DROP COLUMN "targetCount",
ADD COLUMN     "currentDay" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'in-progress',
ADD COLUMN     "totalDays" INTEGER,
DROP COLUMN "repeat",
ADD COLUMN     "repeat" "REPEAT" NOT NULL DEFAULT 'DAILY';

-- DropTable
DROP TABLE "Quest";
