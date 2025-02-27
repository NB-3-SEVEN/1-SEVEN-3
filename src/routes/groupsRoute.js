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
  .patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { ownerPassword, goalRep, ...updateData } = req.body;
    const group = await prisma.group.findFirstOrThrow({
      where: { id: parseInt(id, 10) },
    });

    if (group.ownerPassword !== ownerPassword) {
      res.status(401).json({ message: "Wrong password" });
    }

    if (goalRep && !Number.isInteger(goalRep)) {
      return res.status(400).json({ message: "goalRep must be an integer" });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: parseInt(id, 10) },
      data: { ...updateData, goalRep },
    });

    res.json({ message: updatedGroup });
  })
  .delete("/:id", async (req, res) => {
    const { id } = req.params;
    const { ownerPassword } = req.body;

    const group = await prisma.group.findUniqueOrThrow({
      where: { id: parseInt(id, 10) },
    });

    if (group.ownerPassword !== ownerPassword) {
      return res.status(401).json({ error: "Wrong password" });
    }

    const deletedGrop = await prisma.group.delete({
      where: { id: parseInt(id, 10) },
    });

    res.json({ message: deletedGrop });
  });

export default router;
