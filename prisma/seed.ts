import "dotenv/config";
import { randomUUID } from "node:crypto";
import { type Prisma, BoardRole } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

const seedData = {
  boards: [
    { id: "board-001", name: "Platform Launch", isActive: true },
    { id: "board-002", name: "Marketing Plan", isActive: true },
    { id: "board-003", name: "Roadmap", isActive: true },
  ],
  columns: [
    {
      id: "col-board-001-todo",
      boardId: "board-001",
      name: "Todo",
      color: "#49C4E5",
      order: 0,
    },
    {
      id: "col-board-001-doing",
      boardId: "board-001",
      name: "Doing",
      color: "#8471F2",
      order: 1,
    },
    {
      id: "col-board-001-done",
      boardId: "board-001",
      name: "Done",
      color: "#67E2AE",
      order: 2,
    },
    {
      id: "col-board-002-todo",
      boardId: "board-002",
      name: "Todo",
      color: "#49C4E5",
      order: 0,
    },
    {
      id: "col-board-002-doing",
      boardId: "board-002",
      name: "Doing",
      color: "#8471F2",
      order: 1,
    },
    {
      id: "col-board-002-done",
      boardId: "board-002",
      name: "Done",
      color: "#67E2AE",
      order: 2,
    },
    {
      id: "col-board-003-now",
      boardId: "board-003",
      name: "Now",
      color: "#EA5555",
      order: 0,
    },
    {
      id: "col-board-003-next",
      boardId: "board-003",
      name: "Next",
      color: "#FF9F43",
      order: 1,
    },
    {
      id: "col-board-003-later",
      boardId: "board-003",
      name: "Later",
      color: "#2BC9A6",
      order: 2,
    },
  ],
  tasks: [
    {
      id: "task-col-board-001-todo-001",
      columnId: "col-board-001-todo",
      title: "Build UI for onboarding flow",
      description: "",
      order: 0,
      subtasks: [
        {
          id: "sub-task-col-board-001-todo-001-001",
          title: "Sign up page",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-todo-001-002",
          title: "Sign in page",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-001-todo-001-003",
          title: "Welcome page",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-001-todo-002",
      columnId: "col-board-001-todo",
      title: "Build UI for search",
      description: "",
      order: 1,
      subtasks: [
        {
          id: "sub-task-col-board-001-todo-002-001",
          title: "Search page",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-001-todo-003",
      columnId: "col-board-001-todo",
      title: "Build settings UI",
      description: "",
      order: 2,
      subtasks: [
        {
          id: "sub-task-col-board-001-todo-003-001",
          title: "Account page",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-001-todo-003-002",
          title: "Billing page",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-001-todo-004",
      columnId: "col-board-001-todo",
      title: "QA and test all major user journeys",
      description:
        "Once we feel version one is ready, we need to rigorously test it both internally and externally to identify any major gaps.",
      order: 3,
      subtasks: [
        {
          id: "sub-task-col-board-001-todo-004-001",
          title: "Internal testing",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-001-todo-004-002",
          title: "External testing",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-001-doing-001",
      columnId: "col-board-001-doing",
      title: "Design settings and search pages",
      description: "",
      order: 0,
      subtasks: [
        {
          id: "sub-task-col-board-001-doing-001-001",
          title: "Settings - Account page",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-doing-001-002",
          title: "Settings - Billing page",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-doing-001-003",
          title: "Search page",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-001-doing-002",
      columnId: "col-board-001-doing",
      title: "Add account management endpoints",
      description: "",
      order: 1,
      subtasks: [
        {
          id: "sub-task-col-board-001-doing-002-001",
          title: "Upgrade plan",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-doing-002-002",
          title: "Cancel plan",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-doing-002-003",
          title: "Update payment method",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-001-doing-003",
      columnId: "col-board-001-doing",
      title: "Design onboarding flow",
      description: "",
      order: 2,
      subtasks: [
        {
          id: "sub-task-col-board-001-doing-003-001",
          title: "Sign up page",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-doing-003-002",
          title: "Sign in page",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-001-doing-003-003",
          title: "Welcome page",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-001-doing-004",
      columnId: "col-board-001-doing",
      title: "Add search enpoints",
      description: "",
      order: 3,
      subtasks: [
        {
          id: "sub-task-col-board-001-doing-004-001",
          title: "Add search endpoint",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-doing-004-002",
          title: "Define search filters",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-001-doing-005",
      columnId: "col-board-001-doing",
      title: "Add authentication endpoints",
      description: "",
      order: 4,
      subtasks: [
        {
          id: "sub-task-col-board-001-doing-005-001",
          title: "Define user model",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-doing-005-002",
          title: "Add auth endpoints",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-001-doing-006",
      columnId: "col-board-001-doing",
      title:
        "Research pricing points of various competitors and trial different business models",
      description:
        "We know what we're planning to build for version one. Now we need to finalise the first pricing model we'll use. Keep iterating the subtasks until we have a coherent proposition.",
      order: 5,
      subtasks: [
        {
          id: "sub-task-col-board-001-doing-006-001",
          title: "Research competitor pricing and business models",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-doing-006-002",
          title: "Outline a business model that works for our solution",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-001-doing-006-003",
          title:
            "Talk to potential customers about our proposed solution and ask for fair price expectancy",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-001-done-001",
      columnId: "col-board-001-done",
      title: "Conduct 5 wireframe tests",
      description:
        "Ensure the layout continues to make sense and we have strong buy-in from potential users.",
      order: 0,
      subtasks: [
        {
          id: "sub-task-col-board-001-done-001-001",
          title: "Complete 5 wireframe prototype tests",
          isCompleted: true,
        },
      ],
    },
    {
      id: "task-col-board-001-done-002",
      columnId: "col-board-001-done",
      title: "Create wireframe prototype",
      description:
        "Create a greyscale clickable wireframe prototype to test our asssumptions so far.",
      order: 1,
      subtasks: [
        {
          id: "sub-task-col-board-001-done-002-001",
          title: "Create clickable wireframe prototype in Balsamiq",
          isCompleted: true,
        },
      ],
    },
    {
      id: "task-col-board-001-done-003",
      columnId: "col-board-001-done",
      title: "Review results of usability tests and iterate",
      description:
        "Keep iterating through the subtasks until we're clear on the core concepts for the app.",
      order: 2,
      subtasks: [
        {
          id: "sub-task-col-board-001-done-003-001",
          title: "Meet to review notes from previous tests and plan changes",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-done-003-002",
          title: "Make changes to paper prototypes",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-done-003-003",
          title: "Conduct 5 usability tests",
          isCompleted: true,
        },
      ],
    },
    {
      id: "task-col-board-001-done-004",
      columnId: "col-board-001-done",
      title:
        "Create paper prototypes and conduct 10 usability tests with potential customers",
      description: "",
      order: 3,
      subtasks: [
        {
          id: "sub-task-col-board-001-done-004-001",
          title: "Create paper prototypes for version one",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-done-004-002",
          title: "Complete 10 usability tests",
          isCompleted: true,
        },
      ],
    },
    {
      id: "task-col-board-001-done-005",
      columnId: "col-board-001-done",
      title: "Market discovery",
      description:
        "We need to define and refine our core product. Interviews will help us learn common pain points and help us define the strongest MVP.",
      order: 4,
      subtasks: [
        {
          id: "sub-task-col-board-001-done-005-001",
          title: "Interview 10 prospective customers",
          isCompleted: true,
        },
      ],
    },
    {
      id: "task-col-board-001-done-006",
      columnId: "col-board-001-done",
      title: "Competitor analysis",
      description: "",
      order: 5,
      subtasks: [
        {
          id: "sub-task-col-board-001-done-006-001",
          title: "Find direct and indirect competitors",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-done-006-002",
          title: "SWOT analysis for each competitor",
          isCompleted: true,
        },
      ],
    },
    {
      id: "task-col-board-001-done-007",
      columnId: "col-board-001-done",
      title: "Research the market",
      description:
        "We need to get a solid overview of the market to ensure we have up-to-date estimates of market size and demand.",
      order: 6,
      subtasks: [
        {
          id: "sub-task-col-board-001-done-007-001",
          title: "Write up research analysis",
          isCompleted: true,
        },
        {
          id: "sub-task-col-board-001-done-007-002",
          title: "Calculate TAM",
          isCompleted: true,
        },
      ],
    },
    {
      id: "task-col-board-002-todo-001",
      columnId: "col-board-002-todo",
      title: "Plan Product Hunt launch",
      description: "",
      order: 0,
      subtasks: [
        {
          id: "sub-task-col-board-002-todo-001-001",
          title: "Find hunter",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-002-todo-001-002",
          title: "Gather assets",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-002-todo-001-003",
          title: "Draft product page",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-002-todo-001-004",
          title: "Notify customers",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-002-todo-001-005",
          title: "Notify network",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-002-todo-001-006",
          title: "Launch!",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-002-todo-002",
      columnId: "col-board-002-todo",
      title: "Share on Show HN",
      description: "",
      order: 1,
      subtasks: [
        {
          id: "sub-task-col-board-002-todo-002-001",
          title: "Draft out HN post",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-002-todo-002-002",
          title: "Get feedback and refine",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-002-todo-002-003",
          title: "Publish post",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-002-todo-003",
      columnId: "col-board-002-todo",
      title: "Write launch article to publish on multiple channels",
      description: "",
      order: 2,
      subtasks: [
        {
          id: "sub-task-col-board-002-todo-003-001",
          title: "Write article",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-002-todo-003-002",
          title: "Publish on LinkedIn",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-002-todo-003-003",
          title: "Publish on Inndie Hackers",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-002-todo-003-004",
          title: "Publish on Medium",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-003-now-001",
      columnId: "col-board-003-now",
      title: "Launch version one",
      description: "",
      order: 0,
      subtasks: [
        {
          id: "sub-task-col-board-003-now-001-001",
          title: "Launch privately to our waitlist",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-003-now-001-002",
          title: "Launch publicly on PH, HN, etc.",
          isCompleted: false,
        },
      ],
    },
    {
      id: "task-col-board-003-now-002",
      columnId: "col-board-003-now",
      title: "Review early feedback and plan next steps for roadmap",
      description:
        "Beyond the initial launch, we're keeping the initial roadmap completely empty. This meeting will help us plan out our next steps based on actual customer feedback.",
      order: 1,
      subtasks: [
        {
          id: "sub-task-col-board-003-now-002-001",
          title: "Interview 10 customers",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-003-now-002-002",
          title: "Review common customer pain points and suggestions",
          isCompleted: false,
        },
        {
          id: "sub-task-col-board-003-now-002-003",
          title: "Outline next steps for our roadmap",
          isCompleted: false,
        },
      ],
    },
  ],
};

async function main() {
  const seedUserId = randomUUID();

  const boardMap = new Map<string, string>();
  const boardData: Prisma.BoardCreateManyInput[] = seedData.boards.map(
    (board) => {
      const newId = randomUUID();
      boardMap.set(board.id, newId);
      return {
        id: newId,
        name: board.name,
        isActive: board.isActive,
        ownerId: seedUserId,
      };
    },
  );

  const columnMap = new Map<string, string>();
  const columnData: Prisma.ColumnCreateManyInput[] = seedData.columns.map(
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
    },
  );

  const taskMap = new Map<string, string>();
  const taskData: Prisma.TaskCreateManyInput[] = seedData.tasks.map((task) => {
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

  const subtaskData: Prisma.SubtaskCreateManyInput[] = seedData.tasks.flatMap(
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
      }),
  );

  const boardMemberData: Prisma.BoardMemberCreateManyInput[] =
    seedData.boards.map((board) => {
      const boardId = boardMap.get(board.id);
      if (!boardId) {
        throw new Error(`Board not found for board member ${board.id}`);
      }
      return {
        role: BoardRole.OWNER,
        userId: seedUserId,
        boardId,
      };
    });

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
