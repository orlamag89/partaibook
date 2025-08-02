import { X, Heart } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useLoginModal } from '@/context/LoginModalContext';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: {
    id: string;
    name: string;
    location: string;
    image: string; // legacy, fallback only
    about_your_business?: string; // Supabase bio
    description: string;
    price: number;
    galleryImages?: string[];
    bio?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    rating?: number;
  };
  isLoggedIn?: boolean; // Optional: pass user login state
}


export default function VendorModal({ isOpen, onClose, vendor, isLoggedIn }: VendorModalProps) {
  const { open } = useLoginModal();
  if (!isOpen) return null;

  // Show up to 3 images: prefer vendor.galleryImages, fallback to vendor.image
  let displayImages: string[] = [];
  if (Array.isArray(vendor.galleryImages) && vendor.galleryImages.length > 0) {
    displayImages = vendor.galleryImages.filter(img => typeof img === 'string' && img.trim() !== '').slice(0, 3);
  } else if (typeof vendor.image === 'string' && vendor.image.trim() !== '') {
    displayImages = [vendor.image];
  }

  // Handler for favorite button
  const handleFavorite = () => {
    if (!isLoggedIn) {
      open();
      return;
    }
    // TODO: Add favorite logic here
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - smaller, no circle, hover lift */}
        <button
          onClick={onClose}
          className="absolute top-0.5 right-1.5 z-20 transition-transform hover:-translate-y-1 focus:outline-none"
          aria-label="Close modal"
        >
          <X className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
        </button>

        {/* Image Gallery */}
        <div className="grid grid-cols-3 gap-2 px-4 mt-6 pb-0">
          {displayImages.length > 0 ? (
            displayImages.map((img, index) => (
              <div key={index} className="relative w-full h-40 rounded-lg overflow-hidden">
                <Image
                  src={img}
                  alt={`${vendor?.name || 'Vendor'} image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/file.svg'; }}
                />
              </div>
            ))
          ) : (
            <div className="col-span-3 flex items-center justify-center h-40 text-muted-foreground bg-gray-100 rounded-lg">
              No images available
            </div>
          )}
        </div>

        {/* About and Ratings row under images, aligned horizontally */}
        <div className="flex items-baseline justify-between px-6 mt-6 pb-0 mb-1">
          <h4 className="text-lg font-semibold mb-0" style={{ color: '#444' }}>About {vendor?.name || 'N/A'}</h4>
          {typeof vendor.rating === 'number' ? (
            <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#FF8C42' }}>
              <svg className="w-4 h-4" fill="#FF8C42" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
              <span>{vendor.rating.toFixed(1)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm" style={{ color: '#FF8C42' }}>
              <svg className="w-4 h-4" fill="#FF8C42" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z"/></svg>
              <span>No ratings yet</span>
            </div>
          )}
        </div>

        {/* Location and About Your Business (first paragraph) on one line with icons */}
        <div className="px-6 pt-0 pb-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            {/* Location icon */}
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-5.373-8-10a8 8 0 1116 0c0 4.627-3.582 10-8 10z" /><circle cx="12" cy="11" r="3" /></svg>
            <span>{vendor?.location || 'N/A'}</span>
            {/* Divider */}
            <span className="mx-2 text-gray-300">|</span>
            {/* About your business: first paragraph only */}
            <span className="truncate">
              {typeof vendor.about_your_business === 'string' && vendor.about_your_business.trim() !== ''
                ? vendor.about_your_business.split(/\n+/)[0]
                : 'No description available.'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-border flex justify-end items-center gap-4">
          {/* Favorite Button with Heart Icon */}
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-white hover:border-primary"
            onClick={handleFavorite}
          >
            <Heart className="h-5 w-5 mr-2 fill-primary" />
            <span className="text-sm">Favorite</span>
          </Button>
          {/* Book Now Button */}
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}


