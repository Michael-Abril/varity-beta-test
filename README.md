# TaskFlow — SaaS Starter Template

[![Built with Varity](https://img.shields.io/badge/built%20with-Varity-7C3AED)](https://www.varity.so)

A full-featured project management app built with [Varity](https://www.varity.so). Everything works immediately — no configuration, no API keys, no setup.

## Quick Start

```bash
npm install
npm run dev
```

That's it. Open [http://localhost:3000](http://localhost:3000) and your app is fully functional:

- **Auth** works instantly (email + Google login)
- **Database** works instantly (create, read, update, delete)
- **Dashboard** is fully interactive with real data persistence

No `.env` file needed. No accounts to create. No credentials to configure.

## Make This Your Own (5 Minutes)

Transform this into your own branded SaaS app:

1. **App name** — Edit `APP_NAME` in `src/lib/constants.ts`
2. **Logo** — Replace `public/logo.svg` with your logo
3. **Colors** — Open `src/app/globals.css` and uncomment a color preset (Purple, Green, or Orange) or set your own
4. **Meta title** — Update the `title` and `description` in `src/app/layout.tsx`
5. **Navigation** — Edit `NAVIGATION_ITEMS` in `src/lib/constants.ts` to rename or add sidebar links
6. **Landing page** — Edit the sections in `src/components/landing/` (Hero, Features, Pricing, etc.)

## Built-in Color Themes

Switch your entire app's color scheme by editing `src/app/globals.css`:

| Theme | How |
|-------|-----|
| **Blue** (default) | Active by default |
| **Purple** | Uncomment the Purple `:root` block, comment out Blue |
| **Green** | Uncomment the Green `:root` block, comment out Blue |
| **Orange** | Uncomment the Orange `:root` block, comment out Blue |
| **Custom** | Set your own `--color-primary-*` values using any [Tailwind palette](https://tailwindcss.com/docs/customizing-colors) |

## What's Included

- **Zero-Config Auth** — Email and social login works out of the box
- **Zero-Config Database** — Data persistence with isolated dev environment
- **Dashboard** — KPI cards, data tables, status badges, getting started guide
- **Full CRUD** — Create, read, update, delete for projects, tasks, and team members
- **Command Palette** — Cmd+K search across all data
- **Protected Routes** — Automatic redirect for unauthenticated users
- **Landing Page** — Professional marketing page with hero, features, pricing, testimonials
- **Mobile Responsive** — Hamburger menu, responsive layouts, touch-friendly
- **TypeScript** — Full type safety throughout
- **Tailwind CSS** — Utility-first styling with CSS variable theming

## ✅ Zero Configuration Required

This template works immediately with **zero setup**:

### Instant Auth
- ✅ Email login (Privy)
- ✅ Google/Apple social login
- ✅ Dev credentials built-in
- ❌ No env vars needed

### Instant Database
- ✅ Create, read, update, delete data
- ✅ Dev token built-in
- ✅ Production-ready proxy
- ❌ No credentials needed

### Instant Deploy
```bash
npm run deploy
```
- ✅ Deploys to IPFS
- ✅ Auto-fetches credentials
- ❌ No thirdweb account needed

---

## 🏗️ Architecture

### Workspace Dependencies
This template uses `workspace:^` protocol for Varity packages:
```json
{
  "dependencies": {
    "@varity-labs/sdk": "workspace:^",
    "@varity-labs/ui-kit": "workspace:^",
    "@varity-labs/types": "workspace:^"
  }
}
```

**Why?** Ensures you always use the latest local package versions during development.

**Publishing:** When published to npm, `workspace:^` converts to `^2.0.0-alpha.1` automatically.

### Static Export Ready
- ✅ `output: 'export'` in next.config.js
- ✅ All pages pre-rendered to static HTML
- ✅ No server-side dependencies
- ✅ IPFS/CDN deployable

### Type Safety
- ✅ TypeScript strict mode enabled
- ✅ All errors surface during build
- ✅ No `ignoreBuildErrors` flag

## Project Structure

```
src/
  app/                    # Pages (Next.js App Router)
    dashboard/            # Protected dashboard pages
      projects/           # Project management (list + detail views)
      tasks/              # Task management (status filters, CSV export)
      team/               # Team management (invite, roles)
      settings/           # User settings (4-tab layout with backend persistence)
    login/                # Login page
  components/             # Reusable components
    dashboard/            # Dashboard-specific components
    landing/              # Landing page sections (Hero, Features, Pricing, etc.)
    shared/               # Shared components (Navbar, Footer)
    providers/            # App providers (auth, database, toast)
  lib/                    # Core utilities
    varity.ts             # SDK initialization
    database.ts           # Typed database collections
    hooks.ts              # Data hooks (useProjects, useTasks, useTeam)
    constants.ts          # App name, navigation, option lists
    utils.ts              # Helpers (CSV export, formatting)
  types/                  # TypeScript type definitions
```

## Add a New Page

Example: adding a `/dashboard/reports` page.

**1. Create the page file:**

```tsx
// src/app/dashboard/reports/page.tsx
'use client';

import { useProjects } from '@/lib/hooks';

export default function ReportsPage() {
  const { data: projects, loading } = useProjects();

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      <p className="text-gray-600">{projects.length} projects total</p>
    </div>
  );
}
```

**2. Add navigation item** in `src/lib/constants.ts`:

```ts
{ label: 'Reports', icon: 'chart', path: '/dashboard/reports' },
```

Done. The page is automatically protected by auth and appears in the sidebar.

## Add a New Data Collection

Example: adding an `invoices` collection.

**1. Define the type** in `src/types/index.ts`:

```ts
export interface Invoice {
  id: string;
  projectId: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid';
  createdAt: string;
}
```

**2. Create the collection** in `src/lib/database.ts`:

```ts
export const invoices = () => db.collection<Invoice>('invoices');
```

**3. Create a hook** in `src/lib/hooks.ts` (copy the `useProjects` pattern):

```ts
export function useInvoices(): UseCollectionReturn<Invoice> {
  // ... same pattern as useProjects, using invoices() instead of projects()
}
```

**4. Use it in any page:**

```tsx
const { data, loading, create, update, remove } = useInvoices();
```

The database collection is created automatically on first use — no migrations needed.

## Environment Variables

**For development:** Leave everything blank. Shared development credentials are used automatically.

**For production:** Run `varitykit app deploy` — it injects all credentials into your build automatically. You never need to manually set API keys.

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | No | Auth provider (auto-configured) |
| `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` | No | Infrastructure (auto-configured) |
| `NEXT_PUBLIC_VARITY_APP_TOKEN` | No | Database token (auto-configured) |
| `NEXT_PUBLIC_VARITY_APP_ID` | No | App ID (auto-configured) |

## Deployment

```bash
# Deploy to production with a live URL
varitykit app deploy

# Deploy and submit to the Varity App Store
varitykit app deploy --submit-to-store
```

The CLI builds your app, provisions a private database, injects production credentials, and deploys — all in one command.

**Deploy from your AI editor:** Set up the [Varity MCP server](https://docs.varity.so/mcp) (`npx @varity-labs/mcp`) and ask your AI to "deploy this project".

## Learn More

- [Varity Documentation](https://docs.varity.so)
- [UI Kit Components](https://docs.varity.so/ui-kit)
- [SDK Reference](https://docs.varity.so/sdk)
