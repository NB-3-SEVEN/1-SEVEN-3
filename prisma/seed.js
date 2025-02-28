import { PrismaClient } from "@prisma/client";
import { PARTICIPANTS, GROUPS, RECORDS, TAGS } from "./mock.js";

const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 삭제
  await prisma.record.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.group.deleteMany();
  await prisma.tag.deleteMany();

  await prisma.tag.createMany({
    data: TAGS,
    skipDuplicates: true,
  });

  await prisma.group.createMany({
    data: GROUPS.map((group) => ({
      ...group,
      tags: undefined,
    })),
    skipDuplicates: true,
  });

  await Promise.all(
    GROUPS.map(async (group) => {
      const tagIds = group.tags?.connect.map((tag) => tag.id) || [];
      await prisma.group.update({
        where: { id: group.id },
        data: {
          tag: {
            connect: tagIds.map((id) => ({ id })),
          },
        },
      });
    })
  );

  // 참가자 데이터 삽입
  await Promise.all(
    PARTICIPANTS.map(async (participant) => {
      await prisma.participant.create({ data: participant });
    })
  );

  // 레코드 데이터 삽입
  await prisma.record.createMany({
    data: RECORDS,
    skipDuplicates: true,
  });

  console.log("Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
