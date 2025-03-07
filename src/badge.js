import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

export const autoBadge = async (groupId) => {
  const groupIdInt = parseInt(groupId, 10);
  const group = await prisma.group.findUnique({
    where: { id: groupIdInt },
    select: { likeCount: true, participants: true, Record: true, badges: true },
  });

  let updatedBadge = [...group.badges];

  const { likeCount, participant, record } = group;
  const participantsCount = group.participants.length;
  const recordsCount = group.Record.length;

  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  if (likeCount >= 100 && !group.badges.includes("LIKE_100")) {
    updatedBadge.push("LIKE_100");
  }
  if (recordsCount >= 100 && !group.badges.includes("RECORD_100")) {
    updatedBadge.push("RECORD_100");
  }
  if (participantsCount >= 10 && !group.badges.includes("PARTICIPATION_10")) {
    updatedBadge.push("PARTICIPATION_10");
  }

  await prisma.group.update({
    where: { id: groupIdInt },
    data: { badges: updatedBadge },
  });
};
