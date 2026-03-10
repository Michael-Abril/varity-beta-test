'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser, useUserSettings } from '@/lib/hooks';
import type { UserSettings } from '@/types';
import {
  Button,
  Input,
  Select,
  Dialog,
  ConfirmDialog,
  useToast,
  Toggle,
  Avatar,
  ProgressBar,
  RadioGroup,
  Checkbox,
  Badge,
  DataTable,
  Skeleton,
} from '@varity-labs/ui-kit';
import { APP_NAME } from '@/lib/constants';
import {
  User,
  Copy,
  Camera,
  Shield,
  CreditCard,
  Database,
  Download,
  Lock,
  Globe,
  Bell,
  Trash2,
  LogOut,
  Smartphone,
  Key,
} from 'lucide-react';

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

let PrivyUserProfile: any = null;
let usePrivyHook: any = null;

try {
  const uiKit = require('@varity-labs/ui-kit');
  PrivyUserProfile = uiKit.PrivyUserProfile;
  usePrivyHook = uiKit.usePrivy;
} catch {}

const TABS = [
  { id: 'general', label: 'General', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'account', label: 'Account', icon: Database },
] as const;

type TabId = (typeof TABS)[number]['id'];

// Mock usage data (developers replace with their billing provider)
const MOCK_USAGE = {
  projects: { used: 5, limit: 10 },
  storage: { used: 2.3, limit: 5 },
  bandwidth: { used: 45, limit: 100 },
};

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton width="100%" height={40} />
      <Skeleton width="100%" height={40} />
      <Skeleton width="60%" height={40} />
    </div>
  );
}

export default function SettingsPage() {
  const { email, name, id } = useCurrentUser();
  const { settings, loading, update: updateSettings } = useUserSettings();
  const toast = useToast();
  // eslint-disable-next-line react-hooks/rules-of-hooks -- conditional on require() + env var, stable across renders
  const privy = privyAppId && usePrivyHook ? usePrivyHook() : { logout: async () => {} };

  const [activeTab, setActiveTab] = useState<TabId>('general');

  // Dialog state
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [revokeSessionConfirmOpen, setRevokeSessionConfirmOpen] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [deleteAccountConfirmOpen, setDeleteAccountConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Active sessions (stateful so revoke actually removes from UI)
  const [sessions, setSessions] = useState([
    {
      id: '1',
      browser: 'Chrome on Windows',
      location: 'San Francisco, US',
      ip: '192.168.1.1',
      lastActive: '2026-02-12T12:00:00.000Z',
      current: true,
    },
    {
      id: '2',
      browser: 'Safari on macOS',
      location: 'New York, US',
      ip: '192.168.1.2',
      lastActive: '2026-02-12T11:00:00.000Z',
      current: false,
    },
  ]);

  // Sync profile form when Privy data arrives asynchronously
  useEffect(() => {
    if (name || email) {
      setProfileForm({ name: name || '', email: email || '' });
    }
  }, [name, email]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    toast.success('User ID copied to clipboard');
  };

  const handleSaveProfile = () => {
    toast.info('Profile changes are managed by your auth provider');
    setEditProfileOpen(false);
  };

  const handleChangePassword = () => {
    toast.info('Password changes are managed by your auth provider');
    setChangePasswordOpen(false);
  };

  const handleRevokeSession = () => {
    if (sessionToRevoke) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionToRevoke));
      toast.success('Session revoked successfully');
    }
    setRevokeSessionConfirmOpen(false);
    setSessionToRevoke(null);
  };

  const handleDownloadData = () => {
    const exportData = {
      user: { id, name, email },
      settings: settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${APP_NAME.toLowerCase()}-data-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is not available in the demo');
    setDeleteAccountConfirmOpen(false);
    setDeleteConfirmText('');
  };

  const handleSettingChange = (updates: Partial<UserSettings>) => {
    updateSettings(updates).catch(() => {
      toast.error('Failed to save setting');
    });
  };

  const sessionColumns = [
    {
      key: 'browser',
      header: 'Device',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">
              {value}
              {row.current && (
                <span className="ml-2 text-xs text-green-600 font-normal">(this device)</span>
              )}
            </div>
            <div className="text-xs text-gray-500">{row.ip}</div>
          </div>
        </div>
      ),
    },
    { key: 'location', header: 'Location' },
    {
      key: 'lastActive',
      header: 'Last Active',
      render: (value: string) => {
        const date = new Date(value);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / 3600000);
        if (hours === 0) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
      },
    },
    {
      key: 'id',
      header: '',
      render: (value: string, row: any) => (
        row.current ? (
          <Badge variant="green">Current</Badge>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSessionToRevoke(value);
              setRevokeSessionConfirmOpen(true);
            }}
          >
            Revoke
          </Button>
        )
      ),
    },
  ];

  // --- Tab content renderers ---

  const renderGeneral = () => (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={name || 'User'} size="lg" />
              <button
                className="absolute bottom-0 right-0 p-1.5 bg-primary-600 rounded-full text-white hover:bg-primary-700 transition-colors"
                onClick={() => toast.info('Profile picture upload coming soon')}
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {name || 'User'}
                <Badge variant="blue">Free Plan</Badge>
              </h2>
              <p className="text-sm text-gray-600">{email || 'No email set'}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setEditProfileOpen(true)}>
            <User className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">User ID</label>
            <div className="flex items-center gap-2">
              <code className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">
                {id.substring(0, 16)}...
              </code>
              <Button size="sm" variant="ghost" onClick={handleCopyId}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Member Since</label>
            <p className="text-sm text-gray-900">January 2026</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Preferences
        </h2>

        {loading || !settings ? (
          <SettingsSkeleton />
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Theme</label>
              <Select
                value={settings.theme}
                onChange={(e) => handleSettingChange({ theme: e.target.value as UserSettings['theme'] })}
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'system', label: 'System' },
                ]}
              />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-4">
                <Bell className="h-4 w-4" />
                Notifications
              </h3>
              <div className="space-y-4">
                <Toggle
                  checked={settings.email_notifications}
                  onChange={(v) => handleSettingChange({ email_notifications: v })}
                  label="Email notifications"
                  description="Receive email notifications about your activity"
                />
                <Toggle
                  checked={settings.marketing_emails}
                  onChange={(v) => handleSettingChange({ marketing_emails: v })}
                  label="Marketing emails"
                  description="Receive emails about new features and updates"
                />
                <Toggle
                  checked={settings.product_updates}
                  onChange={(v) => handleSettingChange({ product_updates: v })}
                  label="Product updates"
                  description="Get notified when we ship new features"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Locale</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                  <Select
                    value={settings.date_format}
                    onChange={(e) => handleSettingChange({ date_format: e.target.value })}
                    options={[
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <Select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange({ timezone: e.target.value })}
                    options={[
                      { value: 'America/Los_Angeles', label: 'Pacific Time' },
                      { value: 'America/New_York', label: 'Eastern Time' },
                      { value: 'Europe/London', label: 'London' },
                      { value: 'Asia/Tokyo', label: 'Tokyo' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <Select
                    value={settings.language}
                    onChange={(e) => handleSettingChange({ language: e.target.value })}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Español' },
                      { value: 'fr', label: 'Français' },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <RadioGroup
                value={settings.dashboard_layout}
                onChange={(v) => handleSettingChange({ dashboard_layout: v as UserSettings['dashboard_layout'] })}
                name="dashboard-layout"
                label="Dashboard Layout"
                options={[
                  { value: 'comfortable', label: 'Comfortable', description: 'More spacing and larger elements' },
                  { value: 'compact', label: 'Compact', description: 'Tighter spacing, fit more content' },
                ]}
                orientation="horizontal"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      {/* 2FA */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </h2>

        {loading || !settings ? (
          <SettingsSkeleton />
        ) : (
          <div className="space-y-4">
            <div>
              <Toggle
                checked={settings.two_factor_enabled}
                onChange={(v) => handleSettingChange({ two_factor_enabled: v })}
                label={<span className="inline-flex items-center gap-2">Enable 2FA{settings.two_factor_enabled && <Badge variant="green">Enabled</Badge>}</span>}
                description="Add an extra layer of security to your account"
              />
            </div>
            {settings.two_factor_enabled && (
              <p className="text-sm text-gray-500 pl-14">
                Two-factor authentication is active. You will be prompted for a verification code when signing in.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Password */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Password
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Password management is handled by your authentication provider.
        </p>
        <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
          <Lock className="h-4 w-4" />
          Change Password
        </Button>
      </div>

      {/* Active Sessions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Active Sessions
          </h2>
          <span className="text-sm text-gray-500">{sessions.length} active</span>
        </div>
        <DataTable
          columns={sessionColumns}
          data={sessions}
          emptyMessage="No active sessions"
        />
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Current Plan
        </h2>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Free Plan</span>
            <Badge variant="blue">Active</Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">$0<span className="text-sm font-normal text-gray-600">/month</span></p>
          <Button className="mt-4 w-full" variant="primary">
            Upgrade to Pro
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage</h2>
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Projects</span>
              <span className="text-sm text-gray-600">{MOCK_USAGE.projects.used} / {MOCK_USAGE.projects.limit}</span>
            </div>
            <ProgressBar
              value={(MOCK_USAGE.projects.used / MOCK_USAGE.projects.limit) * 100}
              variant="primary"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Storage</span>
              <span className="text-sm text-gray-600">{MOCK_USAGE.storage.used} GB / {MOCK_USAGE.storage.limit} GB</span>
            </div>
            <ProgressBar
              value={(MOCK_USAGE.storage.used / MOCK_USAGE.storage.limit) * 100}
              variant="success"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Bandwidth</span>
              <span className="text-sm text-gray-600">{MOCK_USAGE.bandwidth.used} GB / {MOCK_USAGE.bandwidth.limit} GB</span>
            </div>
            <ProgressBar
              value={(MOCK_USAGE.bandwidth.used / MOCK_USAGE.bandwidth.limit) * 100}
              variant="warning"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-6">
      {/* Data Export */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Download a copy of all your data including profile, settings, and activity in JSON format.
        </p>
        <Button variant="outline" onClick={handleDownloadData}>
          <Download className="h-4 w-4" />
          Download My Data
        </Button>
      </div>

      {/* Privacy Preferences */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="h-5 w-5" />
          Privacy Preferences
        </h2>

        {loading || !settings ? (
          <SettingsSkeleton />
        ) : (
          <div className="space-y-4">
            <Checkbox
              checked={settings.analytics_enabled}
              onChange={(v) => handleSettingChange({ analytics_enabled: v })}
              label="Usage analytics"
              description="Help us improve by sharing anonymous usage data"
            />
            <Checkbox
              checked={settings.cookies_enabled}
              onChange={(v) => handleSettingChange({ cookies_enabled: v })}
              label="Optional cookies"
              description="Allow non-essential cookies for personalization"
            />
          </div>
        )}
      </div>

      {/* Privy Account Settings */}
      {privyAppId && PrivyUserProfile && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Key className="h-5 w-5" />
            Account Settings (Privy)
          </h2>
          <PrivyUserProfile showLogoutButton={false} />
        </div>
      )}

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-2 text-lg font-semibold text-red-900 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Danger Zone
        </h2>
        <p className="mb-4 text-sm text-red-700">
          These actions are permanent and cannot be undone.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="danger" onClick={() => privy.logout()}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <Button variant="outline" onClick={() => setDeleteAccountConfirmOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );

  const tabContent: Record<TabId, () => JSX.Element> = {
    general: renderGeneral,
    security: renderSecurity,
    billing: renderBilling,
    account: renderAccount,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account, preferences, and security settings.
        </p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px" aria-label="Settings tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {tabContent[activeTab]()}

      {/* Dialogs (always mounted, independent of tabs) */}
      <Dialog
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Your profile is managed by your authentication provider. Changes made here are for display purposes only.
          </p>
          <Input
            label="Display Name"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            placeholder="Your name"
          />
          <Input
            label="Email"
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            placeholder="your@email.com"
            disabled
            hint="Email is managed by your auth provider"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Password management is handled by your authentication provider. Use the fields below to request a password change.
          </p>
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Update Password
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={revokeSessionConfirmOpen}
        onClose={() => { setRevokeSessionConfirmOpen(false); setSessionToRevoke(null); }}
        onConfirm={handleRevokeSession}
        title="Revoke Session"
        description="Are you sure you want to revoke this session? The device will be signed out immediately."
        confirmLabel="Revoke"
        confirmVariant="danger"
      />

      <Dialog
        open={deleteAccountConfirmOpen}
        onClose={() => { setDeleteAccountConfirmOpen(false); setDeleteConfirmText(''); }}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Input
            label={`Type "${APP_NAME}" to confirm`}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder={APP_NAME}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setDeleteAccountConfirmOpen(false); setDeleteConfirmText(''); }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleteConfirmText !== APP_NAME}
              onClick={handleDeleteAccount}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
