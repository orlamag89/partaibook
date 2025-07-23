"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Sparkles } from 'lucide-react';
import '@/app/globals.css'
// Assuming these components exist in your project under @/components/ui
// You might need to adjust paths or component names based on your actual setup

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import VendorModal from '@/components/modals/VendorModal';
import Navbar from '@/components/ui/Navbar';

// Mock data for vendors - replace with your actual data fetching
const mockVendors = [
  {
    id: '1',
    name: 'Sweet Dreams Bakery',
    location: 'Brooklyn, NY',
    image: '/images/bakery.jpg', // Placeholder, replace with actual image paths
    description: 'Custom cakes, cupcakes, and dessert tables. Specializing in whimsical designs and Instagram-worthy treats.',
    price: 150,
    galleryImages: ['/images/bakery_gallery1.jpg', '/images/bakery_gallery2.jpg', '/images/bakery_gallery3.jpg'],
    bio: 'Sweet Dreams Bakery has been crafting delicious and beautiful custom cakes for over 10 years. We believe every celebration deserves a centerpiece that tastes as good as it looks. Our team works closely with clients to bring their sweetest visions to life, from elegant wedding cakes to fun, themed birthday treats. We use only the finest ingredients and offer a variety of flavors and dietary options.',
  },
  {
    id: '2',
    name: 'Groove Masters DJ',
    location: 'Queens, NY',
    image: '/images/dj.jpg', // Placeholder, replace with actual image paths
    description: 'Professional DJ services for intimate gatherings. Expert at reading the room and keeping the energy perfect.',
    price: 300,
    galleryImages: ['/images/dj_gallery1.jpg', '/images/dj_gallery2.jpg', '/images/dj_gallery3.jpg'],
    bio: 'At Groove Masters DJ, we specialize in creating the perfect atmosphere for any event. Our experienced DJs have a vast music library spanning all genres, ensuring your guests are always on the dance floor. We pride ourselves on our ability to seamlessly blend tracks and respond to the crowd&apos;s energy, making every party unforgettable. From intimate brunches to lively micro-weddings, we tailor our sets to your unique vibe.',
  },
  {
    id: '3',
    name: 'Balloon Bliss Co.',
    location: 'Manhattan, NY',
    image: '/images/balloons.jpg', // Placeholder, replace with actual image paths
    description: 'Stunning balloon installations and decor. From simple bouquets to elaborate arches and backdrops.',
    price: 75,
    galleryImages: ['/images/balloons_gallery1.jpg', '/images/balloons_gallery2.jpg', '/images/balloons_gallery3.jpg'],
    bio: 'Transform your event space with the magic of balloons! Balloon Bliss Co. offers bespoke balloon artistry for all occasions. Whether you&apos;re looking for a vibrant arch, a whimsical backdrop, or elegant balloon bouquets, our creative team will design and install stunning arrangements that perfectly complement your theme and vision. We use high-quality, eco-friendly balloons to create unforgettable visual experiences.',
  },
  {
    id: '4',
    name: 'Party Perfect Planners',
    location: 'Bronx, NY',
    image: '/images/planner.jpg', // Placeholder, replace with actual image paths
    description: 'Full-service event planning for any occasion, big or small. We handle every detail so you don&apos;t have to.',
    price: 500,
    galleryImages: ['/images/planner_gallery1.jpg', '/images/planner_gallery2.jpg', '/images/planner_gallery3.jpg'],
    bio: 'Party Perfect Planners takes the stress out of event planning. From concept to execution, our dedicated team manages every detail, ensuring a flawless and memorable experience for you and your guests. We specialize in personalized events, working closely with you to understand your vision and bring it to life. Let us handle the logistics, vendor coordination, and design, so you can relax and enjoy your perfect party.',
  },
];

export default function HomePage() {

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedVendor, setSelectedVendor] = useState<typeof mockVendors[0] | null>(null);
  const router = useRouter();

  const openModal = (vendor: typeof mockVendors[0]) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVendor(null);
  };

  // ...existing code...
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background">
        <div className="container mx-auto px-4 py-2">
          <Navbar />
        </div>
        <div className="w-full border-b border-border" />
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Finally, party planning that <span className="text-secondary">doesn&apos;t suck</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto" style={{ fontSize: '20px' }}>
            The smart way to book birthdays and celebrations. Our AI matches your vision to available local vendors, taking you from planned to booked in minutes - not weeks. We handle the chaos, you throw the party.
          </p>
          {/* Search Bar */}
          <div id="search-section" className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <div className="focus-within:ring-4 focus-within:ring-primary/30 rounded-sm transition-shadow">
                <Input
                  type="text"
                  placeholder="Describe your party vibe... e.g., 'princess theme for a 5-year-old in Queens, two tiered cake, balloons, decorations, entertainment, maybe food'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-sm border-2 border-border focus:border-primary focus:outline-none rounded-sm"
                />
              </div>
            </div>
            <Button
              className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg"
              onClick={() => {
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                } else {
                  router.push('/search');
                }
              }}
            >
              Find My Perfect Vendors
            </Button>
          </div>
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
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
      {/* Spotlight Vendors - User's preferred section with original website styling */}
      <section id="vendors" className="py-16 px-4" style={{ backgroundColor: '#ECEEF0' }}>
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-3xl font-bold text-foreground mb-6 text-center">
            Spotlight Vendors
          </h2>
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {mockVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="bg-card rounded-2xl border border-border shadow-md hover:shadow-lg transition p-4 flex flex-col"
                >
                  <h4 className="font-semibold text-base text-foreground truncate">
                    {vendor.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">{vendor.location}</p>
                  <div className="relative w-full h-32 mb-3">
                    <Image
                      src={vendor.image}
                      alt={vendor.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {vendor.description}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-base font-semibold text-foreground">
                      From ${vendor.price}
                    </span>
                    <Button
                      onClick={() => openModal(vendor)} // Open modal on click
                      className="bg-primary text-primary-foreground font-semibold py-1.5 px-4 rounded-full shadow hover:bg-primary/90 transition text-sm"
                    >
                      Quick View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* How It Works - User's preferred section with adjusted heading size */}
      <section id="how-it-works" className="w-full py-16 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-3xl font-bold text-center text-foreground mb-12 font-sans drop-shadow-sm">
            How PartaiBook Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto px-4">
            {[
              {
                icon: '🎈', // Using a more relevant emoji for 'vibe'
                title: '1. Describe your vibe',
                desc: `Throwing a birthday party? Baby shower? Graduation bash? Just drop your vibe, date, location – even your budget. We'll understand your vision instantly.`,
              },
              {
                icon: '⚡',
                title: '2. Get instant matches',
                desc: `Our AI finds the perfect local vendors who match your preferences and are actually available so you can browse and book your party in minutes. No waiting, no chasing.`,
              },
              {
                icon: '🎉',
                title: '3. Book, chat and track',
                desc: `Add multiple vendors to your cart and book your entire party in one seamless flow. Chat with vendors, send inspo, and track everything in one stress-free hub.`,
              },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-4">
                  <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-accent text-3xl">
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
      {/* CTA Section */}
<section className="py-12 px-4 bg-gradient-to-r from-primary to-secondary">
  <div className="container mx-auto text-center max-w-3xl">
    <h3 className="text-3xl font-bold text-white mb-3">
      The party you’re imagining? It’s one click away.
    </h3>
    <p className="text-[18px] text-white/90 leading-relaxed mb-6">
      Let our AI handle the heavy lifting - Show up, enjoy, and feel like a genius.<br />
      Your friends will think you planned it all, while you smile like a lazy event god.<br />
      Welcome to your era of effortless parties.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        size="lg"
        variant="secondary"
        className="bg-white text-primary hover:bg-white/90"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
              Start Planning Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-primary hover:bg-white hover:text-primary">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>
      {/* Vendor Modal */}
      {isModalOpen && selectedVendor ? (
        <VendorModal
          vendor={selectedVendor}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      ) : null}
      {/* Footer */}
      <footer className="py-12 px-4 bg-muted">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">PartaiBook</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2025 PartaiBook. All rights reserved. Powered by AI, built for real life.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
