-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "affects_money" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "affects_rules" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "affects_streaks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "human_summary" TEXT,
ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'INFO';

-- CreateTable
CREATE TABLE "audit_disputes" (
    "id" TEXT NOT NULL,
    "audit_log_id" TEXT NOT NULL,
    "raised_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reason" TEXT NOT NULL,
    "response" TEXT,
    "resolution" TEXT,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_disputes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_disputes_audit_log_id_idx" ON "audit_disputes"("audit_log_id");

-- CreateIndex
CREATE INDEX "audit_disputes_raised_by_idx" ON "audit_disputes"("raised_by");

-- CreateIndex
CREATE INDEX "audit_disputes_status_idx" ON "audit_disputes"("status");

-- CreateIndex
CREATE INDEX "audit_logs_severity_idx" ON "audit_logs"("severity");

-- AddForeignKey
ALTER TABLE "audit_disputes" ADD CONSTRAINT "audit_disputes_audit_log_id_fkey" FOREIGN KEY ("audit_log_id") REFERENCES "audit_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_disputes" ADD CONSTRAINT "audit_disputes_raised_by_fkey" FOREIGN KEY ("raised_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_disputes" ADD CONSTRAINT "audit_disputes_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
