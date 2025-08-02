"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import VendorModal from "@/components/modals/VendorModal";


interface Vendor {
  id: string;
  name: string;
  location: string;
  image?: string;
  description?: string;
  price?: string | number;
  category?: string;
  galleryImages?: string[];
  images?: string[];
  about_your_business?: string;
  rating?: number;
}

interface SpotlightVendorsProps {
  vendors: Vendor[];
}

const ImageWithFallback: React.FC<{
  src: string;
  fallbackSrc: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  role?: string;
  "aria-label"?: string;
}> = ({ src, fallbackSrc, alt, width, height, className, role, "aria-label": ariaLabel, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setImgSrc(src);
    const img = new window.Image();
    img.onload = () => setIsLoading(false);
    img.onerror = () => setImgSrc(fallbackSrc);
    img.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, fallbackSrc]);

  const validSrc = imgSrc && typeof imgSrc === 'string' && imgSrc.trim() !== '' ? imgSrc : fallbackSrc;
  return (
    <>
      {isLoading && <div className="relative w-full aspect-[4/3] animate-pulse bg-gray-200" aria-hidden="true" />}
      {validSrc ? (
        <Image
          src={validSrc}
          alt={alt}
          width={width}
          height={height}
          className={className}
          role={role}
          aria-label={ariaLabel}
          {...props}
          onLoadingComplete={() => setIsLoading(false)}
          style={{ display: isLoading ? "none" : "block" }}
        />
      ) : null}
    </>
  );
};

const SpotlightVendors: React.FC<SpotlightVendorsProps> = ({ vendors }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Single openModal with correct types
  const openModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVendor(null);
  };


  return (
    <section id="vendors" className="py-16 px-4 bg-[#effdfa]">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-3xl font-bold text-foreground mb-6 text-center">
          Spotlight Vendors
        </h2>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {vendors.length > 0 ? (
              vendors.map((vendor) => {
                const galleryImages = Array.isArray(vendor.galleryImages)
                  ? vendor.galleryImages
                  : (Array.isArray(vendor.images) ? vendor.images : []);
                const safeVendor = {
                  ...vendor,
                  image: galleryImages[0] || vendor.image || "/placeholder.jpg",
                  galleryImages,
                };
                return (
                  <div
                    key={safeVendor.id}
                    className="bg-card rounded-2xl border border-border shadow-md hover:shadow-lg transition p-4 flex flex-col"
                    aria-labelledby={`vendor-${safeVendor.id}-name`}
                  >
                    <h4 id={`vendor-${safeVendor.id}-name`} className="font-semibold text-base truncate" style={{ color: "#444" }}>
                      {safeVendor.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">{safeVendor.location}</p>
                    <div className="relative w-full aspect-[4/3] mb-3">
                      <ImageWithFallback
                        src={safeVendor.image!}
                        fallbackSrc="/placeholder.jpg"
                        alt={safeVendor.name}
                        width={400}
                        height={300}
                        className="w-full object-cover rounded-md"
                        role="img"
                        aria-label={`${safeVendor.name} vendor image`}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                      {safeVendor.description && safeVendor.description.trim() !== ''
                        ? safeVendor.description
                        : 'No description provided.'}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-base font-semibold" style={{ color: "#444" }}>
                        {safeVendor.price && safeVendor.price !== ''
                          ? `From $${safeVendor.price}`
                          : 'Contact for price'}
                      </span>
                      <Button
                        onClick={() => openModal(safeVendor)}
                        className="bg-primary text-primary-foreground font-semibold py-1.5 px-4 rounded-full shadow hover:bg-primary/90 transition text-sm"
                        aria-label={`Quick view for ${safeVendor.name}`}
                      >
                        Quick View
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-muted-foreground">Loading vendors...</p>
            )}
          </div>
        </div>
        {isModalOpen && selectedVendor ? (
          <VendorModal
            vendor={{
              ...selectedVendor,
              image: selectedVendor.image || "/placeholder.jpg",
              description: selectedVendor.description || "",
              price: typeof selectedVendor.price === "number"
                ? selectedVendor.price
                : (typeof selectedVendor.price === "string" && !isNaN(Number(selectedVendor.price))
                  ? Number(selectedVendor.price)
                  : 0)
            }}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        ) : null}
        {/* Search bar and badges (optional, can be moved here if you want) */}
      </div>
    </section>
  );
};

export default SpotlightVendors;
