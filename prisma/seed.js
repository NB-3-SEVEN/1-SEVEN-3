import { PrismaClient } from "@prisma/client";
import { GROUPS, RECORDS, PARTICIPANTS } from "./mock.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.group.deleteMany();
  await prisma.record.deleteMany();
  await prisma.participant.deleteMany();

  await Promise.all(
    GROUPS.map(async (group) => {
      return prisma.group.create({ data: group });
    })
  );

  await Promise.all(
    PARTICIPANTS.map(async (participant) => {
      return prisma.participant.create({ data: participant });
    })
  );

  await Promise.all(
    RECORDS.map(async (record) => {
      return prisma.record.create({ data: record });
    })
  );
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
