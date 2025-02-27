import { PrismaClient } from "@prisma/client";

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
