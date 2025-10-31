import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Relationship Intelligence - AI-Powered Client Monitoring',
  description: 'Never let a client slip away. AI that reads your conversations like you do.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
