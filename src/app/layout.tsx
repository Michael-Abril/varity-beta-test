import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskFlow - Project Management',
  description: 'Manage projects, track tasks, and collaborate with your team.',
  metadataBase: new URL('https://example.com'),
  openGraph: {
    title: 'TaskFlow - Project Management',
    description: 'Manage projects, track tasks, and collaborate with your team.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'TaskFlow - Project Management',
    description: 'Manage projects, track tasks, and collaborate with your team.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
