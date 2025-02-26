-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('PARTICIPATION_10', 'RECORD_100', 'LIKE_100');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('RUN', 'BIKE', 'SWIM');

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "photoUrl" TEXT,
    "goalRep" INTEGER NOT NULL,
    "discordWebhookUrl" TEXT,
    "discordInviteUrl" TEXT,
    "likeCount" INTEGER NOT NULL,
    "tags" TEXT[],
    "ownerNickname" TEXT NOT NULL,
    "ownerPassword" TEXT NOT NULL,
    "badges" "BadgeType"[],
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Record" (
    "id" SERIAL NOT NULL,
    "exerciseType" "ExerciseType" NOT NULL,
    "description" TEXT,
    "time" INTEGER NOT NULL,
    "distance" INTEGER NOT NULL,
    "photos" TEXT[],
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Record_authorId_key" ON "Record"("authorId");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Record" ADD CONSTRAINT "Record_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
