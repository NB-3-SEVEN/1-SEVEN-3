import express from "express";
import { PrismaClient } from "@prisma/client";
import { CreateGroup, CreateParticipant, CreateRecord } from "../struct.js";
import { assert } from "superstruct";
import { asyncHandler } from "../asyncHandler.js";
import { formatGroupResponse } from "../formatter.js";
import { autoBadge } from "../badge.js";
import axios from "axios";

const prisma = new PrismaClient();
const router = express.Router();
router
  .route("/")
  .get(
    asyncHandler(async (req, res) => {
      const {
        page = 1,
        limit = 10,
        order = "desc",
        orderBy = "createdAt",
        search = "",
      } = req.query;

      let orderByParameter;
      switch (orderBy) {
        case "createdAt":
          orderByParameter = {
            createdAt: order,
          };
          break;
        case "likeCount":
          orderByParameter = {
            likeCount: order,
          };
          break;
        case "participantCount":
          orderByParameter = {
            participants: {
              _count: order,
            },
          };
          break;
      }

      const groups = await prisma.group.findMany({
        skip: Number((page - 1) * 6),
        take: Number(limit),
        orderBy: orderByParameter,
        where: {
          name: {
            contains: search,
          },
        },
        include: {
          tags: true,
          participants: true,
        },
      });

      const data = groups.map((group) => {
        return formatGroupResponse(group);
      });

      const json = {
        data,
        total: await prisma.group.count(),
      };

      res.status(200).json(json);
    })
  )
  .post(
    asyncHandler(async (req, res) => {
      assert(req.body, CreateGroup);
      await prisma.$transaction(async (prisma) => {
        const body = req.body;
        const tags = [...new Set(req.body.tags)];

        const group = await prisma.group.create({
          data: {
            name: body.name,
            description: body.description,
            photoUrl: body.photoUrl,
            goalRep: body.goalRep,
            discordWebhookUrl: body.discordWebhookUrl,
            discordInviteUrl: body.discordInviteUrl,
            ownerNickname: body.ownerNickname,
            ownerPassword: body.ownerPassword,
            TagGroup: {
              create: tags.map((tag) => ({
                tag: {
                  connectOrCreate: {
                    where: {
                      name: tag,
                    },
                    create: { name: tag },
                  },
                },
              })),
            },
          },
          include: {
            TagGroup: {
              include: { tag: true },
            },
          },
        });

        group.participants = [
          await prisma.participant.create({
            data: {
              nickname: body.ownerNickname,
              password: body.ownerPassword,
              groupId: group.id,
            },
          }),
        ];

        const json = formatGroupResponse(group);
        res.status(201).json(json);
      });
    })
  );
router.route("/:groupId").get(
  asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const group = await prisma.group.findUnique({
      where: {
        id: Number(groupId),
      },
      include: {
        tags: true,
        participants: true,
      },
    });

    res.status(200).json(formatGroupResponse(group));
  })
);
router.route("/:groupId/rank/").get(
  asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { duration = "monthly" } = req.query;
    const participants = await prisma.participant.findMany({
      where: {
        groupId: Number(groupId),
      },
      select: {
        id: true,
        nickname: true,
        records: true,
      },
    });

    const rank = participants.map((participant) => {
      let recordSum = 0;
      let outdatedRecordCount = 0;
      participant.records.forEach((record) => {
        const date = new Date(record.createdAt);
        const dateNow = new Date();
        if (duration === "weekly") {
          if (dateNow.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000) {
            recordSum += Number(record.time);
          } else outdatedRecordCount++;
        } else {
          if (dateNow.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000) {
            recordSum += Number(record.time);
          } else outdatedRecordCount++;
        }
      });
      return {
        participantId: participant.id,
        nickname: participant.nickname,
        recordCount: participant.records.length - outdatedRecordCount,
        recordTime: recordSum,
      };
    });

    const json = rank.sort((a, b) => b.recordCount - a.recordCount);

    res.status(200).json(json);
  })
);

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

      await autoBadge(groupId);

      const discordWebhookUrl = participant.group.discordWebhookUrl;
      const groupName = participant.group.name;

      if (discordWebhookUrl) {
        try {
          await axios.post(discordWebhookUrl, {
            embeds: [
              {
                title: "새로운 운동 기록 등록!",
                description: `**그룹**: ${groupName}`,
                fields: [
                  { name: "운동 종류", value: exerciseType, inline: true },
                  { name: "작성자", value: authorNickname, inline: true },
                  { name: "시간", value: `${time}분`, inline: true },
                  { name: "거리", value: `${distance}km`, inline: true },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          });
        } catch (e) {
          console.error("디스코드 웹훅 전송 실패:", e);
        }
      }

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

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const offset = (pageNum - 1) * limitNum;

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
        take: limitNum,
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

// 그룹 추천(좋아요)

router
  .route("/:groupId/likes")
  .post(
    asyncHandler(async (req, res) => {
      const { groupId } = req.params;

      const groupIdInt = parseInt(groupId, 10);
      if (isNaN(groupIdInt)) {
        return res.status(400).json({ error: "Invalid groupId" });
      }

      const group = await prisma.group.findUnique({
        where: {
          id: groupIdInt,
        },
        select: { likeCount: true, badges: true },
      });

      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      await autoBadge(groupIdInt);

      const updatedGroup = await prisma.group.update({
        where: { id: parseInt(groupId) },
        data: {
          likeCount: { increment: 1 },
        },
      });

      res.status(200).json(updatedGroup);
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
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      const updateGroup = await prisma.group.update({
        where: {
          id: parseInt(groupId),
        },
        data: {
          likeCount: { decrement: 1 },
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
      const { ownerPassword, goalRep, tags, ...updateData } = req.body;
      const group = await prisma.group.findFirstOrThrow({
        where: { id: parseInt(groupId, 10) },
      });

      if (group.ownerPassword !== ownerPassword) {
        return res.status(401).json({ message: "Wrong password" });
      }

      if (goalRep && !Number.isInteger(goalRep)) {
        return res.status(400).json({ message: "goalRep must be an integer" });
      }

      if (tags) {
        const newTags = tags.map((tag) => tag.replace("#", "").trim());

        const existingTags = await prisma.tag.findMany({
          where: { name: { in: newTags } },
          select: { id: true, name: true },
        });

        const tagsToCreate = newTags.filter(
          (tag) => !existingTags.some((t) => t.name === tag)
        );

        const createdTags = await prisma.$transaction(
          tagsToCreate.map((tag) =>
            prisma.tag.create({ data: { name: tag }, select: { id: true } })
          )
        );

        const allTaglds = [...existingTags, ...createdTags].map((tag) => ({
          id: tag.id,
        }));

        await prisma.group.update({
          where: { id: parseInt(groupId, 10) },
          data: {
            ...updateData,
            goalRep,
            tags: { set: allTaglds },
          },
        });
      } else {
        await prisma.group.update({
          where: { id: parseInt(groupId, 10) },
          data: {
            ...updateData,
            goalRep,
          },
        });
      }

      await prisma.group.update({
        where: { id: parseInt(groupId, 10) },
        data: { ...updateData, goalRep },
      });

      const updatedGroup = await prisma.group.findFirstOrThrow({
        where: { id: parseInt(groupId, 10) },
        include: { participants: true, tags: true },
      });

      res.json(formatGroupResponse(updatedGroup));
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { ownerPassword } = req.body;

      const group = await prisma.group.findUniqueOrThrow({
        where: { id: parseInt(id, 10) },
      });

      console.log(group);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (group.ownerPassword.trim() !== ownerPassword.trim()) {
        return res.status(401).json({ message: "Wrong password" });
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

      await autoBadge(groupId);

      const group = await prisma.group.findUniqueOrThrow({
        where: { id: parseInt(groupId, 10) },
        include: { tags: true, participants: true },
      });

      res.json(formatGroupResponse(group));
    })
  )
  .delete(
    asyncHandler(async (req, res) => {
      const { id: groupId } = req.params;
      const { nickname, password } = req.body;

      const participant = await prisma.participant.findFirst({
        where: { groupId: parseInt(groupId, 10), nickname: nickname?.trim() },
      });

      if (!participant) {
        return res.status(400).json({ message: "nickname is required" });
      }

      if (participant.nickname.trim() !== nickname.trim()) {
        return res.status(400).json({ message: "nickname is required" });
      }

      const group = await prisma.group.findUnique({
        where: { id: parseInt(groupId, 10) },
      });

      if (group.ownerNickname === participant.nickname) {
        return res
          .status(403)
          .json({ message: "Owner cannot leave the group" });
      }

      if (participant.password.trim() !== password.trim()) {
        return res.status(401).json({ message: "Wrong password" });
      }

      const deletedParticipant = await prisma.participant.delete({
        where: { id: participant.id },
      });

      res.json({ message: deletedParticipant });
    })
  );

export default router;
