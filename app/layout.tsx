import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeGrande Fitness Center | Member Space',
  description: 'Your training plans, workouts and progress at LeGrande Fitness Center.',
  manifest: '/manifest.json',
  applicationName: 'LeGrande Fitness Center',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'LeGrande' },
  icons: { icon: '/legrande-logo.png', apple: '/legrande-logo.png' },
  themeColor: '#f6f6f4'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
