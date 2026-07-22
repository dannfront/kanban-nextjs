export const messages = {
  board: {
    create: {
      success: "Board created",
      error: "Error creating board",
    },
    update: {
      success: "Board updated",
      error: "Failed to update board",
    },
    delete: {
      success: "Board deleted",
      error: "Error deleting board",
    },
  },
  column: {
    delete: {
      success: "Column deleted",
      error: "Failed to delete column",
    },
  },
  task: {
    create: {
      success: "Task created",
      error: "Error creating task",
    },
    update: {
      success: "Task updated",
      error: "Failed to update task",
    },
    move: {
      success: "Task moved",
      error: "Failed to move task",
    },
    reorder: {
      error: "Failed to reorder tasks. Order restored.",
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
      userExists:
        "That user or email already exists. Please use another email.",
    },
  },
  signout: {
    success: "User signed out",
    error: "Error signing out",
  },
} as const;
