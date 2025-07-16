/*
  Warnings:

  - The `rank` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('E', 'D', 'C', 'B', 'A', 'S');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DEFAULT 'player',
DROP COLUMN "rank",
ADD COLUMN     "rank" "Rank" NOT NULL DEFAULT 'E',
ALTER COLUMN "avatar" SET DEFAULT '',
ALTER COLUMN "lastActiveDate" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" JSONB,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
