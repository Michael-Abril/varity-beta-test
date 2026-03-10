export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  owner: string;
  members: string[];
  dueDate: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  avatarUrl?: string;
  joinedAt: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  // Preferences
  theme: 'light' | 'dark' | 'system';
  email_notifications: boolean;
  marketing_emails: boolean;
  product_updates: boolean;
  date_format: string;
  timezone: string;
  language: string;
  dashboard_layout: 'comfortable' | 'compact';
  // Security
  two_factor_enabled: boolean;
  // Privacy
  analytics_enabled: boolean;
  cookies_enabled: boolean;
  // Timestamps
  updated_at: string;
}
