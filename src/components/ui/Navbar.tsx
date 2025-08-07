"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import HamburgerDrawer from "@/components/ui/HamburgerDrawer";
import { useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import "@/app/datepicker.css";
import { useSearchContext } from "@/context/SearchContext";

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const hamburgerDrawerRef = useRef<HTMLDivElement>(null);
  // Outside click detection for hamburger drawer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isHamburger = hamburgerRef.current && hamburgerRef.current.contains(target);
      const isHamburgerDrawer = hamburgerDrawerRef.current && hamburgerDrawerRef.current.contains(target);
      if (isHamburgerOpen && !isHamburgerDrawer && !isHamburger) {
        setIsHamburgerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isHamburgerOpen]);

  const {
    location,
    setLocation,
    budget,
    setBudget,
    vibe,
    setVibe,
    date,
    setDate,
    handleSearch,
  } = useSearchContext();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    setLocation(searchParams.get("location") || "");
    setBudget(searchParams.get("budget") || "");
    setVibe(searchParams.get("vibe") || "");
    const d = searchParams.get("date");
    setDate(d ? new Date(d) : null);
  }, [searchParams, setLocation, setBudget, setVibe, setDate]);

  return (
    <nav className="w-full bg-white sticky top-0 z-50 py-3 flex items-center justify-between px-4 border-b border-gray-100">
      {/* Brand: Updated to use logo image instead of icon+text */}
      <Link
        href="/"
        className="flex items-center font-bold text-foreground font-sans tracking-tight -ml-8"
      >
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

      {pathname !== "/search" && pathname !== "/" && (
        <div className="w-full max-w-2xl mx-4 flex items-center gap-2">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Where"
            className="border rounded-full px-4 py-2 w-full text-sm text-black bg-gray-50"
          />
          <DatePicker
            selected={date}
            onChange={(d: Date | null) => setDate(d)}
            placeholderText="When"
            dateFormat="MMMM d, yyyy"
            calendarStartDay={1}
            minDate={new Date()}
            monthsShown={1}
            className="border rounded-full px-4 py-2 w-full text-sm text-black bg-gray-50"
            calendarClassName="airbnb-calendar"
          />
          <input
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            placeholder="What do you need?"
            onKeyDown={handleKeyDown}
            className="border rounded-full px-4 py-2 w-full text-sm text-black bg-gray-50"
          />
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Budget"
            onKeyDown={handleKeyDown}
            className="border rounded-full px-4 py-2 w-full text-sm text-black bg-gray-50"
          />
          <button
            onClick={handleSearch}
            className="text-2xl px-3 py-2 text-black hover:text-indigo-600"
            aria-label="Search"
          >
            🔍
          </button>
        </div>
      )}

      <div className="flex gap-1 items-center">
        {pathname !== "/search" && (
          <button
            onClick={() => {
              const section = document.getElementById("how-it-works");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="text-base font-normal text-foreground hover:text-primary transition bg-transparent px-4 py-2 rounded focus:outline-none font-sans mr-4 mt-1"
          >
            How it works
          </button>
        )}
        <div className="ml-3" ref={hamburgerRef}>
          <HamburgerDrawer
            className=""
            aria-label="Open menu"
            isOpen={isHamburgerOpen}
            onToggle={() => setIsHamburgerOpen(!isHamburgerOpen)}
            drawerRef={hamburgerDrawerRef}
          />
        </div>
      </div>
    </nav>
  );
}