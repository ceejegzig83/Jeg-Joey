import { Product, CateringPackage, LocationPoint, Driver, Order } from '../types';

export const BUSINESS_INFO = {
  name: 'FLOURISH DESTINY COLLECTION',
  subtitle: 'Multi-Service Commerce, Hospitality & Logistics Platform',
  location: 'Okene, Kogi State, Nigeria',
  address: 'No. 14 Inoziomi Road, Off Total Junction, Okene, Kogi State',
  phone: '09162723865',
  formattedPhone: '+234 916 272 3865',
  whatsappUrl: 'https://wa.me/2349162723865?text=Hello%20Flourish%20Destiny%20Collection,%20I%20would%20like%20to%20make%20an%20inquiry.',
  email: 'info@flourishdestiny.ng',
  workingHours: 'Mon - Sat: 7:30 AM - 9:00 PM | Sun: 12:00 PM - 8:00 PM',
  divisions: [
    { id: 'FASHION', name: 'Fashion Store', tag: 'Clothing & Custom Tailoring', icon: 'Sparkles', color: 'from-amber-600 to-amber-800' },
    { id: 'BAKERY', name: 'Artisanal Bakery', tag: 'Fresh Bread, Pastries & Custom Cakes', icon: 'Cake', color: 'from-orange-500 to-amber-700' },
    { id: 'CATERING', name: 'Catering Services', tag: 'Events, Weddings & Custom Feasts', icon: 'UtensilsCrossed', color: 'from-rose-600 to-amber-800' },
    { id: 'GROCERY', name: 'Grocery Hub', tag: 'Daily Food Items & Supermarket Essentials', icon: 'ShoppingBag', color: 'from-emerald-600 to-teal-800' },
    { id: 'TRANSPORT', name: 'Kogi Ride-Hailing', tag: 'Intra-City Keke & Car Transport', icon: 'Car', color: 'from-blue-600 to-indigo-800' },
  ]
};

export const INITIAL_PRODUCTS: Product[] = [
  // --- FASHION STORE ---
  {
    id: 'fash-01',
    division: 'FASHION',
    name: 'Ebira Heritage Hand-Woven Aso-Oke Attire',
    category: 'Traditional Wear',
    price: 35000,
    originalPrice: 42000,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    description: 'Authentic handcrafted Okene woven fabric with metallic gold accents. Ideal for traditional weddings, chieftaincy events, and cultural ceremonies.',
    inStock: true,
    stockCount: 14,
    rating: 4.9,
    reviewCount: 38,
    badge: 'Kogi Artisan Made',
    sizes: ['S', 'M', 'L', 'XL', 'Custom'],
    colors: ['Royal Gold & Charcoal', 'Emerald & Navy', 'Burgundy Wine'],
    fabric: 'Authentic Ebira Woven Cotton',
    gender: 'Unisex'
  },
  {
    id: 'fash-02',
    division: 'FASHION',
    name: 'Executive Senator Kaftan Suit with Embroidery',
    category: 'Men\'s Wear',
    price: 28500,
    originalPrice: 32000,
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    description: 'Premium cashmere-blend Senator 2-piece outfit with bespoke chest embroidery and matching trousers.',
    inStock: true,
    stockCount: 22,
    rating: 4.8,
    reviewCount: 52,
    badge: 'Best Seller',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Midnight Navy', 'Pure White', 'Charcoal Grey', 'Forest Green'],
    fabric: 'Super 140s Cashmere Wool Blend',
    gender: 'Men'
  },
  {
    id: 'fash-03',
    division: 'FASHION',
    name: 'Ankara Royal Flowing Maxi Gown',
    category: 'Women\'s Wear',
    price: 22000,
    originalPrice: 26000,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    description: 'Vibrant wax print tailored maxi dress with gathered waistline, puff sleeves, and side pockets.',
    inStock: true,
    stockCount: 18,
    rating: 4.9,
    reviewCount: 29,
    badge: 'Popular',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Sunset Orange Wax', 'Indigo Azure', 'Emerald Burst'],
    fabric: '100% Cotton Hollandis Wax',
    gender: 'Women'
  },
  {
    id: 'fash-04',
    division: 'FASHION',
    name: 'Handcrafted Nigerian Leather Slip-on Shoes',
    category: 'Shoes',
    price: 19500,
    originalPrice: 24000,
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
    description: 'Durable full-grain leather loafers with non-slip rubber soles and padded insole comfort.',
    inStock: true,
    stockCount: 12,
    rating: 4.7,
    reviewCount: 19,
    sizes: ['41', '42', '43', '44', '45', '46'],
    colors: ['Cognac Brown', 'Obsidian Black'],
    fabric: 'Genuine Cowhide Leather',
    gender: 'Men'
  },
  {
    id: 'fash-05',
    division: 'FASHION',
    name: 'Grand Agbada 3-Piece Ceremonial Set',
    category: 'Traditional Wear',
    price: 65000,
    originalPrice: 75000,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    description: 'Heavyweight guinea brocade 3-piece agbada with intricate neck-to-chest monogram embroidery.',
    inStock: true,
    stockCount: 8,
    rating: 5.0,
    reviewCount: 14,
    badge: 'Luxury Tier',
    sizes: ['L', 'XL', 'XXL', 'Custom'],
    colors: ['Pristine Ivory', 'Royal Purple', 'Champagne Gold'],
    fabric: 'Guinea Brocade Gold Grade',
    gender: 'Men'
  },
  {
    id: 'fash-07',
    division: 'FASHION',
    name: 'Ebira Custom Hand-Woven Cap (Fila / Traditional Hat)',
    category: 'Traditional Wear',
    price: 8500,
    originalPrice: 10000,
    image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80',
    description: 'Masterfully woven Ebira cap with intricate cultural geometric embroidery. Complements Agbada and Senator outfits.',
    inStock: true,
    stockCount: 30,
    rating: 4.9,
    reviewCount: 37,
    sizes: ['Standard', 'Custom Fit'],
    colors: ['Gold & Green', 'Navy & Silver', 'Royal Wine'],
    fabric: 'Authentic Ebira Aso-Oke',
    gender: 'Men'
  },
  {
    id: 'fash-08',
    division: 'FASHION',
    name: 'Luxury 2-Piece Ebira Blouse & Wrapper Set',
    category: "Women's Wear",
    price: 38000,
    originalPrice: 45000,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    description: 'Double-woven authentic Ebira cloth paired with a tailored peplum blouse and matching head-tie.',
    inStock: true,
    stockCount: 10,
    rating: 5.0,
    reviewCount: 24,
    badge: 'Artisan Heritage',
    sizes: ['S', 'M', 'L', 'XL', 'Custom'],
    colors: ['Emerald & Gold', 'Cobalt & Bronze'],
    fabric: 'Pure Ebira Cotton Weave',
    gender: 'Women'
  },

  // --- ARTISANAL BAKERY ---
  {
    id: 'bake-01',
    division: 'BAKERY',
    name: 'Flourish Supreme Butter Agege Bread (Jumbo)',
    category: 'Bread',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Freshly baked daily in our Okene bakery ovens. Ultra-soft, dense, pillowy butter bread with a melt-in-mouth crumb.',
    inStock: true,
    stockCount: 85,
    rating: 5.0,
    reviewCount: 140,
    badge: 'Daily Best-Seller',
    shelfLife: '5 Days Room Temp',
    allergens: ['Wheat / Gluten', 'Dairy']
  },
  {
    id: 'bake-02',
    division: 'BAKERY',
    name: 'Special Spicy Beef Meat Pie (Flaky Crust)',
    category: 'Pastries',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1621236378699-8597fee6a1ce?auto=format&fit=crop&w=800&q=80',
    description: 'Golden, butter-rich shortcrust pastry filled with minced lean beef, potatoes, carrots, and aromatic spices.',
    inStock: true,
    stockCount: 60,
    rating: 4.9,
    reviewCount: 96,
    badge: 'Hot & Fresh',
    shelfLife: '2 Days Fresh'
  },
  {
    id: 'bake-03',
    division: 'BAKERY',
    name: 'Gourmet Red Velvet Celebration Cake (8-inch)',
    category: 'Cakes',
    price: 18500,
    originalPrice: 22000,
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80',
    description: 'Moist crimson sponge infused with hints of Dutch cocoa and layered with velvety cream cheese frosting.',
    inStock: true,
    stockCount: 10,
    rating: 4.9,
    reviewCount: 44,
    badge: 'Party Ready',
    shelfLife: '7 Days Chilled'
  },
  {
    id: 'bake-04',
    division: 'BAKERY',
    name: 'Giant Smoked Sausage Roll',
    category: 'Pastries',
    price: 900,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    description: 'Succulent seasoned sausage meat wrapped in flaky puff pastry baked to crisp golden perfection.',
    inStock: true,
    stockCount: 70,
    rating: 4.8,
    reviewCount: 51,
    shelfLife: '2 Days'
  },
  {
    id: 'bake-05',
    division: 'BAKERY',
    name: 'Glazed Ring Doughnuts (Box of 6)',
    category: 'Snacks',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    description: 'Fluffy yeast-risen fried doughnuts topped with sweet vanilla glaze, chocolate drizzle, and colorful sprinkles.',
    inStock: true,
    stockCount: 30,
    rating: 4.9,
    reviewCount: 33,
    shelfLife: '3 Days'
  },
  {
    id: 'bake-06',
    division: 'BAKERY',
    name: 'Rich Chocolate Fudge Gateau',
    category: 'Cakes',
    price: 21000,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    description: 'Decadent triple-layer dark chocolate cake enveloped with warm Belgian chocolate ganache.',
    inStock: true,
    stockCount: 8,
    rating: 5.0,
    reviewCount: 28,
    shelfLife: '7 Days Chilled'
  },
  {
    id: 'bake-07',
    division: 'BAKERY',
    name: 'Flaky French Butter Croissants (Pack of 4)',
    category: 'Pastries',
    price: 3600,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    description: 'Multi-layered honeycomb butter croissants baked golden brown with crisp outer crust and soft interior.',
    inStock: true,
    stockCount: 20,
    rating: 4.8,
    reviewCount: 19,
    shelfLife: '3 Days'
  },
  {
    id: 'bake-08',
    division: 'BAKERY',
    name: 'Artisan Banana Nut Loaf Bread',
    category: 'Bread',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=800&q=80',
    description: 'Moist banana dessert bread studded with roasted cashew nuts and cinnamon glaze.',
    inStock: true,
    stockCount: 25,
    rating: 4.9,
    reviewCount: 31,
    shelfLife: '5 Days'
  },

  // --- GROCERY HUB ---
  {
    id: 'groc-01',
    division: 'GROCERY',
    name: 'Fresh Okene Farm Yam Tubers (Bundle of 5 Large)',
    category: 'Tubers & Roots',
    price: 16500,
    originalPrice: 19000,
    image: 'https://images.unsplash.com/photo-1596450514735-111a2fe0ac76?auto=format&fit=crop&w=800&q=80',
    description: 'Freshly harvested giant white yams from fertile farms in Kogi State. Perfect for pounding or boiling.',
    inStock: true,
    stockCount: 40,
    rating: 4.9,
    reviewCount: 67,
    unit: '5 Large Tubers',
    badge: 'Direct Farm Price'
  },
  {
    id: 'groc-02',
    division: 'GROCERY',
    name: 'Pure Unadulterated Red Palm Oil (5 Litre Keg)',
    category: 'Oils & Spices',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    description: 'Fresh aromatic village-pressed red palm oil with rich color, no artificial additives, zero water mix.',
    inStock: true,
    stockCount: 55,
    rating: 5.0,
    reviewCount: 83,
    unit: '5 Litres',
    badge: '100% Pure'
  },
  {
    id: 'groc-03',
    division: 'GROCERY',
    name: 'Royal Parboiled Rice (50kg Bag)',
    category: 'Grains & Rice',
    price: 78000,
    originalPrice: 85000,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    description: 'Stone-free, long-grain polished parboiled rice. Clean, cooks fluffy without sticking.',
    inStock: true,
    stockCount: 25,
    rating: 4.8,
    reviewCount: 47,
    unit: '50kg Sack'
  },
  {
    id: 'groc-04',
    division: 'GROCERY',
    name: 'Yellow Fine Garri - Kogi Local Mix (Pain Bag / 10kg)',
    category: 'Grains & Flours',
    price: 8200,
    image: 'https://images.unsplash.com/photo-1627483262268-9c2b5b2834b5?auto=format&fit=crop&w=800&q=80',
    description: 'Crisp, sour, well-fried yellow garri made from cassava soaked with palm oil. Great for drinking or eba.',
    inStock: true,
    stockCount: 50,
    rating: 4.9,
    reviewCount: 71,
    unit: '10kg Bag'
  },
  {
    id: 'groc-05',
    division: 'GROCERY',
    name: 'Fresh Ground Melon Seeds / Hand-Peeled Egusi (1 Custard Bucket)',
    category: 'Soup Ingredients',
    price: 14000,
    image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=800&q=80',
    description: 'Oil-rich, freshly peeled melon seeds. Prepared stone-free and packaged hygienically.',
    inStock: true,
    stockCount: 32,
    rating: 4.9,
    reviewCount: 39,
    unit: '4 Litre Paint Bucket'
  },
  {
    id: 'groc-06',
    division: 'GROCERY',
    name: 'Whole Smoked Catfish Pack (Pack of 4 Large)',
    category: 'Proteins & Meat',
    price: 11000,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    description: 'Oven-dried hardwood smoked catfish. Sandy grit cleaned and sanitarily vacuum sealed.',
    inStock: true,
    stockCount: 28,
    rating: 4.8,
    reviewCount: 26,
    unit: 'Pack of 4 Fish'
  },
  {
    id: 'groc-07',
    division: 'GROCERY',
    name: 'Supermarket Household Bundle (Detergent + Tissue + Disinfectant)',
    category: 'Supermarket Essentials',
    price: 7500,
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
    description: 'Essential cleaning and hygiene items bundle for family household use.',
    inStock: true,
    stockCount: 45,
    rating: 4.7,
    reviewCount: 15,
    unit: 'Combo Pack'
  }
];

export const CATERING_PACKAGES: CateringPackage[] = [
  {
    id: 'cat-basic',
    name: 'Classic Celebration Pack',
    tier: 'BASIC',
    pricePerGuest: 3200,
    minGuests: 30,
    description: 'Ideal for intimate birthday parties, family dedications, and youth club events.',
    menuItems: [
      'Party Jollof Rice with Rich Tomato Base',
      'Fried Rice with Diced Vegetables',
      'Crispy Spiced Quarter Chicken or Beef',
      'Sweet Fried Plantain (Dodo)',
      'Fresh Coleslaw with Salad Dressing'
    ],
    drinks: ['Assorted Soft Drinks (Coke, Fanta, Sprite)', 'Chilled Bottled Water'],
    includesServers: false,
    includesChafingDishes: true
  },
  {
    id: 'cat-standard',
    name: 'Grand Occasion Feast',
    tier: 'STANDARD',
    pricePerGuest: 5800,
    minGuests: 50,
    popular: true,
    description: 'Perfect for standard Nigerian weddings, milestone anniversaries, and corporate banquets.',
    menuItems: [
      'Smokey Firewood Jollof Rice',
      'Special Fried Rice with Shrimps & Liver',
      'Pounded Yam with Rich Egusi Soup or Vegetable Soup',
      'Jumbo Peppered Chicken or Fried Catfish',
      'Spiced Goat Meat (Asun Chunks)',
      'Moi-Moi with Boiled Egg',
      'Mixed Green Garden Salad'
    ],
    drinks: ['Malt Drinks & Fruit Juices', 'Assorted Soft Drinks', 'Premium Bottled Water'],
    includesServers: true,
    includesChafingDishes: true
  },
  {
    id: 'cat-royal',
    name: 'Royal Ebira Heritage & Executive VIP Feast',
    tier: 'ROYAL_EBIRA',
    pricePerGuest: 9500,
    minGuests: 80,
    description: 'Our flagship VIP package with authentic Kogi & Ebira culinary delicacies, live carving stations, and uniformed professional waitstaff.',
    menuItems: [
      'Authentic Ebira Special Apapa (Steamed Seasoned Bean Pudding)',
      'Hot Pounded Yam with Native Egusi Soup & Bush Meat',
      'Seafood Gourmet Fried Rice & Smokey Party Jollof',
      'Whole Roasted Spicy Ram / Goat Meat Carving Station',
      'Fresh Catfish Pepper Soup with Scent Leaves',
      'Garnished Snail / Peppered Gizzard Skewers',
      'Flourish Pastry Dessert Board (Cupcakes & Meat Pies)'
    ],
    drinks: ['Fresh Palm Wine Mocktails', 'Exotic Fruit Punch', 'Champagne/Wine Service Setup', 'Juices & Premium Beverages'],
    includesServers: true,
    includesChafingDishes: true
  }
];

export const KOGI_LOCATIONS: LocationPoint[] = [
  // Okene Hub (HQ Base)
  { name: 'Flourish Destiny Hub (Total Junction, Okene)', address: 'Inoziomi Road, Total Junction, Okene', area: 'Total Junction', lga: 'Okene', isWithinKogi: true, latitude: 7.5501, longitude: 6.2359 },
  { name: 'Okene Central Market (Obehira)', address: 'Obehira Road, Okene', area: 'Obehira', lga: 'Okene', isWithinKogi: true, latitude: 7.5420, longitude: 6.2280 },
  { name: 'Kuroko Township', address: 'Kuroko Main Street, Okene', area: 'Kuroko', lga: 'Okene', isWithinKogi: true, latitude: 7.5680, longitude: 6.2410 },
  { name: 'Nagazi / Eika Junction', address: 'Nagazi Express Route, Adavi', area: 'Nagazi', lga: 'Adavi', isWithinKogi: true, latitude: 7.5850, longitude: 6.2620 },
  { name: 'Federal College of Education (FCE) Okene', address: 'FCE Campus Gate, Okene', area: 'Otite / FCE', lga: 'Okene', isWithinKogi: true, latitude: 7.5310, longitude: 6.2490 },
  { name: 'Itakpe Mining Community / Housing Estate', address: 'Itakpe Iron Ore Complex Gate, Okehi', area: 'Itakpe', lga: 'Okehi', isWithinKogi: true, latitude: 7.6100, longitude: 6.3150 },
  { name: 'Adavi LGA Secretariat / Ogaminana', address: 'Ogaminana Roundabout, Adavi', area: 'Ogaminana', lga: 'Adavi', isWithinKogi: true, latitude: 7.5920, longitude: 6.2710 },
  { name: 'Okehi LGA Secretariat / Obangede', address: 'Obangede Central, Okehi', area: 'Obangede', lga: 'Okehi', isWithinKogi: true, latitude: 7.6400, longitude: 6.2100 },

  // Ajaokuta & Lokoja
  { name: 'Ajaokuta Steel Plant (Geregu / Main Gate)', address: 'Steel Complex Highway, Ajaokuta', area: 'Geregu', lga: 'Ajaokuta', isWithinKogi: true, latitude: 7.5620, longitude: 6.6550 },
  { name: 'Lokoja Post Office / Ganaja Junction', address: 'Ganaja Express, Lokoja', area: 'Ganaja', lga: 'Lokoja', isWithinKogi: true, latitude: 7.7980, longitude: 6.7410 },
  { name: 'Federal University Lokoja (FUL) Adankolo Campus', address: 'Adankolo, Lokoja', area: 'Adankolo', lga: 'Lokoja', isWithinKogi: true, latitude: 7.8100, longitude: 6.7350 },
  { name: 'Kogi State Polytechnic Main Campus (Lokoja)', address: 'Felele, Lokoja', area: 'Felele', lga: 'Lokoja', isWithinKogi: true, latitude: 7.8420, longitude: 6.7210 },
  { name: 'Kabba Township (Oba Palace)', address: 'Kabba Main Road, Kabba/Bunu', area: 'Kabba Central', lga: 'Kabba/Bunu', isWithinKogi: true, latitude: 7.8280, longitude: 6.0750 },
  { name: 'Prince Abubakar Audu University (Anyigba)', address: 'PAAU Campus Gate, Anyigba', area: 'Anyigba', lga: 'Dekina', isWithinKogi: true, latitude: 7.4950, longitude: 7.1820 },
  { name: 'Ankpa Town Center', address: 'Ankpa Central Roundabout', area: 'Ankpa', lga: 'Ankpa', isWithinKogi: true, latitude: 7.6320, longitude: 7.6310 },
  { name: 'Idah Federal Polytechnic Gate', address: 'Polytechnic Road, Idah', area: 'Idah', lga: 'Idah', isWithinKogi: true, latitude: 7.1120, longitude: 6.7410 },

  // External / Outside Kogi Boundaries (for Boundary Validation Demonstration)
  { name: 'Abuja (Garki Area 1) - OUTSIDE KOGI', address: 'Area 1, Abuja FCT', area: 'Abuja FCT', lga: 'Abuja', isWithinKogi: false, latitude: 9.0300, longitude: 7.4800 },
  { name: 'Benin City (Ring Road) - OUTSIDE KOGI', address: 'Ring Road, Benin City, Edo State', area: 'Edo State', lga: 'Oredo', isWithinKogi: false, latitude: 6.3350, longitude: 5.6030 },
  { name: 'Akure (Alagbaka) - OUTSIDE KOGI', address: 'Alagbaka, Akure, Ondo State', area: 'Ondo State', lga: 'Akure South', isWithinKogi: false, latitude: 7.2500, longitude: 5.1950 },
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-01',
    name: 'Suleiman Yusuf (Ebira Express)',
    phone: '08034567891',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    vehicleType: 'KEKE',
    vehicleModel: 'TVS King Deluxe (Yellow)',
    plateNumber: 'KGI-482-OKE',
    rating: 4.9,
    totalTrips: 420,
    currentLat: 7.5510,
    currentLng: 6.2370,
    isOnline: true
  },
  {
    id: 'drv-02',
    name: 'Ibrahim Omeiza (Kogi Car Pilot)',
    phone: '08129876543',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    vehicleType: 'CAR',
    vehicleModel: 'Toyota Corolla / Camry (Air-Conditioned)',
    plateNumber: 'KGI-915-LKJ',
    rating: 4.95,
    totalTrips: 680,
    currentLat: 7.5540,
    currentLng: 6.2410,
    isOnline: true
  },
  {
    id: 'drv-03',
    name: 'Mustapha Audu (Okene Shuttle Car)',
    phone: '09012345678',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    vehicleType: 'CAR',
    vehicleModel: 'Honda Accord (Comfort Saloon)',
    plateNumber: 'KGI-007-AJX',
    rating: 5.0,
    totalTrips: 310,
    currentLat: 7.5490,
    currentLng: 6.2320,
    isOnline: true
  }
];

export const DELIVERY_ZONES = [
  { id: 'zone-1', name: 'Okene Central & Total Junction', fee: 500, time: '20-35 mins' },
  { id: 'zone-2', name: 'Obehira / Otite / FCE Okene', fee: 800, time: '30-45 mins' },
  { id: 'zone-3', name: 'Kuroko / Nagazi / Adavi (Ogaminana)', fee: 1200, time: '35-50 mins' },
  { id: 'zone-4', name: 'Itakpe / Obangede (Okehi LGA)', fee: 1800, time: '45-65 mins' },
  { id: 'zone-5', name: 'Ajaokuta Steel Complex / Geregu', fee: 3500, time: '60-90 mins' },
  { id: 'zone-6', name: 'Lokoja Express Delivery (Ganaja/Felele)', fee: 5000, time: 'Same-day / 2-3 hours' },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'FDC-ORD-7821',
    customerName: 'Amina Danjuma',
    customerPhone: '08134567890',
    customerAddress: 'Plot 8, Kuroko Road, Okene',
    deliveryArea: 'Kuroko / Nagazi / Adavi (Ogaminana)',
    division: 'MULTI',
    items: [
      {
        id: 'cart-1',
        productId: 'bake-01',
        division: 'BAKERY',
        name: 'Flourish Supreme Butter Agege Bread (Jumbo)',
        price: 1800,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        quantity: 2
      },
      {
        id: 'cart-2',
        productId: 'bake-02',
        division: 'BAKERY',
        name: 'Special Spicy Beef Meat Pie (Flaky Crust)',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1621236378699-8597fee6a1ce?auto=format&fit=crop&w=800&q=80',
        quantity: 4
      }
    ],
    subtotal: 8400,
    deliveryFee: 1200,
    discount: 0,
    tax: 0,
    total: 9600,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    orderStatus: 'OUT_FOR_DELIVERY',
    createdAt: '2026-08-28T07:15:00Z',
    estimatedDeliveryTime: '35 mins'
  }
];

// --- RICH SAMPLES & CATALOGS ACROSS ALL 5 HUBS ---

export interface BespokeTailoringSample {
  id: string;
  name: string;
  category: string;
  price: number;
  turnaroundDays: number;
  image: string;
  description: string;
  fabric: string;
  badge?: string;
}

export const BESPOKE_TAILORING_SAMPLES: BespokeTailoringSample[] = [
  {
    id: 'bt-01',
    name: 'Ebira Heritage Aso-Oke 3-Piece Agbada',
    category: 'Cultural / Traditional',
    price: 55000,
    turnaroundDays: 7,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    description: 'Bespoke hand-woven Ebira Aso-Oke Agbada, matching trousers, and inner buba with metallic thread embroidery.',
    fabric: 'Authentic Okene Hand-Woven Cloth',
    badge: 'Flagship Cultural'
  },
  {
    id: 'bt-02',
    name: 'Executive 2-Piece Senator Kaftan Suit',
    category: "Men's Bespoke",
    price: 28500,
    turnaroundDays: 5,
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    description: 'Precision-tailored cashmere wool Senator outfit with bespoke chest placket embroidery and crisp tailored pants.',
    fabric: 'Super 140s Cashmere Wool Blend',
    badge: 'Corporate & Casual'
  },
  {
    id: 'bt-03',
    name: 'Royal Ankara Corset & Mermaid Maxi Gown',
    category: "Women's Couture",
    price: 26000,
    turnaroundDays: 6,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    description: 'Structure-boned corset bodice with sweeping mermaid hemline, made from authentic high-grade wax print.',
    fabric: 'Hollandis Premium Cotton Wax',
    badge: 'Wedding Guest'
  },
  {
    id: 'bt-04',
    name: 'Double-Layered Ebira Traditional Wrapper & Peplum',
    category: "Women's Cultural",
    price: 38000,
    turnaroundDays: 7,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    description: 'Two wrappers in heavyweight woven Ebira textile paired with an embroidered peplum top and matching head-tie.',
    fabric: 'Heavy Okene Ebira Loom Woven',
    badge: 'Traditional Wedding'
  },
  {
    id: 'bt-05',
    name: 'Corporate Single-Breasted 2-Piece Pant Suit',
    category: 'Corporate Wear',
    price: 32000,
    turnaroundDays: 5,
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
    description: 'Sharp tailored blazer with lined lapels and straight-leg matching trousers for corporate executives.',
    fabric: 'Italian Crepe Wool Blend'
  },
  {
    id: 'bt-06',
    name: 'Handcrafted Nigerian Oxford Leather Shoes',
    category: 'Footwear',
    price: 21000,
    turnaroundDays: 4,
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
    description: 'Full-grain cowhide leather shoes handcrafted with Goodyear welt soles and padded leather insole.',
    fabric: '100% Genuine Nigerian Cowhide Leather'
  }
];

export interface CakeCustomSample {
  id: string;
  name: string;
  tier: string;
  price: number;
  servings: string;
  image: string;
  flavor: string;
  design: string;
  badge?: string;
}

export const CAKE_CUSTOM_SAMPLES: CakeCustomSample[] = [
  {
    id: 'cs-01',
    name: '3-Tier Royal Grand Wedding Fondant Cake',
    tier: '3-Tier Grand',
    price: 65000,
    servings: '120 - 150 Guests',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
    flavor: 'Red Velvet, Vanilla Marble & Rich Fruit Cake',
    design: 'Ivory White Fondant with Edible 24k Gold Leaf & Sugar Orchids',
    badge: 'Wedding Masterpiece'
  },
  {
    id: 'cs-02',
    name: '2-Tier Luxury Birthday & Anniversary Cake',
    tier: '2-Tier Luxury',
    price: 38000,
    servings: '50 - 70 Guests',
    image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80',
    flavor: 'Crimson Red Velvet & Dutch Dark Chocolate',
    design: 'Smooth Buttercream Ombre with Gold Drip & Macarons',
    badge: 'Most Popular'
  },
  {
    id: 'cs-03',
    name: '1-Tier Signature Gourmet Celebration Cake',
    tier: '1-Tier Classic (8-inch)',
    price: 18500,
    servings: '15 - 25 Guests',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    flavor: 'Belgian Chocolate Ganache / Moist Vanilla',
    design: 'Piped Rosettes with Custom Inscription Banner & Sprinkles',
    badge: 'Quick 24h Bake'
  },
  {
    id: 'cs-04',
    name: 'Custom Cartoon / Character Kids Birthday Cake',
    tier: 'Theme Sculpted (8-inch)',
    price: 25000,
    servings: '20 - 30 Guests',
    image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=800&q=80',
    flavor: 'Fluffy Strawberry & Vanilla Swirl',
    design: 'Vibrant 3D Character Sugar Topper with Rainbow Cream Layers',
    badge: 'Kids Favorite'
  }
];

export interface CateringSampleDish {
  id: string;
  name: string;
  category: string;
  pricePerPortion: number;
  image: string;
  description: string;
  isEbiraSpecialty?: boolean;
}

export const CATERING_SAMPLE_DISHES: CateringSampleDish[] = [
  {
    id: 'cd-01',
    name: 'Authentic Ebira Special Apapa (Steamed Bean Delicacy)',
    category: 'Kogi Cultural Specialty',
    pricePerPortion: 1200,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional Okene seasoned bean pudding enriched with flaked fish, smoked prawns, and native palm oil.',
    isEbiraSpecialty: true
  },
  {
    id: 'cd-02',
    name: 'Smokey Party Firewood Jollof & Fried Rice Duo',
    category: 'Party Rice Special',
    pricePerPortion: 1800,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    description: 'Signature party jollof with distinct firewood aroma paired with vegetable fried rice and fried sweet plantains.'
  },
  {
    id: 'cd-03',
    name: 'Fresh Pounded Yam with Native Egusi Soup & Bushmeat',
    category: 'Traditional Swallows',
    pricePerPortion: 3500,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    description: 'Silky smooth hot pounded Okene yam served with thick melon seed soup, bitterleaf, dried fish, and grasscutter meat.'
  },
  {
    id: 'cd-04',
    name: 'Whole Roasted Spicy Goat Meat (Asun Carving Station)',
    category: 'Grill & BBQ',
    pricePerPortion: 2800,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    description: 'Tender goat meat slow-charred over open flame with Scotch bonnet peppers and sliced red onions.'
  },
  {
    id: 'cd-05',
    name: 'Fresh Catfish Pepper Soup with Native Scent Leaves',
    category: 'Soups & Starters',
    pricePerPortion: 2500,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    description: 'Live fresh catfish simmered with aromatic Kogi spices, Uda, Ehuru, and fresh scent leaves.'
  },
  {
    id: 'cd-06',
    name: 'Gourmet Small Chops Platter (Spring Roll + Samosa + Puff-Puff)',
    category: 'Finger Foods',
    pricePerPortion: 1500,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    description: 'Crisp vegetable spring rolls, spicy beef samosas, golden sweet puff-puff, and seasoned peppered gizzard.'
  }
];

export interface TransportSampleRoute {
  id: string;
  pickup: string;
  destination: string;
  distanceKm: number;
  kekeFare: number;
  carFare: number;
  durationMins: number;
  image: string;
  description: string;
}

export const TRANSPORT_SAMPLE_ROUTES: TransportSampleRoute[] = [
  {
    id: 'rt-01',
    pickup: 'Total Junction Hub, Okene',
    destination: 'Okene Central Market / Obehira',
    distanceKm: 2.8,
    kekeFare: 650,
    carFare: 1500,
    durationMins: 10,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    description: 'Direct town-center transit from Total Junction base to Obehira market and trading shops.'
  },
  {
    id: 'rt-02',
    pickup: 'Total Junction Hub, Okene',
    destination: 'Kuroko Township / Nagazi Adavi',
    distanceKm: 4.5,
    kekeFare: 950,
    carFare: 1950,
    durationMins: 15,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    description: 'Suburban transit connecting residential Okene districts to Nagazi along the expressway.'
  },
  {
    id: 'rt-03',
    pickup: 'Total Junction Hub, Okene',
    destination: 'Federal College of Education (FCE) Gate, Otite',
    distanceKm: 3.2,
    kekeFare: 700,
    carFare: 1600,
    durationMins: 12,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    description: 'Campus corridor route for students, faculty, and visitors to FCE Okene.'
  },
  {
    id: 'rt-04',
    pickup: 'Okene Headquarters Hub',
    destination: 'Ajaokuta Steel Plant & Geregu Hub',
    distanceKm: 22.0,
    kekeFare: 0, // Car only for long inter-town distance
    carFare: 6300,
    durationMins: 35,
    image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80',
    description: 'Inter-district highway trip via comfortable air-conditioned car across the Ajaokuta steel belt.'
  },
  {
    id: 'rt-05',
    pickup: 'Okene Headquarters Hub',
    destination: 'Lokoja Ganaja / Felele (State Capital)',
    distanceKm: 48.0,
    kekeFare: 0,
    carFare: 12800,
    durationMins: 55,
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    description: 'Premium private express travel from Okene to Lokoja ministries, Ganaja, or Kogi State Poly.'
  }
];
