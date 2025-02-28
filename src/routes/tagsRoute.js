import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router
  .get("/", async (req, res) => {
    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.status(200).json({ data: tags, total: tags.length });
  })
  .get("/:tagId", async (req, res) => {
    const tagId = Number(req.params.tagId);
    const tag = await prisma.tag.findUnique({
      where: {
        id: tagId,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!tag) {
      return res.status(404).json({ message: "Tag Id not found" });
    }
    res.status(200).json(tag);
  });

export default router;
