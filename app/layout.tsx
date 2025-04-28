import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '3D-Editor',
  description: '一款开箱即用的3D编辑器开源模版',
  generator: '趣谈前端 - 徐小夕',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
