# Known Issues — SaaS Starter Template

> **Last Updated:** March 8, 2026
> **Template:** `saas-starter` (TaskFlow)
> **Status:** All features functional, builds with 0 errors (8 routes + _not-found)

---

## What Works

| Feature | Status | Notes |
|---------|--------|-------|
| Landing Page | Working | 6 sections, scroll animations, social proof |
| Auth (Login) | Working | Email/Google via Privy, zero-config dev credentials |
| Dashboard | Working | KPI cards, checklist, activity feed |
| Projects/Tasks/Team CRUD | Working | Full create, read, update, delete with validation |
| Settings | Working | 4 tabs with backend persistence via DB Proxy |
| Command Palette | Working | Cmd+K / Ctrl+K |
| Color Themes | Working | 4 presets (Blue, Purple, Green, Orange) |
| Static Export | Working | `output: 'export'` for IPFS deployment |
| Mobile Nav | Working | Responsive sidebar with hamburger menu |

## Known Issues

### 1. Auth Uses Privy Directly (Abstraction Coming Post-Beta)
The template uses `usePrivy()` and `NEXT_PUBLIC_PRIVY_APP_ID`. The planned `useAuth()` hook and `NEXT_PUBLIC_VARITY_AUTH_ID` env var are post-beta tasks. No action required -- current auth works correctly.

### 2. Payments Section is Placeholder
Settings > Billing shows mock UI. Credit card payment integration (on/off ramp) is coming soon. Wire your own billing provider (Stripe, etc.) if needed now.

### 3. No Server-Side Rendering
All pages are statically exported. No SSR, API routes, or middleware. Do not use dynamic routes (`[id]` patterns) -- use client-side state for detail views instead.

### 4. Navigation Flash
Brief "Initializing Dashboard" screen when navigating between pages. Caused by `PrivyReadyGate` re-checking auth state. Resolves in under 1 second.

### 5. Team Email Invites Are Local Only
No SMTP integration. Team members are added to the database but no invitation email is sent. Integrate your own email service if needed.

### 6. Sessions and Password Are Auth-Provider Managed
Settings > Security shows mock session data. Password changes and profile photos are managed by the auth provider (Privy), not the template.

## Environment

### Development (Zero Config)
```bash
npm install && npm run dev
```
No `.env` file, API keys, or accounts needed.

### Production
```bash
varitykit app deploy
```

## Reporting Issues

- GitHub: https://github.com/varity-labs/varity-sdk/issues
- Discord: https://discord.gg/7vWsdwa2Bg
