/*
  Warnings:

  - You are about to drop the column `tags` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the `TagGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TagGroup" DROP CONSTRAINT "TagGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "TagGroup" DROP CONSTRAINT "TagGroup_tagId_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "tags";

-- DropTable
DROP TABLE "TagGroup";

-- CreateTable
CREATE TABLE "_GroupToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToTag_AB_unique" ON "_GroupToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToTag_B_index" ON "_GroupToTag"("B");

-- AddForeignKey
ALTER TABLE "_GroupToTag" ADD CONSTRAINT "_GroupToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToTag" ADD CONSTRAINT "_GroupToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
