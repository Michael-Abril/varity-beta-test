'use client';

import { useMemo } from 'react';
import { EnhancedKPICard, Skeleton } from '@varity-labs/ui-kit';
import type { Project, Task, TeamMember } from '@/types';

interface DashboardStatsProps {
  projects: Project[];
  tasks: Task[];
  team: TeamMember[];
  loading?: boolean;
}

export function DashboardStats({
  projects,
  tasks,
  team,
  loading = false,
}: DashboardStatsProps) {
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const activeTasks = tasks.filter((t) => t.status !== 'done').length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const completionRate =
    tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  // Generate sparkline data (mock trend data for each metric)
  const projectsSparkline = useMemo(() => {
    const baseValue = projects.length || 8;
    return Array.from({ length: 7 }, (_, i) => {
      const progress = i / 6;
      const trend = baseValue * (1 - 0.125 * (1 - progress));
      return Math.max(1, Math.round(trend + (Math.random() - 0.5) * 2));
    });
  }, [projects.length]);

  const tasksSparkline = useMemo(() => {
    const baseValue = tasks.length || 12;
    return Array.from({ length: 7 }, (_, i) => {
      const progress = i / 6;
      const trend = baseValue * (1 + 0.15 * progress);
      return Math.max(1, Math.round(trend + (Math.random() - 0.5) * 2));
    });
  }, [tasks.length]);

  const teamSparkline = useMemo(() => {
    const baseValue = team.length || 3;
    return Array.from({ length: 7 }, (_, i) => {
      const progress = i / 6;
      const trend = baseValue * (1 + 0.08 * progress);
      return Math.max(1, Math.round(trend + (Math.random() - 0.5) * 0.5));
    });
  }, [team.length]);

  const completionSparkline = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const progress = i / 6;
      const trend = completionRate * (1 - 0.10 * (1 - progress));
      return Math.max(0, Math.min(100, trend + (Math.random() - 0.5) * 5));
    });
  }, [completionRate]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton height={180} />
        <Skeleton height={180} />
        <Skeleton height={180} />
        <Skeleton height={180} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <EnhancedKPICard
        title="Active Projects"
        value={activeProjects.toString()}
        change={{
          value: 12.5,
          period: 'vs last month'
        }}
        icon="📊"
        trend="up"
        color="blue"
        sparklineData={projectsSparkline}
        showSparkline
        lastSynced={new Date().toISOString()}
        helpText={`${projects.length} total projects (${activeProjects} active)`}
      />
      <EnhancedKPICard
        title="Open Tasks"
        value={activeTasks.toString()}
        change={{
          value: 8.3,
          period: 'vs last week'
        }}
        icon="✓"
        trend="up"
        color="orange"
        sparklineData={tasksSparkline}
        showSparkline
        lastSynced={new Date().toISOString()}
        helpText={`${doneTasks} completed tasks out of ${tasks.length} total`}
      />
      <EnhancedKPICard
        title="Team Members"
        value={team.length.toString()}
        change={{
          value: 5.0,
          period: 'vs last month'
        }}
        icon="👥"
        trend="up"
        color="green"
        sparklineData={teamSparkline}
        showSparkline
        lastSynced={new Date().toISOString()}
        helpText="Active team members with access"
      />
      <EnhancedKPICard
        title="Completion Rate"
        value={`${completionRate}%`}
        change={{
          value: completionRate > 0 ? 3.2 : 0,
          period: 'vs last week'
        }}
        icon="📈"
        trend={completionRate >= 50 ? 'up' : completionRate > 0 ? 'neutral' : 'down'}
        color={completionRate >= 50 ? 'green' : completionRate > 0 ? 'blue' : 'red'}
        sparklineData={completionSparkline}
        showSparkline
        lastSynced={new Date().toISOString()}
        helpText="Percentage of tasks marked as complete"
      />
    </div>
  );
}
