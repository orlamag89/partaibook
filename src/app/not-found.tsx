import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-gray-600 mb-6">Sorry, we couldn’t find the page you’re looking for.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-[#A78BFA] text-white rounded hover:bg-[#7C5DD6] transition"
      >
        Go Home
      </Link>
    </div>
  )
}