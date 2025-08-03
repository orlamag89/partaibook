"use client";

import React, { useState, useEffect, Suspense, Component } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import nlp from "compromise"; // Ensure this is installed
import "@/app/globals.css";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VendorModal from "@/components/modals/VendorModal";
import Navbar from "@/components/ui/Navbar";

// Define Vendor interface based on your Supabase schema
interface Vendor {
  id: string;
  name: string;
  location: string;
  image: string;
  description: string;
  price: string;
  category?: string; // Add if your schema includes this
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface ImageWithFallbackProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  role?: string;
  "aria-label"?: string;
  [key: string]: unknown;
}

const ImageWithFallback = ({ src, fallbackSrc, alt, width, height, className, role, "aria-label": ariaLabel, ...props }: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setImgSrc(src);
    const img = new window.Image();
    img.onload = () => setIsLoading(false);
    img.onerror = () => {
      if (imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc);
      } else {
        setIsLoading(false);
      }
    };
    img.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, fallbackSrc]);

  return (
    <>
      {isLoading && <div className="relative w-full aspect-[4/3] animate-pulse bg-gray-200" aria-hidden="true" />}
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        role={role}
        aria-label={ariaLabel}
        {...props}
        onLoadingComplete={() => setIsLoading(false)}
        style={{ display: isLoading ? "none" : "block" }}
        onError={() => {
          if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          } else {
            setIsLoading(false);
          }
        }}
      />
    </>
  );
};

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

const HowItWorks = () => (
  <section id="how-it-works" className="w-full py-16 px-4 bg-background">
    <div className="container mx-auto">
      <h2 className="text-3xl md:text-3xl font-bold text-center text-foreground mb-12 font-sans drop-shadow-sm">
        How PartaiBook Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto px-4">
        {[
          {
            icon: "🎈",
            title: "1. Describe your vibe",
            desc: `Throwing a birthday party? Baby shower? Small celebration? Just drop your vibe, date, location, if a venue is needed – even your budget. We'll understand your vision.`,
            bgColor: "#00CBA7",
          },
          {
            icon: "⚡",
            title: "2. Get instant matches",
            desc: `Our AI finds verified vendors who match your needs and are actually available nearby so you can browse through options and make your pick. No waiting, no chasing.`,
            bgColor: "#A78BFA",
          },
          {
            icon: "🎉",
            title: "3. Book, chat and track",
            desc: `Add as many vendors as you need to your cart and book your entire party in one seamless flow. Chat with vendors, send inspo, and track it all in one stress-free hub.`,
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
);

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

export default function HomePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const router = useRouter();

  // Fetch random vendors from Supabase
  useEffect(() => {
    const fetchRandomVendors = async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("random()") // PostgreSQL random() for randomization
        .limit(4); // Limit to 4 for spotlight section
      if (error) {
        console.error("Error fetching vendors:", error);
      } else {
        setVendors(data || []);
      }
    };
    fetchRandomVendors();
  }, []);

  const openModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVendor(null);
  };

  // Parse search query and navigate
  const handleFindVendors = () => {
    const query = searchQuery.trim();
    if (!query) {
      router.push("/search");
      return;
    }

    const doc = nlp(query.toLowerCase());
    let category = "";
    let location = "";
    let date = "";

    // Extract category (basic mapping)
    if (doc.has("cake") || doc.has("dessert")) category = "Cakes & Desserts";
    else if (doc.has("food") || doc.has("catering")) category = "Catering & Food";
    else if (doc.has("entertainment")) category = "Entertainment";

    // Extract location (simple keyword match)
    const locMatch = query.match(/in\s+([A-Za-z\s]+)(?:,|\b)/i);
    location = locMatch ? locMatch[1].trim() : "";

    // Extract date (basic regex)
    const dateMatch = query.match(/\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|next\s+\w+)\b/i);
    date = dateMatch ? dateMatch[0] : ""; // Placeholder, refine as needed

    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (location) params.append("location", location);
    if (date) params.append("date", date);
    router.push(`/search?${params.toString()}`);
    console.log("Navigating with params:", params.toString()); // Debug
  };

  return (
    <Suspense>
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <header className="bg-background">
            <div className="container mx-auto px-4 py-2">
              <Navbar />
            </div>
            <div className="w-full border-b border-border" />
          </header>

          {/* Restored Hero Section */}
          <section className="py-16 px-4">
            <div className="container mx-auto text-center">
              <h2 className="text-5xl font-bold text-foreground mb-6">
                Finally, party planning that <span className="text-secondary">doesn&apos;t suck</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto" style={{ fontSize: "20px" }}>
                The smart way to book birthdays and celebrations. Our AI matches your vision to available local vendors, taking you from planned to booked in minutes - not weeks. We handle the chaos, you throw the party.
              </p>
              <div id="search-section" className="max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <div className="focus-within:ring-4 focus-within:ring-primary/30 rounded-xl transition-shadow bg-white border-2 border-border focus-within:border-primary focus-within:border-2 p-0">
                    <textarea
                      placeholder="Describe your party vibe... e.g., 'princess theme for a 5-year-old in Queens, two tiered cake, balloons, decorations, entertainment, maybe food, 27th next month at 2pm, budget of $600'"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      rows={2}
                      className="pl-12 py-6 text-sm bg-transparent border-none focus:outline-none rounded-xl w-full resize-none align-middle"
                      style={{ minHeight: "3.5rem", maxHeight: "6.5rem", boxShadow: "none" }}
                    />
                  </div>
                </div>
                <Button
                  className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg"
                  onClick={handleFindVendors}
                >
                  Find My Perfect Vendors
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <Badge variant="outline" className="border-secondary text-secondary px-4 py-2 rounded-sm">
                  Instant Vendor Matches
                </Badge>
                <Badge variant="outline" className="border-primary text-primary px-4 py-2 rounded-sm">
                  No More Ghosting
                </Badge>
                <Badge variant="outline" className="border-accent text-accent px-4 py-2 rounded-sm">
                  Trusted Local Pros
                </Badge>
                <Badge variant="outline" className="border-muted-foreground text-muted-foreground px-4 py-2 rounded-sm">
                  Book Everything at Once
                </Badge>
              </div>
            </div>
          </section>

          <section id="vendors" className="py-16 px-4 bg-[#effdfa]">
            <div className="container mx-auto">
              <h2 className="text-3xl md:text-3xl font-bold text-foreground mb-6 text-center">
                Spotlight Vendors
              </h2>
              <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {vendors.length > 0 ? (
                    vendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="bg-card rounded-2xl border border-border shadow-md hover:shadow-lg transition p-4 flex flex-col"
                        aria-labelledby={`vendor-${vendor.id}-name`}
                      >
                        <h4 id={`vendor-${vendor.id}-name`} className="font-semibold text-base truncate" style={{ color: "#444" }}>
                          {vendor.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">{vendor.location}</p>
                        <div className="relative w-full aspect-[4/3] mb-3">
                          <ImageWithFallback
                            src={vendor.image}
                            fallbackSrc="/placeholder.jpg"
                            alt={vendor.name}
                            width={400}
                            height={300}
                            className="w-full object-cover rounded-md"
                            role="img"
                            aria-label={`${vendor.name} vendor image`}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                          {vendor.description && vendor.description.trim() !== ''
                            ? vendor.description
                            : 'No description provided.'}
                        </p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-base font-semibold" style={{ color: "#444" }}>
                            {vendor.price && vendor.price !== '' && !isNaN(Number(vendor.price))
                              ? `From $${vendor.price}`
                              : 'Contact for price'}
                          </span>
                          <Button
                            onClick={() => openModal(vendor)}
                            className="bg-primary text-primary-foreground font-semibold py-1.5 px-4 rounded-full shadow hover:bg-primary/90 transition text-sm"
                            aria-label={`Quick view for ${vendor.name}`}
                          >
                            Quick View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">Loading vendors...</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <HowItWorks />

          {/* Restored Comparison Section */}
          <section className="py-16 px-4 !bg-[#FDF9F5] relative z-10">
            <div className="container mx-auto max-w-6xl">
              <h2 className="text-3xl font-bold text-center text-foreground mb-4">
                The Old Way vs. The PartaiBook Way
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                Stop living in party planning hell. Here&apos;s what changes when you use PartaiBook.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Before - The Old Way */}
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
                  <div className="text-center mb-6">
                    <span className="text-4xl mb-2 block">😩</span>
                    <h3 className="text-xl font-bold text-red-700">The Old Way (Painful)</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      "Spend hours on Google trying to find the perfect vendors",
                      "DM roulette: who replied, who didn’t, where was that quote again?",
                      "Manually coordinate availability with every vendor",
                      "Worry about last-minute vendor changes with no backup plan",
                      "Different vendors, different payment methods, more stress",
                      "Vendor cancels? You’re left scrambling",
                      "You finally find someone you like… and they’re already booked",
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-red-500 text-base">❌</span>
                        <span className="text-red-700 text-sm leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-red-100 rounded-lg">
                    <div className="font-semibold text-red-800">Total Time: 1-2 weeks</div>
                    <div className="text-red-700">Stress Level: “Why did I say I’d plan this?”</div>
                  </div>
                </div>

                {/* After - The PartaiBook Way */}
                <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8">
                  <div className="text-center mb-6">
                    <span className="text-4xl mb-2 block">🎉</span>
                    <h3 className="text-xl font-bold text-green-700">The PartaiBook Way (Effortless)</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      "Describe your party idea in one sentence",
                      "Get instant matches from trusted available vendors",
                      "Browse real profiles with images, reviews, and pricing",
                      "Book multiple vendors in one go",
                      "Vendor has to cancel? You’re auto-matched with a backup",
                      "Track everything in one organized dashboard",
                      "Peace of mind: your payment is safe, even if plans change",
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-green-500 text-base">✅</span>
                        <span className="text-green-700 text-sm leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-green-200 rounded-lg">
                    <div className="font-semibold text-green-800">Total Time: 15 minutes</div>
                    <div className="text-green-700">Stress Level: “Wait… that was it?!” 😌</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-12 px-4 bg-gradient-to-r from-primary to-secondary">
            <div className="container mx-auto text-center max-w-4xl">
              <h2 className="text-3xl md:text-3xl font-bold text-center text-white mb-3 font-sans drop-shadow-sm">
                The party you&apos;re imagining? It&apos;s one click away.
              </h2>
              <p className="text-[18px] text-white/90 leading-relaxed mb-6">
                Let our AI handle the messy stuff - even the ghosting. Just show up, enjoy, and feel like a genius.<br />
                People won&apos;t believe you planned it all in minutes, while you smile like a lazy event god.<br />
                <span className="block mt-4">Welcome to your era of effortless parties.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  aria-label="Start planning your party now"
                >
                  Start Planning Now
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => window.open("https://example.com/demo", "_blank")}
                  aria-label="Watch a demo video of PartaiBook in action"
                >
                  Watch the Magic in Action
                </Button>
              </div>
            </div>
          </section>

          {isModalOpen && selectedVendor ? (
            <VendorModal vendor={{ ...selectedVendor, price: Number(selectedVendor.price) || 0 }} isOpen={isModalOpen} onClose={closeModal} />
          ) : null}

          <footer className="py-6 px-4 bg-muted text-sm">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold text-foreground">PartaiBook</span>
                </div>
                <div className="flex space-x-6 text-sm">
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</a>
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
      </ErrorBoundary>
    </Suspense>
  );
}