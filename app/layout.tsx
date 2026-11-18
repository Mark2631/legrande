import type { Metadata } from 'next'
import './globals.css'
export const metadata:Metadata={title:'LeGrande Fitness Center | Train with purpose',description:'A focused training space for strength, fitness and consistency.',manifest:'/manifest.json',applicationName:'LeGrande Fitness Center',appleWebApp:{capable:true,statusBarStyle:'default',title:'LeGrande'},icons:{icon:'/legrande-logo.png',apple:'/legrande-logo.png'}}
export const viewport = { themeColor: '#f5f4f0' }
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
