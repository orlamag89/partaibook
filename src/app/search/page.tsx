'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react';
import { useEffect, useState } from 'react'
import CategoryVendors from '@/components/CategoryVendors'
import { supabase } from '@/lib/supabaseClient'



interface Vendor {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  location: string;
}

export default function SearchResultsPage() {
  return (
    <Suspense>
      <SearchResultsContent />
    </Suspense>
  );
}
 

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [vibe, setVibe] = useState('');
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    setLocation(searchParams.get('location') || '');
    setBudget(searchParams.get('budget') || '');
    setVibe(searchParams.get('vibe') || '');
    const d = searchParams.get('date');
    setDate(d ? new Date(d) : null);
  }, [searchParams]);

  useEffect(() => {
    const fetchVendors = async () => {
      let query = supabase.from('vendors').select('*');
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }
      if (budget) {
        query = query.lte('price', parseFloat(budget));
      }
      if (vibe) {
        query = query.or(`service_type.ilike.%${vibe}%,about_your_business.ilike.%${vibe}%`);
      }
      if (date) {
        console.log('Date filtering placeholder:', date.toISOString());
      }
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching vendors:', error);
      } else {
        setVendors(data);
      }
    };
    fetchVendors();
  }, [location, budget, vibe, date]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (budget) params.append('budget', budget);
    if (vibe) params.append('vibe', vibe);
    if (date) params.append('date', date.toISOString());
    router.push(`/search?${params.toString()}`);
  };

  const totalResults = vendors.length;
  const categoryCounts = vendors.reduce((acc: Record<string, number>, vendor) => {
    acc[vendor.category] = (acc[vendor.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="min-h-screen w-full bg-white">
      <section className="px-2 sm:px-4 md:px-6 lg:px-8 max-w-[95rem] mx-auto mt-4">
        <form onSubmit={handleSubmit}>
          <h1 className="text-xl font-semibold text-gray-800 mb-4">
            🎉 {totalResults} local vendors found for your party!
          </h1>
          {/* You can add editable inputs here later if you want them inline */}
          {Object.entries(categoryCounts).map(([category, count]) => (
            <div key={category} className="mb-10">
              <h2 className="text-lg font-bold text-gray-700 mb-2">
                {count} {category}
                {typeof count === 'number' && count > 1 ? 's' : ''}
              </h2>
              <CategoryVendors
                vendors={vendors.filter((v) => v.category === category)}
                withLeftPadding={true}
              />
            </div>
          ))}
        </form>
      </section>
    </main>
  );
}
