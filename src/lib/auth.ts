import "server-only";
import { prisma } from "@/lib/prisma";

const SEED_EMAIL = "seed@kanban.local";

export async function getSeedUserId(): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { email: SEED_EMAIL },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`Seed user not found: ${SEED_EMAIL}`);
  }

  return user.id;
}
