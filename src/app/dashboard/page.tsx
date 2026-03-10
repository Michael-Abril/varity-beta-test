'use client';

import { useRouter } from 'next/navigation';
import { useProjects, useTasks, useTeam, useCurrentUser } from '@/lib/hooks';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { APP_NAME } from '@/lib/constants';
import { FolderKanban, ListTodo, Users, ArrowRight } from 'lucide-react';

function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: 'New Project',
      description: 'Organize your work',
      icon: 'folderKanban',
      path: '/dashboard/projects',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'View Tasks',
      description: 'Track your progress',
      icon: 'listTodo',
      path: '/dashboard/tasks',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Invite Team',
      description: 'Collaborate together',
      icon: 'users',
      path: '/dashboard/team',
      color: 'bg-green-50 text-green-600',
    },
  ];

  const getIcon = (name: string) => {
    const className = "h-5 w-5";
    switch (name) {
      case 'folderKanban': return <FolderKanban className={className} />;
      case 'listTodo': return <ListTodo className={className} />;
      case 'users': return <Users className={className} />;
      default: return null;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {actions.map((action) => (
        <button
          key={action.path}
          onClick={() => router.push(action.path)}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.color}`}>
            {getIcon(action.icon)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{action.label}</p>
            <p className="text-xs text-gray-500">{action.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function GettingStarted({
  hasProjects,
  hasTasks,
  hasTeam,
}: {
  hasProjects: boolean;
  hasTasks: boolean;
  hasTeam: boolean;
}) {
  const router = useRouter();
  const completedCount = [hasProjects, hasTasks, hasTeam].filter(Boolean).length;

  if (completedCount === 3) return null;

  const steps = [
    {
      label: 'Create your first project',
      done: hasProjects,
      path: '/dashboard/projects',
    },
    {
      label: 'Add a task to your project',
      done: hasTasks,
      path: '/dashboard/projects',
    },
    {
      label: 'Invite a team member',
      done: hasTeam,
      path: '/dashboard/team',
    },
  ];

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary-900">Getting Started</h3>
        <span className="text-xs font-medium text-primary-600">{completedCount}/3 complete</span>
      </div>
      <div className="h-1.5 rounded-full bg-primary-100 mb-4">
        <div
          className="h-1.5 rounded-full bg-primary-600 transition-all"
          style={{ width: `${(completedCount / 3) * 100}%` }}
        />
      </div>
      <div className="space-y-2">
        {steps.map((step) => (
          <button
            key={step.label}
            onClick={() => !step.done && router.push(step.path)}
            disabled={step.done}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              step.done
                ? 'text-primary-400'
                : 'text-primary-800 hover:bg-primary-100'
            }`}
          >
            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              step.done
                ? 'bg-primary-600 text-white'
                : 'border-2 border-primary-300'
            }`}>
              {step.done ? '✓' : ''}
            </span>
            <span className={step.done ? 'line-through' : ''}>{step.label}</span>
            {!step.done && <ArrowRight className="ml-auto h-4 w-4 opacity-50" />}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { name } = useCurrentUser();
  const { data: projects, loading: projectsLoading, error: projectsError, refresh: refreshProjects } = useProjects();
  const { data: tasks, loading: tasksLoading, error: tasksError, refresh: refreshTasks } = useTasks();
  const { data: team, loading: teamLoading, error: teamError, refresh: refreshTeam } = useTeam();
  const loading = projectsLoading || tasksLoading || teamLoading;
  const error = projectsError || tasksError || teamError;
  const hasProjects = projects.length > 0;
  const hasTasks = tasks.length > 0;
  const hasTeam = team.length > 0;
  const hasData = hasProjects || hasTasks;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {hasData ? 'Dashboard' : `Welcome, ${name || 'there'}`}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {hasData
            ? 'Overview of your projects and tasks.'
            : `Get started with ${APP_NAME} by creating your first project.`}
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">Failed to load data. Please check your connection and try again.</p>
          <button
            onClick={() => { refreshProjects(); refreshTasks(); refreshTeam(); }}
            className="text-sm font-medium text-red-700 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      <DashboardStats
        projects={projects}
        tasks={tasks}
        team={team}
        loading={loading}
      />

      {!loading && !hasData ? (
        <div className="space-y-6">
          <GettingStarted
            hasProjects={hasProjects}
            hasTasks={hasTasks}
            hasTeam={hasTeam}
          />
          <QuickActions />
        </div>
      ) : (
        <>
          {!loading && (!hasProjects || !hasTasks || !hasTeam) && (
            <GettingStarted
              hasProjects={hasProjects}
              hasTasks={hasTasks}
              hasTeam={hasTeam}
            />
          )}
          <QuickActions />
          <RecentActivity tasks={tasks} loading={tasksLoading} />
        </>
      )}
    </div>
  );
}
