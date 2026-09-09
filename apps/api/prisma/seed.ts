import { prisma } from "../src/db/prisma.js";
import { DEMO_USER } from "../src/domain/user.js";

async function main() {
  await prisma.user.upsert({
    where: { id: DEMO_USER.id },
    update: {},
    create: DEMO_USER
  });

  console.log(`Seeded ${DEMO_USER.email}`);
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
