"use client";

import React, { useState, useEffect, Suspense, Component } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Calendar, MapPin, Phone, Mail, Download, Share2 } from "lucide-react";
import "@/app/globals.css";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HamburgerDrawer from "@/components/ui/HamburgerDrawer";
import Link from "next/link";

// Define booking confirmation interface
interface BookingDetails {
  id: string;
  partyDate: string;
  partyTime: string;
  location: string;
  partyType: string;
  totalAmount: number;
  vendors: {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    phone?: string;
    email?: string;
  }[];
  hostName: string;
  hostEmail: string;
  hostPhone: string;
  bookingDate: string;
  confirmationNumber: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <h2 className="text-center text-foreground">Something went wrong. Please try again later.</h2>;
    }
    return this.props.children;
  }
}

export default function BookingConfirmationPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mock booking details - in real app, fetch from API using booking ID
  useEffect(() => {
    const bookingId = searchParams.get('booking_id') || 'BK-2025-001';
    
    // Mock data - replace with actual API call
    const mockBookingDetails: BookingDetails = {
      id: bookingId,
      partyDate: "February 15, 2025",
      partyTime: "2:00 PM - 6:00 PM",
      location: "123 Party Street, Brooklyn, NY 11201",
      partyType: "Princess Birthday Party",
      totalAmount: 850,
      hostName: "Sarah Johnson",
      hostEmail: "sarah.johnson@email.com",
      hostPhone: "(555) 123-4567",
      bookingDate: "January 8, 2025",
      confirmationNumber: "PB-" + bookingId,
      vendors: [
        {
          id: "v1",
          name: "Magical Moments Cakes",
          category: "Cakes & Desserts",
          price: 180,
          image: "/placeholder.jpg",
          phone: "(555) 234-5678",
          email: "info@magicalcakes.com"
        },
        {
          id: "v2", 
          name: "Princess Party Decorations",
          category: "Decorations",
          price: 320,
          image: "/placeholder.jpg",
          phone: "(555) 345-6789",
          email: "hello@princessparty.com"
        },
        {
          id: "v3",
          name: "Enchanted Entertainment",
          category: "Entertainment",
          price: 350,
          image: "/placeholder.jpg",
          phone: "(555) 456-7890",
          email: "bookings@enchanted.com"
        }
      ]
    };

    setBookingDetails(mockBookingDetails);
  }, [searchParams]);

  const handleDownloadReceipt = () => {
    // In real app, generate and download PDF receipt
    console.log("Downloading receipt...");
  };

  const handleShareConfirmation = () => {
    // In real app, implement sharing functionality
    console.log("Sharing confirmation...");
  };

  const handlePlanAnotherParty = () => {
    router.push("/");
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense>
      <ErrorBoundary>
        <div className="min-h-screen bg-white">
          <header className="bg-white">
            <div className="container mx-auto px-4 py-3">
              <div className="flex justify-between items-center">
                {/* Logo on the left */}
                <Link href="/" className="cursor-pointer -ml-6">
                  <Image 
                    src="/logo.png" 
                    alt="PartaiBook" 
                    width={140} 
                    height={56} 
                    className="h-[56px] w-auto object-contain" 
                    priority
                    quality={100}
                    unoptimized={true}
                    style={{ 
                      imageRendering: 'crisp-edges',
                      WebkitFontSmoothing: 'antialiased',
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)'
                    }}
                  />
                </Link>
                {/* Navigation on the right */}
                <div className="flex items-center space-x-4 mr-[-20px]">
                  <button
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    className="text-foreground hover:text-primary transition-colors flex items-center space-x-1 px-2.5 py-2 bg-primary hover:bg-primary/90 rounded-sm ml-3"
                    aria-label="Open menu"
                  >
                    <span className="h-5 w-5 text-white">👤</span>
                    <span className="h-5 w-5 text-white">☰</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full border-b border-border" />
          </header>

          {/* Hero Confirmation Section */}
          <section className="py-16 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="container mx-auto text-center max-w-4xl">
              <div className="mb-8">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#222222" }}>
                  🎉 Party Booked Successfully! 🎉
                </h1>
                <p className="text-xl mb-6 max-w-2xl mx-auto leading-relaxed" style={{ color: "#222222" }}>
                  Your <span className="font-semibold text-primary">{bookingDetails.partyType}</span> is officially happening! 
                  Get ready for an absolutely magical celebration.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge variant="outline" className="border-green-500 text-green-600 px-4 py-2 rounded-sm">
                  ✅ Payment Confirmed
                </Badge>
                <Badge variant="outline" className="border-primary text-primary px-4 py-2 rounded-sm">
                  📧 Vendors Notified
                </Badge>
                <Badge variant="outline" className="border-accent text-accent px-4 py-2 rounded-sm">
                  📱 Confirmation Sent
                </Badge>
                <Badge variant="outline" className="border-purple-500 text-purple-600 px-4 py-2 rounded-sm">
                  🎈 Party Mode: ON
                </Badge>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-green-200">
                <h2 className="text-2xl font-bold mb-4" style={{ color: "#222222" }}>
                  Confirmation #{bookingDetails.confirmationNumber}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold" style={{ color: "#222222" }}>Party Date & Time</p>
                        <p className="text-muted-foreground">{bookingDetails.partyDate}</p>
                        <p className="text-muted-foreground">{bookingDetails.partyTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold" style={{ color: "#222222" }}>Location</p>
                        <p className="text-muted-foreground">{bookingDetails.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold" style={{ color: "#222222" }}>Host Contact</p>
                        <p className="text-muted-foreground">{bookingDetails.hostName}</p>
                        <p className="text-muted-foreground">{bookingDetails.hostPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold" style={{ color: "#222222" }}>Email</p>
                        <p className="text-muted-foreground">{bookingDetails.hostEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="default"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleDownloadReceipt}
                  aria-label="Download receipt"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Receipt
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={handleShareConfirmation}
                  aria-label="Share confirmation"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Confirmation
                </Button>
              </div>
            </div>
          </section>

          {/* Vendor Details Section */}
          <section className="py-16 px-4 bg-[#effdfa]">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl md:text-3xl font-bold mb-6 text-center" style={{ color: "#222222" }}>
                Your Dream Team Vendors
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                These amazing professionals will make your party unforgettable. They&apos;ve been notified and will contact you soon!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {bookingDetails.vendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="bg-white rounded-2xl border border-border shadow-md hover:shadow-lg transition p-6 text-center"
                  >
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <Image
                        src={vendor.image}
                        alt={vendor.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-full border-4 border-primary/20"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2" style={{ color: "#222222" }}>
                      {vendor.name}
                    </h3>
                    <Badge variant="outline" className="border-primary text-primary px-3 py-1 rounded-sm mb-3">
                      {vendor.category}
                    </Badge>
                    <p className="text-2xl font-bold text-primary mb-4">
                      ${vendor.price}
                    </p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {vendor.phone && (
                        <div className="flex items-center justify-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{vendor.phone}</span>
                        </div>
                      )}
                      {vendor.email && (
                        <div className="flex items-center justify-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{vendor.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-primary/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: "#222222" }}>
                      Total Investment in Fun
                    </h3>
                    <p className="text-muted-foreground">Your complete party package</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-primary">
                      ${bookingDetails.totalAmount}
                    </p>
                    <p className="text-sm text-muted-foreground">Paid in full ✅</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* What Happens Next Section */}
          <section className="py-16 px-4 bg-white">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl md:text-3xl font-bold text-center mb-12 font-sans drop-shadow-sm" style={{ color: "#222222" }}>
                What Happens Next? 🚀
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: "📧",
                    title: "Vendors Will Contact You",
                    desc: "Each vendor will reach out within 24 hours to confirm details and coordinate delivery/setup times.",
                    bgColor: "#00CBA7",
                  },
                  {
                    icon: "💬",
                    title: "Chat & Coordinate",
                    desc: "Use our platform to chat with vendors, share inspiration photos, and make any final adjustments.",
                    bgColor: "#A78BFA",
                  },
                  {
                    icon: "🎊",
                    title: "Party Time!",
                    desc: "Show up and enjoy your perfectly planned celebration. Your vendors handle everything else!",
                    bgColor: "#FF8C42",
                  },
                ].map((step, idx) => (
                  <div key={idx} className="text-center">
                    <div className="flex justify-center mb-4">
                      <span
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full text-3xl"
                        style={{ backgroundColor: `rgba(${hexToRgb(step.bgColor)}, 0.2)` }}
                      >
                        {step.icon}
                      </span>
                    </div>
                    <h3 className="text-[22px] font-semibold mb-5 text-foreground">{step.title}</h3>
                    <p className="text-[16px] text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="py-12 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="container mx-auto text-center max-w-4xl">
              <h2 className="text-3xl md:text-3xl font-bold text-center mb-3 font-sans drop-shadow-sm" style={{ color: "#222222" }}>
                Ready to Plan Your Next Celebration? 🎈
              </h2>
              <p className="text-[18px] leading-relaxed mb-6" style={{ color: "#222222" }}>
                That was easy, right? Why not book your next party while you&apos;re here?<br />
                Birthdays, anniversaries, baby showers - we&apos;ve got you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="default"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handlePlanAnotherParty}
                  aria-label="Plan another party"
                >
                  Plan Another Party
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => router.push("/dashboard")}
                  aria-label="View dashboard"
                >
                  View My Dashboard
                </Button>
              </div>
            </div>
          </section>

          <footer className="py-6 px-4 bg-muted text-sm">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <span className="text-lg font-semibold text-teal-600">PartaiBook</span>
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

          {/* Hamburger Drawer - positioned as fixed overlay */}
          {isDrawerOpen && (
            <HamburgerDrawer 
              isOpen={isDrawerOpen} 
              onToggle={() => setIsDrawerOpen(!isDrawerOpen)} 
            />
          )}
        </div>
      </ErrorBoundary>
    </Suspense>
  );
}

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}
