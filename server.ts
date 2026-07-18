import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  User, 
  Workspace, 
  Board, 
  List, 
  Card, 
  UserRole, 
  CardPriority,
  ChecklistItem,
  Comment,
  Attachment,
  ActivityLog,
  DashboardStats
} from "./src/types.js";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper helper functions to read and write database
interface DatabaseSchema {
  users: User[];
  workspaces: Workspace[];
  boards: Board[];
  lists: List[];
  cards: Card[];
  globalLogs: {
    id: string;
    text: string;
    boardName: string;
    userName: string;
    createdAt: string;
  }[];
}

const DEFAULT_USERS: User[] = [
  {
    id: "user-1",
    username: "Alice Admin",
    email: "admin@company.com",
    role: "Admin",
    avatarColor: "#ef4444",
    joinedAt: "2026-01-10T12:00:00Z"
  },
  {
    id: "user-2",
    username: "Bob Manager",
    email: "manager@company.com",
    role: "Manager",
    avatarColor: "#3b82f6",
    joinedAt: "2026-02-15T14:30:00Z"
  },
  {
    id: "user-3",
    username: "Charlie Employee",
    email: "employee@company.com",
    role: "Employee",
    avatarColor: "#10b981",
    joinedAt: "2026-03-01T09:15:00Z"
  },
  {
    id: "user-4",
    username: "Dana Developer",
    email: "developer@company.com",
    role: "Employee",
    avatarColor: "#f59e0b",
    joinedAt: "2026-04-10T10:00:00Z"
  }
];

function initializeDb(): DatabaseSchema {
  const users = [...DEFAULT_USERS];
  
  const workspaces: Workspace[] = [
    {
      id: "workspace-1",
      name: "Product & Engineering",
      description: "Development, roadmaps, and release tasks for our core software products.",
      createdBy: "user-1",
      members: ["user-1", "user-2", "user-3", "user-4"]
    },
    {
      id: "workspace-2",
      name: "Marketing & Growth",
      description: "Campaign design, content planning, and user acquisition workflows.",
      createdBy: "user-2",
      members: ["user-1", "user-2", "user-3"]
    }
  ];

  const boards: Board[] = [
    {
      id: "board-1",
      workspaceId: "workspace-1",
      name: "SaaS Launch Kanban",
      description: "Main development pipeline for launching our next-gen subscription portal.",
      isFavorite: true,
      listOrder: ["list-1-1", "list-1-2", "list-1-3", "list-1-4"]
    },
    {
      id: "board-2",
      workspaceId: "workspace-1",
      name: "Mobile App Backlog",
      description: "Feature refinement, UI enhancements, and patch releases for Android & iOS.",
      isFavorite: false,
      listOrder: ["list-2-1", "list-2-2", "list-2-3", "list-2-4"]
    },
    {
      id: "board-3",
      workspaceId: "workspace-2",
      name: "Q3 Campaign Launch",
      description: "Coordinating visuals, press releases, social media schedules, and newsletters.",
      isFavorite: true,
      listOrder: ["list-3-1", "list-3-2", "list-3-3", "list-3-4"]
    }
  ];

  const lists: List[] = [
    // Board 1 Columns
    { id: "list-1-1", boardId: "board-1", name: "📋 To Do", order: 0 },
    { id: "list-1-2", boardId: "board-1", name: "🚀 In Progress", order: 1 },
    { id: "list-1-3", boardId: "board-1", name: "👀 Review", order: 2 },
    { id: "list-1-4", boardId: "board-1", name: "✅ Done", order: 3 },

    // Board 2 Columns
    { id: "list-2-1", boardId: "board-2", name: "📋 To Do", order: 0 },
    { id: "list-2-2", boardId: "board-2", name: "🚀 In Progress", order: 1 },
    { id: "list-2-2-rev", boardId: "board-2", name: "👀 Review", order: 2 },
    { id: "list-2-2-done", boardId: "board-2", name: "✅ Done", order: 3 },

    // Board 3 Columns
    { id: "list-3-1", boardId: "board-3", name: "📋 To Do", order: 0 },
    { id: "list-3-2", boardId: "board-3", name: "🚀 In Progress", order: 1 },
    { id: "list-3-3", boardId: "board-3", name: "👀 Review", order: 2 },
    { id: "list-3-4", boardId: "board-3", name: "✅ Done", order: 3 }
  ];

  const cards: Card[] = [
    {
      id: "card-1-1",
      listId: "list-1-1",
      title: "Design user registration UI wireframes",
      description: "Mock up modern desktop and mobile registration interfaces. Include validation prompts, terms of service checkboxes, and clear headings.",
      dueDate: "2026-07-20",
      priority: "Medium",
      assigneeId: "user-4",
      labels: ["Design", "Auth"],
      checklist: [
        { id: "check-1-1-1", text: "Create typography rules and responsive margins", isDone: true },
        { id: "check-1-1-2", text: "Review contrast ratios for accessibility", isDone: false },
        { id: "check-1-1-3", text: "Verify mobile viewports", isDone: false }
      ],
      comments: [
        { id: "comm-1-1-1", userId: "user-2", text: "Let's use Space Grotesk for headings and Inter for body text.", createdAt: "2026-07-15T09:00:00Z" }
      ],
      attachments: [],
      activityHistory: [
        { id: "act-1-1-1", text: "Task created by Alice Admin", userId: "user-1", createdAt: "2026-07-14T08:00:00Z" },
        { id: "act-1-1-2", text: "Assigned to Dana Developer", userId: "user-1", createdAt: "2026-07-14T08:05:00Z" }
      ],
      order: 0
    },
    {
      id: "card-1-2",
      listId: "list-1-1",
      title: "Write API schema documentation",
      description: "Map out the REST endpoints for lists, boards, and workspaces. Document response schemas, parameters, and error codes.",
      dueDate: "2026-07-24",
      priority: "Low",
      assigneeId: "user-3",
      labels: ["Docs", "Backend"],
      checklist: [],
      comments: [],
      attachments: [],
      activityHistory: [
        { id: "act-1-2-1", text: "Task created by Bob Manager", userId: "user-2", createdAt: "2026-07-15T10:15:00Z" }
      ],
      order: 1
    },
    {
      id: "card-1-3",
      listId: "list-1-2",
      title: "Implement session-based authentication",
      description: "Set up security session handlers on Express server. Add cookies support, password comparison, and role validation middleware.",
      dueDate: "2026-07-18",
      priority: "High",
      assigneeId: "user-4",
      labels: ["Backend", "Security"],
      checklist: [
        { id: "check-1-3-1", text: "Configure environment validation helper functions", isDone: true },
        { id: "check-1-3-2", text: "Set up login route", isDone: true },
        { id: "check-1-3-3", text: "Set up register route", isDone: true },
        { id: "check-1-3-4", text: "Verify token encryption and expiration", isDone: false }
      ],
      comments: [
        { id: "comm-1-3-1", userId: "user-1", text: "High priority! We need this ready for employee tests on Monday.", createdAt: "2026-07-16T11:00:00Z" },
        { id: "comm-1-3-2", userId: "user-4", text: "Working on it today. Login/Register endpoints are functional.", createdAt: "2026-07-16T14:20:00Z" }
      ],
      attachments: [],
      activityHistory: [
        { id: "act-1-3-1", text: "Task created by Alice Admin", userId: "user-1", createdAt: "2026-07-15T09:00:00Z" },
        { id: "act-1-3-2", text: "Moved to In Progress", userId: "user-4", createdAt: "2026-07-16T10:15:00Z" }
      ],
      order: 0
    },
    {
      id: "card-1-4",
      listId: "list-1-3",
      title: "Create primary dashboard analytics",
      description: "Aggregate board, task completion ratios, overdue calculations, and activity logs. Present data beautifully in custom widgets.",
      dueDate: "2026-07-16",
      priority: "Medium",
      assigneeId: "user-2",
      labels: ["Frontend", "Analytics"],
      checklist: [
        { id: "check-1-4-1", text: "Design widget structures with Tailwind", isDone: true },
        { id: "check-1-4-2", text: "Integrate dashboard state hook and fetch API", isDone: true }
      ],
      comments: [],
      attachments: [],
      activityHistory: [
        { id: "act-1-4-1", text: "Task created by Bob Manager", userId: "user-2", createdAt: "2026-07-13T10:00:00Z" },
        { id: "act-1-4-2", text: "Moved to Review", userId: "user-2", createdAt: "2026-07-16T16:00:00Z" }
      ],
      order: 0
    },
    {
      id: "card-1-5",
      listId: "list-1-4",
      title: "Bootstrap TypeScript workspace skeleton",
      description: "Set up the Vite, Express, and Tailwind project directories. Configure paths, TypeScript config settings, and simple dev builds.",
      dueDate: "2026-07-15",
      priority: "High",
      assigneeId: "user-1",
      labels: ["Backend", "Frontend"],
      checklist: [],
      comments: [
        { id: "comm-1-5-1", userId: "user-3", text: "Excellent setup! Build script resolves without errors.", createdAt: "2026-07-15T15:00:00Z" }
      ],
      attachments: [],
      activityHistory: [
        { id: "act-1-5-1", text: "Task created by Alice Admin", userId: "user-1", createdAt: "2026-07-12T09:00:00Z" },
        { id: "act-1-5-2", text: "Moved to Done", userId: "user-1", createdAt: "2026-07-15T14:00:00Z" }
      ],
      order: 0
    }
  ];

  const globalLogs = [
    {
      id: "log-1",
      text: "created SaaS Launch Kanban board",
      boardName: "SaaS Launch Kanban",
      userName: "Alice Admin",
      createdAt: "2026-07-14T08:00:00Z"
    },
    {
      id: "log-2",
      text: "moved 'Create primary dashboard analytics' to Review",
      boardName: "SaaS Launch Kanban",
      userName: "Bob Manager",
      createdAt: "2026-07-16T16:00:00Z"
    },
    {
      id: "log-3",
      text: "completed 'Bootstrap TypeScript workspace skeleton'",
      boardName: "SaaS Launch Kanban",
      userName: "Alice Admin",
      createdAt: "2026-07-15T14:00:00Z"
    }
  ];

  return { users, workspaces, boards, lists, cards, globalLogs };
}

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = initializeDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, returning default:", err);
    return initializeDb();
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to database:", err);
  }
}

// ------------------------------------------
// API ENDPOINTS
// ------------------------------------------

// 1. AUTHENTICATION & USERS
// For simplicity, we manage sessions on server side with a simple activeSession map or user lookup
let currentSessionUser: User | null = null;

app.get("/api/auth/me", (req, res) => {
  res.json({ user: currentSessionUser });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = readDb();
  
  // Find user by email (case-insensitive)
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (user) {
    currentSessionUser = user;
    res.json({ success: true, user });
  } else {
    // If not found, let's look up if they want to enter password (mock verification)
    res.status(401).json({ error: "Invalid credentials. Try 'admin@company.com' or another team email." });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { username, email, role } = req.body;
  if (!username || !email) {
    return res.status(400).json({ error: "Username and email are required" });
  }

  const db = readDb();
  const exists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "User with this email already exists" });
  }

  // Assign random attractive avatar color
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser: User = {
    id: `user-${Date.now()}`,
    username,
    email,
    role: (role as UserRole) || "Employee",
    avatarColor,
    joinedAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  currentSessionUser = newUser;
  res.status(201).json({ success: true, user: newUser });
});

app.post("/api/auth/logout", (req, res) => {
  currentSessionUser = null;
  res.json({ success: true });
});

app.get("/api/users", (req, res) => {
  const db = readDb();
  res.json({ users: db.users });
});

app.post("/api/users/invite", (req, res) => {
  const { workspaceId, userId } = req.body;
  const db = readDb();
  const workspace = db.workspaces.find(w => w.id === workspaceId);
  
  if (!workspace) {
    return res.status(404).json({ error: "Workspace not found" });
  }

  if (workspace.members.includes(userId)) {
    return res.status(400).json({ error: "User is already a member of this workspace" });
  }

  workspace.members.push(userId);
  writeDb(db);

  res.json({ success: true, workspace });
});

// 2. WORKSPACES
app.get("/api/workspaces", (req, res) => {
  const db = readDb();
  // Filter workspaces the current user is member of
  const userId = currentSessionUser?.id || "user-1";
  const userWorkspaces = db.workspaces.filter(w => w.members.includes(userId));
  res.json({ workspaces: userWorkspaces });
});

app.post("/api/workspaces", (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const userId = currentSessionUser?.id || "user-1";
  const db = readDb();

  const newWorkspace: Workspace = {
    id: `workspace-${Date.now()}`,
    name,
    description: description || "",
    createdBy: userId,
    members: [userId]
  };

  db.workspaces.push(newWorkspace);
  writeDb(db);

  res.status(201).json({ workspace: newWorkspace });
});

// 3. BOARDS
app.get("/api/boards", (req, res) => {
  const { workspaceId } = req.query;
  const db = readDb();
  
  let boards = db.boards;
  if (workspaceId) {
    boards = boards.filter(b => b.workspaceId === workspaceId);
  }
  res.json({ boards });
});

app.post("/api/boards", (req, res) => {
  const { workspaceId, name, description } = req.body;
  if (!workspaceId || !name) {
    return res.status(400).json({ error: "Workspace ID and Board name are required" });
  }

  const db = readDb();

  // Create four default columns automatically
  const boardId = `board-${Date.now()}`;
  const listIds = [`list-${boardId}-todo`, `list-${boardId}-progress`, `list-${boardId}-review`, `list-${boardId}-done`];
  
  const defaultLists: List[] = [
    { id: listIds[0], boardId, name: "📋 To Do", order: 0 },
    { id: listIds[1], boardId, name: "🚀 In Progress", order: 1 },
    { id: listIds[2], boardId, name: "👀 Review", order: 2 },
    { id: listIds[3], boardId, name: "✅ Done", order: 3 }
  ];

  db.lists.push(...defaultLists);

  const newBoard: Board = {
    id: boardId,
    workspaceId,
    name,
    description: description || "",
    isFavorite: false,
    listOrder: listIds
  };

  db.boards.push(newBoard);

  // Add global activity log
  const userName = currentSessionUser?.username || "Someone";
  db.globalLogs.unshift({
    id: `log-${Date.now()}`,
    text: `created board '${name}'`,
    boardName: name,
    userName: userName,
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.status(201).json({ board: newBoard, lists: defaultLists });
});

app.put("/api/boards/:id", (req, res) => {
  const { name, description, isFavorite } = req.body;
  const db = readDb();
  const board = db.boards.find(b => b.id === req.params.id);

  if (!board) return res.status(404).json({ error: "Board not found" });

  if (name !== undefined) board.name = name;
  if (description !== undefined) board.description = description;
  if (isFavorite !== undefined) board.isFavorite = isFavorite;

  writeDb(db);
  res.json({ board });
});

app.delete("/api/boards/:id", (req, res) => {
  const db = readDb();
  const boardIndex = db.boards.findIndex(b => b.id === req.params.id);

  if (boardIndex === -1) return res.status(404).json({ error: "Board not found" });

  const boardName = db.boards[boardIndex].name;
  db.boards.splice(boardIndex, 1);

  // Clean up all related lists and cards
  db.lists = db.lists.filter(l => l.boardId !== req.params.id);
  
  // Find list IDs to clean cards
  const relatedListIds = db.lists.filter(l => l.boardId === req.params.id).map(l => l.id);
  db.cards = db.cards.filter(c => !relatedListIds.includes(c.listId));

  // Add activity log
  db.globalLogs.unshift({
    id: `log-${Date.now()}`,
    text: `deleted board '${boardName}'`,
    boardName: boardName,
    userName: currentSessionUser?.username || "Someone",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true });
});

// Reorder lists of a board
app.put("/api/boards/:id/reorder-lists", (req, res) => {
  const { listOrder } = req.body; // array of listIds
  if (!Array.isArray(listOrder)) return res.status(400).json({ error: "Invalid listOrder" });

  const db = readDb();
  const board = db.boards.find(b => b.id === req.params.id);

  if (!board) return res.status(404).json({ error: "Board not found" });

  board.listOrder = listOrder;

  // Also update individual list order numbers
  listOrder.forEach((listId, idx) => {
    const list = db.lists.find(l => l.id === listId);
    if (list) list.order = idx;
  });

  writeDb(db);
  res.json({ success: true, listOrder });
});

// 4. LISTS (COLUMNS)
app.get("/api/boards/:boardId/lists", (req, res) => {
  const db = readDb();
  const board = db.boards.find(b => b.id === req.params.boardId);
  if (!board) return res.status(404).json({ error: "Board not found" });

  const boardLists = db.lists.filter(l => l.boardId === req.params.boardId);
  
  // Sort according to board's listOrder
  const sortedLists = [...boardLists].sort((a, b) => {
    const aIdx = board.listOrder.indexOf(a.id);
    const bIdx = board.listOrder.indexOf(b.id);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  res.json({ lists: sortedLists });
});

app.post("/api/lists", (req, res) => {
  const { boardId, name } = req.body;
  if (!boardId || !name) return res.status(400).json({ error: "Board ID and List name are required" });

  const db = readDb();
  const board = db.boards.find(b => b.id === boardId);
  if (!board) return res.status(404).json({ error: "Board not found" });

  const newListId = `list-${Date.now()}`;
  const newList: List = {
    id: newListId,
    boardId,
    name,
    order: board.listOrder.length
  };

  db.lists.push(newList);
  board.listOrder.push(newListId);

  writeDb(db);
  res.status(201).json({ list: newList });
});

app.put("/api/lists/:id", (req, res) => {
  const { name } = req.body;
  const db = readDb();
  const list = db.lists.find(l => l.id === req.params.id);

  if (!list) return res.status(404).json({ error: "List not found" });

  if (name !== undefined) list.name = name;

  writeDb(db);
  res.json({ list });
});

app.delete("/api/lists/:id", (req, res) => {
  const db = readDb();
  const listIndex = db.lists.findIndex(l => l.id === req.params.id);

  if (listIndex === -1) return res.status(404).json({ error: "List not found" });

  const list = db.lists[listIndex];
  const boardId = list.boardId;

  // Delete list
  db.lists.splice(listIndex, 1);

  // Delete related cards
  db.cards = db.cards.filter(c => c.listId !== req.params.id);

  // Update board's listOrder
  const board = db.boards.find(b => b.id === boardId);
  if (board) {
    board.listOrder = board.listOrder.filter(id => id !== req.params.id);
  }

  writeDb(db);
  res.json({ success: true });
});

// 5. CARDS (TASKS)
app.get("/api/cards", (req, res) => {
  const { boardId } = req.query;
  const db = readDb();

  let cards = db.cards;
  if (boardId) {
    const boardLists = db.lists.filter(l => l.boardId === boardId).map(l => l.id);
    cards = cards.filter(c => boardLists.includes(c.listId));
  }

  // Sort by order
  cards.sort((a, b) => a.order - b.order);

  res.json({ cards });
});

app.post("/api/cards", (req, res) => {
  const { listId, title, description, dueDate, priority, assigneeId, labels } = req.body;
  if (!listId || !title) return res.status(400).json({ error: "List ID and card title are required" });

  const db = readDb();
  const list = db.lists.find(l => l.id === listId);
  if (!list) return res.status(404).json({ error: "List not found" });

  const board = db.boards.find(b => b.id === list.boardId);
  const boardName = board ? board.name : "Board";

  // Count existing cards in this list
  const listCardsCount = db.cards.filter(c => c.listId === listId).length;

  const currentUserId = currentSessionUser?.id || "user-1";
  const currentUserName = currentSessionUser?.username || "Someone";

  const newCard: Card = {
    id: `card-${Date.now()}`,
    listId,
    title,
    description: description || "",
    dueDate: dueDate || "",
    priority: (priority as CardPriority) || "Medium",
    assigneeId: assigneeId || "",
    labels: labels || [],
    checklist: [],
    comments: [],
    attachments: [],
    activityHistory: [
      {
        id: `act-${Date.now()}`,
        text: `Task created by ${currentUserName}`,
        userId: currentUserId,
        createdAt: new Date().toISOString()
      }
    ],
    order: listCardsCount
  };

  db.cards.push(newCard);

  // Add to global logs
  db.globalLogs.unshift({
    id: `log-${Date.now()}`,
    text: `created task '${title}' in column '${list.name}'`,
    boardName,
    userName: currentUserName,
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.status(201).json({ card: newCard });
});

app.put("/api/cards/:id", (req, res) => {
  const { title, description, dueDate, priority, assigneeId, labels } = req.body;
  const db = readDb();
  const card = db.cards.find(c => c.id === req.params.id);

  if (!card) return res.status(404).json({ error: "Card not found" });

  const currentUserId = currentSessionUser?.id || "user-1";
  const currentUserName = currentSessionUser?.username || "Someone";

  const logs: string[] = [];

  if (title !== undefined && title !== card.title) {
    logs.push(`renamed task to '${title}'`);
    card.title = title;
  }
  if (description !== undefined && description !== card.description) {
    logs.push("updated description");
    card.description = description;
  }
  if (dueDate !== undefined && dueDate !== card.dueDate) {
    logs.push(`changed due date to ${dueDate || "none"}`);
    card.dueDate = dueDate;
  }
  if (priority !== undefined && priority !== card.priority) {
    logs.push(`updated priority to ${priority}`);
    card.priority = priority;
  }
  if (assigneeId !== undefined && assigneeId !== card.assigneeId) {
    const user = db.users.find(u => u.id === assigneeId);
    logs.push(`assigned task to ${user ? user.username : "Unassigned"}`);
    card.assigneeId = assigneeId;
  }
  if (labels !== undefined) {
    logs.push("updated labels");
    card.labels = labels;
  }

  // Create card activity entries
  logs.forEach(logText => {
    card.activityHistory.push({
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: logText,
      userId: currentUserId,
      createdAt: new Date().toISOString()
    });
  });

  writeDb(db);
  res.json({ card });
});

app.delete("/api/cards/:id", (req, res) => {
  const db = readDb();
  const index = db.cards.findIndex(c => c.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: "Card not found" });

  const card = db.cards[index];
  const list = db.lists.find(l => l.id === card.listId);
  const board = list ? db.boards.find(b => b.id === list.boardId) : null;
  const boardName = board ? board.name : "Board";

  db.cards.splice(index, 1);

  // Add global log
  db.globalLogs.unshift({
    id: `log-${Date.now()}`,
    text: `deleted task '${card.title}'`,
    boardName,
    userName: currentSessionUser?.username || "Someone",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true });
});

// Card movement drag and drop & reordering
app.put("/api/cards/reorder", (req, res) => {
  const { cardId, targetListId, targetIndex } = req.body;
  if (!cardId || !targetListId === undefined || targetIndex === undefined) {
    return res.status(400).json({ error: "cardId, targetListId, and targetIndex are required" });
  }

  const db = readDb();
  const card = db.cards.find(c => c.id === cardId);

  if (!card) return res.status(404).json({ error: "Card not found" });

  const oldListId = card.listId;
  const oldList = db.lists.find(l => l.id === oldListId);
  const targetList = db.lists.find(l => l.id === targetListId);

  if (!targetList) return res.status(404).json({ error: "Target list not found" });

  const currentUserId = currentSessionUser?.id || "user-1";
  const currentUserName = currentSessionUser?.username || "Someone";

  // If columns changed, record activity
  if (oldListId !== targetListId) {
    const oldListName = oldList ? oldList.name : "previous column";
    const targetListName = targetList.name;
    
    card.listId = targetListId;
    card.activityHistory.push({
      id: `act-${Date.now()}`,
      text: `moved task from '${oldListName}' to '${targetListName}'`,
      userId: currentUserId,
      createdAt: new Date().toISOString()
    });

    // Global log
    const board = db.boards.find(b => b.id === targetList.boardId);
    db.globalLogs.unshift({
      id: `log-${Date.now()}`,
      text: `moved '${card.title}' from '${oldListName}' to '${targetListName}'`,
      boardName: board ? board.name : "Board",
      userName: currentUserName,
      createdAt: new Date().toISOString()
    });
  }

  // Get and sort card list for the source column
  const oldListCards = db.cards.filter(c => c.listId === oldListId && c.id !== cardId).sort((a, b) => a.order - b.order);
  oldListCards.forEach((c, idx) => {
    c.order = idx;
  });

  // Get and sort card list for target column
  const targetListCards = db.cards.filter(c => c.listId === targetListId && c.id !== cardId).sort((a, b) => a.order - b.order);
  
  // Insert card at the targetIndex
  targetListCards.splice(targetIndex, 0, card);
  targetListCards.forEach((c, idx) => {
    c.order = idx;
  });

  writeDb(db);
  res.json({ success: true });
});

// Card Checklist item endpoints
app.post("/api/cards/:id/checklist", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  const db = readDb();
  const card = db.cards.find(c => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: "Card not found" });

  const newItem: ChecklistItem = {
    id: `check-${Date.now()}`,
    text,
    isDone: false
  };

  card.checklist.push(newItem);
  card.activityHistory.push({
    id: `act-${Date.now()}`,
    text: `added checklist item: '${text}'`,
    userId: currentSessionUser?.id || "user-1",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.status(201).json({ item: newItem, card });
});

app.put("/api/cards/:id/checklist/:itemId", (req, res) => {
  const { text, isDone } = req.body;
  const db = readDb();
  const card = db.cards.find(c => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: "Card not found" });

  const item = card.checklist.find(i => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ error: "Checklist item not found" });

  if (text !== undefined) item.text = text;
  if (isDone !== undefined) {
    item.isDone = isDone;
    card.activityHistory.push({
      id: `act-${Date.now()}`,
      text: `${isDone ? "completed" : "uncompleted"} checklist item: '${item.text}'`,
      userId: currentSessionUser?.id || "user-1",
      createdAt: new Date().toISOString()
    });
  }

  writeDb(db);
  res.json({ item, card });
});

app.delete("/api/cards/:id/checklist/:itemId", (req, res) => {
  const db = readDb();
  const card = db.cards.find(c => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: "Card not found" });

  const itemIndex = card.checklist.findIndex(i => i.id === req.params.itemId);
  if (itemIndex === -1) return res.status(404).json({ error: "Checklist item not found" });

  const text = card.checklist[itemIndex].text;
  card.checklist.splice(itemIndex, 1);
  card.activityHistory.push({
    id: `act-${Date.now()}`,
    text: `deleted checklist item: '${text}'`,
    userId: currentSessionUser?.id || "user-1",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true, card });
});

// Card Comments endpoints
app.post("/api/cards/:id/comments", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Comment text is required" });

  const db = readDb();
  const card = db.cards.find(c => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: "Card not found" });

  const newComment: Comment = {
    id: `comm-${Date.now()}`,
    userId: currentSessionUser?.id || "user-1",
    text,
    createdAt: new Date().toISOString()
  };

  card.comments.push(newComment);
  card.activityHistory.push({
    id: `act-${Date.now()}`,
    text: `added a comment: '${text.length > 30 ? text.substring(0, 30) + "..." : text}'`,
    userId: currentSessionUser?.id || "user-1",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.status(201).json({ comment: newComment, card });
});

app.delete("/api/cards/:id/comments/:commentId", (req, res) => {
  const db = readDb();
  const card = db.cards.find(c => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: "Card not found" });

  const idx = card.comments.findIndex(c => c.id === req.params.commentId);
  if (idx === -1) return res.status(404).json({ error: "Comment not found" });

  card.comments.splice(idx, 1);
  writeDb(db);
  res.json({ success: true, card });
});

// Card Attachments endpoints (uses base64 JSON payload)
app.post("/api/cards/:id/attachments", (req, res) => {
  const { name, dataUrl } = req.body;
  if (!name || !dataUrl) {
    return res.status(400).json({ error: "Attachment name and data URL are required" });
  }

  const db = readDb();
  const card = db.cards.find(c => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: "Card not found" });

  const newAttachment: Attachment = {
    id: `attach-${Date.now()}`,
    name,
    url: dataUrl,
    uploadedAt: new Date().toISOString()
  };

  card.attachments.push(newAttachment);
  card.activityHistory.push({
    id: `act-${Date.now()}`,
    text: `uploaded attachment: '${name}'`,
    userId: currentSessionUser?.id || "user-1",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.status(201).json({ attachment: newAttachment, card });
});

app.delete("/api/cards/:id/attachments/:attachmentId", (req, res) => {
  const db = readDb();
  const card = db.cards.find(c => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: "Card not found" });

  const idx = card.attachments.findIndex(a => a.id === req.params.attachmentId);
  if (idx === -1) return res.status(404).json({ error: "Attachment not found" });

  const name = card.attachments[idx].name;
  card.attachments.splice(idx, 1);
  card.activityHistory.push({
    id: `act-${Date.now()}`,
    text: `removed attachment: '${name}'`,
    userId: currentSessionUser?.id || "user-1",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true, card });
});

// 6. DASHBOARD ANALYTICS
app.get("/api/dashboard", (req, res) => {
  const db = readDb();
  
  const totalBoards = db.boards.length;
  const totalTasks = db.cards.length;
  
  // Completed tasks are defined as tasks in the column containing "Done" or order of lists
  // Let's find list IDs of columns that are named "Done" or "✅ Done"
  const doneListIds = db.lists.filter(l => l.name.toLowerCase().includes("done")).map(l => l.id);
  const completedTasks = db.cards.filter(c => doneListIds.includes(c.listId)).length;

  // Overdue tasks: cards with a due date before today that are NOT completed
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = db.cards.filter(c => {
    const isCompleted = doneListIds.includes(c.listId);
    return c.dueDate && c.dueDate < todayStr && !isCompleted;
  }).length;

  // Recent activity aggregated from global logs (limited to 10)
  const stats: DashboardStats = {
    totalBoards,
    totalTasks,
    completedTasks,
    overdueTasks,
    recentActivity: db.globalLogs.slice(0, 10)
  };

  res.json(stats);
});

// ------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// ------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode - integrate Vite dev server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Production mode - serve compiled static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static server enabled, serving:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Kanban Task Manager Backend listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch(err => {
  console.error("Failed to start application server:", err);
});
