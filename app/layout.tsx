import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeGrande Fitness Center | Member Space',
  description: 'Your training, progress and recovery companion at LeGrande Fitness Center.',
  manifest: '/manifest.json',
  applicationName: 'LeGrande Fitness Center',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'LeGrande' },
  icons: { icon: '/logo.svg', apple: '/logo.svg' },
  themeColor: '#090d0b'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
