'use client';

import { useState } from 'react';
import { KPICard, DataTable, EmptyState } from '@varity-labs/ui-kit';
import { useProjects, useTasks, useCurrentUser } from '@/lib/hooks';
import { Plus, FolderKanban, ArrowLeft, ListTodo, CheckCircle, Clock, Users, Pencil, Trash2, Download } from 'lucide-react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Dialog,
  ConfirmDialog,
  useToast,
  ProjectStatusBadge,
  TaskStatusBadge,
  PriorityBadge
} from '@varity-labs/ui-kit';
import { formatDate, downloadCSV } from '@/lib/utils';
import { PRIORITY_OPTIONS, PROJECT_STATUS_OPTIONS, TASK_STATUS_OPTIONS } from '@/lib/constants';
import type { Project, Task } from '@/types';

const EMPTY_PROJECT = { name: '', description: '', dueDate: '', status: 'active' as Project['status'] };
const EMPTY_TASK = { title: '', description: '', priority: 'medium' as Task['priority'], status: 'todo' as Task['status'] };

export default function ProjectsPage() {
  const toast = useToast();
  const { email } = useCurrentUser();
  const { data: projects, loading, error, create, update, remove, refresh } = useProjects();

  // Selected project for detail view
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Create project dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT);
  const [nameError, setNameError] = useState('');
  const [projectSubmitting, setProjectSubmitting] = useState(false);

  // Edit project dialog
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_PROJECT);
  const [editNameError, setEditNameError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete project confirmation
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Create task dialog (for detail view)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskForm, setTaskForm] = useState(EMPTY_TASK);
  const [titleError, setTitleError] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // Edit task dialog (for detail view)
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskForm, setEditTaskForm] = useState(EMPTY_TASK);
  const [editTitleError, setEditTitleError] = useState('');
  const [editTaskSubmitting, setEditTaskSubmitting] = useState(false);

  // Delete task confirmation (for detail view)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deleteTaskSubmitting, setDeleteTaskSubmitting] = useState(false);

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : null;

  // Tasks for the selected project
  const {
    data: tasks,
    loading: tasksLoading,
    create: createTask,
    update: updateTask,
    remove: removeTask,
  } = useTasks(selectedProjectId || undefined);

  const deletingProject = deletingProjectId
    ? projects.find((p) => p.id === deletingProjectId)
    : null;

  // --- Project CRUD handlers ---

  function resetCreateDialog() {
    setProjectForm(EMPTY_PROJECT);
    setNameError('');
    setCreateDialogOpen(false);
  }

  function startEditProject(project: Project) {
    setEditingProject(project);
    setEditForm({
      name: project.name,
      description: project.description,
      dueDate: project.dueDate ? project.dueDate.split('T')[0] : '',
      status: project.status,
    });
    setEditNameError('');
  }

  function resetEditDialog() {
    setEditingProject(null);
    setEditForm(EMPTY_PROJECT);
    setEditNameError('');
  }

  async function handleCreateProject() {
    if (!projectForm.name.trim()) {
      setNameError('Project name is required');
      return;
    }

    setProjectSubmitting(true);
    try {
      await create({
        name: projectForm.name.trim(),
        description: projectForm.description,
        status: 'active',
        owner: email,
        members: [email],
        dueDate: projectForm.dueDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      });
      toast.success('Project created successfully');
      resetCreateDialog();
    } catch {
      toast.error('Failed to create project. Please try again.');
    } finally {
      setProjectSubmitting(false);
    }
  }

  async function handleEditProject() {
    if (!editingProject?.id) return;
    if (!editForm.name.trim()) {
      setEditNameError('Project name is required');
      return;
    }

    setEditSubmitting(true);
    try {
      await update(editingProject.id, {
        name: editForm.name.trim(),
        description: editForm.description,
        status: editForm.status,
        dueDate: editForm.dueDate || editingProject.dueDate,
      });
      toast.success('Project updated successfully');
      resetEditDialog();
    } catch {
      toast.error('Failed to update project. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDeleteProject() {
    if (!deletingProjectId) return;

    setDeleteSubmitting(true);
    try {
      await remove(deletingProjectId);
      toast.success('Project deleted');
      setDeletingProjectId(null);
      if (selectedProjectId === deletingProjectId) {
        setSelectedProjectId(null);
      }
    } catch {
      toast.error('Failed to delete project. Please try again.');
    } finally {
      setDeleteSubmitting(false);
    }
  }

  // --- Task CRUD handlers ---

  function resetTaskDialog() {
    setTaskForm(EMPTY_TASK);
    setTitleError('');
    setTaskDialogOpen(false);
  }

  function startEditTask(task: Task) {
    setEditingTask(task);
    setEditTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
    });
    setEditTitleError('');
  }

  function resetEditTaskDialog() {
    setEditingTask(null);
    setEditTaskForm(EMPTY_TASK);
    setEditTitleError('');
  }

  async function handleCreateTask() {
    if (!taskForm.title.trim() || !selectedProjectId) {
      setTitleError('Task title is required');
      return;
    }

    setTaskSubmitting(true);
    try {
      await createTask({
        projectId: selectedProjectId,
        title: taskForm.title.trim(),
        description: taskForm.description,
        status: 'todo',
        priority: taskForm.priority,
      });
      toast.success('Task added successfully');
      resetTaskDialog();
    } catch {
      toast.error('Failed to add task. Please try again.');
    } finally {
      setTaskSubmitting(false);
    }
  }

  async function handleEditTask() {
    if (!editingTask?.id) return;
    if (!editTaskForm.title.trim()) {
      setEditTitleError('Task title is required');
      return;
    }

    setEditTaskSubmitting(true);
    try {
      await updateTask(editingTask.id, {
        title: editTaskForm.title.trim(),
        description: editTaskForm.description,
        priority: editTaskForm.priority,
        status: editTaskForm.status,
      });
      toast.success('Task updated successfully');
      resetEditTaskDialog();
    } catch {
      toast.error('Failed to update task. Please try again.');
    } finally {
      setEditTaskSubmitting(false);
    }
  }

  async function handleDeleteTask() {
    if (!deletingTaskId) return;

    setDeleteTaskSubmitting(true);
    try {
      await removeTask(deletingTaskId);
      toast.success('Task deleted');
      setDeletingTaskId(null);
    } catch {
      toast.error('Failed to delete task. Please try again.');
    } finally {
      setDeleteTaskSubmitting(false);
    }
  }

  // --- Table columns ---

  const projectColumns = [
    { key: 'name', header: 'Project Name', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => <ProjectStatusBadge status={value} />,
    },
    {
      key: 'members',
      header: 'Members',
      render: (value: string[]) => {
        const count = value?.filter(Boolean).length || 0;
        return <span>{count} {count === 1 ? 'member' : 'members'}</span>;
      },
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (value: string) => formatDate(value),
    },
    {
      key: 'id',
      header: '',
      render: (_: string, row: Project) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => startEditProject(row)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Edit project"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeletingProjectId(row.id!)}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete project"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const taskColumns = [
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
      key: 'assignee',
      header: 'Assignee',
      render: (value: string) => value || 'Unassigned',
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

  // --- Shared dialogs ---

  const editProjectDialog = (
    <Dialog
      open={!!editingProject}
      onClose={resetEditDialog}
      title="Edit Project"
      description="Update your project details."
    >
      <div className="space-y-4">
        <Input
          label="Project Name"
          required
          value={editForm.name}
          onChange={(e) => { setEditForm({ ...editForm, name: e.target.value }); if (editNameError) setEditNameError(''); }}
          error={editNameError}
          placeholder="Enter project name"
        />
        <Textarea
          label="Description"
          value={editForm.description}
          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          rows={3}
          placeholder="What is this project about?"
        />
        <Select
          label="Status"
          value={editForm.status}
          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Project['status'] })}
          options={[...PROJECT_STATUS_OPTIONS]}
        />
        <Input
          label="Due Date"
          type="date"
          value={editForm.dueDate}
          onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
        />
        <div className="flex gap-2 pt-2">
          <Button onClick={handleEditProject} loading={editSubmitting}>Save Changes</Button>
          <Button variant="secondary" onClick={resetEditDialog} disabled={editSubmitting}>Cancel</Button>
        </div>
      </div>
    </Dialog>
  );

  const deleteProjectDialog = (
    <ConfirmDialog
      open={!!deletingProjectId}
      onClose={() => setDeletingProjectId(null)}
      onConfirm={handleDeleteProject}
      title="Delete Project"
      description={`Are you sure you want to delete "${deletingProject?.name || ''}"? This will remove the project and all its tasks. This action cannot be undone.`}
      confirmLabel="Delete Project"
      loading={deleteSubmitting}
    />
  );

  const editTaskDialog = (
    <Dialog
      open={!!editingTask}
      onClose={resetEditTaskDialog}
      title="Edit Task"
      description="Update task details."
    >
      <div className="space-y-4">
        <Input
          label="Task Title"
          required
          value={editTaskForm.title}
          onChange={(e) => { setEditTaskForm({ ...editTaskForm, title: e.target.value }); if (editTitleError) setEditTitleError(''); }}
          error={editTitleError}
          placeholder="What needs to be done?"
        />
        <Textarea
          label="Description"
          value={editTaskForm.description}
          onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
          rows={2}
          placeholder="Add details..."
        />
        <Select
          label="Status"
          value={editTaskForm.status}
          onChange={(e) => setEditTaskForm({ ...editTaskForm, status: e.target.value as Task['status'] })}
          options={[...TASK_STATUS_OPTIONS]}
        />
        <Select
          label="Priority"
          value={editTaskForm.priority}
          onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value as Task['priority'] })}
          options={[...PRIORITY_OPTIONS]}
        />
        <div className="flex gap-2 pt-2">
          <Button onClick={handleEditTask} loading={editTaskSubmitting}>Save Changes</Button>
          <Button variant="secondary" onClick={resetEditTaskDialog} disabled={editTaskSubmitting}>Cancel</Button>
        </div>
      </div>
    </Dialog>
  );

  const deleteTaskDialog = (
    <ConfirmDialog
      open={!!deletingTaskId}
      onClose={() => setDeletingTaskId(null)}
      onConfirm={handleDeleteTask}
      title="Delete Task"
      description="Are you sure you want to delete this task? This action cannot be undone."
      confirmLabel="Delete Task"
      loading={deleteTaskSubmitting}
    />
  );

  // ---------- PROJECT DETAIL VIEW ----------
  if (selectedProject) {
    const todoCount = tasks.filter((t) => t.status === 'todo').length;
    const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
    const doneCount = tasks.filter((t) => t.status === 'done').length;

    return (
      <div className="space-y-6">
        {editProjectDialog}
        {deleteProjectDialog}
        {editTaskDialog}
        {deleteTaskDialog}

        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedProjectId(null)}
            icon={<ArrowLeft className="h-4 w-4" />}
            className="mb-2"
          >
            Back to Projects
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h1>
              <p className="mt-1 text-sm text-gray-600">{selectedProject.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <ProjectStatusBadge status={selectedProject.status} />
              <Button variant="ghost" size="sm" onClick={() => startEditProject(selectedProject)} icon={<Pencil className="h-4 w-4" />}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDeletingProjectId(selectedProject.id!)} className="text-red-600 hover:text-red-700 hover:bg-red-50" icon={<Trash2 className="h-4 w-4" />}>
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="To Do" value={todoCount} icon={<ListTodo className="h-5 w-5" />} />
          <KPICard title="In Progress" value={inProgressCount} icon={<Clock className="h-5 w-5" />} />
          <KPICard title="Completed" value={doneCount} icon={<CheckCircle className="h-5 w-5" />} trend={doneCount > 0 ? 'up' : undefined} />
          <KPICard title="Team Members" value={selectedProject.members?.length || 0} icon={<Users className="h-5 w-5" />} />
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          <Button size="sm" onClick={() => setTaskDialogOpen(true)} icon={<Plus className="h-4 w-4" />}>
            Add Task
          </Button>
        </div>

        <Dialog open={taskDialogOpen} onClose={resetTaskDialog} title="Add Task" description="Create a new task for this project.">
          <div className="space-y-4">
            <Input
              label="Task Title"
              required
              value={taskForm.title}
              onChange={(e) => { setTaskForm({ ...taskForm, title: e.target.value }); if (titleError) setTitleError(''); }}
              error={titleError}
              placeholder="What needs to be done?"
            />
            <Select
              label="Priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Task['priority'] })}
              options={[...PRIORITY_OPTIONS]}
            />
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreateTask} loading={taskSubmitting}>Add Task</Button>
              <Button variant="secondary" onClick={resetTaskDialog} disabled={taskSubmitting}>Cancel</Button>
            </div>
          </div>
        </Dialog>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <DataTable columns={taskColumns} data={tasks} loading={tasksLoading} emptyMessage="No tasks yet. Add a task to get started." />
        </div>
      </div>
    );
  }

  // ---------- PROJECTS LIST VIEW ----------
  return (
    <div className="space-y-6">
      {editProjectDialog}
      {deleteProjectDialog}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your projects and track progress.</p>
        </div>
        <div className="flex items-center gap-2">
          {projects.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadCSV(
                projects.map((p) => ({ name: p.name, status: p.status, description: p.description || '', dueDate: p.dueDate || '', createdAt: p.createdAt })),
                'projects.csv'
              )}
              icon={<Download className="h-4 w-4" />}
            >
              Export
            </Button>
          )}
          <Button onClick={() => setCreateDialogOpen(true)} icon={<Plus className="h-4 w-4" />}>
            New Project
          </Button>
        </div>
      </div>

      <Dialog open={createDialogOpen} onClose={resetCreateDialog} title="Create New Project" description="Add a new project to organize your team's work.">
        <div className="space-y-4">
          <Input
            label="Project Name"
            required
            value={projectForm.name}
            onChange={(e) => { setProjectForm({ ...projectForm, name: e.target.value }); if (nameError) setNameError(''); }}
            error={nameError}
            placeholder="Enter project name"
          />
          <Textarea
            label="Description"
            value={projectForm.description}
            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
            rows={3}
            placeholder="What is this project about?"
          />
          <Input
            label="Due Date"
            type="date"
            value={projectForm.dueDate}
            onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
            hint="Defaults to 30 days from today if left blank"
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCreateProject} loading={projectSubmitting}>Create Project</Button>
            <Button variant="secondary" onClick={resetCreateDialog} disabled={projectSubmitting}>Cancel</Button>
          </div>
        </div>
      </Dialog>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">Failed to load projects. Please check your connection and try again.</p>
          <button onClick={refresh} className="text-sm font-medium text-red-700 hover:text-red-800 underline">Retry</button>
        </div>
      )}

      {!loading && projects.length === 0 && !createDialogOpen ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started."
          icon={<FolderKanban className="h-12 w-12 text-gray-400" />}
          action={{ label: 'Create Project', onClick: () => setCreateDialogOpen(true) }}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <DataTable
            columns={projectColumns}
            data={projects}
            loading={loading}
            pagination
            pageSize={10}
            hoverable
            onRowClick={(row) => setSelectedProjectId(row.id)}
          />
        </div>
      )}
    </div>
  );
}
