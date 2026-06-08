-- CreateTable
CREATE TABLE "personal_checklist_items" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personal_checklist_items_memberId_idx" ON "personal_checklist_items"("memberId");

-- AddForeignKey
ALTER TABLE "personal_checklist_items" ADD CONSTRAINT "personal_checklist_items_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "trip_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
