import express from "express";

import { postGroup } from "../api/group.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).send("Groups route is working!");
});

router.route("/").post(postGroup);

router
  .post("/:groupId/likes", async (req, res) => {
    const { groupId } = req.params;
    const group = await prisma.group.findUnique({
      where: {
        id: parseInt(groupId),
      },
    });
    const updateGroup = await prisma.group.update({
      where: {
        id: parseInt(groupId),
      },
      data: {
        likeCount: group.likeCount + 1,
      },
    });
    res.status(200).json(updateGroup);
  })
  .delete("/:groupId/likes", async (req, res) => {
    const { groupId } = req.params;
    const group = await prisma.group.findUnique({
      where: {
        id: parseInt(groupId),
      },
    });
    const updateGroup = await prisma.group.update({
      where: {
        id: parseInt(groupId),
      },
      data: {
        likeCount: group.likeCount - 1,
      },
    });
    res.status(200).json(updateGroup);
  })
  .post("/:id/participants", async (req, res) => {
    const { id: groupId } = req.params;
    const { nickname, password } = req.body;

    const existingParticipant = await prisma.participant.findFirst({
      where: { nickname, groupId: parseInt(groupId, 10) },
    });

    if (existingParticipant) {
      return res.status(400).json({ message: "nickname is required" });
    }

    const participant = await prisma.participant.create({
      data: {
        nickname,
        password,
        group: { connect: { id: parseInt(groupId, 10) } },
      },
    });

    res.json({ message: participant });
  })
  .delete("/:id/participants", async (req, res) => {
    const { id } = req.params;
    const { nickname, password } = req.body;

    const participant = await prisma.participant.findUniqueOrThrow({
      where: { id: parseInt(id, 10) },
    });

    if (participant.nickname !== nickname) {
      return res.status(400).json({ error: "nickname is required" });
    }

    if (participant.password !== password) {
      return res.status(401).json({ error: "Wrong password" });
    }

    const deletedParticipant = await prisma.participant.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: deletedParticipant });
  });

export default router;
