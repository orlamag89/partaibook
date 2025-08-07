
"use client";

import type { GeoJSONSource } from "mapbox-gl";
import React from "react";

import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, Menu, User } from "lucide-react";
import Link from "next/link";
import HamburgerDrawer from "@/components/ui/HamburgerDrawer";
import { Button } from "@/components/ui/button";
import ShortlistModal from "./ShortlistModal";
import { createClient } from "@supabase/supabase-js";
import nlp from "compromise";
import mapboxgl from "mapbox-gl";
import "@/app/globals.css";

interface Vendor {
  id: string;
  name: string;
  location: string;
  images: string[];
  description: string;
  price: string;
  category: string;
  unavailable_dates?: string[];
  longitude?: number;
  latitude?: number;
  [key: string]: string | string[] | number | boolean | undefined;
}

interface VendorCategories {
  [key: string]: Vendor[];
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vibeQuery, setVibeQuery] = useState(searchParams.get("q") || "");
  const [dateQuery, setDateQuery] = useState<Date | null>(searchParams.get("date") ? new Date(searchParams.get("date")!) : null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isVibeInputOpen, setIsVibeInputOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const loginModalRef = useRef<HTMLDivElement>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const vibeDropdownRef = useRef<HTMLDivElement>(null);
  const calendarDropdownRef = useRef<HTMLDivElement>(null);
  const vendorImageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [activeDots, setActiveDots] = useState<{ [key: string]: number }>({});
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [spotlightVendor, setSpotlightVendor] = useState<Vendor | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapBounds, setMapBounds] = useState<mapboxgl.LngLatBounds | null>(null); // Used now
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // --- Move fetchVendorsInBounds above all useEffect hooks that reference it ---
  const fetchVendorsInBounds = React.useCallback(async (bounds: mapboxgl.LngLatBounds) => {
    if (!bounds) return; // Guard against null
    const { data } = await supabase
      .from("vendors")
      .select("*")
      .gte("latitude", bounds.getSouth())
      .lte("latitude", bounds.getNorth())
      .gte("longitude", bounds.getWest())
      .lte("longitude", bounds.getEast());
    if (data) {
      const vendorsWithCoords = await Promise.all(data.map(async (vendor: Vendor) => {
        if (vendor.location && (!vendor.longitude || !vendor.latitude)) {
          const [longitude, latitude] = await geocodeLocation(vendor.location);
          await supabase
            .from("vendors")
            .update({ longitude, latitude })
            .eq("id", vendor.id);
          return { ...vendor, longitude, latitude };
        }
        return vendor;
      }));
      setVendors(vendorsWithCoords);
      // Only update map markers if map is loaded
      if (map.current && map.current.loaded()) {
        updateMapMarkers(vendorsWithCoords);
      }
    }
  }, []);

  // Fetch vendors with geocoded coordinates (temporary client-side geocoding until API route is adjusted)
  useEffect(() => {
    const fetchVendors = async () => {
      const { data, error } = await supabase.from("vendors").select("*");
      if (error) console.error("Error fetching vendors:", error);
      else {
        const vendorsWithCoords = await Promise.all(data.map(async (vendor) => {
          if (vendor.location && (!vendor.longitude || !vendor.latitude)) {
            const [longitude, latitude] = await geocodeLocation(vendor.location);
            await supabase
              .from("vendors")
              .update({ longitude, latitude })
              .eq("id", vendor.id);
            return { ...vendor, longitude, latitude };
          }
          return vendor;
        }));
        setVendors(vendorsWithCoords);
        // Only update map markers if map is loaded
        if (map.current && map.current.loaded()) {
          updateMapMarkers(vendorsWithCoords);
        }
      }
    };
    fetchVendors();
  }, []);

  // Fetch spotlight vendor
  useEffect(() => {
    const fetchSpotlight = async () => {
      const { data } = await supabase.from("settings").select("spotlight_vendor_id").single();
      if (data?.spotlight_vendor_id) {
        const { data: vendor } = await supabase.from("vendors").select("*").eq("id", data.spotlight_vendor_id).single();
        setSpotlightVendor(vendor || null);
      }
    };
    fetchSpotlight();
    const interval = setInterval(fetchSpotlight, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Prepare shortlisted vendors for modal
  const shortlistedVendors = Array.from(selectedVendors).map((id) => {
    const info = vendors.find((v) => v.id === id);
    return info && info.images && info.images.length > 0
      ? { id: info.id, name: info.name, category: info.category, image: info.images[0], images: info.images }
      : info
        ? { id: info.id, name: info.name, category: info.category, image: undefined, images: [] }
        : null;
  }).filter(Boolean) as Array<{ id: string; name: string; category: string; image?: string; images?: string[] }>;

  // Remove vendor from shortlist
  const handleRemoveShortlist = (vendorId: string) => {
    setSelectedVendors((prev) => {
      const newSet = new Set(prev);
      newSet.delete(vendorId);
      return newSet;
    });
  };

  // Continue to booking
  const handleContinueBooking = () => {
    setIsShortlistModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isVibeDropdown = vibeDropdownRef.current && vibeDropdownRef.current.contains(target);
      const isCalendarDropdown = calendarDropdownRef.current && calendarDropdownRef.current.contains(target);
      const isLoginModal = loginModalRef.current && loginModalRef.current.contains(target);
      if (!isVibeDropdown && !isCalendarDropdown && !isLoginModal) {
        setIsSearchExpanded(false);
        setIsVibeInputOpen(false);
        setIsHamburgerOpen(false);
        setIsLoginModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchExpanded, isVibeInputOpen, isHamburgerOpen, isLoginModalOpen]);

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

  const handleScroll = (category: string, direction: "left" | "right") => {
    const container = scrollRefs.current[category];
    if (container) {
      const scrollAmount = direction === "left" ? -300 : 300;
      container.scrollLeft += scrollAmount;
    }
  };

  const totalVendors = vendors.length;

  // Extract location from vibeQuery for use in filters
  const locationQuery = vibeQuery.match(/in\s+([A-Za-z\s]+),?\s*[A-Za-z]*/i)?.[1]?.trim() || "";

  const handleSearchSubmit = () => {
    const dateStr = dateQuery ? dateQuery.toISOString().split("T")[0] : "";
    const doc = nlp(vibeQuery.toLowerCase());
    let newCategoryFilter = "";
    const dateMatch = vibeQuery.match(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/);
    const parsedDate = dateMatch ? new Date(dateMatch[0].split("/").reverse().join("-")) : null;

    if (doc.has("cake") || doc.has("dessert")) newCategoryFilter = "Cakes & Desserts";
    else if (doc.has("finger food") || doc.has("catering") || doc.has("food")) newCategoryFilter = "Catering & Food";
    else if (doc.has("entertainment") || doc.has("games") || doc.has("activities")) newCategoryFilter = "Entertainment";
    else if (doc.has("other") || !Object.keys(categories).some(cat => doc.has(cat.toLowerCase()))) newCategoryFilter = "Other";

    setCategoryFilter(newCategoryFilter);
    setDateQuery(parsedDate || dateQuery);
    router.push(`/search?q=${encodeURIComponent(vibeQuery)}${dateStr ? `&date=${encodeURIComponent(dateStr)}` : ""}`);
    setIsSearchExpanded(false);
    setIsVibeInputOpen(false);
    if (map.current && mapBounds) {
      fetchVendorsInBounds(mapBounds);
    }
  };

  const handleImageError = (id: string) => {
    setFailedImages((prev) => new Set(prev).add(id));
  };

  const handleVibeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearchSubmit();
    }
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

  const handleCheckboxChange = (vendorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSelectedVendors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(vendorId)) {
        newSet.delete(vendorId);
      } else {
        newSet.add(vendorId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (isShortlistModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isShortlistModalOpen]);

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-73.935242, 40.730610], // Default to Queens, NY
        zoom: 10,
      });

      map.current.on("load", () => {
        if (!map.current) return;
        
        map.current.addSource("vendors", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });
        
        map.current.addLayer({
          id: "vendors",
          type: "circle",
          source: "vendors",
          paint: {
            "circle-radius": 6,
            "circle-color": [
              "match",
              ["get", "category"],
              "Cakes & Desserts", "#FFF9C4",
              "Catering & Food", "#C8E6C9",
              "Balloons & Decor", "#F8BBD0",
              "Entertainment", "#FFCDD2",
              "Photography & Video", "#FFE0B2",
              "Venue Hire", "#BBDEFB",
              "Kids Activities", "#F8BBD0",
              "Transport", "#D7CCC8",
              "Games & Rentals", "#B2DFDB",
              "Other", "#D7CCC8",
              "#D7CCC8", // Default color
            ],
            "circle-opacity": 0.8,
          },
        });

        // Only update markers after map has fully loaded
        updateMapMarkers(vendors);
      });

      map.current.on("move", () => {
        if (!map.current) return;
        const bounds = map.current.getBounds();
        setMapBounds(bounds);
        if (bounds) fetchVendorsInBounds(bounds);
      });

      map.current.on("error", (e) => {
        console.warn("Map error:", e);
      });

    } catch (error) {
      console.error("Failed to initialize map:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [vendors, fetchVendorsInBounds]);

  const updateMapMarkers = (vendorsToUpdate: Vendor[]) => {
    if (!map.current || !map.current.loaded()) return;
    
    try {
      const source = map.current.getSource("vendors");
      if (source && "setData" in source) {
        (source as GeoJSONSource).setData({
          type: "FeatureCollection",
          features: vendorsToUpdate
            .filter(v => v.longitude && v.latitude)
            .map(v => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [v.longitude!, v.latitude!] },
              properties: { id: v.id, name: v.name, price: v.price, category: v.category },
            })),
        });
      }
    } catch (error) {
      console.warn("Map markers update failed:", error);
    }
  };




  // Temporary client-side geocoding (adjust if Geocoding scope is added)
  const geocodeLocation = async (location: string): Promise<[number, number]> => {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1`
    );
    const data = await response.json();
    return data.features[0]?.center || [0, 0];
  };

  const categoryColors: Record<string, string> = { // Type safety
    "Cakes & Desserts": "#FFF9C4",
    "Catering & Food": "#C8E6C9",
    "Balloons & Decor": "#F8BBD0",
    "Entertainment": "#FFCDD2",
    "Photography & Video": "#FFE0B2",
    "Venue Hire": "#BBDEFB",
    "Kids Activities": "#F8BBD0",
    "Transport": "#D7CCC8",
    "Games & Rentals": "#B2DFDB",
    "Other": "#D7CCC8",
  };

  const categories = {
    "Cakes & Desserts": ["Custom Cakes", "Cupcakes", "Cookies", "Dessert Tables"],
    "Catering & Food": ["Full Service", "Finger Food", "Grazing Table", "Private Chef", "Food Trucks"],
    "Balloons & Decor": ["Balloon Arches", "Backdrops", "Table Decor", "Themed Styling"],
    "Entertainment": ["DJs", "Magicians", "Clowns", "Face Painters", "Dancers", "Mascots"],
    "Photography & Video": ["Photographer", "Videographer", "360 Booth", "Photobooth"],
    "Venue Hire": ["Indoor", "Outdoor", "Rooftops", "Private Rooms"],
    "Kids Activities": ["Soft Play", "Bouncy Castle", "Craft Stations", "Puppet Shows"],
    "Transport": ["Party Buses", "Limos", "Shuttle Vans", "Vintage Cars"],
    "Games & Rentals": ["Giant Games", "Arcade Machines", "Lawn Games", "Karaoke Machine"],
  };

  const groupedVendors = vendors.reduce((acc, vendor) => {
    const cat = typeof vendor.category === 'string' && vendor.category.trim() !== ''
      ? vendor.category.split(" > ")[0]
      : "Other";
    acc[cat] = acc[cat] || [];
    acc[cat].push(vendor);
    return acc;
  }, {} as VendorCategories);

  const [filters, setFilters] = useState<Record<string, string[]>>({
    "Cakes & Desserts": [],
    "Catering & Food": [],
    "Balloons & Decor": [],
    "Entertainment": [],
    "Photography & Video": [],
    "Venue Hire": [],
    "Kids Activities": [],
    "Transport": [],
    "Games & Rentals": [],
    "Other": [],
  });

  const filteredVendors = Object.fromEntries(
    Object.entries(groupedVendors).map(([cat, vend]) => [
      cat,
      vend.filter(v =>
        (!categoryFilter || v.category === categoryFilter || v.category.includes(categoryFilter.split(" > ")[1]) || v.category.includes("Other")) &&
        (!dateQuery || !v.unavailable_dates?.some(d => new Date(d).toDateString() === dateQuery.toDateString())) &&
        (!locationQuery || v.location.toLowerCase().includes(locationQuery.toLowerCase())) &&
        (filters[cat].length === 0 || filters[cat].every(filter => typeof v[filter] === 'boolean' && v[filter] === true))
      )
    ])
  );

  const handleFilterChange = (category: string, filter: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [category]: checked
        ? [...prev[category], filter]
        : prev[category].filter(f => f !== filter),
    }));
  };

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
      <header className="w-full sticky top-0 z-[2000] bg-white">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex justify-between items-center">
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
            
            {/* Search bar in the center */}
            <div className="flex-1 flex justify-center max-w-md mx-8">
              <div className="w-full flex items-center gap-2">
                <div className="flex items-center border rounded-full px-4 py-2 bg-gray-50 text-sm text-black w-full" aria-label="Edit search">
                  <div className="flex-1 pr-2 truncate max-w-[220px] min-w-[120px]" onClick={() => setIsVibeInputOpen(true)}>
                    <span className="text-sm">{vibeQuery || "Make changes?"}</span>
                  </div>
                  <div className="border-l border-border h-6 mx-2" />
                  <div className="flex-none w-[60px] pl-2 truncate" onClick={() => setIsSearchExpanded(true)}>
                    <span className="text-sm">
                      {dateQuery
                        ? `${dateQuery.toLocaleString('en-US', { month: 'short' })} ${dateQuery.getDate()}`
                        : "Date"}
                    </span>
                  </div>
                  <div className="flex items-center justify-end ml-2">
                    <Search className="h-5 w-5 text-[#A78BFA]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation on the right */}
            <div className="flex items-center space-x-4 mr-[-20px]">
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-base font-normal text-foreground hover:text-primary transition-colors hidden md:block mr-4"
              >
                How it Works
              </button>
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="text-foreground hover:text-primary transition-colors flex items-center space-x-1 px-2.5 py-2 bg-primary hover:bg-primary/90 rounded-sm ml-3"
                aria-label="Open menu"
              >
                <User className="h-5 w-5 text-white" />
                <Menu className="h-5 w-5 text-white" />
              </button>
            </div>
          </nav>
        </div>
        <div className="w-full border-b border-border" />
        
        {/* Enhanced Category Filter Bar */}
        <div className="flex overflow-x-auto space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 sticky top-20 z-10 scrollbar-hide">
          {Object.keys(categories).map(cat => (
            <Button
              key={cat}
              onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)}
              variant={categoryFilter === cat ? "default" : "outline"}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                categoryFilter === cat 
                  ? "bg-primary text-white shadow-lg scale-105" 
                  : "bg-white border-border text-foreground hover:bg-primary hover:text-white hover:border-primary"
              }`}
            >
              {cat} {categoryFilter === cat && "✨"}
            </Button>
          ))}
          <Button
            onClick={() => setIsFilterModalOpen(true)}
            variant="outline"
            className="px-4 py-2 rounded-full text-sm font-semibold bg-white border-primary text-primary hover:bg-primary hover:text-white whitespace-nowrap"
          >
            🔍 More Filters
          </Button>
        </div>
      </header>

      {(isVibeInputOpen || isSearchExpanded) && (
        <div className="fixed inset-0 bg-black/20 z-40" style={{ top: "80px" }} />
      )}
      {isVibeInputOpen && (
        <div className="absolute w-full max-w-[300px] mx-auto mt-0 bg-card rounded-lg shadow-lg p-4 z-50 left-1/2 -translate-x-1/2" ref={vibeDropdownRef}>
          <div className="relative">
            <textarea
              placeholder="Describe your party vibe"
              value={vibeQuery}
              onChange={(e) => setVibeQuery(e.target.value)}
              onKeyDown={handleVibeKeyDown}
              className="w-full h-24 text-sm border-2 border-border focus:border-primary focus:outline-none rounded-md bg-gray-50 px-4 py-2 text-black resize-none"
              aria-label="Search vibe"
              autoFocus
            />
            <Search
              className="h-5 w-5 text-[#A78BFA] absolute right-2 bottom-2 cursor-pointer"
              onClick={handleSearchSubmit}
              aria-label="Submit search"
            />
          </div>
        </div>
      )}
      {isSearchExpanded && (
        <div className="absolute w-full max-w-[600px] mx-auto mt-0 bg-card rounded-lg shadow-lg p-4 z-50 left-1/2 -translate-x-1/2" ref={calendarDropdownRef}>
          <div className="flex flex-col gap-2">
            {/* Placeholder for calendar - replace with actual component */}
            <div className="airbnb-calendar-wrapper" style={{ padding: "0 24px" }}>
              <p>Calendar placeholder (implement AirbnbCalendar)</p>
            </div>
            <Search
              className="h-5 w-5 text-[#A78BFA] self-end cursor-pointer"
              onClick={handleSearchSubmit}
              aria-label="Submit search"
            />
          </div>
        </div>
      )}

      {/* Hero Results Section */}
      <section className="py-8 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#222222" }}>
            🎉 Amazing Vendors Found!
          </h1>
          <p className="text-lg mb-6 max-w-2xl mx-auto leading-relaxed" style={{ color: "#222222" }}>
            We discovered <span className="font-bold text-primary">{totalVendors} perfect vendors</span> to make your party absolutely unforgettable!
          </p>
          
          {spotlightVendor && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-border max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-3">
                <span className="text-2xl mr-2">⭐</span>
                <h3 className="font-semibold text-lg" style={{ color: "#222222" }}>Spotlight Vendor</h3>
              </div>
              <Link href={`/vendors/${spotlightVendor.id}`} className="block hover:bg-gray-50 rounded-lg p-3 transition-colors">
                <h4 className="font-bold text-primary text-xl mb-2">{spotlightVendor.name}</h4>
                <p className="text-muted-foreground">{spotlightVendor.description}</p>
                <Button size="sm" className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90">
                  View Details ✨
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Vendors Section */}
      <section className="py-8 px-4 bg-white">
        <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            {Object.entries(filteredVendors).map(([category, vendors]) => (
              <div key={category} className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3" style={{ color: "#222222" }}>
                    <span 
                      className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold"
                      style={{ backgroundColor: categoryColors[category], color: "#222222" }}
                    >
                      {category}
                    </span>
                    <span className="text-primary text-lg">({vendors.length})</span>
                  </h2>
                </div>
                
                <div className="relative">
                  {/* Scroll buttons */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleScroll(category, "left")}
                    className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-primary rounded-full w-10 h-10 hover:bg-primary hover:text-white shadow-lg hidden md:flex"
                    aria-label={`Scroll left ${category}`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleScroll(category, "right")}
                    className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 bg-white border-2 border-primary rounded-full w-10 h-10 hover:bg-primary hover:text-white shadow-lg hidden md:flex"
                    aria-label={`Scroll right ${category}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Vendor grid with horizontal scroll */}
                  <div
                    ref={(el) => { (scrollRefs.current[category] as HTMLDivElement | null) = el; }}
                    className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide scroll-smooth"
                    style={{ scrollSnapType: 'x mandatory' }}
                  >
                    {vendors.map((vendor) => {
                      if (!vendor.images || !vendor.images.length) {
                        return (
                          <div key={vendor.id} className="flex-shrink-0 w-[280px] md:w-[300px]">
                            <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center border border-border">
                              <span className="text-muted-foreground">No images available</span>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={vendor.id} className="flex-shrink-0 w-[280px] md:w-[300px]" style={{ scrollSnapAlign: 'start' }}>
                          <Link href={`/vendors/${vendor.id}`} className="block group">
                            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-border overflow-hidden group-hover:scale-[1.02]">
                              <div className="relative h-48">
                                <div
                                  ref={(el) => { if (el) vendorImageRefs.current[vendor.id] = el; }}
                                  className="flex overflow-x-auto scrollbar-hide h-full"
                                  style={{ scrollBehavior: "smooth", scrollSnapType: 'x mandatory' }}
                                >
                                  {vendor.images.map((image, index) => (
                                    <div key={`${vendor.id}-${index}`} className="flex-shrink-0 w-full h-full relative" style={{ scrollSnapAlign: 'start' }}>
                                      {failedImages.has(`${vendor.id}-${index}`) ? (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                          <span className="text-muted-foreground">Image unavailable</span>
                                        </div>
                                      ) : (
                                        <Image
                                          src={image}
                                          alt={`${vendor.name} image ${index + 1}`}
                                          width={300}
                                          height={192}
                                          className="w-full h-full object-cover"
                                          onError={() => handleImageError(`${vendor.id}-${index}`)}
                                          unoptimized
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Checkbox overlay */}
                                <div className="absolute top-3 right-3">
                                  <label className="custom-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={selectedVendors.has(vendor.id)}
                                      onChange={(e) => { e.stopPropagation(); handleCheckboxChange(vendor.id, e); }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="checkmark" />
                                  </label>
                                </div>

                                {/* Image dots */}
                                {vendor.images.length > 1 && (
                                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                                    {vendor.images.map((_, index) => (
                                      <button
                                        key={`${vendor.id}-dot-${index}`}
                                        type="button"
                                        aria-label={`Go to image ${index + 1}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const ref = vendorImageRefs.current[vendor.id];
                                          if (ref) {
                                            const scrollWidth = ref.scrollWidth;
                                            const clientWidth = ref.clientWidth;
                                            const newScrollLeft = (index / (ref.children.length - 1)) * (scrollWidth - clientWidth);
                                            ref.scrollLeft = newScrollLeft;
                                            setActiveDots((prev) => ({ ...prev, [vendor.id]: index }));
                                          }
                                        }}
                                        onKeyDown={(e) => handleDotKeyDown(vendor.id, index, e)}
                                        className={`w-2 h-2 rounded-full transition-colors ${
                                          activeDots[vendor.id] === index ? "bg-white" : "bg-white/50"
                                        } border border-gray-400 shadow-sm`}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              {/* Vendor info */}
                              <div className="p-4">
                                <h3 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors" style={{ color: "#222222" }}>
                                  {vendor.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                  <span>📍</span>
                                  {vendor.location}
                                </p>
                                <p className="text-sm font-semibold text-primary mb-3">{vendor.price}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                                  {vendor.description}
                                </p>
                                <Button 
                                  size="sm" 
                                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* No vendors found state */}
            {totalVendors === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎈</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: "#222222" }}>
                  No vendors found yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search filters or exploring different categories
                </p>
                <Button 
                  onClick={() => router.push("/")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Start New Search
                </Button>
              </div>
            )}
          </div>
          
          {/* Map sidebar */}
          <div className="hidden lg:block w-full lg:w-1/3">
            <div className="sticky top-28">
              <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10">
                  <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: "#222222" }}>
                    <span>🗺️</span>
                    Vendor Locations
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Find vendors near you
                  </p>
                </div>
                <div 
                  ref={mapContainer} 
                  className="h-[calc(100vh-200px)] min-h-[400px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Enhanced Shortlist Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-primary px-6 py-4 animate-fade-in flex flex-col items-center min-w-[260px] relative">
          {/* Celebration badge */}
          <div className="absolute -top-2 -right-2">
            <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
              🎉
            </span>
          </div>
          
          {/* Info tooltip */}
          <div className="absolute top-2 left-2 group" style={{ zIndex: 2 }}>
            <span className="inline-block align-middle cursor-pointer relative">
              <span className="bg-primary/10 rounded-full p-[2.5px] shadow-sm flex items-center justify-center" style={{ display: 'inline-flex' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[17px] h-[17px] text-primary">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
                </svg>
              </span>
              <span className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 absolute left-0 top-8 bg-white text-foreground text-sm rounded-2xl shadow-lg px-4 py-3 max-w-xs whitespace-normal z-50 border border-border" style={{ minWidth: '220px', fontSize: '0.95rem', lineHeight: '1.4' }}>
                <span className="font-semibold text-primary">What&apos;s this?</span> <br />
                Select your favorite vendors as you browse, then edit your lineup before booking your dream party team!
              </span>
            </span>
          </div>
          
          <div className="text-center mb-4">
            <span className="text-primary font-bold text-lg whitespace-nowrap mb-1 block">
              {selectedVendors.size} Vendor{selectedVendors.size !== 1 ? 's' : ''} Selected
            </span>
            <span className="text-muted-foreground text-sm">
              Ready to plan something amazing? ✨
            </span>
          </div>
          
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="border-primary text-primary font-semibold rounded-full px-4 py-2 hover:bg-primary hover:text-white transition-all text-sm flex-1"
              onClick={() => setIsShortlistModalOpen(true)}
            >
              📝 Edit List
            </Button>
            <Button
              variant="default"
              className="bg-primary text-white font-semibold rounded-full px-4 py-2 hover:bg-primary/90 transition-all text-sm flex-1"
              onClick={handleContinueBooking}
            >
              🚀 Book Now
            </Button>
          </div>
        </div>
      </div>      {/* Enhanced Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsFilterModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2" style={{ color: "#222222" }}>
                  <span>🔍</span>
                  Filter Your Perfect Vendors
                </h3>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Close filters"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-muted-foreground mt-2">
                Narrow down your search to find exactly what you need for your celebration!
              </p>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {Object.keys(categories).map(cat => (
                <div key={cat} className="mb-6 last:mb-0">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: "#222222" }}>
                    <span 
                      className="inline-block w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoryColors[cat] }}
                    />
                    {cat}
                  </h4>
                  <div className="space-y-3 pl-6">
                    {cat === "Cakes & Desserts" && (
                      <>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={filters[cat].includes("delivery")} 
                            onChange={(e) => handleFilterChange(cat, "delivery", e.target.checked)}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-foreground group-hover:text-primary transition-colors">🚚 Delivery Available</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={filters[cat].includes("customOrders")} 
                            onChange={(e) => handleFilterChange(cat, "customOrders", e.target.checked)}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-foreground group-hover:text-primary transition-colors">🎨 Custom Orders</span>
                        </label>
                      </>
                    )}
                    {cat === "Venue Hire" && (
                      <>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={filters[cat].includes("indoor")} 
                            onChange={(e) => handleFilterChange(cat, "indoor", e.target.checked)}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-foreground group-hover:text-primary transition-colors">🏠 Indoor Space</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={filters[cat].includes("parking")} 
                            onChange={(e) => handleFilterChange(cat, "parking", e.target.checked)}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <span className="text-foreground group-hover:text-primary transition-colors">🅿️ Parking Available</span>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-border">
              <Button 
                onClick={() => setIsFilterModalOpen(false)} 
                className="w-full bg-primary text-white hover:bg-primary/90 rounded-full text-lg py-3"
              >
                ✨ Apply Filters & Find Magic
              </Button>
            </div>
          </div>
        </div>
      )}

      <ShortlistModal
        isOpen={isShortlistModalOpen}
        onClose={() => setIsShortlistModalOpen(false)}
        onContinue={handleContinueBooking}
        shortlistedVendors={shortlistedVendors}
        onRemove={handleRemoveShortlist}
      />
      <style>
        {`.scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .custom-checkbox {
          position: relative;
          display: inline-block;
          width: 20px;
          height: 20px;
        }
        .custom-checkbox input[type="checkbox"] {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .checkmark {
          position: absolute;
          top: 0;
          left: 0;
          height: 20px;
          width: 20px;
          background-color: #fff;
          border: 2px solid #e5e7eb;
          border-radius: 4px;
          box-shadow: 0 1px 2px 0 rgba(16,24,40,0.05);
          transition: background 0.2s, border 0.2s;
        }
        .custom-checkbox input[type="checkbox"]:checked + .checkmark {
          background-color: #14b8a6;
          border-color: #14b8a6;
        }
        .custom-checkbox input[type="checkbox"]:checked + .checkmark:after {
          display: block;
        }
        .checkmark:after {
          content: "";
          position: absolute;
          left: 6px;
          top: 2px;
          width: 6px;
          height: 12px;
          border: solid white;
          border-width: 0 3px 3px 0;
          transform: rotate(45deg);
          display: none;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-pop {
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        `}
      </style>

      {/* Hamburger Drawer */}
      {isDrawerOpen && (
        <HamburgerDrawer 
          isOpen={isDrawerOpen} 
          onToggle={() => setIsDrawerOpen(!isDrawerOpen)} 
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}