-- AlterTable
ALTER TABLE "personal_checklist_items" ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "personal_checklist_categories" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personal_checklist_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "personal_checklist_categories_memberId_idx" ON "personal_checklist_categories"("memberId");

-- CreateIndex
CREATE INDEX "personal_checklist_items_categoryId_idx" ON "personal_checklist_items"("categoryId");

-- AddForeignKey
ALTER TABLE "personal_checklist_categories" ADD CONSTRAINT "personal_checklist_categories_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "trip_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_checklist_items" ADD CONSTRAINT "personal_checklist_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "personal_checklist_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
