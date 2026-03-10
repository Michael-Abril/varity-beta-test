'use client';

import Link from 'next/link';
import { DataTable } from '@varity-labs/ui-kit';
import { TaskStatusBadge, PriorityBadge } from '@varity-labs/ui-kit';
import { formatRelativeDate } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import type { Task } from '@/types';

interface RecentActivityProps {
  tasks: Task[];
  loading?: boolean;
}

export function RecentActivity({ tasks, loading = false }: RecentActivityProps) {
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const columns = [
    { key: 'title', header: 'Task', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => <TaskStatusBadge status={value} />,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (value: string) => <PriorityBadge priority={value} />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value: string) => formatRelativeDate(value),
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent Activity
        </h3>
        {tasks.length > 5 && (
          <Link
            href="/dashboard/tasks"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            View all tasks
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <DataTable
        columns={columns}
        data={recentTasks}
        loading={loading}
        emptyMessage="No tasks yet. Create a project and add tasks to get started."
      />
    </div>
  );
}
