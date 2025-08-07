'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';

interface EventDetails {
  title: string;
  date: string;
  time?: string;
  location: string;
  guestCount?: string;
  specialRequests?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    // Load data from localStorage
    const storedCartItems = localStorage.getItem('cartItems');
    const storedEventDetails = localStorage.getItem('eventDetails');
    
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }
    
    if (storedEventDetails) {
      setEventDetails(JSON.parse(storedEventDetails));
    }

    if (!storedCartItems || !storedEventDetails) {
      router.push('/cart');
    }
  }, [router]);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);
  const bookingFee = 3.99;
  const finalTotal = totalAmount + bookingFee;

  const handlePayment = async () => {
    if (!customerInfo.fullName || !customerInfo.email) {
      alert('Please fill in all required fields');
      return;
    }

    if (!eventDetails) {
      alert('Event details are missing');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create/get user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          email: customerInfo.email,
          full_name: customerInfo.fullName,
          phone: customerInfo.phone
        })
        .select()
        .single();

      if (userError) throw userError;

      // 2. Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: userData.id,
          event_title: eventDetails.title,
          event_date: eventDetails.date,
          event_time: eventDetails.time || null,
          event_location: eventDetails.location,
          guest_count: eventDetails.guestCount ? parseInt(eventDetails.guestCount) : null,
          special_requests: eventDetails.specialRequests || null,
          total_amount: finalTotal,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // 3. Create booking items
      const bookingItems = cartItems.map(item => ({
        booking_id: bookingData.id,
        vendor_id: item.vendor.id,
        service_description: item.serviceDescription,
        price: item.price,
        status: 'pending'
      }));

      const { error: itemsError } = await supabase
        .from('booking_items')
        .insert(bookingItems);

      if (itemsError) throw itemsError;

      // 4. Create payment record (simplified for MVP)
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingData.id,
          amount: finalTotal,
          status: 'succeeded' // For MVP, we'll mark as succeeded
        });

      if (paymentError) throw paymentError;

      // Clear localStorage and redirect
      localStorage.removeItem('cartItems');
      localStorage.removeItem('eventDetails');
      
      router.push(`/confirmation/${bookingData.id}`);

    } catch (error) {
      console.error('Payment error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!eventDetails || cartItems.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

          {/* Customer Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerInfo.fullName}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="mb-3">
                <h3 className="font-medium text-gray-900">{eventDetails.title}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(eventDetails.date).toLocaleDateString()} 
                  {eventDetails.time && ` at ${eventDetails.time}`}
                </p>
                <p className="text-sm text-gray-600">{eventDetails.location}</p>
              </div>
              
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div key={item.vendor.id} className="flex justify-between text-sm">
                    <span>{item.vendor.name}</span>
                    <span>${item.price}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span>Booking Fee</span>
                  <span>${bookingFee}</span>
                </div>
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section (Simplified for MVP) */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Secure Payment</span>
              </div>
              <p className="text-sm text-blue-800">
                For this MVP demo, clicking &quot;Complete Booking&quot; will simulate a successful payment.
                In production, this would integrate with Stripe for real payments.
              </p>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Complete Booking - ${finalTotal.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
