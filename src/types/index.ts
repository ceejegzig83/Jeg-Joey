export type Division = 'ALL' | 'FASHION' | 'BAKERY' | 'CATERING' | 'GROCERY' | 'TRANSPORT';

export type PaymentMethod = 
  | 'PAYSTACK_CARD' 
  | 'FLUTTERWAVE_CARD' 
  | 'BANK_TRANSFER' 
  | 'USSD' 
  | 'CASH_ON_DELIVERY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type OrderStatus = 
  | 'PLACED' 
  | 'PROCESSING' 
  | 'READY_FOR_PICKUP' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED';

export interface Product {
  id: string;
  division: 'FASHION' | 'BAKERY' | 'GROCERY';
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  // Fashion specific
  sizes?: string[];
  colors?: string[];
  fabric?: string;
  gender?: 'Men' | 'Women' | 'Unisex' | 'Kids';
  // Bakery specific
  shelfLife?: string;
  allergens?: string[];
  // Grocery specific
  unit?: string;
  isPerishable?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  division: 'FASHION' | 'BAKERY' | 'GROCERY';
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  specialNotes?: string;
}

export interface TailoringRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  garmentType: string; // e.g. 'Ebira Traditional Aso-Oke', 'Senator Suit', 'Agbada', 'Maxi Dress'
  fabricPreference: string; // e.g. 'Provide Own Fabric', 'Ebira Woven Cloth', 'Premium Cashmere', 'Italian Wool'
  colorTheme: string;
  measurements: {
    chest?: number;
    waist?: number;
    shoulder?: number;
    sleeve?: number;
    length?: number;
    trouserLength?: number;
    thigh?: number;
    neck?: number;
    customNotes?: string;
  };
  designDescription: string;
  referenceImage?: string;
  preferredCompletionDate: string;
  estimatedCost: number;
  depositPaid: number;
  status: 'REQUESTED' | 'REVIEWING' | 'QUOTED' | 'APPROVED' | 'IN_PRODUCTION' | 'READY' | 'COMPLETED';
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface CakeOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  cakeType: string; // Birthday, Wedding, Anniversary, Graduation
  cakeSize: string; // 8-inch, 10-inch, 2-tier, 3-tier, 4-tier
  flavor: string; // Vanilla, Chocolate, Red Velvet, Marble, Coconut
  layers: number;
  designStyle: string; // Fondant, Buttercream, Naked, Floral
  colorTheme: string;
  inscription: string; // e.g. 'Happy 30th Birthday Destiny'
  referenceImage?: string;
  deliveryDate: string;
  deliveryTimeSlot: string; // 'Morning (9am-12pm)', 'Afternoon (1pm-4pm)', 'Evening (5pm-7pm)'
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  specialInstructions?: string;
  estimatedPrice: number;
  status: 'RECEIVED' | 'DESIGN_CONFIRMED' | 'BAKING' | 'DECORATING' | 'READY_FOR_DELIVERY' | 'DELIVERED';
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface CateringPackage {
  id: string;
  name: string;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ROYAL_EBIRA';
  pricePerGuest: number;
  description: string;
  minGuests: number;
  menuItems: string[];
  drinks: string[];
  includesServers: boolean;
  includesChafingDishes: boolean;
  popular?: boolean;
}

export interface CateringBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: 'Wedding' | 'Birthday' | 'Burial' | 'Corporate Event' | 'Political Gathering' | 'Religious Event' | 'Traditional Celebration' | 'Other';
  eventDate: string;
  eventTime: string;
  eventLocation: string; // e.g., 'Okene Civic Centre', 'Kabba Town Hall', 'Lokoja Hotel'
  expectedGuests: number;
  selectedPackageId?: string;
  customMenuPreferences: string[];
  serviceStyle: 'Buffet' | 'Plated VIP' | 'Packed Boxes' | 'Live Cooking Stations';
  specialRequirements?: string;
  baseFoodCost: number;
  serviceCharge: number;
  transportCharge: number;
  totalQuote: number;
  depositRequired: number; // 50% or 100%
  depositPaid: number;
  status: 'PENDING_QUOTE' | 'QUOTE_ISSUED' | 'BOOKING_CONFIRMED' | 'PREPARATION' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export type VehicleType = 'KEKE' | 'CAR';

export interface LocationPoint {
  name: string;
  address: string;
  area: string;
  lga: string; // Local Govt Area in Kogi State (e.g., Okene, Adavi, Okehi, Ajaokuta, Lokoja)
  isWithinKogi: boolean;
  latitude: number;
  longitude: number;
}

export interface RideRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: LocationPoint;
  destinationLocation: LocationPoint;
  vehicleType: VehicleType;
  distanceKm: number;
  estimatedMinutes: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  totalFare: number;
  paymentMethod: 'PAYSTACK_CARD' | 'FLUTTERWAVE_CARD' | 'BANK_TRANSFER' | 'USSD';
  paymentStatus: 'PAID';
  paymentVerifiedAt?: string;
  paymentGatewayRef?: string;
  status: 
    | 'SEARCHING_FOR_DRIVER' 
    | 'DRIVER_ASSIGNED' 
    | 'DRIVER_ARRIVING' 
    | 'DRIVER_ARRIVED' 
    | 'TRIP_STARTED' 
    | 'TRIP_COMPLETED' 
    | 'CANCELLED';
  driver?: Driver;
  createdAt: string;
  completedAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  photo: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  plateNumber: string;
  rating: number;
  totalTrips: number;
  currentLat: number;
  currentLng: number;
  isOnline: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryArea: string;
  division: 'FASHION' | 'BAKERY' | 'GROCERY' | 'MULTI';
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentVerifiedBy?: string;
  paymentVerifiedAt?: string;
  orderStatus: OrderStatus;
  createdAt: string;
  estimatedDeliveryTime?: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  defaultAddress: string;
  defaultArea: string;
  role: 'CUSTOMER' | 'DRIVER' | 'ADMIN';
}
