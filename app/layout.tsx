import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "NeonTrade",
  description: "3D real-time trading terminal built with Next.js 15"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
