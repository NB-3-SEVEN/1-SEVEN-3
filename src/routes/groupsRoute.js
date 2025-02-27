import express from "express";
import { PrismaClient } from "@prisma/client";
import { CreateRecord } from "../struct.js";
import { assert } from "superstruct";

const prisma = new PrismaClient();
const router = express.Router();

const asyncHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: e.message });
  }
};

// 운동 기록 등록
router.post(
  "/:groupId/records",
  asyncHandler(async (req, res) => {
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
        description: description || null, // description이 없으면 null 저장
        time,
        distance,
        photos,
        authorId: participant.id,
      },
      include: {
        author: {
          select: { id: true, nickname: true },
        },
      },
    });

    res.status(201).send(record);
  })
);

export default router;
