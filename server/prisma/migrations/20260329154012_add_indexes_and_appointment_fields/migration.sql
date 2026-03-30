-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "scheduledById" TEXT;

-- CreateIndex
CREATE INDEX "Appointment_ticketId_idx" ON "Appointment"("ticketId");

-- CreateIndex
CREATE INDEX "Appointment_scheduledById_idx" ON "Appointment"("scheduledById");

-- CreateIndex
CREATE INDEX "Attachment_ticketId_idx" ON "Attachment"("ticketId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "Comment_ticketId_idx" ON "Comment"("ticketId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_ticketId_idx" ON "Payment"("ticketId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Ticket_clientId_idx" ON "Ticket"("clientId");

-- CreateIndex
CREATE INDEX "Ticket_advisorId_idx" ON "Ticket"("advisorId");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_type_idx" ON "Ticket"("type");

-- CreateIndex
CREATE INDEX "Ticket_updatedAt_idx" ON "Ticket"("updatedAt" DESC);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_scheduledById_fkey" FOREIGN KEY ("scheduledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
