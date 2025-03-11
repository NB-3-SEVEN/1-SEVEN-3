import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router
  .get("/", async (req, res) => {
    const { page = 1, limit = 10, order = "desc", search = "" } = req.query;
    let orderBy = { createdAt: "desc" };
    if (order === "oldest") {
      orderBy = { createdAt: "asc" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tags = await prisma.tag.findMany({
      skip: skip,
      take: parseInt(limit),
      orderBy: orderBy,
      where: {
        name: {
          contains: search,
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    const total = await prisma.tag.count({
      where: {
        name: {
          contains: search,
        },
      },
    });
    res.status(200).json({ data: tags, total: total });
    console.log(tags);
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
