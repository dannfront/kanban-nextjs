export const messages = {
  board: {
    create: {
      success: "Board created",
      error: "Error creating board",
    },
    delete: {
      success: "Board deleted",
      error: "Error deleting board",
    },
  },
  task: {
    create: {
      success: "Task created",
      error: "Error creating task",
    },
    delete: {
      success: "Task deleted",
      error: "Error deleting task",
    },
  },
  auth: {
    login: {
      error: "Error signing in",
    },
    signup: {
      error: "Error creating account",
    },
  },
  singout: {
    success: "User signed out",
    error: "Error signing out",
  },
} as const;
