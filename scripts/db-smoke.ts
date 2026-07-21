import "dotenv/config";
import { prisma } from "../src/lib/prisma";

// Expected counts match the seed data now inlined in prisma/seed.ts
const expected = {
  users: 1,
  boards: 3,
  boardMembers: 3,
  columns: 9,
  tasks: 22,
  subtasks: 54,
};

async function main() {
  const [users, boards, boardMembers, columns, tasks, subtasks] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.board.count(),
      prisma.boardMember.count(),
      prisma.column.count(),
      prisma.task.count(),
      prisma.subtask.count(),
    ]);

  const actual = {
    users,
    boards,
    boardMembers,
    columns,
    tasks,
    subtasks,
  };

  console.log("Database smoke test results:");
  console.log(`  Users:        ${users} (expected ${expected.users})`);
  console.log(`  Boards:       ${boards} (expected ${expected.boards})`);
  console.log(
    `  BoardMembers: ${boardMembers} (expected ${expected.boardMembers})`
  );
  console.log(`  Columns:      ${columns} (expected ${expected.columns})`);
  console.log(`  Tasks:        ${tasks} (expected ${expected.tasks})`);
  console.log(`  Subtasks:     ${subtasks} (expected ${expected.subtasks})`);

  const failed = Object.entries(expected).filter(
    ([key, expectedValue]) => actual[key as keyof typeof actual] !== expectedValue
  );

  if (failed.length > 0) {
    console.error("Smoke test FAILED: counts do not match expected values.");
    process.exit(1);
  }

  console.log("Smoke test PASSED.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
