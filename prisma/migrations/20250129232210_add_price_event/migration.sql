/*
  Warnings:

  - You are about to drop the column `price` on the `Card` table. All the data in the column will be lost.
  - Added the required column `price` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
