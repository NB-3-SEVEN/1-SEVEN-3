import express from "express";
import { postGroup } from "../api/group.js";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

const asyncHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (e) {
    console.error(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).send({ message: e.message });
    } else if (e instanceof Prisma.PrismaClientValidationError) {
      res.status(422).send({ message: e.message });
    } else {
      res.status(500).send({ message: e.message });
    }
  }
};

router.get("/", (req, res) => {
  res.status(200).send("Groups route is working!");
});

router.route("/").post(postGroup);

router.get(
  "/:groupId/records",
  asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const {
      page = 1,
      limit = 10,
      order = "desc",
      orderBy = "createdAt",
      search = "",
    } = req.query;

    const offset = (page - 1) * limit;

    let orderByField;
    switch (orderBy) {
      case "time":
        orderByField = { time: order };
        break;
      case "createdAt":
        orderByField = { createdAt: order };
        break;
      default:
        orderByField = { createdAt: "desc" };
    }

    const where = search
      ? {
          groupId: parseInt(groupId), // groupId를 직접 사용
          author: {
            nickname: {
              contains: search,
              mode: "insensitive",
            },
          },
        }
      : { groupId: parseInt(groupId) }; // groupId를 직접 사용

    const records = await prisma.record.findMany({
      where,
      orderBy: orderByField,
      skip: offset,
      take: limit,
      select: {
        id: true,
        exerciseType: true,
        description: true,
        time: true,
        distance: true,
        photos: true,
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    const total = await prisma.record.count({
      where,
    });

    res.send({ data: records, total });
  })
);

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
  });

export default router;
