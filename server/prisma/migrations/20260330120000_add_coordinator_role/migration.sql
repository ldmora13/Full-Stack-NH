-- Add COORDINATOR to Role enum (appended; order in Prisma schema: CLIENT, ADMIN, ADVISOR, COORDINATOR)
ALTER TYPE "Role" ADD VALUE 'COORDINATOR';
