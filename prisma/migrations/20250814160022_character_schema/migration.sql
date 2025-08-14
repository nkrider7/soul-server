/*
  Warnings:

  - You are about to drop the column `profileId` on the `Character` table. All the data in the column will be lost.
  - Added the required column `title` to the `Character` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_profileId_fkey";

-- DropIndex
DROP INDEX "Character_profileId_key";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "profileId",
ADD COLUMN     "animatedImage" TEXT,
ADD COLUMN     "backstory" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "element" TEXT,
ADD COLUMN     "personality" TEXT,
ADD COLUMN     "statsBoost" JSONB,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "character" TEXT;
