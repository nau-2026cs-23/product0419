export type TaskSource = 'manual' | 'system';
export type TaskCategory = 'exam' | 'registration' | 'homework' | 'competition' | 'other';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  deadline: string;
  source: TaskSource;
  category: TaskCategory;
  status: TaskStatus;
  tag?: string;
  isArchived?: boolean;
  createdAt: string;
}

export interface SystemExam {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  date: string;
  type: 'exam' | 'registration' | 'competition';
  category: 'language' | 'skill' | 'competition';
  isEnabled: boolean;
  description?: string;
  registrationUrl?: string;
}

export interface FeedbackForm {
  type: 'suggestion' | 'error';
  content: string;
  contact?: string;
}

export interface AppSettings {
  systemRemindersEnabled: boolean;
  pushNotificationsEnabled: boolean;
  theme: 'purple' | 'teal' | 'gray';
}

export type NavTab = 'home' | 'calendar' | 'stats' | 'settings' | 'admin';
export type FilterTab = 'all' | 'week' | 'exam' | 'registration' | 'homework' | 'competition' | 'history';

export interface SystemUser {
  id: string;
  username: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Feedback {
  id: string;
  userId: string;
  username: string;
  type: 'suggestion' | 'error';
  content: string;
  contact?: string;
  status: 'pending' | 'processed';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}
