import './globals.css'
import { SearchProvider } from '@/context/SearchContext'
import { LoginModalProvider } from '@/context/LoginModalContext'

export const metadata = {
  title: 'PartaiBook | AI Party Planner',
  description: 'Plan unforgettable parties and events with AI. Instantly find and book local cakes, decor, catering, venues and more — all in one place.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LoginModalProvider>
          <SearchProvider>
            {children}
          </SearchProvider>
        </LoginModalProvider>
      </body>
    </html>
  )
}