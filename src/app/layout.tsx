"use client";
import './globals.css';
import { Component } from 'react';
import { SearchProvider } from '@/context/SearchContext';
import { LoginModalProvider } from '@/context/LoginModalContext';
import LoginModalRoot from './LoginModalRoot';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h2 className="text-center text-foreground">Something went wrong. Please try again later.</h2>;
    }
    return this.props.children;
  }
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-background">
        <ErrorBoundary>
          <SearchProvider>
            <LoginModalProvider>
              <LoginModalRoot />
              {children}
            </LoginModalProvider>
          </SearchProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}