-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('WORK_VISA', 'STUDENT_VISA', 'RESIDENCY', 'CITIZENSHIP', 'OTHER');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "type" "TicketType" NOT NULL DEFAULT 'OTHER';
