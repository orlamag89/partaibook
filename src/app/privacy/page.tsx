import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none" style={{ color: "#222222" }}>
          <p className="text-lg mb-6" style={{ color: "#6A6A6A" }}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <div style={{ color: "#6A6A6A", lineHeight: "1.6" }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#222222" }}>Information We Collect</h2>
            <p className="mb-4">
              At PartaiBook, we collect information you provide directly to us, such as when you create an account, 
              book vendors, or contact us for support.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#222222" }}>How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect to provide, maintain, and improve our services, process transactions, 
              and communicate with you about your bookings and our services.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#222222" }}>Information Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
              except as described in this privacy policy.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#222222" }}>Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#222222" }}>Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at privacy@partaibook.com.
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
