/*
  Warnings:

  - Added the required column `groupId` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "groupId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
