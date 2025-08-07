export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  event_title: string;
  event_date: string;
  event_time?: string;
  event_location: string;
  guest_count?: number;
  special_requests?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  booking_items?: BookingItem[];
  user?: User;
}

export interface BookingItem {
  id: string;
  booking_id: string;
  vendor_id: string;
  service_description: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at?: string;
  vendor?: Vendor;
}

export interface CartItem {
  vendor: Vendor;
  serviceDescription: string;
  price: number;
}

// Re-export the existing Vendor interface for consistency
export interface Vendor {
  id: string;
  name: string;
  location: string;
  about_your_business: string;
  price_range: string;
  service_type?: string;
  galleryimages?: string[];
  galleryvideos?: string[];
  email?: string;
  phone?: string;
  verified?: boolean;
  rating?: number;
  reviews?: unknown;
  created_at?: string;
}
