import { X, Heart } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: {
    id: string;
    name: string;
    location: string;
    image: string; // Main image for the card
    description: string;
    price: number;
    // Add more details for the modal here, e.g., a list of gallery images
    galleryImages?: string[];
    bio?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
  };
}

export default function VendorModal({ isOpen, onClose, vendor }: VendorModalProps) {
  if (!isOpen) return null;

  // Determine images to display (up to 3 from gallery, fallback to main image)
  const displayImages = vendor.galleryImages && vendor.galleryImages.length > 0
    ? vendor.galleryImages.slice(0, 3)
    : [vendor.image];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose} // Close on backdrop click
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted hover:bg-muted-foreground/10 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="h-6 w-6 text-foreground" />
        </button>

        {/* Image Gallery */}
        <div className="grid grid-cols-3 gap-2 p-4 pt-12 pb-0">
          {displayImages.map((img, index) => (
            <div key={index} className="relative w-full h-40 rounded-lg overflow-hidden">
              <Image
                src={img}
                alt={`${vendor.name} image ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          ))}
        </div>

        {/* Vendor Name and Location */}
        <div className="p-4 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-1">{vendor.name}</h3>
          <p className="text-lg text-muted-foreground">{vendor.location}</p>
        </div>

        {/* About Me / Bio */}
        <div className="px-6 py-4 border-t border-border">
          <h4 className="text-xl font-semibold text-foreground mb-2">About Me</h4>
          <p className="text-muted-foreground leading-relaxed">
            {vendor.bio || vendor.description} {/* Use bio if available, fallback to description */}
          </p>
        </div>

        {/* Contact Information (Optional) */}
        {(vendor.contactEmail || vendor.contactPhone || vendor.website) && (
          <div className="px-6 py-4 border-t border-border">
            <h4 className="text-xl font-semibold text-foreground mb-2">Contact</h4>
            {vendor.contactEmail && (
              <p className="text-muted-foreground">Email: <a href={`mailto:${vendor.contactEmail}`} className="text-primary hover:underline">{vendor.contactEmail}</a></p>
            )}
            {vendor.contactPhone && (
              <p className="text-muted-foreground">Phone: <a href={`tel:${vendor.contactPhone}`} className="text-primary hover:underline">{vendor.contactPhone}</a></p>
            )}
            {vendor.website && (
              <p className="text-muted-foreground">Website: <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{vendor.website}</a></p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-border flex justify-end items-center gap-4">
          {/* Shortlist Button with Heart Icon */}
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Heart className="h-5 w-5 mr-2 fill-primary" />
            Shortlist
          </Button>
          {/* Book Now Button */}
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}


