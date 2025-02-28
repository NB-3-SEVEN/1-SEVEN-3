import express from "express";
import { getGroup, getGroups, postGroup } from "../api/group.js";
import { PrismaClient, Prisma } from "@prisma/client";
import { CreateRecord } from "../struct.js";
import { assert } from "superstruct";

const prisma = new PrismaClient();
const router = express.Router();
router.route("/").get(getGroups).post(postGroup);
router.route("/:groupId").get(getGroup);

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

// 운동 기록 등록
router.post(
  "/:groupId/records",
  asyncHandler(async (req, res) => {
    if (isNaN(req.params.groupId)) {
      return res.status(400).json({ message: "groupId must be integer" });
    }

    assert(req.body, CreateRecord);
    const { groupId } = req.params;
    const {
      exerciseType,
      description,
      time,
      distance,
      photos,
      authorNickname,
      authorPassword,
    } = req.body;

    const participant = await prisma.participant.findFirst({
      where: {
        nickname: authorNickname,
        password: authorPassword,
        groupId: Number(groupId),
      },
      include: { group: true },
    });

    if (!participant) {
      return res
        .status(403)
        .send({ message: "그룹에 등록된 참가자가 아닙니다." });
    }

    const record = await prisma.record.create({
      data: {
        exerciseType,
        description: description || null,
        time,
        distance,
        photos,
        authorId: participant.id,
        groupId: participant.group.id,
      },
      select: {
        id: true,
        exerciseType: true,
        description: true,
        time: true,
        distance: true,
        photos: true,
        author: {
          select: { id: true, nickname: true },
        },
      },
    });

    res.status(201).send(record);
  })
);

// 그룹 운동 기록 목록 조회
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
          groupId: parseInt(groupId),
          author: {
            nickname: {
              contains: search,
              mode: "insensitive",
            },
          },
        }
      : { groupId: parseInt(groupId) };

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

// 그룹 운동 기록 상세 조회
router.get(
  "/:groupId/records/:recordId",
  asyncHandler(async (req, res) => {
    const { groupId, recordId } = req.params;

    const record = await prisma.record.findUnique({
      where: {
        id: parseInt(recordId, 10),
        groupId: parseInt(groupId, 10),
      },
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

    if (!record) {
      return res.status(404).json({ message: "운동 기록을 찾을 수 없습니다." });
    }

    res.status(200).json(record);
  })
);
// 그룹 추천(좋아요)
router
  .post("/:groupId/likes", async (req, res) => {
    const { groupId } = req.params;
    const group = await prisma.group.findUnique({
      where: {
        id: parseInt(groupId),
      },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const updateGroup = await prisma.group.update({
      where: {
        id: parseInt(groupId),
      },
      data: {
        likeCount: (group.likeCount || 0) + 1, // 기본값을 0으로 설정
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

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    if (group.likeCount <= 0) {
      return res
        .status(422)
        .json({ message: "좋아요 수는 최소 0 이상이어야 합니다." });
    }

    const updateGroup = await prisma.group.update({
      where: {
        id: parseInt(groupId),
      },
      data: {
        likeCount: Math.max(0, group.likeCount - 1), // 기본값을 0으로 설정
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
