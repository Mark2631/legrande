import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Member space | LeGrande Fitness Center',
  robots: { index: false, follow: false },
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return children
}
