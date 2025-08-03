/*
  Warnings:

  - You are about to drop the column `durationDays` on the `Challenge` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "durationDays",
ADD COLUMN     "duration" INTEGER NOT NULL;
