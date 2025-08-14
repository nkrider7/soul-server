/*
  Warnings:

  - You are about to drop the column `authToken` on the `User` table. All the data in the column will be lost.
  - Changed the type of `gender` on the `Character` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authToken",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
