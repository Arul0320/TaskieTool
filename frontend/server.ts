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

// Helper functions to read and write database
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

function initializeDb(): DatabaseSchema {
  return {
    users: [],
    workspaces: [],
    boards: [],
    lists: [],
    cards: [],
    globalLogs: []
  };
}

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = initializeDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(data);
    return {
      users: parsed.users || [],
      workspaces: parsed.workspaces || [],
      boards: parsed.boards || [],
      lists: parsed.lists || [],
      cards: parsed.cards || [],
      globalLogs: parsed.globalLogs || []
    };
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
let currentSessionUser: User | null = null;

app.get("/api/auth/me", (req, res) => {
  res.json({ user: currentSessionUser });
});

app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required" });
  }

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (user) {
    currentSessionUser = user;
    res.json({ success: true, user });
  } else {
    res.status(401).json({ error: "Account not found. Please verify your email or create a new account." });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { username, email, role, studentId, department } = req.body;
  if (!username || !email) {
    return res.status(400).json({ error: "Username and email are required" });
  }

  const db = readDb();
  const exists = db.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "An account with this email already exists" });
  }

  // Assign random vibrant avatar color
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1"];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newUser: User = {
    id: `user-${Date.now()}`,
    username: username.trim(),
    email: email.trim(),
    role: (role as UserRole) || "Teacher",
    avatarColor,
    joinedAt: new Date().toISOString(),
    studentId: studentId ? studentId.trim() : undefined,
    department: department ? department.trim() : undefined
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
  if (!currentSessionUser) {
    return res.json({ workspaces: [] });
  }

  const userId = currentSessionUser.id;
  // If user is Teacher, return all workspaces, otherwise return workspaces they belong to
  const userWorkspaces = currentSessionUser.role === "Teacher"
    ? db.workspaces
    : db.workspaces.filter(w => w.members.includes(userId));

  res.json({ workspaces: userWorkspaces });
});

app.post("/api/workspaces", (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Workspace name is required" });

  if (!currentSessionUser) {
    return res.status(401).json({ error: "Please log in to create a workspace" });
  }

  const userId = currentSessionUser.id;
  const db = readDb();

  const newWorkspace: Workspace = {
    id: `workspace-${Date.now()}`,
    name: name.trim(),
    description: description ? description.trim() : "",
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
  const { workspaceId, name, description, initialColumns } = req.body;
  if (!workspaceId || !name) {
    return res.status(400).json({ error: "Workspace ID and Board name are required" });
  }

  const db = readDb();
  const boardId = `board-${Date.now()}`;

  // Use dynamically provided columns, or start with default standard columns if none specified
  const columnNames = Array.isArray(initialColumns) && initialColumns.length > 0
    ? initialColumns
    : ["To Do", "In Progress", "Done"];

  const createdLists: List[] = columnNames.map((colName: string, index: number) => ({
    id: `list-${boardId}-${index}-${Date.now()}`,
    boardId,
    name: colName,
    order: index
  }));

  db.lists.push(...createdLists);

  const newBoard: Board = {
    id: boardId,
    workspaceId,
    name: name.trim(),
    description: description ? description.trim() : "",
    isFavorite: false,
    listOrder: createdLists.map(l => l.id)
  };

  db.boards.push(newBoard);

  const userName = currentSessionUser?.username || "A user";
  db.globalLogs.unshift({
    id: `log-${Date.now()}`,
    text: `created board '${newBoard.name}'`,
    boardName: newBoard.name,
    userName: userName,
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.status(201).json({ board: newBoard, lists: createdLists });
});

app.put("/api/boards/:id", (req, res) => {
  const { name, description, isFavorite } = req.body;
  const db = readDb();
  const board = db.boards.find(b => b.id === req.params.id);

  if (!board) return res.status(404).json({ error: "Board not found" });

  if (name !== undefined) board.name = name.trim();
  if (description !== undefined) board.description = description.trim();
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

  // Find related list IDs to clean lists and cards
  const relatedListIds = db.lists.filter(l => l.boardId === req.params.id).map(l => l.id);
  db.lists = db.lists.filter(l => l.boardId !== req.params.id);
  db.cards = db.cards.filter(c => !relatedListIds.includes(c.listId));

  db.globalLogs.unshift({
    id: `log-${Date.now()}`,
    text: `deleted board '${boardName}'`,
    boardName: boardName,
    userName: currentSessionUser?.username || "A user",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true });
});

app.put("/api/boards/:id/reorder-lists", (req, res) => {
  const { listOrder } = req.body;
  if (!Array.isArray(listOrder)) return res.status(400).json({ error: "Invalid listOrder" });

  const db = readDb();
  const board = db.boards.find(b => b.id === req.params.id);

  if (!board) return res.status(404).json({ error: "Board not found" });

  board.listOrder = listOrder;

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

  const sortedLists = [...boardLists].sort((a, b) => {
    const aIdx = board.listOrder.indexOf(a.id);
    const bIdx = board.listOrder.indexOf(b.id);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  res.json({ lists: sortedLists });
});

app.post("/api/lists", (req, res) => {
  const { boardId, name } = req.body;
  if (!boardId || !name) return res.status(400).json({ error: "Board ID and Column name are required" });

  const db = readDb();
  const board = db.boards.find(b => b.id === boardId);
  if (!board) return res.status(404).json({ error: "Board not found" });

  const newListId = `list-${Date.now()}`;
  const newList: List = {
    id: newListId,
    boardId,
    name: name.trim(),
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

  if (!list) return res.status(404).json({ error: "Column not found" });

  if (name !== undefined) list.name = name.trim();

  writeDb(db);
  res.json({ list });
});

app.delete("/api/lists/:id", (req, res) => {
  const db = readDb();
  const listIndex = db.lists.findIndex(l => l.id === req.params.id);

  if (listIndex === -1) return res.status(404).json({ error: "Column not found" });

  const list = db.lists[listIndex];
  const boardId = list.boardId;

  db.lists.splice(listIndex, 1);
  db.cards = db.cards.filter(c => c.listId !== req.params.id);

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

  cards.sort((a, b) => a.order - b.order);
  res.json({ cards });
});

app.post("/api/cards", (req, res) => {
  const { listId, title, description, dueDate, priority, assigneeId, labels } = req.body;
  if (!listId || !title) return res.status(400).json({ error: "Column ID and card title are required" });

  const db = readDb();
  const list = db.lists.find(l => l.id === listId);
  if (!list) return res.status(404).json({ error: "Column not found" });

  const board = db.boards.find(b => b.id === list.boardId);
  const boardName = board ? board.name : "Board";
  const listCardsCount = db.cards.filter(c => c.listId === listId).length;

  const currentUserId = currentSessionUser?.id || "anonymous";
  const currentUserName = currentSessionUser?.username || "A user";

  const newCard: Card = {
    id: `card-${Date.now()}`,
    listId,
    title: title.trim(),
    description: description ? description.trim() : "",
    dueDate: dueDate || "",
    priority: (priority as CardPriority) || "Medium",
    assigneeId: assigneeId || "",
    labels: Array.isArray(labels) ? labels : [],
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

  db.globalLogs.unshift({
    id: `log-${Date.now()}`,
    text: `created task '${newCard.title}' in column '${list.name}'`,
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

  const currentUserId = currentSessionUser?.id || "anonymous";
  const logs: string[] = [];

  if (title !== undefined && title.trim() !== card.title) {
    logs.push(`renamed task to '${title.trim()}'`);
    card.title = title.trim();
  }
  if (description !== undefined && description.trim() !== card.description) {
    logs.push("updated description");
    card.description = description.trim();
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
    card.labels = Array.isArray(labels) ? labels : [];
  }

  logs.forEach(logText => {
    card.activityHistory.push({
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

  db.globalLogs.unshift({
    id: `log-${Date.now()}`,
    text: `deleted task '${card.title}'`,
    boardName,
    userName: currentSessionUser?.username || "A user",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true });
});

// Card movement drag and drop & reordering
app.put("/api/cards/reorder", (req, res) => {
  const { cardId, targetListId, targetIndex } = req.body;
  if (!cardId || targetListId === undefined || targetIndex === undefined) {
    return res.status(400).json({ error: "cardId, targetListId, and targetIndex are required" });
  }

  const db = readDb();
  const card = db.cards.find(c => c.id === cardId);

  if (!card) return res.status(404).json({ error: "Card not found" });

  const oldListId = card.listId;
  const oldList = db.lists.find(l => l.id === oldListId);
  const targetList = db.lists.find(l => l.id === targetListId);

  if (!targetList) return res.status(404).json({ error: "Target column not found" });

  const currentUserId = currentSessionUser?.id || "anonymous";
  const currentUserName = currentSessionUser?.username || "A user";

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

    const board = db.boards.find(b => b.id === targetList.boardId);
    db.globalLogs.unshift({
      id: `log-${Date.now()}`,
      text: `moved '${card.title}' from '${oldListName}' to '${targetListName}'`,
      boardName: board ? board.name : "Board",
      userName: currentUserName,
      createdAt: new Date().toISOString()
    });
  }

  const oldListCards = db.cards.filter(c => c.listId === oldListId && c.id !== cardId).sort((a, b) => a.order - b.order);
  oldListCards.forEach((c, idx) => {
    c.order = idx;
  });

  const targetListCards = db.cards.filter(c => c.listId === targetListId && c.id !== cardId).sort((a, b) => a.order - b.order);
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
  if (!text) return res.status(400).json({ error: "Checklist text is required" });

  const db = readDb();
  const card = db.cards.find(c => c.id === req.params.id);
  if (!card) return res.status(404).json({ error: "Card not found" });

  const newItem: ChecklistItem = {
    id: `check-${Date.now()}`,
    text: text.trim(),
    isDone: false
  };

  card.checklist.push(newItem);
  card.activityHistory.push({
    id: `act-${Date.now()}`,
    text: `added checklist item: '${newItem.text}'`,
    userId: currentSessionUser?.id || "anonymous",
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

  if (text !== undefined) item.text = text.trim();
  if (isDone !== undefined) {
    item.isDone = isDone;
    card.activityHistory.push({
      id: `act-${Date.now()}`,
      text: `${isDone ? "completed" : "uncompleted"} checklist item: '${item.text}'`,
      userId: currentSessionUser?.id || "anonymous",
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
    userId: currentSessionUser?.id || "anonymous",
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
    userId: currentSessionUser?.id || "anonymous",
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  card.comments.push(newComment);
  card.activityHistory.push({
    id: `act-${Date.now()}`,
    text: `added a comment: '${newComment.text.length > 30 ? newComment.text.substring(0, 30) + "..." : newComment.text}'`,
    userId: currentSessionUser?.id || "anonymous",
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

// Card Attachments endpoints
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
    name: name.trim(),
    url: dataUrl,
    uploadedAt: new Date().toISOString()
  };

  card.attachments.push(newAttachment);
  card.activityHistory.push({
    id: `act-${Date.now()}`,
    text: `uploaded attachment: '${newAttachment.name}'`,
    userId: currentSessionUser?.id || "anonymous",
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
    userId: currentSessionUser?.id || "anonymous",
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  res.json({ success: true, card });
});

// 6. DASHBOARD ANALYTICS
app.get("/api/dashboard", (req, res) => {
  const db = readDb();

  const totalWorkspaces = db.workspaces.length;
  const totalBoards = db.boards.length;
  const totalTasks = db.cards.length;

  const doneListIds = db.lists
    .filter(l => l.name.toLowerCase().includes("done") || l.name.toLowerCase().includes("complete"))
    .map(l => l.id);
  const completedTasks = db.cards.filter(c => doneListIds.includes(c.listId)).length;

  const stats: DashboardStats = {
    totalWorkspaces,
    totalBoards,
    totalTasks,
    completedTasks,
    recentActivity: db.globalLogs.slice(0, 10)
  };

  res.json(stats);
});

// ------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// ------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static server enabled, serving:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dynamic Kanban Task Manager Backend listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch(err => {
  console.error("Failed to start application server:", err);
});
