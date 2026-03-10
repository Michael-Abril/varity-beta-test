/**
 * Dashboard Service
 *
 * Centralized service for dashboard-related API calls.
 * Provides type-safe interfaces and error handling.
 */

import type { Project, Task, TeamMember } from '@/types';

// ============================================================================
// Type Definitions
// ============================================================================

export interface KPIMetric {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  trend?: 'up' | 'down' | 'neutral';
  sparklineData?: number[];
}

export interface KPIResponse {
  kpis: KPIMetric[];
  has_data: boolean;
  last_updated: string;
}

export interface Activity {
  id: string;
  type: 'project_created' | 'task_completed' | 'member_added' | 'comment_added';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

export interface ActivityResponse {
  activities: Activity[];
  total_count: number;
  has_more: boolean;
}

export interface ProjectResponse {
  projects: Project[];
  total_count: number;
  active_count: number;
}

export interface TaskResponse {
  tasks: Task[];
  total_count: number;
  completed_count: number;
  by_status: {
    todo: number;
    in_progress: number;
    done: number;
  };
}

export interface TeamMemberResponse {
  members: TeamMember[];
  total_count: number;
  roles: {
    owner: number;
    admin: number;
    member: number;
    viewer: number;
  };
}

export interface DashboardOverviewResponse {
  kpis: KPIResponse;
  recent_activity: Activity[];
  projects_summary: {
    active: number;
    total: number;
    recent: Project[];
  };
  tasks_summary: {
    open: number;
    completed: number;
    completion_rate: number;
  };
  team_summary: {
    total: number;
    active: number;
  };
}

// ============================================================================
// Error Handling
// ============================================================================

export class DashboardServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DashboardServiceError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new DashboardServiceError(
      `API request failed: ${response.statusText}`,
      response.status,
      new Error(errorText)
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new DashboardServiceError(
      'Failed to parse API response',
      response.status,
      error instanceof Error ? error : undefined
    );
  }
}

// ============================================================================
// API Client
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Fetch dashboard KPIs
 */
export async function getKPIs(userId: string): Promise<KPIResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/kpis?userId=${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data
      }
    );

    return await handleResponse<KPIResponse>(response);
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to fetch KPIs',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Fetch recent activity
 */
export async function getRecentActivity(
  userId: string,
  limit: number = 10
): Promise<Activity[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/activity?userId=${encodeURIComponent(userId)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    const data = await handleResponse<ActivityResponse>(response);
    return data.activities;
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to fetch recent activity',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Fetch all projects for a user
 */
export async function getProjects(userId: string): Promise<Project[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/projects?userId=${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    const data = await handleResponse<ProjectResponse>(response);
    return data.projects;
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to fetch projects',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Fetch tasks, optionally filtered by project
 */
export async function getTasks(
  userId: string,
  projectId?: string
): Promise<Task[]> {
  try {
    const url = projectId
      ? `${API_BASE_URL}/tasks?userId=${encodeURIComponent(userId)}&projectId=${encodeURIComponent(projectId)}`
      : `${API_BASE_URL}/tasks?userId=${encodeURIComponent(userId)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await handleResponse<TaskResponse>(response);
    return data.tasks;
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to fetch tasks',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Fetch team members
 */
export async function getTeamMembers(userId: string): Promise<TeamMember[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/team?userId=${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    const data = await handleResponse<TeamMemberResponse>(response);
    return data.members;
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to fetch team members',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Fetch complete dashboard overview
 */
export async function getDashboardOverview(
  userId: string
): Promise<DashboardOverviewResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dashboard/overview?userId=${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    return await handleResponse<DashboardOverviewResponse>(response);
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to fetch dashboard overview',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Create a new project
 */
export async function createProject(
  userId: string,
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, ...data }),
    });

    return await handleResponse<Project>(response);
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to create project',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Update an existing project
 */
export async function updateProject(
  projectId: string,
  data: Partial<Project>
): Promise<Project> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await handleResponse<Project>(response);
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to update project',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new DashboardServiceError(
        `Failed to delete project: ${response.statusText}`,
        response.status
      );
    }
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to delete project',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Create a new task
 */
export async function createTask(
  userId: string,
  data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Task> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, ...data }),
    });

    return await handleResponse<Task>(response);
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to create task',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Update an existing task
 */
export async function updateTask(
  taskId: string,
  data: Partial<Task>
): Promise<Task> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await handleResponse<Task>(response);
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to update task',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new DashboardServiceError(
        `Failed to delete task: ${response.statusText}`,
        response.status
      );
    }
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to delete task',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Invite a team member
 */
export async function inviteTeamMember(
  userId: string,
  email: string,
  role: TeamMember['role']
): Promise<TeamMember> {
  try {
    const response = await fetch(`${API_BASE_URL}/team/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, email, role }),
    });

    return await handleResponse<TeamMember>(response);
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to invite team member',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Remove a team member
 */
export async function removeTeamMember(memberId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/team/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new DashboardServiceError(
        `Failed to remove team member: ${response.statusText}`,
        response.status
      );
    }
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to remove team member',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Update team member role
 */
export async function updateTeamMemberRole(
  memberId: string,
  role: TeamMember['role']
): Promise<TeamMember> {
  try {
    const response = await fetch(`${API_BASE_URL}/team/${memberId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });

    return await handleResponse<TeamMember>(response);
  } catch (error) {
    if (error instanceof DashboardServiceError) {
      throw error;
    }
    throw new DashboardServiceError(
      'Failed to update team member role',
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}
