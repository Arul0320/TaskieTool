export type UserRole = 'Admin' | 'Manager' | 'Employee';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatarColor: string;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  createdBy: string; // User ID
  members: string[]; // User IDs
}

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  isFavorite: boolean;
  listOrder: string[]; // List of column IDs in order
}

export interface List {
  id: string;
  boardId: string;
  name: string;
  order: number;
}

export type CardPriority = 'Low' | 'Medium' | 'High';

export interface ChecklistItem {
  id: string;
  text: string;
  isDone: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string; // Can be base64 or data URL
  uploadedAt: string;
}

export interface ActivityLog {
  id: string;
  text: string;
  userId: string;
  createdAt: string;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD or empty
  priority: CardPriority;
  assigneeId: string; // User ID
  labels: string[];
  checklist: ChecklistItem[];
  comments: Comment[];
  attachments: Attachment[];
  activityHistory: ActivityLog[];
  order: number;
}

export interface DashboardStats {
  totalBoards: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  recentActivity: {
    id: string;
    text: string;
    boardName: string;
    userName: string;
    createdAt: string;
  }[];
}
