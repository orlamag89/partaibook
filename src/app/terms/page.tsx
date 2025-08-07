import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background">
        <div className="container mx-auto px-4 py-1 md:py-2">
          <div className="flex justify-center">
            <Link href="/" className="cursor-pointer">
              <Image src="/logo.png" alt="PartaiBook" width={200} height={96} className="h-16 md:h-24 w-auto" />
            </Link>
          </div>
        </div>
        <div className="w-full border-b border-border" />
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center" style={{ color: "#222222" }}>
          Terms of Service
        </h1>
        
        <div className="prose prose-lg max-w-none" style={{ color: "#222222" }}>
          <p className="text-lg mb-6" style={{ color: "#6A6A6A" }}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <div style={{ color: "#6A6A6A", lineHeight: "1.6" }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#222222" }}>Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using PartaiBook, you accept and agree to be bound by the terms and provision 
              of this agreement.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#222222" }}>Service Description</h2>
            <p className="mb-4">
              PartaiBook is an AI-powered platform that connects party planners with verified vendors for 
              birthdays, celebrations, and events.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#222222" }}>User Responsibilities</h2>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account and password and for 
              restricting access to your computer.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#222222" }}>Vendor Obligations</h2>
            <p className="mb-4">
              Vendors must provide accurate information about their services, maintain professional standards, 
              and honor all confirmed bookings.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#222222" }}>Payment Terms</h2>
            <p className="mb-4">
              All payments are processed securely through our platform. Deposits are required to confirm bookings, 
              and final payments are processed according to the agreed timeline.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#222222" }}>Limitation of Liability</h2>
            <p className="mb-4">
              PartaiBook shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#222222" }}>Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us at legal@partaibook.com.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 bg-muted text-sm mt-16">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="h-6 w-6" style={{ color: "#00CBA7" }} />
              <span className="text-lg font-semibold" style={{ color: "#00CBA7" }}>PartaiBook</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</a>
            </div>
          </div>

          <div className="w-full border-t border-border my-6" />

          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 PartaiBook. All rights reserved. AI-Powered Party Planning for Real Life.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
