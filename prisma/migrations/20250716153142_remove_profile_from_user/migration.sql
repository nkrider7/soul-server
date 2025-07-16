/*
  Warnings:

  - You are about to drop the column `userId` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Currency` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Habit` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Quest` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `maxStreak` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stats` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `streak` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileId]` on the table `Character` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profileId` to the `Character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `lastActiveDate` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- DropForeignKey
ALTER TABLE "Character" DROP CONSTRAINT "Character_userId_fkey";

-- DropForeignKey
ALTER TABLE "Currency" DROP CONSTRAINT "Currency_userId_fkey";

-- DropForeignKey
ALTER TABLE "Habit" DROP CONSTRAINT "Habit_userId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_userId_fkey";

-- DropForeignKey
ALTER TABLE "Quest" DROP CONSTRAINT "Quest_userId_fkey";

-- DropIndex
DROP INDEX "Character_userId_key";

-- DropIndex
DROP INDEX "Currency_userId_key";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Currency" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Habit" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT;

-- AlterTable
ALTER TABLE "Posts" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Quest" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatar",
DROP COLUMN "level",
DROP COLUMN "maxStreak",
DROP COLUMN "rank",
DROP COLUMN "stats",
DROP COLUMN "streak",
DROP COLUMN "username",
DROP COLUMN "xp",
ADD COLUMN     "authToken" TEXT NOT NULL,
ADD COLUMN     "posts" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "lastActiveDate" SET NOT NULL;

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL DEFAULT 'player',
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "rank" "Rank" NOT NULL DEFAULT 'E',
    "avatar" TEXT DEFAULT '',
    "stats" JSONB DEFAULT '{"strength": 1, "intelligence": 1, "karma": 1, "stamina": 1}',
    "streak" INTEGER NOT NULL DEFAULT 0,
    "maxStreak" INTEGER NOT NULL DEFAULT 0,
    "currencyId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Character_profileId_key" ON "Character"("profileId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
