import React, { useState, useEffect } from "react";
import Image from "next/image";

interface VendorImageCarouselProps {
  images: string[];
  name: string;
}

const VendorImageCarousel: React.FC<VendorImageCarouselProps> = ({ images, name }) => {
  const [active, setActive] = useState(0);
  const dragStartX = React.useRef<number | null>(null);
  const dragStartY = React.useRef<number | null>(null);
  const dragging = React.useRef(false);
  const verticalLock = React.useRef(false);

  useEffect(() => {
    setActive(0);
  }, [images]);

  // Helper: is video file
  const isVideo = (src: string) => /\.mp4$|\.webm$|\.ogg$|\/videos\//i.test(src);

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    dragging.current = true;
    verticalLock.current = false;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current || dragStartX.current === null || dragStartY.current === null) return;
    const diffX = e.touches[0].clientX - dragStartX.current;
    const diffY = e.touches[0].clientY - dragStartY.current;
    // Only prevent default if horizontal swipe is dominant
    if (!verticalLock.current && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (Math.abs(diffX) > 30 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        setActive((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else {
        setActive((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
      dragging.current = false;
      dragStartX.current = null;
      dragStartY.current = null;
    }
    if (Math.abs(diffY) > 10 && Math.abs(diffY) > Math.abs(diffX)) {
      verticalLock.current = true; // allow vertical scroll
    }
  };
  const handleTouchEnd = () => {
    dragging.current = false;
    dragStartX.current = null;
    dragStartY.current = null;
    verticalLock.current = false;
  };

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;
    dragging.current = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current || dragStartX.current === null) return;
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 30) {
      if (diff < 0) {
        setActive((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else {
        setActive((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
      dragging.current = false;
      dragStartX.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
  };
  const handleMouseUp = () => {
    dragging.current = false;
    dragStartX.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  if (!images.length) {
    return <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-xs text-gray-400 rounded-lg">No Image</div>;
  }

  return (
    <div
      className="relative w-full aspect-square flex items-center justify-center select-none z-[3100]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'auto' }}
    >
      {isVideo(images[active]) ? (
        <video
          src={images[active]}
          controls
          className="object-cover w-full h-full rounded-lg"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <Image
          src={images[active]}
          alt={`${name} image ${active + 1}`}
          fill
          className="object-cover w-full h-full rounded-lg"
          sizes="(max-width: 160px) 100vw, 160px"
          draggable={false}
        />
      )}
      {images.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`w-1.5 h-1.5 rounded-full ${active === idx ? 'bg-[#14b8a6]' : 'bg-gray-300'} border border-white`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ShortlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  shortlistedVendors: Array<{
    id: string;
    name: string;
    category: string;
    image?: string;
    images?: string[];
  }>;
  onRemove: (vendorId: string) => void;
}

const groupByCategory = (vendors: ShortlistModalProps["shortlistedVendors"]) => {
  const grouped: { [category: string]: typeof vendors } = {};
  vendors.forEach((v) => {
    if (!grouped[v.category]) grouped[v.category] = [];
    grouped[v.category].push(v);
  });
  return grouped;
};

const ShortlistModal: React.FC<ShortlistModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  shortlistedVendors,
  onRemove,
}) => {
  if (!isOpen) return null;

  const grouped = groupByCategory(shortlistedVendors);

  return (
    <div
      className="modal-overlay fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 py-12 sm:py-16"
      onClick={e => {
        if (e.target === e.currentTarget) {
          console.log('Overlay clicked, closing modal');
          onClose();
        } else {
          console.log('Modal content clicked, not closing');
        }
      }}
      role="presentation"
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-[640px] w-full relative animate-fade-in flex flex-col px-4 sm:px-6"
        style={{ minHeight: '240px', maxHeight: 'calc(100vh - 160px)', overflow: 'hidden', marginLeft: 'auto', marginRight: 'auto', position: 'relative', cursor: 'auto' }}
        onClick={e => { e.stopPropagation(); }}
      >
        <h2 className="text-lg font-bold mb-2 pt-4 text-center" style={{ color: '#444' }}>Edit Shortlist</h2>
        <div className="flex-1 overflow-y-auto p-0 pb-2" style={{ minHeight: '100px' }}>
          {shortlistedVendors.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No vendors selected.</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(grouped).map(([category, vendors], idx, arr) => (
                <div key={category} className="mb-1">
                  <div className="text-base font-semibold mb-2 px-1" style={{ color: '#444' }}>{category}</div>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {vendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="bg-gray-50 rounded-xl shadow-sm flex flex-col items-center min-w-[150px] max-w-[160px] p-0"
                        style={{ height: '210px' }}
                      >
                        <div className="w-full flex-1 flex items-center justify-center p-0 m-0" style={{ height: 140 }}>
                          <VendorImageCarousel images={vendor.images || (vendor.image ? [vendor.image] : [])} name={vendor.name} />
                        </div>
                        <div className="font-bold text-xs text-[#444] text-center mt-2 mb-1 truncate w-full">{vendor.name}</div>
                        <button
                          className="w-full px-2 py-1 text-xs bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition z-10 mt-auto"
                          style={{ marginTop: 'auto' }}
                          onClick={() => onRemove(vendor.id)}
                          aria-label={`Remove ${vendor.name} from shortlist`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="border-t border-gray-200 mt-2 mb-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Sticky action bar */}
        <div className="flex gap-2 px-5 py-3 bg-white border-t border-gray-100 sticky bottom-0 z-10">
          <button
            className="flex-1 bg-[#14b8a6] text-white font-semibold rounded-full px-4 py-2 hover:bg-[#0f766e] transition-colors"
            onClick={onContinue}
          >
            Continue to Booking
          </button>
          <button
            className="flex-1 bg-gray-100 text-[#444] font-semibold rounded-full px-4 py-2 hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            Return to Results
          </button>
        </div>
      </div>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Disable pointer events on background when modal is open */
        body.modal-open {
          overflow: hidden !important;
        }
        /* Only disable pointer events on background, not overlay or modal */
        body.modal-open > *:not(.modal-overlay) {
          pointer-events: none !important;
        }
        .modal-overlay, .modal-overlay * {
          pointer-events: auto !important;
        }
      `}</style>
    </div>
  );
};

export default ShortlistModal;
