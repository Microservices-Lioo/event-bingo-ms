/*
  Warnings:

  - Added the required column `markedCol` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `nums` on the `Card` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "markedCol" JSONB NOT NULL,
DROP COLUMN "nums",
ADD COLUMN     "nums" JSONB NOT NULL;
