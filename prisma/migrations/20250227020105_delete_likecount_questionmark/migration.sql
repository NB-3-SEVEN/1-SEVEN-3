/*
  Warnings:

  - Made the column `likeCount` on table `Group` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "likeCount" SET NOT NULL;
