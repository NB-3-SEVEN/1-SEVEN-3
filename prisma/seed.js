import { PrismaClient } from "@prisma/client";
import { PARTICIPANTS, GROUPS, RECORDS } from "./mock.js";

const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 삭제
  await prisma.record.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.group.deleteMany();

  // 목 데이터 삽입
  await prisma.group.createMany({
    data: GROUPS,
    skipDuplicates: true,
  });

  await Promise.all(
    PARTICIPANTS.map(async (participant) => {
      await prisma.participant.create({ data: participant });
    })
  );

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
