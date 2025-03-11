import { PrismaClient } from "@prisma/client";
import { GROUPS } from "./mock.js";

const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 삭제
  await prisma.record.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.group.deleteMany();
  await prisma.tag.deleteMany();

  // 그룹+참가자+태그+레코드+그룹과태그의관계테이블 데이터 삽입
  GROUPS.map(async (group) => {
    await prisma.group.create({
      data: group,
    });
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
