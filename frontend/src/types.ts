export type UserRole = 'Teacher' | 'Student';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatarColor: string;
  joinedAt: string;
  studentId?: string;
  department?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  createdBy: string; // User ID
  members: string[]; // User IDs
  courseCode?: string;
  semester?: string;
}

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  isFavorite: boolean;
  listOrder: string[]; // List IDs in display order
  academicYear?: string;
}

export interface List {
  id: string;
  boardId: string;
  name: string;
  order: number;
  categoryType?: string;
}

export type CardPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type ActivityType = 'Academic' | 'Sports' | 'Volunteering' | 'Club' | 'Leadership' | 'Task' | 'Feature' | 'Bug' | 'Other';
export type ActivityStatus = 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface ChecklistItem {
  id: string;
  text: string;
  isDone: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  isAchieved: boolean;
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
  url: string; // Base64 data URL or file path
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
  dueDate?: string;
  priority?: CardPriority;
  assigneeId?: string;
  labels: string[];
  checklist: ChecklistItem[];
  comments: Comment[];
  attachments: Attachment[];
  activityHistory: ActivityLog[];
  order: number;

  // Optional extensions for academic / student activity tracking
  studentId?: string;
  activityTitle?: string;
  activityType?: ActivityType;
  status?: ActivityStatus;
  startDate?: string;
  endDate?: string;
  hoursSpent?: number;
  location?: string;
  mentor?: string;
  achievements?: Achievement[];
}

export interface DashboardStats {
  totalWorkspaces: number;
  totalBoards: number;
  totalTasks: number;
  completedTasks: number;
  totalCourses?: number;
  totalActivities?: number;
  completedActivities?: number;
  totalHours?: number;
  recentActivity: {
    id: string;
    text: string;
    boardName: string;
    userName: string;
    createdAt: string;
  }[];
}
