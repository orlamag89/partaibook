export type Vendor = {
  id: string;
  name: string;
  location: string;
  image: string;
  description: string;
  price: number;
  galleryImages?: string[];
  bio?: string;
};

export const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Sweet Dreams Bakery',
    location: 'Brooklyn, NY',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&crop=center',
    description: 'Custom cakes, cupcakes, and dessert tables. Specializing in whimsical designs and Instagram-worthy treats.',
    price: 150,
    galleryImages: [
      'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop&crop=center'
    ],
    bio: 'Sweet Dreams Bakery has been crafting delicious and beautiful custom cakes for over 10 years...',
  },
  {
    id: '2',
    name: 'Groove Masters DJ',
    location: 'Queens, NY',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center',
    description: 'Professional DJ services for intimate gatherings. Expert at reading the room and keeping the energy perfect.',
    price: 300,
    galleryImages: [
      'https://images.unsplash.com/photo-1571266028243-d220bc5cd5f1?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=400&h=300&fit=crop&crop=center'
    ],
    bio: 'At Groove Masters DJ, we specialize in creating the perfect atmosphere for any event...',
  },
  {
    id: '3',
    name: 'Balloon Bliss Co.',
    location: 'Manhattan, NY',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop&crop=center',
    description: 'Stunning balloon installations and decor. From simple bouquets to elaborate arches and backdrops.',
    price: 75,
    galleryImages: [
      'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop&crop=center'
    ],
    bio: 'Transform your event space with the magic of balloons! Balloon Bliss Co. offers bespoke balloon artistry...',
  },
  {
    id: '4',
    name: 'Party Perfect Planners',
    location: 'Bronx, NY',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop&crop=center',
    description: 'Full-service event planning for any occasion, big or small. We handle every detail so you don\'t have to.',
    price: 500,
    galleryImages: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400&h=300&fit=crop&crop=center'
    ],
    bio: 'Party Perfect Planners takes the stress out of event planning. From concept to execution...',
  },
];