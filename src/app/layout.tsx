import './globals.css'
import Navbar from '@/components/ui/Navbar'
import { LoginModalProvider } from '@/context/LoginModalContext'
import LoginModalWrapper from '@/components/modals/LoginModalWrapper'

// Dummy font variables to avoid fetching fonts in Codex
const inter = {
  variable: '--font-geist-sans',
}

const robotoMono = {
  variable: '--font-geist-mono',
}

export const metadata = {
  title: 'PartaiBook',
  description: 'Plan unforgettable events with AI',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased bg-gray-100 min-h-screen`}>
        <LoginModalProvider>
          <Navbar />
          <LoginModalWrapper />
          <main className="bg-white min-h-screen p-4">{children}</main>
        </LoginModalProvider>
      </body>
    </html>
  )
}
