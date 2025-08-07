# PartaiBook Logo Setup

## Logo File Location
Place your logo file at: `/public/logo.png`

## Logo Specifications
- **File name**: `logo.png` (exactly this name)
- **Location**: Put it in the `public` folder at the root of your project
- **Recommended size**: 
  - Width: 200-400px 
  - Height: 80-120px
  - Format: PNG with transparent background preferred
- **Display sizes**:
  - Mobile: 64px height (h-16)
  - Desktop: 96px height (h-24)
  - Width: Auto (maintains aspect ratio)

## Usage
The logo is now used in:
- Homepage header (centered)
- Privacy policy page header
- Terms of service page header
- Footer branding (text-based with Sparkles icon)

## CSS Classes Applied
```jsx
<Image 
  src="/logo.png" 
  alt="PartaiBook" 
  width={200} 
  height={96} 
  className="h-16 md:h-24 w-auto" 
/>
```

## If You Don't Have a Logo Yet
The site will show a broken image until you add your logo.png file. 
You can:
1. Create a simple text-based logo
2. Use a placeholder image
3. Commission a designer to create one

## File Structure
```
partaibook/
├── public/
│   └── logo.png  <- Put your logo here
├── src/
│   └── app/
│       ├── page.tsx (updated with logo)
│       ├── privacy/
│       │   └── page.tsx (new)
│       └── terms/
│           └── page.tsx (new)
```
