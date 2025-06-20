-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "end_time" TIMESTAMP(3),
ADD COLUMN     "time" TIMESTAMP(3),
ALTER COLUMN "start_time" DROP NOT NULL;
