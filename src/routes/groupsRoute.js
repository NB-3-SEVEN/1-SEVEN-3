import express from "express";
import { getGroup, getGroups, getRank, postGroup } from "../api/group.js";
import { PrismaClient, Prisma } from "@prisma/client";
import { CreateParticipant, CreateRecord } from "../struct.js";
import { assert } from "superstruct";
import { asyncHandler } from "../asyncHandler.js";

const prisma = new PrismaClient();
const router = express.Router();
router.route("/").get(asyncHandler(getGroups)).post(asyncHandler(postGroup));
router.route("/:groupId").get(asyncHandler(getGroup));
router.route("/:groupId/rank/").get(asyncHandler(getRank));

// 운동 기록 등록
router
  .route("/:groupId/records")
  .post(
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
  )
  .get(
    // 그룹 운동 기록 목록 조회
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
router.route("/:groupId/records/:recordId").get(
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

router
  .route("/:groupId/likes")
  .post(
    asyncHandler(async (req, res) => {
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
  )
  .delete(
    asyncHandler(async (req, res) => {
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
  );

router
  .route("/:id")
  .patch(
    asyncHandler(async (req, res) => {
      const { id: groupId } = req.params;
      const { ownerPassword, goalRep, ...updateData } = req.body;
      const group = await prisma.group.findFirstOrThrow({
        where: { id: parseInt(groupId, 10) },
      });

      if (group.ownerPassword !== ownerPassword) {
        res.status(401).json({ message: "Wrong password" });
      }

      if (goalRep && !Number.isInteger(goalRep)) {
        return res.status(400).json({ message: "goalRep must be an integer" });
      }

      const updatedGroup = await prisma.group.update({
        where: { id: parseInt(groupId, 10) },
        data: { ...updateData, goalRep },
      });

      const groups = await prisma.group.findUniqueOrThrow({
        where: { id: parseInt(groupId, 10) },
        select: {
          id: true,
          name: true,
          description: true,
          photoUrl: true,
          goalRep: true,
          discordWebhookUrl: true,
          discordInviteUrl: true,
          likeCount: true,
          tags: { select: { name: true } },
          createdAt: true,
          updatedAt: true,
          badges: true,
        },
      });

      const owner = await prisma.participant.findFirst({
        where: {
          nickname: updatedGroup.ownerNickname,
          groupId: updatedGroup.id,
        },
        select: { id: true, nickname: true, createdAt: true, updatedAt: true },
      });

      const participants = await prisma.participant.findMany({
        where: { groupId: parseInt(groupId, 10) },
        select: { id: true, nickname: true, createdAt: true, updatedAt: true },
      });

      res.json({ ...groups, owner, participants });
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
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
    })
  );
router
  .route("/:id/participants")
  .post(
    asyncHandler(async (req, res) => {
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
        select: {
          id: true,
          name: true,
          description: true,
          photoUrl: true,
          goalRep: true,
          discordWebhookUrl: true,
          discordInviteUrl: true,
          likeCount: true,
          tags: { select: { name: true } },
          createdAt: true,
          updatedAt: true,
          badges: true,
        },
      });

      const ownerNickname = await prisma.group.findUnique({
        where: { id: parseInt(groupId, 10) },
        select: { ownerNickname: true },
      });

      const owner = await prisma.participant.findFirst({
        where: {
          nickname: ownerNickname.ownerNickname,
          groupId: parseInt(groupId, 10),
        },
        select: { id: true, nickname: true, createdAt: true, updatedAt: true },
      });

      const participants = await prisma.participant.findMany({
        where: { groupId: parseInt(groupId, 10) },
        select: { id: true, nickname: true, createdAt: true, updatedAt: true },
      });

      res.json({ ...group, owner, participants });
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
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
    })
  );

export default router;
