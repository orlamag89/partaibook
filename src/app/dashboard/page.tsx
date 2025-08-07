
"use client";

import React, { useState, useEffect, Suspense, Component } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Clock, Users, PartyPopper, Plus, Eye, Edit3, MessageCircle } from "lucide-react";
import "@/app/globals.css";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HamburgerDrawer from "@/components/ui/HamburgerDrawer";
import Link from "next/link";

// Define party booking interface
interface PartyBooking {
  id: string;
  partyName: string;
  partyDate: string;
  partyTime: string;
  location: string;
  partyType: string;
  status: "upcoming" | "completed" | "cancelled";
  totalAmount: number;
  guestCount: number;
  vendorCount: number;
  image: string;
  confirmationNumber: string;
  vendors: {
    id: string;
    name: string;
    category: string;
    status: "confirmed" | "pending" | "cancelled";
  }[];
}

interface UpcomingEvent {
  date: string;
  title: string;
  type: "party" | "vendor_contact" | "payment";
  description: string;
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

const QuickStats = ({ bookings }: { bookings: PartyBooking[] }) => {
  const totalParties = bookings.length;
  const upcomingParties = bookings.filter(b => b.status === "upcoming").length;
  const totalSpent = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const completedParties = bookings.filter(b => b.status === "completed").length;

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-3xl font-bold text-center mb-12 font-sans drop-shadow-sm" style={{ color: "#222222" }}>
          Your Party Planning Stats 📊
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              icon: "🎉",
              title: "Total Parties",
              value: totalParties,
              desc: "Celebrations planned",
              bgColor: "#00CBA7",
            },
            {
              icon: "📅",
              title: "Upcoming Events",
              value: upcomingParties,
              desc: "Parties to look forward to",
              bgColor: "#A78BFA",
            },
            {
              icon: "💰",
              title: "Total Investment",
              value: `$${totalSpent.toLocaleString()}`,
              desc: "In amazing memories",
              bgColor: "#FF8C42",
            },
            {
              icon: "✨",
              title: "Completed",
              value: completedParties,
              desc: "Successful celebrations",
              bgColor: "#10B981",
            },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 text-center border border-border">
              <div className="flex justify-center mb-4">
                <span
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full text-2xl"
                  style={{ backgroundColor: `rgba(${hexToRgb(stat.bgColor)}, 0.2)` }}
                >
                  {stat.icon}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1" style={{ color: "#222222" }}>
                {stat.value}
              </h3>
              <p className="text-sm font-semibold text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-xs text-muted-foreground">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Dashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [bookings, setBookings] = useState<PartyBooking[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [userName] = useState<string>("Sarah");
  const router = useRouter();

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockBookings: PartyBooking[] = [
      {
        id: "1",
        partyName: "Emma's 7th Birthday",
        partyDate: "February 15, 2025",
        partyTime: "2:00 PM - 6:00 PM",
        location: "123 Party Street, Brooklyn, NY",
        partyType: "Princess Birthday Party",
        status: "upcoming",
        totalAmount: 850,
        guestCount: 20,
        vendorCount: 3,
        image: "/placeholder.jpg",
        confirmationNumber: "PB-BK-2025-001",
        vendors: [
          { id: "v1", name: "Magical Moments Cakes", category: "Cakes & Desserts", status: "confirmed" },
          { id: "v2", name: "Princess Party Decorations", category: "Decorations", status: "confirmed" },
          { id: "v3", name: "Enchanted Entertainment", category: "Entertainment", status: "pending" }
        ]
      },
      {
        id: "2",
        partyName: "Wedding Anniversary",
        partyDate: "March 10, 2025",
        partyTime: "7:00 PM - 11:00 PM",
        location: "456 Celebration Ave, Manhattan, NY",
        partyType: "Anniversary Celebration",
        status: "upcoming",
        totalAmount: 1200,
        guestCount: 40,
        vendorCount: 4,
        image: "/placeholder.jpg",
        confirmationNumber: "PB-WA-2025-002",
        vendors: [
          { id: "v4", name: "Elegant Catering Co.", category: "Catering", status: "confirmed" },
          { id: "v5", name: "Romantic Flowers", category: "Flowers", status: "confirmed" }
        ]
      },
      {
        id: "3",
        partyName: "Jake's Baby Shower",
        partyDate: "December 20, 2024",
        partyTime: "1:00 PM - 4:00 PM",
        location: "789 Family Rd, Queens, NY",
        partyType: "Baby Shower",
        status: "completed",
        totalAmount: 600,
        guestCount: 25,
        vendorCount: 2,
        image: "/placeholder.jpg",
        confirmationNumber: "PB-BS-2024-003",
        vendors: [
          { id: "v6", name: "Sweet Baby Cakes", category: "Cakes & Desserts", status: "confirmed" },
          { id: "v7", name: "Blue Balloon Co.", category: "Decorations", status: "confirmed" }
        ]
      }
    ];

    const mockUpcomingEvents: UpcomingEvent[] = [
      {
        date: "January 10, 2025",
        title: "Vendor Check-in Call",
        type: "vendor_contact",
        description: "Final details call with Enchanted Entertainment for Emma's party"
      },
      {
        date: "February 14, 2025",
        title: "Setup Day",
        type: "party",
        description: "Emma's 7th Birthday Party setup begins at 12:00 PM"
      },
      {
        date: "March 5, 2025",
        title: "Final Payment Due",
        type: "payment",
        description: "Wedding Anniversary remaining balance due"
      }
    ];

    setBookings(mockBookings);
    setUpcomingEvents(mockUpcomingEvents);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge variant="outline" className="border-blue-500 text-blue-600 px-3 py-1 rounded-sm">🔮 Upcoming</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-green-500 text-green-600 px-3 py-1 rounded-sm">✅ Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="border-red-500 text-red-600 px-3 py-1 rounded-sm">❌ Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-500 text-gray-600 px-3 py-1 rounded-sm">❓ Unknown</Badge>;
    }
  };

  const getVendorStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="outline" className="border-green-500 text-green-600 px-2 py-0.5 rounded-sm text-xs">✅</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600 px-2 py-0.5 rounded-sm text-xs">⏳</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="border-red-500 text-red-600 px-2 py-0.5 rounded-sm text-xs">❌</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-500 text-gray-600 px-2 py-0.5 rounded-sm text-xs">❓</Badge>;
    }
  };

  const handlePlanNewParty = () => {
    router.push("/");
  };

  const handleViewParty = (bookingId: string) => {
    router.push(`/confirmation?booking_id=${bookingId}`);
  };

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

          {/* Hero Welcome Section */}
          <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="container mx-auto text-center max-w-4xl">
              <div className="mb-8">
                <PartyPopper className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#222222" }}>
                  Welcome back, {userName}! 🎊
                </h1>
                <p className="text-xl mb-6 max-w-2xl mx-auto leading-relaxed" style={{ color: "#222222" }}>
                  Your party planning command center. Track your celebrations, chat with vendors, and plan your next amazing event.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button
                  size="lg"
                  variant="default"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handlePlanNewParty}
                  aria-label="Plan a new party"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Plan New Party
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => router.push("/vendors")}
                  aria-label="Browse vendors"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Browse Vendors
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="outline" className="border-green-500 text-green-600 px-4 py-2 rounded-sm">
                  🎉 Party Pro Status
                </Badge>
                <Badge variant="outline" className="border-primary text-primary px-4 py-2 rounded-sm">
                  📱 Instant Notifications
                </Badge>
                <Badge variant="outline" className="border-accent text-accent px-4 py-2 rounded-sm">
                  💬 Direct Vendor Chat
                </Badge>
              </div>
            </div>
          </section>

          <QuickStats bookings={bookings} />

          {/* My Parties Section */}
          <section className="py-16 px-4 bg-[#effdfa]">
            <div className="container mx-auto max-w-6xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl md:text-3xl font-bold" style={{ color: "#222222" }}>
                  My Parties 🎈
                </h2>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={handlePlanNewParty}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Party
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-border shadow-md hover:shadow-lg transition p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1" style={{ color: "#222222" }}>
                          {booking.partyName}
                        </h3>
                        <p className="text-sm text-muted-foreground">{booking.partyType}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{booking.partyDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{booking.partyTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="truncate">{booking.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{booking.guestCount} guests</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-2" style={{ color: "#222222" }}>
                        Vendors ({booking.vendors.length})
                      </p>
                      <div className="space-y-1">
                        {booking.vendors.slice(0, 2).map((vendor) => (
                          <div key={vendor.id} className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground truncate">{vendor.name}</span>
                            {getVendorStatusBadge(vendor.status)}
                          </div>
                        ))}
                        {booking.vendors.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{booking.vendors.length - 2} more vendors
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-primary">
                        ${booking.totalAmount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        #{booking.confirmationNumber}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleViewParty(booking.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => console.log("Chat with vendors")}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      {booking.status === "upcoming" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                          onClick={() => console.log("Edit party")}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Upcoming Events Timeline */}
          <section className="py-16 px-4 bg-white">
            <div className="container mx-auto max-w-4xl">
              <h2 className="text-3xl md:text-3xl font-bold text-center mb-12 font-sans drop-shadow-sm" style={{ color: "#222222" }}>
                What&apos;s Coming Up? 📅
              </h2>
              <div className="space-y-6">
                {upcomingEvents.map((event, idx) => (
                  <div key={idx} className="flex gap-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-border">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        {event.type === "party" && <span className="text-xl">🎉</span>}
                        {event.type === "vendor_contact" && <span className="text-xl">📞</span>}
                        {event.type === "payment" && <span className="text-xl">💳</span>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg" style={{ color: "#222222" }}>
                          {event.title}
                        </h3>
                        <span className="text-sm text-muted-foreground">{event.date}</span>
                      </div>
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="py-12 px-4 bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="container mx-auto text-center max-w-4xl">
              <h2 className="text-3xl md:text-3xl font-bold text-center mb-3 font-sans drop-shadow-sm" style={{ color: "#222222" }}>
                Ready for Your Next Celebration? 🚀
              </h2>
              <p className="text-[18px] leading-relaxed mb-6" style={{ color: "#222222" }}>
                You&apos;re getting good at this party planning thing! Why not celebrate your planning skills with... another party?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="default"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handlePlanNewParty}
                  aria-label="Plan another party"
                >
                  Plan Another Party
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => router.push("/vendors")}
                  aria-label="Discover vendors"
                >
                  Discover New Vendors
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