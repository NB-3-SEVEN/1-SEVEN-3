import express from "express";
import { postGroup } from "../api/group.js";
import { PrismaClient } from "@prisma/client";
import { CreateParticipant } from "../struct.js";
import { formatGroupResponse } from "../utils/groupFromatter.js";
import { assert } from "superstruct";

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

    assert(req.body, CreateParticipant);

    const existingParticipant = await prisma.participant.findFirst({
      where: { nickname, groupId: parseInt(groupId, 10) },
    });

    if (existingParticipant) {
      return res.status(400).json({ message: "nickname is required" });
    }

    await prisma.participant.create({
      data: {
        nickname,
        password,
        group: { connect: { id: parseInt(groupId, 10) } },
      },
    });

    const group = await prisma.group.findUniqueOrThrow({
      where: { id: parseInt(groupId, 10) },
      include: {
        participants: {
          select: {
            id: true,
            nickname: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    console.log("참가자 목록:", group.participants);

    const owner = group.participants.find(
      (p) => p.nickname === group.ownerNickname
    );

    const response = formatGroupResponse(group);

    res.json({ message: response });
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
