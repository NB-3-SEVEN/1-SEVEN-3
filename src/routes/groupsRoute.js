import express from "express";
import { getGroups, postGroup } from "../api/group.js";
import { PrismaClient, Prisma } from "@prisma/client";
import { CreateRecord } from "../struct.js";
import { assert } from "superstruct";


const prisma = new PrismaClient();
const router = express.Router();
router.route("/").get(getGroups).post(postGroup);

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

    // 닉네임과 비밀번호로 참가자 조회
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

    // 운동 기록 저장
    const record = await prisma.record.create({
      data: {
        exerciseType,
        description: description || null,
        time,
        distance,
        photos,
        authorId: participant.id, // Directly set the authorId to the existing participant's ID
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
