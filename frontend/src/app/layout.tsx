import type { Metadata } from 'next';
import '@/styles/theme.css';
import '@/styles/fonts.css';
import '@/styles/tailwind.css';

export const metadata: Metadata = {
  title: 'College Management System',
  description: 'College Management System - Admin, Faculty and Student Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
