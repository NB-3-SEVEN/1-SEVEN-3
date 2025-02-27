import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.route("/").get((req, res) => {
  res.status(200).send("Groups route is working!");
});

router.route("/:id").patch(async (req, res) => {
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
});

export default router;
