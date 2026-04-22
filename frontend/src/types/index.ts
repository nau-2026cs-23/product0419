export type TaskSource = 'manual' | 'system';
export type TaskCategory = 'exam' | 'registration' | 'homework' | 'other';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  deadline: string; // ISO date string
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
  date: string; // ISO date string
  type: 'exam' | 'registration';
  category: 'language' | 'skill';
  isEnabled: boolean;
  description?: string; // 考试简介
  registrationUrl?: string; // 报名网址
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

export type NavTab = 'home' | 'calendar' | 'stats' | 'settings';
export type FilterTab = 'all' | 'week' | 'exam' | 'registration' | 'homework' | 'history';
