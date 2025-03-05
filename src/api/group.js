import { PrismaClient } from "@prisma/client";
import { assert } from "superstruct";
import { CreateGroup } from "../struct.js";

const prisma = new PrismaClient();

export async function postGroup(req, res) {
  assert(req.body, CreateGroup);
  await prisma.$transaction(async (prisma) => {
    const body = req.body;
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
      },
    });

    const participant = await prisma.participant.create({
      data: {
        nickname: body.ownerNickname,
        password: body.ownerPassword,
        groupId: group.id,
      },
    });

    const tagsName = body.tags.map((tag) => {
      return {
        name: tag,
        groupId: group.id,
      };
    });

    await prisma.tag.createMany({
      data: tagsName,
    });
    const json = {
      //tags와 group 과 particpants 합쳐서 응답하기
      id: group.id,
      name: group.name,
      description: group.description,
      photoUrl: group.photoUrl,
      goalRep: group.goalRep,
      discordWebhookUrl: group.discordWebhookUrl,
      discordInviteUrl: group.discordInviteUrl,
      likeCount: group.likeCount,
      tags: body.tags,
      owner: {
        id: participant.id,
        nickname: participant.nickname,
        createdAt: participant.createdAt,
        updatedAt: participant.updatedAt,
      },
      participants: [
        {
          id: participant.id,
          nickname: participant.nickname,
          createdAt: participant.createdAt,
          updatedAt: participant.updatedAt,
        },
      ],
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      badges: group.badges,
    };

    res.status(201).json(json);
  });
}

export async function getGroups(req, res) {
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
        participantCount: order,
      };
      break;
  }

  const groups = await prisma.group.findMany({
    skip: (page - 1) * 6,
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
    const owner = group.participants.find(
      (p) => p.nickname === group.ownerNickname
    );

    const tags = group.tags.map((tag) => {
      if (tag.groupId === group.id) {
        return tag.name;
      }
    });
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      photoUrl: group.photoUrl,
      goalRep: group.goalRep,
      discordWebhookUrl: group.discordWebhookUrl,
      discordInviteUrl: group.discordInviteUrl,
      likeCount: group.likeCount,
      tags: tags,
      owner: {
        id: owner.id,
        nickname: owner.nickname,
        createdAt: owner.createdAt,
        updatedAt: owner.updatedAt,
      },
      participants: group.participants.map((participant) => {
        return {
          id: participant.id,
          nickname: participant.nickname,
          createdAt: participant.createdAt,
          updatedAt: participant.updatedAt,
        };
      }),
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      badges: group.badges,
    };
  });

  const json = {
    data: data,
    total: data.length,
  };

  res.status(200).json(json);
}

export async function getGroup(req, res) {
  const { groupId } = req.params;
  const group = await prisma.group.findUnique({
    select: {
      id: true,
      name: true,
      description: true,
      photoUrl: true,
      goalRep: true,
      discordWebhookUrl: true,
      discordInviteUrl: true,
      likeCount: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
      badges: true,
    },
    where: {
      id: Number(groupId),
    },
  });

  const { ownerNickname } = await prisma.group.findUnique({
    where: {
      id: Number(groupId),
    },
    select: {
      ownerNickname: true,
    },
  });

  const owner = await prisma.participant.findUnique({
    where: {
      id: Number(groupId),
      nickname: ownerNickname,
    },
    select: {
      id: true,
      nickname: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const participants = await prisma.participant.findMany({
    where: {
      groupId: Number(groupId),
    },
    select: {
      id: true,
      nickname: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const json = {
    ...group,
    owner,
    participants,
  };

  res.status(200).json(json);
}

export async function getRank(req, res) {
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
}
