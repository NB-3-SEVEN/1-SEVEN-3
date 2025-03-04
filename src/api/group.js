import { PrismaClient } from "@prisma/client";
import { json } from "express";

const prisma = new PrismaClient();

export async function postGroup(req, res) {
  const body = req.body;
  const group = await prisma.group.create({
    data: body,
  });

  const participant = new Array();
  participant[0] = await prisma.participant.create({
    data: {
      nickname: body.ownerNickname,
      password: body.ownerPassword,
      groupId: group.id,
    },
  });

  const json = {
    //group 과 particpant 합쳐서 응답하기
    ...group,
    owner: participant[0],
    participant: participant,
  };
  res.status(201).json(json);
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
        createdAt: order,
      };
      break;
    case "participantCount":
      orderByParameter = {
        createdAt: order,
      };
      break;
  }

  const group = await prisma.group.findMany({
    skip: (page - 1) * 6,
    take: Number(limit),
    orderBy: orderByParameter,
    where: {
      name: {
        contains: search,
      },
    },
  });
  res.status(200).json(group);
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

  const participant = await prisma.participant.findMany({
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
    group,
    owner,
    participant,
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
