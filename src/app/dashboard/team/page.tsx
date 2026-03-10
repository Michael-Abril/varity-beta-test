'use client';

import { useState } from 'react';
import { DataTable, EmptyState } from '@varity-labs/ui-kit';
import { useTeam } from '@/lib/hooks';
import { Plus, Users, Pencil, Trash2 } from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Dialog,
  ConfirmDialog,
  useToast,
  RoleBadge
} from '@varity-labs/ui-kit';
import { formatDate, isValidEmail } from '@/lib/utils';
import { ROLE_OPTIONS } from '@/lib/constants';
import type { TeamMember } from '@/types';

const EMPTY_FORM = { name: '', email: '', role: 'member' as TeamMember['role'] };

export default function TeamPage() {
  const toast = useToast();
  const { data: team, loading, error, create, update, remove, refresh } = useTeam();

  // Invite dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Edit role dialog
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState<TeamMember['role']>('member');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Remove member confirmation
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [removeSubmitting, setRemoveSubmitting] = useState(false);

  const removingMember = removingMemberId
    ? team.find((m) => m.id === removingMemberId)
    : null;

  function resetAndClose() {
    setFormData(EMPTY_FORM);
    setErrors({});
    setDialogOpen(false);
  }

  function startEditMember(member: TeamMember) {
    setEditingMember(member);
    setEditRole(member.role);
  }

  function resetEditDialog() {
    setEditingMember(null);
    setEditRole('member');
  }

  function validateForm(): boolean {
    const newErrors: { name?: string; email?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleInvite() {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
      });
      toast.success(`${formData.name.trim()} added to team`);
      resetAndClose();
    } catch {
      toast.error('Failed to send invitation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditRole() {
    if (!editingMember?.id) return;

    setEditSubmitting(true);
    try {
      await update(editingMember.id, { role: editRole });
      toast.success(`${editingMember.name}'s role updated to ${editRole}`);
      resetEditDialog();
    } catch {
      toast.error('Failed to update role. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleRemoveMember() {
    if (!removingMemberId) return;

    setRemoveSubmitting(true);
    try {
      await remove(removingMemberId);
      toast.success('Team member removed');
      setRemovingMemberId(null);
    } catch {
      toast.error('Failed to remove member. Please try again.');
    } finally {
      setRemoveSubmitting(false);
    }
  }

  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'role',
      header: 'Role',
      render: (value: string) => <RoleBadge role={value} />,
    },
    {
      key: 'joinedAt',
      header: 'Joined',
      sortable: true,
      render: (value: string) => formatDate(value),
    },
    {
      key: 'id',
      header: '',
      render: (_: string, row: TeamMember) => (
        <div className="flex gap-1">
          <button
            onClick={() => startEditMember(row)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Edit role"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setRemovingMemberId(row.id!)}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Remove member"
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
        open={dialogOpen}
        onClose={resetAndClose}
        title="Invite Team Member"
        description="Send an invitation to join your team."
      >
        <div className="space-y-4">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            error={errors.name}
            placeholder="Full name"
          />
          <Input
            label="Email"
            required
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            placeholder="email@example.com"
          />
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as TeamMember['role'] })
            }
            options={[...ROLE_OPTIONS]}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleInvite} loading={submitting}>
              Send Invite
            </Button>
            <Button variant="secondary" onClick={resetAndClose} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={!!editingMember}
        onClose={resetEditDialog}
        title="Edit Role"
        description={editingMember ? `Change ${editingMember.name}'s role.` : ''}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Member</label>
            <p className="text-sm text-gray-900">{editingMember?.name} ({editingMember?.email})</p>
          </div>
          <Select
            label="Role"
            value={editRole}
            onChange={(e) => setEditRole(e.target.value as TeamMember['role'])}
            options={[...ROLE_OPTIONS]}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={handleEditRole} loading={editSubmitting}>Save Changes</Button>
            <Button variant="secondary" onClick={resetEditDialog} disabled={editSubmitting}>Cancel</Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={!!removingMemberId}
        onClose={() => setRemovingMemberId(null)}
        onConfirm={handleRemoveMember}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${removingMember?.name || 'this member'} from the team? They will lose access to all projects.`}
        confirmLabel="Remove Member"
        loading={removeSubmitting}
      />

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">Failed to load team data. Please check your connection and try again.</p>
          <button onClick={refresh} className="text-sm font-medium text-red-700 hover:text-red-800 underline">Retry</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your team members and roles.
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          icon={<Plus className="h-4 w-4" />}
        >
          Invite Member
        </Button>
      </div>

      {!loading && team.length === 0 && !dialogOpen ? (
        <EmptyState
          title="No team members yet"
          description="Invite your first team member to start collaborating."
          icon={<Users className="h-12 w-12 text-gray-400" />}
          action={{
            label: 'Invite Member',
            onClick: () => setDialogOpen(true),
          }}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <DataTable
            columns={columns}
            data={team}
            loading={loading}
            pagination
            pageSize={10}
            hoverable
          />
        </div>
      )}
    </div>
  );
}
