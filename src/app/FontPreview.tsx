/*
  This file allows you to preview 4 popular web fonts: Inter, Poppins, Nunito, and Outfit.
  To use, copy the relevant import and fontFamily to your Tailwind config and _app or layout file.
*/

import { useState } from 'react'

const fontOptions = [
  {
    name: 'Inter',
    import: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');",
    className: 'font-inter',
    style: { fontFamily: 'Inter, sans-serif' },
  },
  {
    name: 'Poppins',
    import: "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap');",
    className: 'font-poppins',
    style: { fontFamily: 'Poppins, sans-serif' },
  },
  {
    name: 'Nunito',
    import: "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');",
    className: 'font-nunito',
    style: { fontFamily: 'Nunito, sans-serif' },
  },
  {
    name: 'Outfit',
    import: "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap');",
    className: 'font-outfit',
    style: { fontFamily: 'Outfit, sans-serif' },
  },
]

export default function FontPreview() {
  const [selected, setSelected] = useState(0)
  const font = fontOptions[selected]

  return (
    <div className="p-8">
      <div className="flex gap-4 mb-8">
        {fontOptions.map((f, i) => (
          <button
            key={f.name}
            onClick={() => setSelected(i)}
            className={`px-4 py-2 rounded border ${selected === i ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700'}`}
          >
            {f.name}
          </button>
        ))}
      </div>
      <div style={font.style} className="text-4xl font-bold mb-4">Welcome to PartaiBook 🎉</div>
      <div style={font.style} className="text-xl mb-2">Plan and book life’s celebrations in minutes with AI.</div>
      <div style={font.style} className="text-2xl font-semibold mt-8 mb-2">Fresh Finds</div>
      <div style={font.style} className="text-lg mb-8">How It Works</div>
      <div className="mt-8 text-sm text-gray-500">
        <div>Google Fonts Import:</div>
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{font.import}</pre>
        <div className="mt-2">Tailwind fontFamily: <code>{font.style.fontFamily}</code></div>
      </div>
    </div>
  )
}
