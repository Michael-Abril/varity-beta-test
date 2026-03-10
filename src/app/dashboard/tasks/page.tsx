'use client';

import { useState } from 'react';
import { DataTable, EmptyState } from '@varity-labs/ui-kit';
import { useTasks, useProjects } from '@/lib/hooks';
import {
  useToast,
  Button,
  Input,
  Textarea,
  Select,
  Dialog,
  ConfirmDialog,
  TaskStatusBadge,
  PriorityBadge
} from '@varity-labs/ui-kit';
import { formatDateShort, downloadCSV } from '@/lib/utils';
import { TASK_STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/lib/constants';
import { ListTodo, Pencil, Trash2, Download } from 'lucide-react';
import type { Task } from '@/types';

const STATUS_CYCLE: Record<string, Task['status']> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  ...TASK_STATUS_OPTIONS,
];

const EMPTY_EDIT = { title: '', description: '', priority: 'medium' as Task['priority'], status: 'todo' as Task['status'] };

export default function TasksPage() {
  const { data: tasks, loading, error, update, remove, refresh } = useTasks();
  const { data: projects } = useProjects();
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit task dialog
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [editTitleError, setEditTitleError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete task confirmation
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const filteredTasks =
    statusFilter === 'all'
      ? tasks
      : tasks.filter((t) => t.status === statusFilter);

  function getProjectName(projectId: string): string {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || 'Unknown';
  }

  async function cycleStatus(task: Task): Promise<void> {
    if (!task.id) return;
    try {
      await update(task.id, { status: STATUS_CYCLE[task.status] });
      toast.success(`Task marked as ${STATUS_CYCLE[task.status].replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update task status');
    }
  }

  function startEditTask(task: Task) {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
    });
    setEditTitleError('');
  }

  function resetEditDialog() {
    setEditingTask(null);
    setEditForm(EMPTY_EDIT);
    setEditTitleError('');
  }

  async function handleEditTask() {
    if (!editingTask?.id) return;
    if (!editForm.title.trim()) {
      setEditTitleError('Task title is required');
      return;
    }

    setEditSubmitting(true);
    try {
      await update(editingTask.id, {
        title: editForm.title.trim(),
        description: editForm.description,
        priority: editForm.priority,
        status: editForm.status,
      });
      toast.success('Task updated successfully');
      resetEditDialog();
    } catch {
      toast.error('Failed to update task. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDeleteTask() {
    if (!deletingTaskId) return;

    setDeleteSubmitting(true);
    try {
      await remove(deletingTaskId);
      toast.success('Task deleted');
      setDeletingTaskId(null);
    } catch {
      toast.error('Failed to delete task. Please try again.');
    } finally {
      setDeleteSubmitting(false);
    }
  }

  const columns = [
    { key: 'title', header: 'Task', sortable: true },
    {
      key: 'projectId',
      header: 'Project',
      render: (value: string) => (
        <span className="text-gray-600">{getProjectName(value)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string, row: Task) => (
        <button onClick={() => cycleStatus(row)} title="Click to change status">
          <TaskStatusBadge status={value} />
        </button>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (value: string) => <PriorityBadge priority={value || 'medium'} />,
    },
    {
      key: 'assignee',
      header: 'Assignee',
      render: (value: string) => value || 'Unassigned',
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (value: string) => formatDateShort(value),
    },
    {
      key: 'id',
      header: '',
      render: (_: string, row: Task) => (
        <div className="flex gap-1">
          <button
            onClick={() => startEditTask(row)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeletingTaskId(row.id!)}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Dialog
        open={!!editingTask}
        onClose={resetEditDialog}
        title="Edit Task"
        description="Update task details."
      >
        <div className="space-y-4">
          <Input
            label="Task Title"
            required
            value={editForm.title}
            onChange={(e) => { setEditForm({ ...editForm, title: e.target.value }); if (editTitleError) setEditTitleError(''); }}
            error={editTitleError}
            placeholder="What needs to be done?"
          />
          <Textarea
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            rows={2}
            placeholder="Add details..."
          />
          <Select
            label="Status"
            value={editForm.status}
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Task['status'] })}
            options={[...TASK_STATUS_OPTIONS]}
          />
          <Select
            label="Priority"
            value={editForm.priority}
            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Task['priority'] })}
            options={[...PRIORITY_OPTIONS]}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleEditTask} loading={editSubmitting}>Save Changes</Button>
            <Button variant="secondary" onClick={resetEditDialog} disabled={editSubmitting}>Cancel</Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!deletingTaskId}
        onClose={() => setDeletingTaskId(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
        loading={deleteSubmitting}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-600">
            All tasks across your projects. Click status to update.
          </p>
        </div>
        {tasks.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadCSV(
              tasks.map((t) => ({ title: t.title, status: t.status, priority: t.priority, description: t.description || '', createdAt: t.createdAt })),
              'tasks.csv'
            )}
            icon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">Failed to load tasks. Please check your connection and try again.</p>
          <button onClick={refresh} className="text-sm font-medium text-red-700 hover:text-red-800 underline">Retry</button>
        </div>
      )}

      <div className="flex gap-2">
        {FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {!loading && tasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Tasks will appear here when you add them to projects."
          icon={<ListTodo className="h-12 w-12 text-gray-400" />}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <DataTable
            columns={columns}
            data={filteredTasks}
            loading={loading}
            pagination
            pageSize={15}
            hoverable
          />
        </div>
      )}
    </div>
  );
}
