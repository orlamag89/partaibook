import { supabase } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface VendorProfilePageProps {
  params: {
    id: string
  }
}

export default async function VendorProfile({ params }: VendorProfilePageProps) {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) return notFound()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
      <p className="text-gray-600 text-sm mb-1 capitalize">
        {data.service_type} in {data.location}
      </p>
      <p className="text-gray-800 text-base mt-4">{data.about_your_business}</p>
      <p className="text-lg font-semibold mt-6">Price Range: {data.price_range}</p>
      <p className="text-sm text-gray-500 mt-2">Contact: {data.email}</p>

      {data.image_url && (
        <Image
          src={data.image_url}
          alt={`Image of ${data.name}`}
          width={600}
          height={400}
          className="mt-6 w-full rounded-md shadow-md object-cover"
        />
      )}

      <Link
        href={`/vendors/${data.id}/book`}
        className="inline-block mt-8 bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
      >
        Book This Vendor
      </Link>
    </div>
  )
}