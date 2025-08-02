"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import HamburgerDrawer from "@/components/ui/HamburgerDrawer";
import { Button } from "@/components/ui/button";
import "@/app/globals.css";

interface Vendor {
  name: string;
  location: string;
  images: string[];
  description: string;
  price: string;
  id: string;
}

interface VendorCategories {
  [key: string]: Vendor[];
}

const mockVendors: VendorCategories = {
  "Cakes": [
    { id: "1", name: "Sweet Dreams Bakery", location: "Brooklyn, NY", images: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&crop=center", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop&crop=center"], description: "Custom cakes and desserts.", price: "$150" },
    { id: "2", name: "Frosted Bliss", location: "Queens, NY", images: ["https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop&crop=center", "https://images.unsplash.com/photo-1592913640230-3e9e5e687ba0?w=400&h=300&fit=crop&crop=center"], description: "Artisan cupcakes.", price: "$120" },
  ],
  "Entertainment": [
    { id: "3", name: "Groove Masters DJ", location: "Queens, NY", images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center", "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=300&fit=crop&crop=center"], description: "Professional DJ services.", price: "$200" },
    { id: "4", name: "Magic Moments", location: "Manhattan, NY", images: ["https://images.unsplash.com/photo-1571266028243-d220bc5cd5f1?w=400&h=300&fit=crop&crop=center", "https://images.unsplash.com/photo-1516726817509-f69e83a0e2d9?w=400&h=300&fit=crop&crop=center"], description: "Magicians for kids.", price: "$180" },
  ],
  "Decor": [
    { id: "5", name: "Balloon Bliss Co.", location: "Manhattan, NY", images: ["https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop&crop=center", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center"], description: "Balloon installations.", price: "$130" },
    { id: "6", name: "Theme Crafters", location: "Bronx, NY", images: ["https://images.unsplash.com/photo-1464047736614-af63643285bf?w=400&h=300&fit=crop&crop=center", "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=300&fit=crop&crop=center"], description: "Custom decor setups.", price: "$160" },
  ],
};

export default function VendorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("id");
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const loginModalRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const hamburgerDrawerRef = useRef<HTMLDivElement>(null);
  const vendorImageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [activeDots, setActiveDots] = useState<{ [key: string]: number }>({});
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as Node;
      const isHamburger = hamburgerRef.current && hamburgerRef.current.contains(target);
      const isHamburgerDrawer = hamburgerDrawerRef.current && hamburgerDrawerRef.current.contains(target);
      const isLoginModal = loginModalRef.current && loginModalRef.current.contains(target);
      if (!isHamburger && !isLoginModal) {
        setIsHamburgerOpen(false);
        setIsLoginModalOpen(false);
      }
      if (isHamburgerOpen && !isHamburgerDrawer && !isHamburger) {
        setIsHamburgerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isHamburgerOpen, isLoginModalOpen]);

  useEffect(() => {
    const refsCopy = { ...vendorImageRefs.current };
    const updateDots = () => {
      Object.keys(refsCopy).forEach((vendorId) => {
        const ref = refsCopy[vendorId];
        if (ref) {
          const scrollWidth = ref.scrollWidth;
          const clientWidth = ref.clientWidth;
          const scrollLeft = ref.scrollLeft;
          const imageCount = ref.children.length;
          const activeDot = Math.min(Math.floor((scrollLeft / (scrollWidth - clientWidth)) * (imageCount - 1)), imageCount - 1);
          setActiveDots((prev) => ({ ...prev, [vendorId]: activeDot }));
        }
      });
    };

    Object.values(refsCopy).forEach((ref) => {
      if (ref) {
        ref.addEventListener("scroll", updateDots);
      }
    });

    return () => {
      Object.values(refsCopy).forEach((ref) => {
        if (ref) {
          ref.removeEventListener("scroll", updateDots);
        }
      });
    };
  }, []);

  const handleScroll = (vendorId: string, direction: "left" | "right") => {
    const ref = vendorImageRefs.current[vendorId];
    if (ref) {
      const scrollAmount = direction === "left" ? -300 : 300;
      ref.scrollLeft += scrollAmount;
    }
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => new Set(prev).add(id));
  };

  const handleDotKeyDown = (vendorId: string, index: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const ref = vendorImageRefs.current[vendorId];
      if (ref) {
        const scrollWidth = ref.scrollWidth;
        const clientWidth = ref.clientWidth;
        const newScrollLeft = (index / (ref.children.length - 1)) * (scrollWidth - clientWidth);
        ref.scrollLeft = newScrollLeft;
        setActiveDots((prev) => ({ ...prev, [vendorId]: index }));
      }
    }
  };
  const handleDotClick = (vendorId: string, index: number) => {
    const ref = vendorImageRefs.current[vendorId];
    if (ref) {
      const scrollWidth = ref.scrollWidth;
      const clientWidth = ref.clientWidth;
      const newScrollLeft = (index / (ref.children.length - 1)) * (scrollWidth - clientWidth);
      ref.scrollLeft = newScrollLeft;
      setActiveDots((prev) => ({ ...prev, [vendorId]: index }));
    }
  };

  const getVendorById = (id: string) => {
    return Object.values(mockVendors).flat().find((vendor) => vendor.id === id) || null;
  };

  const vendor = vendorId ? getVendorById(vendorId) : null;

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <button onClick={() => setIsLoginModalOpen(true)} className="hidden" aria-label="Open login modal" />
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/30 z-200 flex items-center justify-center">
          <div ref={loginModalRef} className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Login</h2>
            <button onClick={() => setIsLoginModalOpen(false)} className="mt-4 px-4 py-2 bg-primary text-white rounded">Close</button>
          </div>
        </div>
      )}
      <header className="bg-[#F9F9F9] sticky top-0 z-[2000]">
        <div className="container mx-auto px-4 py-0 max-w-7xl">
          <nav className="w-full bg-[#F9F9F9] h-20 py-2 flex items-center justify-between px-4">
            <div className="flex items-center justify-between w-full">
              <Link href="/" className="flex items-center space-x-2 font-bold text-foreground font-sans tracking-tight -ml-8 mt-0.5" aria-label="Home">
                <Sparkles className="h-8 w-8 text-primary" />
                <span className="text-2xl">PartaiBook</span>
              </Link>
              <div className="flex gap-1 items-center mr-[-32px] mt-0.5" ref={hamburgerRef}>
                <div className="ml-1">
                  <HamburgerDrawer
                    className="text-white bg-primary hover:bg-primary/90 transition-colors rounded-sm p-2 flex items-center justify-center"
                    aria-label="Open menu"
                    isOpen={isHamburgerOpen}
                    onToggle={() => setIsHamburgerOpen(!isHamburgerOpen)}
                    drawerRef={hamburgerDrawerRef}
                  />
                </div>
              </div>
            </div>
          </nav>
        </div>
        <div className="w-full border-b border-border" />
      </header>

      <section className="py-6 px-6 mt-4">
        <div className="container mx-auto max-w-7xl">
          {vendor ? (
            <>
              <div className="mb-12 mt-4">
                <div className="w-full flex-shrink-0">
                  <div className="relative w-full h-64">
                    <div
                      ref={(el) => { if (el) vendorImageRefs.current[vendor.id] = el; }}
                      className="flex overflow-x-auto scroll-snap-type-x mandatory space-x-2 pb-4 scrollbar-hide"
                      style={{ scrollBehavior: "smooth" }}
                      role="region"
                      aria-label={`${vendor.name} image gallery`}
                    >
                      {vendor.images.map((image, index) => (
                        <div key={`${vendor.id}-${index}`} className="flex-shrink-0 w-full h-64">
                          {failedImages.has(`${vendor.id}-${index}`) ? (
                            <Image
                              src="/api/placeholder/300/200"
                              alt={`${vendor.name} placeholder ${index + 1}`}
                              width={250}
                              height={256}
                              className="w-full h-64 object-cover rounded-md"
                              unoptimized
                            />
                          ) : (
                            <Image
                              src={image}
                              alt={`${vendor.name} image ${index + 1}`}
                              width={250}
                              height={256}
                              className="w-full h-64 object-cover rounded-md"
                              onError={() => handleImageError(`${vendor.id}-${index}`)}
                              unoptimized
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleScroll(vendor.id, "left")}
                        className="bg-background border border-border rounded-full w-7 h-7 hover:bg-gray-200"
                        aria-label={`Scroll left ${vendor.name} images`}
                      >
                        <ChevronLeft className="h-3.5 w-3.5 text-foreground" />
                      </Button>
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleScroll(vendor.id, "right")}
                        className="bg-background border border-border rounded-full w-7 h-7 hover:bg-gray-200"
                        aria-label={`Scroll right ${vendor.name} images`}
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-foreground" />
                      </Button>
                    </div>
                    <div
                      role="tablist"
                      className="absolute left-1/2 -translate-x-1/2 bottom-2 flex justify-center items-center gap-1"
                      aria-label={`${vendor.name} image navigation`}
                    >
                    {vendor.images.map((_, index) => (
                      <button
                        key={`${vendor.id}-dot-${index}`}
                        type="button"
                        aria-label={`Go to image ${index + 1}`}
                        aria-selected={activeDots[vendor.id] === index}
                        tabIndex={0}
                        onClick={() => handleDotClick(vendor.id, index)}
                        onKeyDown={(e) => handleDotKeyDown(vendor.id, index, e)}
                        className={`rounded-full cursor-pointer transition-colors ${activeDots[vendor.id] === index ? "bg-white" : "bg-gray-300"} border border-gray-400`}
                        style={{ minWidth: '8px', minHeight: '8px', width: '8px', height: '8px', marginRight: index === vendor.images.length - 1 ? '0px' : '1px' }}
                      >
                        {activeDots[vendor.id] === index && <span className="sr-only">Active image {index + 1}</span>}
                      </button>
                    ))}
                    </div>
                  </div>
                  <h4 className="text-base font-semibold truncate mt-2 text-foreground">{vendor.name}</h4>
                  <p className="text-sm text-muted-foreground"><span className="font-medium">Location:</span> {vendor.location} | <span className="font-medium">Price:</span> {vendor.price}</p>
                  <p className="text-sm line-clamp-2 text-muted-foreground"><span className="font-medium">Description:</span> {vendor.description}</p>
                  <div className="mt-2">
                    <Link href="/search" className="text-primary text-sm underline mr-4">Back to Search</Link>
                    <Link href="/vendors" className="text-primary text-sm underline">Back to Vendors</Link>
                  </div>
                </div>
              </div>
              <h2 className="text-lg font-semibold mb-4 text-left text-foreground" style={{ marginLeft: "0" }}>
                <span style={{ color: '#444' }}>Other Vendors</span>
              </h2>
              {Object.entries(mockVendors).map(([category, vendors]) => (
                <div key={category} className="mb-12 mt-4 relative">
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pb-4"
                  >
                  <h3 className="text-base font-semibold mb-2 text-left text-foreground ml-0">
                    {category} <span className="text-muted-foreground">({vendors.length})</span>
                  </h3>
                  {vendors.map((v) => (
                    v.id !== vendor.id && (
                      <div
                        key={v.id}
                        className="w-full flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow rounded-md"
                        onClick={() => router.push(`/vendors?id=${v.id}`)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${v.name} profile`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            router.push(`/vendors?id=${v.id}`);
                          }
                        }}
                        style={{ outline: "none" }}
                      >
                        <div className="relative w-full h-48">
                          <div
                            className="flex overflow-x-auto scroll-snap-type-x mandatory space-x-2 pb-2 scrollbar-hide"
                            style={{ scrollBehavior: "smooth" }}
                          >
                            {v.images.slice(0, 2).map((image, index) => (
                              <div key={`${v.id}-${index}`} className="flex-shrink-0 w-full h-48">
                                <Image
                                  src={image}
                                  alt={`${v.name} image ${index + 1}`}
                                  width={200}
                                  height={192}
                                  className="w-full h-48 object-cover rounded-md cursor-pointer"
                                  onError={() => handleImageError(`${v.id}-${index}`)}
                                  unoptimized
                                  style={{ cursor: "pointer" }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        <h4 className="text-base font-semibold truncate mt-2 text-foreground">{v.name}</h4>
                        <p className="text-sm text-muted-foreground">{v.location} - {v.price}</p>
                        <p className="text-sm line-clamp-1 text-muted-foreground">{v.description}</p>
                      </div>
                    )
                  ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center text-foreground" style={{ color: '#444' }}>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Vendor not found</h2>
          <Link href="/vendors" className="text-primary text-sm underline">Back to Vendors</Link>
            </div>
          )}
        </div>
      </section>
      <style>
        {`.scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }`}
      </style>
    </div>
  );
}