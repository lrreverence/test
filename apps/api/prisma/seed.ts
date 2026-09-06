import { prisma } from "../src/db/prisma.js";
import { DEMO_USER } from "../src/domain/user.js";

await prisma.user.upsert({
  where: { id: DEMO_USER.id },
  update: {},
  create: DEMO_USER
});

console.log(`Seeded ${DEMO_USER.email}`);
await prisma.$disconnect();

