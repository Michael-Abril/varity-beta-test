'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@varity-labs/ui-kit';

export function Providers({ children }: { children: ReactNode }) {
  // Only ToastProvider at the global level.
  // PrivyStack is added in dashboard/layout.tsx and login/page.tsx —
  // the landing page loads instantly without any auth dependency.
  return <ToastProvider>{children}</ToastProvider>;
}
