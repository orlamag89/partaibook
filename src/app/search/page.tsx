
"use client";

import type { GeoJSONSource } from "mapbox-gl";
import React from "react";

import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const loginModalRef = useRef<HTMLDivElement>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const navbarRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const hamburgerDrawerRef = useRef<HTMLDivElement>(null);
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
      if (map.current) updateMapMarkers(vendorsWithCoords);
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
        if (map.current) updateMapMarkers(vendorsWithCoords);
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
      const isNavbar = navbarRef.current && navbarRef.current.contains(target);
      const isVibeDropdown = vibeDropdownRef.current && vibeDropdownRef.current.contains(target);
      const isCalendarDropdown = calendarDropdownRef.current && calendarDropdownRef.current.contains(target);
      const isHamburger = hamburgerRef.current && hamburgerRef.current.contains(target);
      const isHamburgerDrawer = hamburgerDrawerRef.current && hamburgerDrawerRef.current.contains(target);
      const isLoginModal = loginModalRef.current && loginModalRef.current.contains(target);
      if (!isNavbar && !isVibeDropdown && !isCalendarDropdown && !isHamburger && !isLoginModal) {
        setIsSearchExpanded(false);
        setIsVibeInputOpen(false);
        setIsHamburgerOpen(false);
        setIsLoginModalOpen(false);
      }
      if (isHamburgerOpen && !isHamburgerDrawer && !isHamburger) {
        setIsHamburgerOpen(false);
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
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-73.935242, 40.730610], // Default to Queens, NY
      zoom: 10,
    });

    map.current.on("load", () => {
      map.current!.addSource("vendors", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
      map.current!.addLayer({
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

      updateMapMarkers(vendors);
    });

    map.current.on("move", () => {
      const bounds = map.current!.getBounds();
      setMapBounds(bounds);
      if (bounds) fetchVendorsInBounds(bounds);
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, [vendors, fetchVendorsInBounds]);

  const updateMapMarkers = (vendorsToUpdate: Vendor[]) => {
    if (!map.current) return;
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
      <header className="w-full sticky top-0 z-[2000] bg-[#F9F9F9]">
        <div className="container mx-auto px-4 py-0 max-w-7xl">
          <nav className="w-full h-20 py-2 flex items-center justify-between px-4 bg-[#F9F9F9]" ref={navbarRef}>
            <div className="flex items-center justify-between w-full">
              <Link href="/" className="flex items-center space-x-2 font-bold text-foreground font-sans tracking-tight -ml-8 mt-0.5" aria-label="Home">
                <Sparkles className="h-8 w-8 text-primary" />
                <span className="text-2xl">PartaiBook</span>
              </Link>
              <div className="flex-1 flex justify-center">
                <div className="max-w-[340px] w-full flex items-center gap-2 mt-0.5">
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
          <div className="w-full border-b border-border" />
          <div className="flex overflow-x-auto space-x-2 p-2 bg-gray-100 sticky top-20 z-10">
            {Object.keys(categories).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat === categoryFilter ? "" : cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${categoryFilter === cat ? "bg-primary text-white" : "bg-white text-foreground hover:bg-gray-200"}`}
                style={{ backgroundColor: categoryFilter === cat ? categoryColors[cat] : "transparent" }}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="px-3 py-1 rounded-full text-sm font-medium bg-white text-foreground hover:bg-gray-200"
            >
              Filters
            </button>
          </div>
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

      <section className="py-6 px-6 mt-4">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row gap-4">
          {spotlightVendor && (
            <div className="mb-8 p-4 bg-primary/10 rounded-lg w-full md:w-2/3">
              <h3 className="text-foreground">Spotlight Vendor</h3>
              <Link href={`/vendors/${spotlightVendor.id}`}>
                <h4>{spotlightVendor.name}</h4>
                <p>{spotlightVendor.description}</p>
              </Link>
            </div>
          )}
          <h2 className="text-lg font-semibold mb-16 text-left text-foreground w-full md:w-2/3" style={{ marginLeft: "0" }}>
            <span style={{ color: '#2c3e50' }}>🎉 {totalVendors} vendors found for your party!</span>
          </h2>
          <div className="w-full md:w-2/3">
            {Object.entries(filteredVendors).map(([category, vendors]) => (
              <div key={category} className="mb-12 mt-4 relative">
                <h3
                  className="text-base font-semibold text-left text-foreground inline-block px-3 py-1 rounded-full mb-2"
                  style={{ backgroundColor: categoryColors[category], color: "#2c3e50" }}
                >
                  {category} ({vendors.length})
                </h3>
                <div
                  ref={(el) => { (scrollRefs.current[category] as HTMLDivElement | null) = el; }}
                  id={`vendor-row-${category}`}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pb-4"
                >
                  <div className="absolute left-0 right-0 flex justify-between" style={{ top: "0" }}>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleScroll(category, "left")}
                      className="bg-background border border-border rounded-full w-7 h-7 hover:bg-gray-200 ml-[-40px]"
                      aria-label={`Scroll left ${category}`}
                    >
                      <ChevronLeft className="h-3.5 w-3.5 text-foreground" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleScroll(category, "right")}
                      className="bg-background border border-border rounded-full w-7 h-7 hover:bg-gray-200 mr-[-40px]"
                      aria-label={`Scroll right ${category}`}
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-foreground" />
                    </Button>
                  </div>
                  {vendors.map((vendor) => {
                    if (!vendor.images || !vendor.images.length) {
                      return <div key={vendor.id} className="w-full h-64 bg-gray-200 flex items-center justify-center">No images available</div>;
                    }
                    return (
                      <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="w-full flex-shrink-0 block">
                        <div className="relative w-full h-64">
                          <div
                            ref={(el) => { if (el) vendorImageRefs.current[vendor.id] = el; }}
                            className="flex overflow-x-auto scroll-snap-type-x mandatory space-x-2 pb-4 scrollbar-hide"
                            style={{ scrollBehavior: "smooth" }}
                          >
                            {vendor.images.map((image, index) => (
                              <div key={`${vendor.id}-${index}`} className="flex-shrink-0 w-full h-64 relative">
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
                                <div className="absolute top-2 right-2">
                                  <label className="custom-checkbox">
                                    <input
                                      type="checkbox"
                                      id={`checkbox-${vendor.id}`}
                                      checked={selectedVendors.has(vendor.id)}
                                      onChange={(e) => { e.stopPropagation(); handleCheckboxChange(vendor.id, e); }}
                                      readOnly
                                    />
                                    <span className="checkmark" />
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div
                            className="absolute left-1/2 -translate-x-1/2 bottom-2 flex justify-center items-center gap-1"
                          >
                            {vendor.images.map((_, index) => (
                              <button
                                key={`${vendor.id}-dot-${index}`}
                                type="button"
                                aria-label={`Go to image ${index + 1}`}
                                tabIndex={0}
                                onClick={() => {
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
                                className={`rounded-full cursor-pointer transition-colors ${activeDots[vendor.id] === index ? "bg-white" : "bg-gray-300"} border border-gray-400`}
                                style={{ minWidth: '8px', minHeight: '8px', width: '8px', height: '8px', marginRight: index === vendor.images.length - 1 ? '0px' : '1px' }}
                              >
                                {activeDots[vendor.id] === index && <span className="sr-only">Active image {index + 1}</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                        <h4 className="font-semibold text-sm truncate mt-2" style={{ color: '#2c3e50' }}>{vendor.name}</h4>
                        <p className="text-sm" style={{ color: 'rgb(113, 113, 122)' }}>{vendor.location} - {vendor.price}</p>
                        <p className="text-sm line-clamp-2" style={{ color: 'rgb(113, 113, 122)', display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{vendor.description}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block w-full md:w-1/3 sticky top-28 h-[calc(100vh-112px)]" ref={mapContainer} />
        </div>
      </section>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-[#14b8a6] rounded-2xl shadow-lg px-6 py-4 animate-fade-in flex flex-col items-center min-w-[220px] relative">
          <div className="absolute top-2 right-2 group" style={{ zIndex: 2 }}>
            <span className="inline-block align-middle cursor-pointer relative">
              <span className="bg-white/60 rounded-full p-[2.5px] shadow-sm flex items-center justify-center" style={{ display: 'inline-flex' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#1f2937" className="w-[17px] h-[17px]">
                  <circle cx="12" cy="12" r="9" stroke="#1f2937" strokeWidth="1.5" fill="none" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
                </svg>
              </span>
              <span className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 absolute right-0 top-7 bg-white text-[#1f2937] text-sm rounded-2xl shadow-lg px-4 py-2 max-w-xs whitespace-normal z-50 border border-[#e0f7f5]" style={{ minWidth: '220px', fontSize: '0.95rem', lineHeight: '1.4' }}>
                <span className="font-semibold text-[#14b8a6]">What’s this?</span> <br />
                You can select your fave vendors as you browse, then edit your lineup before locking it in.
              </span>
            </span>
          </div>
          <span className="text-white font-semibold whitespace-nowrap text-sm mb-2 text-center">
            {selectedVendors.size} Vendor{selectedVendors.size !== 1 ? 's' : ''} Selected
          </span>
          <div className="flex gap-2 w-full justify-center">
            <Button
              variant="ghost"
              className="bg-white text-[#14b8a6] font-semibold rounded-full px-4 py-2 hover:bg-[#e0f7f5] hover:text-[#0f766e] transition-colors text-sm w-full"
              style={{ boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)' }}
              onClick={() => setIsShortlistModalOpen(true)}
            >
              Edit Shortlist
            </Button>
            <Button
              variant="ghost"
              className="bg-white text-[#14b8a6] font-semibold rounded-full px-4 py-2 hover:bg-[#e0f7f5] hover:text-[#0f766e] transition-colors text-sm w-full"
              style={{ boxShadow: '0 1px 2px 0 rgba(16,24,40,0.05)' }}
              onClick={handleContinueBooking}
            >
              Book Vendors
            </Button>
          </div>
        </div>
      </div>

      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setIsFilterModalOpen(false)}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            {Object.keys(categories).map(cat => (
              <div key={cat} className="mb-4">
                <h4 className="text-md font-medium mb-2">{cat}</h4>
                <div className="space-y-2">
                  {cat === "Cakes & Desserts" && (
                    <>
                      <label className="flex items-center">
                        <input type="checkbox" checked={filters[cat].includes("delivery")} onChange={(e) => handleFilterChange(cat, "delivery", e.target.checked)} />
                        <span className="ml-2">Delivery</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" checked={filters[cat].includes("customOrders")} onChange={(e) => handleFilterChange(cat, "customOrders", e.target.checked)} />
                        <span className="ml-2">Custom Orders</span>
                      </label>
                    </>
                  )}
                  {cat === "Venue Hire" && (
                    <>
                      <label className="flex items-center">
                        <input type="checkbox" checked={filters[cat].includes("indoor")} onChange={(e) => handleFilterChange(cat, "indoor", e.target.checked)} />
                        <span className="ml-2">Indoor</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" checked={filters[cat].includes("parking")} onChange={(e) => handleFilterChange(cat, "parking", e.target.checked)} />
                        <span className="ml-2">Parking</span>
                      </label>
                    </>
                  )}
                </div>
              </div>
            ))}
            <Button onClick={() => setIsFilterModalOpen(false)} className="mt-4 w-full bg-primary text-white">Apply Filters</Button>
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