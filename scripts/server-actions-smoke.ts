import "./_register-next-stubs";
import "dotenv/config";
import type { ActionResult } from "../src/lib/actions/result";
import {
  getBoards,
  getBoardWithColumns,
} from "../src/features/boards/actions";
import {
  createColumn,
  updateColumn,
  deleteColumn,
} from "../src/features/columns/actions";
import {
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  createSubtask,
  toggleSubtask,
  deleteSubtask,
} from "../src/features/tasks/actions";
import { prisma } from "../src/lib/prisma";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      message || `Expected ${String(expected)}, got ${String(actual)}`
    );
  }
}

function assertTrue(value: boolean, message?: string): void {
  if (!value) {
    throw new Error(message || "Expected true");
  }
}

function unwrap<T>(result: ActionResult<T>, context: string): T {
  if (!result.success) {
    throw new Error(`${context} failed: ${result.error}`);
  }
  return result.data;
}

async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✓ ${name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: message });
    console.error(`  ✗ ${name}: ${message}`);
  }
}

async function main() {
  console.log("Server Actions smoke test starting...\n");

  const boards = unwrap(await getBoards(), "getBoards");
  assertEqual(boards.length, 3, "Expected 3 boards");
  const board = boards[0];

  await runTest("getBoards returns 3 boards", async () => {
    assertEqual(boards.length, 3);
  });

  const boardWithColumns = unwrap(
    await getBoardWithColumns(board.id),
    "getBoardWithColumns"
  );
  const columns = boardWithColumns.columns;
  assertTrue(columns.length > 0, "Expected at least one column");
  const sourceColumn = columns[0];
  const targetColumn = columns[1] ?? columns[0];

  await runTest("getBoardWithColumns returns board with columns", async () => {
    assertEqual(boardWithColumns.id, board.id);
    assertTrue(columns.length > 0);
  });

  let createdColumnId: string;
  await runTest("createColumn creates a new column", async () => {
    const column = unwrap(
      await createColumn({
        boardId: board.id,
        name: "Smoke Column",
        color: "#FF0000",
      }),
      "createColumn"
    );
    createdColumnId = column.id;
  });

  await runTest("updateColumn renames the column", async () => {
    const column = unwrap(
      await updateColumn(createdColumnId!, { name: "Updated Smoke Column" }),
      "updateColumn"
    );
    assertEqual(column.name, "Updated Smoke Column");
  });

  await runTest("deleteColumn soft-deletes the column", async () => {
    unwrap(await deleteColumn(createdColumnId!), "deleteColumn");
    const column = await prisma.column.findUnique({
      where: { id: createdColumnId! },
    });
    assertTrue(column?.deletedAt !== null, "Column should be soft-deleted");
  });

  let createdTaskId: string;
  await runTest("createTask creates a task with subtasks", async () => {
    const task = unwrap(
      await createTask({
        columnId: sourceColumn.id,
        title: "Smoke Task",
        description: "Smoke task description",
        subtasks: [{ title: "Smoke Subtask 1" }, { title: "Smoke Subtask 2" }],
      }),
      "createTask"
    );
    createdTaskId = task.id;
    assertEqual(task.title, "Smoke Task");
    assertEqual(task.subtasks.length, 2);
  });

  await runTest("updateTask updates title and upserts subtasks", async () => {
    const existingSubtask = (await prisma.subtask.findMany({
      where: { taskId: createdTaskId!, deletedAt: null },
    }))[0];

    const task = unwrap(
      await updateTask(createdTaskId!, {
        title: "Updated Smoke Task",
        subtasks: [
          { id: existingSubtask.id, title: "Updated Subtask" },
          { title: "New Subtask" },
        ],
      }),
      "updateTask"
    );
    assertEqual(task.title, "Updated Smoke Task");
    assertEqual(task.subtasks.length, 3);
  });

  await runTest("moveTask moves task to target column", async () => {
    const task = unwrap(
      await moveTask(createdTaskId!, targetColumn.id, 0),
      "moveTask"
    );
    assertEqual(task.columnId, targetColumn.id);
  });

  let createdSubtaskId: string;
  await runTest("createSubtask adds a subtask", async () => {
    const subtask = unwrap(
      await createSubtask({
        taskId: createdTaskId!,
        title: "Toggle Smoke Subtask",
      }),
      "createSubtask"
    );
    createdSubtaskId = subtask.id;
    assertEqual(subtask.isCompleted, false);
  });

  await runTest("toggleSubtask flips completion", async () => {
    const subtask = unwrap(await toggleSubtask(createdSubtaskId!), "toggleSubtask");
    assertEqual(subtask.isCompleted, true);
  });

  await runTest("deleteSubtask soft-deletes the subtask", async () => {
    unwrap(await deleteSubtask(createdSubtaskId!), "deleteSubtask");
    const subtask = await prisma.subtask.findUnique({
      where: { id: createdSubtaskId! },
    });
    assertTrue(subtask?.deletedAt !== null, "Subtask should be soft-deleted");
  });

  await runTest("deleteTask soft-deletes the task and subtasks", async () => {
    unwrap(await deleteTask(createdTaskId!), "deleteTask");
    const task = await prisma.task.findUnique({ where: { id: createdTaskId! } });
    assertTrue(task?.deletedAt !== null, "Task should be soft-deleted");
    const remainingSubtasks = await prisma.subtask.findMany({
      where: { taskId: createdTaskId!, deletedAt: null },
    });
    assertEqual(
      remainingSubtasks.length,
      0,
      "All subtasks should be soft-deleted"
    );
  });

  const failed = results.filter((r) => !r.passed);
  console.log(
    `\n${results.length - failed.length}/${results.length} tests passed`
  );

  if (failed.length > 0) {
    console.error("\nFailed tests:");
    for (const result of failed) {
      console.error(`  - ${result.name}: ${result.error}`);
    }
    process.exit(1);
  }

  console.log("Server Actions smoke test PASSED.");
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
