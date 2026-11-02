import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'LeGrande Fitness Center', description: 'Your personal training companion', manifest: '/manifest.json' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html> }
