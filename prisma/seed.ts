import "dotenv/config";
import { randomUUID } from "node:crypto";
import { type Prisma, BoardRole } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import data from "../data.json";

async function main() {
  const seedUserId = randomUUID();

  const boardMap = new Map<string, string>();
  const boardData: Prisma.BoardCreateManyInput[] = data.boards.map((board) => {
    const newId = randomUUID();
    boardMap.set(board.id, newId);
    return {
      id: newId,
      name: board.name,
      isActive: board.isActive,
      ownerId: seedUserId,
    };
  });

  const columnMap = new Map<string, string>();
  const columnData: Prisma.ColumnCreateManyInput[] = data.columns.map(
    (column) => {
      const newId = randomUUID();
      columnMap.set(column.id, newId);
      const boardId = boardMap.get(column.boardId);
      if (!boardId) {
        throw new Error(`Board not found for column ${column.id}`);
      }
      return {
        id: newId,
        name: column.name,
        color: column.color,
        order: column.order * 1000,
        boardId,
      };
    }
  );

  const taskMap = new Map<string, string>();
  const taskData: Prisma.TaskCreateManyInput[] = data.tasks.map((task) => {
    const newId = randomUUID();
    taskMap.set(task.id, newId);
    const columnId = columnMap.get(task.columnId);
    if (!columnId) {
      throw new Error(`Column not found for task ${task.id}`);
    }
    return {
      id: newId,
      title: task.title,
      description: task.description,
      order: task.order * 1000,
      columnId,
    };
  });

  const subtaskData: Prisma.SubtaskCreateManyInput[] = data.tasks.flatMap(
    (task) =>
      task.subtasks.map((subtask) => {
        const taskId = taskMap.get(task.id);
        if (!taskId) {
          throw new Error(`Task not found for subtask ${subtask.id}`);
        }
        return {
          title: subtask.title,
          isCompleted: subtask.isCompleted,
          taskId,
        };
      })
  );

  const boardMemberData: Prisma.BoardMemberCreateManyInput[] = data.boards.map(
    (board) => {
      const boardId = boardMap.get(board.id);
      if (!boardId) {
        throw new Error(`Board not found for board member ${board.id}`);
      }
      return {
        role: BoardRole.OWNER,
        userId: seedUserId,
        boardId,
      };
    }
  );

  await prisma.$transaction([
    prisma.subtask.deleteMany({}),
    prisma.task.deleteMany({}),
    prisma.column.deleteMany({}),
    prisma.boardMember.deleteMany({}),
    prisma.board.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.user.create({
      data: {
        id: seedUserId,
        email: "seed@kanban.local",
        password: "seed123",
        name: "Seed User",
      },
    }),
    prisma.board.createMany({ data: boardData }),
    prisma.boardMember.createMany({ data: boardMemberData }),
    prisma.column.createMany({ data: columnData }),
    prisma.task.createMany({ data: taskData }),
    prisma.subtask.createMany({ data: subtaskData }),
  ]);

  console.log("Seeded database successfully");
  console.log(`  Users: 1`);
  console.log(`  Boards: ${boardData.length}`);
  console.log(`  BoardMembers: ${boardMemberData.length}`);
  console.log(`  Columns: ${columnData.length}`);
  console.log(`  Tasks: ${taskData.length}`);
  console.log(`  Subtasks: ${subtaskData.length}`);
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
