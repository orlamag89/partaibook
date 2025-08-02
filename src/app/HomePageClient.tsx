"use client";
import { Suspense, Component } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/Navbar";
import SpotlightVendors from "@/components/SpotlightVendors";

interface Vendor {
  id: string;
  name: string;
  location: string;
  image?: string;
  description?: string;
  price?: string;
  category?: string;
  galleryImages?: string[];
  images?: string[];
  about_your_business?: string;
  rating?: number;
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

interface HomePageClientProps {
  vendors: Vendor[];
}


// --- HERO SECTION WITH SEARCH BAR ---
const HeroSection = () => (
  <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 px-4">
    <div className="container mx-auto max-w-4xl text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground drop-shadow-sm">
        Effortless Party Planning, Powered by AI
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Instantly match with the best local vendors for your vibe, budget, and date. Book your entire party in minutes, not weeks.
      </p>
      <form className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="What are you celebrating? (e.g. 30th birthday, baby shower)"
          className="w-full md:w-2/5 px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base bg-background"
        />
        <input
          type="text"
          placeholder="Location (suburb or city)"
          className="w-full md:w-1/4 px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base bg-background"
        />
        <input
          type="date"
          className="w-full md:w-1/5 px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-base bg-background"
        />
        <Button type="submit" size="lg" className="w-full md:w-auto">
          Search Vendors
        </Button>
      </form>
    </div>
  </section>
);

// --- OLD WAY VS PARTAIBOOK TABLE ---
const ComparisonTable = () => (
  <div className="overflow-x-auto">
    <table className="w-full max-w-4xl mx-auto border border-border rounded-lg bg-white shadow-sm">
      <thead>
        <tr className="bg-muted">
          <th className="py-3 px-4 text-left text-lg font-semibold text-foreground">The Old Way</th>
          <th className="py-3 px-4 text-left text-lg font-semibold text-primary">The PartaiBook Way</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-3 px-4 border-b border-border text-muted-foreground">Hours of Googling, DMing, and chasing vendors</td>
          <td className="py-3 px-4 border-b border-border text-foreground">Instant matches with available, verified vendors</td>
        </tr>
        <tr>
          <td className="py-3 px-4 border-b border-border text-muted-foreground">No idea who&apos;s legit or available</td>
          <td className="py-3 px-4 border-b border-border text-foreground">See real reviews, availability, and pricing up front</td>
        </tr>
        <tr>
          <td className="py-3 px-4 border-b border-border text-muted-foreground">Endless back-and-forth, ghosting, and stress</td>
          <td className="py-3 px-4 border-b border-border text-foreground">Book, chat, and track everything in one place</td>
        </tr>
        <tr>
          <td className="py-3 px-4 text-muted-foreground">Worry you forgot something important</td>
          <td className="py-3 px-4 text-foreground">AI keeps you on track and in control</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const HomePageClient: React.FC<HomePageClientProps> = ({ vendors }) => (
  <Suspense>
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <header className="bg-background">
          <div className="container mx-auto px-4 py-2">
            <Navbar />
          </div>
          <div className="w-full border-b border-border" />
        </header>
        <HeroSection />
        <SpotlightVendors vendors={vendors} />
        <HowItWorks />
        <section className="py-16 px-4 !bg-[#FDF9F5] relative z-10">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-foreground mb-4">
              The Old Way vs. The PartaiBook Way
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Stop living in party planning hell. Here&apos;s what changes when you use PartaiBook.
            </p>
            <ComparisonTable />
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
              <p>© 2025 PartaiBook. All rights reserved. Powered by AI, built for real life.</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  </Suspense>
);

export default HomePageClient;
