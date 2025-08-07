'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, totalAmount, clearCart } = useCart();
  const [eventDetails, setEventDetails] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    guestCount: '',
    specialRequests: ''
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some vendors to get started planning your party!</p>
          <Button onClick={() => router.push('/search')}>
            Find Vendors
          </Button>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!eventDetails.title || !eventDetails.date || !eventDetails.location) {
      alert('Please fill in the required event details');
      return;
    }
    
    // Store event details for checkout
    localStorage.setItem('eventDetails', JSON.stringify(eventDetails));
    localStorage.setItem('cartItems', JSON.stringify(items));
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Party Cart</h1>
          <Button variant="outline" onClick={clearCart}>
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.vendor.id} className="bg-white rounded-lg border p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.vendor.galleryimages?.[0] ? (
                      <Image
                        src={item.vendor.galleryimages[0]}
                        alt={item.vendor.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.vendor.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.serviceDescription}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{item.vendor.location}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">${item.price}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.vendor.id)}
                          className="mt-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Event Details & Summary */}
          <div className="space-y-6">
            {/* Event Details Form */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventDetails.title}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Birthday Party, Baby Shower, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={eventDetails.date}
                      onChange={(e) => setEventDetails(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={eventDetails.time}
                      onChange={(e) => setEventDetails(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={eventDetails.location}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Full address or venue name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Count
                  </label>
                  <input
                    type="number"
                    value={eventDetails.guestCount}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, guestCount: e.target.value }))}
                    placeholder="Approximate number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    value={eventDetails.specialRequests}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, specialRequests: e.target.value }))}
                    placeholder="Any special requests or notes for vendors..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.vendor.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.vendor.name}</span>
                    <span className="font-medium">${item.price}</span>
                  </div>
                ))}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Booking Fee</span>
                    <span className="font-medium">$3.99</span>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${(totalAmount + 3.99).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                className="w-full mt-6"
                size="lg"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
