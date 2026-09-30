export type Division = 'ALL' | 'FASHION' | 'BAKERY' | 'CATERING' | 'GROCERY' | 'TRANSPORT' | 'VTU';

export type VTUNetwork = 'MTN' | 'AIRTEL' | 'GLO' | '9MOBILE';

export type VTUServiceType = 'AIRTIME' | 'DATA';

export type VTUTransactionStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUCCESSFUL'
  | 'PROCESSING'
  | 'SUCCESSFUL'
  | 'FAILED'
  | 'REVERSED'
  | 'REFUNDED';

export interface VTUNetworkInfo {
  id: VTUNetwork;
  name: string;
  shortName: string;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  prefixes: string[];
  enabled: boolean;
  airtimeDiscountPercent?: number;
}

export interface VTUDataPlan {
  planId: string;
  network: VTUNetwork;
  name: string; // e.g., "1GB", "500MB", "2GB"
  description: string; // e.g., "MTN SME / Monthly Data Plan"
  category?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MEGA';
  validity: string; // e.g., "30 Days"
  providerPrice: number;
  customerPrice: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface VTUTransaction {
  id: string; // e.g., "FDC-20260927-849201"
  reference: string; // Payment/Idempotency reference
  idempotencyKey?: string;
  type: VTUServiceType;
  network: VTUNetwork;
  phoneNumber: string; // Normalized 11-digit Nigerian number e.g. 08012345678
  customerName?: string;
  customerEmail?: string;
  amount: number; // Nominal airtime amount or bundle customerPrice
  serviceFee: number;
  totalAmount: number;
  providerCost?: number;
  planId?: string;
  planName?: string;
  planValidity?: string;
  paymentMethod: 'PAYSTACK_CARD' | 'BANK_TRANSFER' | 'USSD';
  paymentStatus: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'ABANDONED' | 'REFUNDED';
  paymentGatewayRef?: string;
  paymentVerifiedAt?: string;
  vtuProvider: string;
  vtuProviderRef?: string;
  vtuStatusMessage?: string;
  status: VTUTransactionStatus;
  mode: 'TEST_MODE' | 'LIVE_MODE';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface VTUSavedBeneficiary {
  id: string;
  name: string;
  phoneNumber: string;
  network: VTUNetwork;
}

export interface VTUConfig {
  mode: 'TEST_MODE' | 'LIVE_MODE';
  isLivePaystack: boolean;
  vtuProviderName: string;
  minAirtimeAmount: number;
  maxAirtimeAmount: number;
  airtimeServiceFee: number;
  dataServiceFee: number;
  networksEnabled: Record<VTUNetwork, boolean>;
}


export type PaymentMethod = 
  | 'PAYSTACK_CARD' 
  | 'FLUTTERWAVE_CARD' 
  | 'BANK_TRANSFER' 
  | 'USSD' 
  | 'CASH_ON_DELIVERY';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PLACED' 
  | 'RECEIVED'
  | 'PROCESSING' 
  | 'READY'
  | 'READY_FOR_PICKUP' 
  | 'DISPATCHED'
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'COMPLETED'
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
  featured?: boolean;
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

export type TailoringProductionStage =
  | 'ORDER_RECEIVED'
  | 'MEASUREMENT_CONFIRMED'
  | 'CUTTING'
  | 'SEWING'
  | 'FINISHING'
  | 'QUALITY_CHECK'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'REQUESTED'
  | 'REVIEWING'
  | 'QUOTED'
  | 'APPROVED'
  | 'IN_PRODUCTION';

export interface TailoringRequest {
  id: string;
  orderReference?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  garmentType: string; // e.g. 'Ebira Traditional Aso-Oke', 'Senator Suit', 'Agbada', 'Maxi Dress'
  fabricPreference: string; // e.g. 'Provide Own Fabric', 'Ebira Woven Cloth', 'Premium Cashmere', 'Italian Wool'
  colorTheme: string;
  quantity?: number;
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
  status: TailoringProductionStage;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface CakeOrder {
  id: string;
  orderReference?: string;
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
  status:
    | 'ORDER_RECEIVED'
    | 'RECEIVED'
    | 'DESIGN_CONFIRMED'
    | 'BAKING'
    | 'DECORATING'
    | 'READY'
    | 'READY_FOR_DELIVERY'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED';
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

export type CateringBookingStatus =
  | 'REQUEST_RECEIVED'
  | 'QUOTE_PREPARING'
  | 'QUOTE_SENT'
  | 'DEPOSIT_REQUIRED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'PENDING_QUOTE'
  | 'QUOTE_ISSUED'
  | 'BOOKING_CONFIRMED'
  | 'PREPARATION'
  | 'CANCELLED';

export interface CateringBooking {
  id: string;
  bookingReference?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  eventType: 'Wedding' | 'Birthday' | 'Burial' | 'Burial / Celebration of Life' | 'Naming Ceremony' | 'Graduation' | 'Corporate Event' | 'Political Gathering' | 'Religious Event' | 'Traditional Celebration' | 'Other' | string;
  eventDate: string;
  eventTime: string;
  eventLocation: string; // e.g., 'Okene Civic Centre', 'Kabba Town Hall', 'Lokoja Hotel'
  expectedGuests: number;
  selectedPackageId?: string;
  customMenuPreferences: string[];
  serviceStyle: 'Buffet' | 'Plated VIP' | 'Packed Boxes' | 'Live Cooking Stations' | string;
  specialRequirements?: string;
  baseFoodCost: number;
  serviceCharge: number;
  transportCharge: number;
  totalQuote: number;
  depositRequired: number; // 50% or 100%
  depositPaid: number;
  status: CateringBookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export type VehicleType = 'KEKE' | 'CAR';

export interface LocationPoint {
  name: string;
  address: string;
  area: string;
  lga: string; // Local Govt Area in Kogi State (all 21 LGAs)
  ward?: string; // Electoral / Administrative Ward
  street?: string; // Street / Road / Avenue
  isWithinKogi: boolean;
  latitude: number;
  longitude: number;
}

export type RideStatus =
  | 'SEARCHING_FOR_DRIVER'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ARRIVING'
  | 'DRIVER_ARRIVED'
  | 'TRIP_STARTED'
  | 'TRIP_IN_PROGRESS'
  | 'TRIP_COMPLETED'
  | 'CANCELLED';

export interface RideRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: LocationPoint;
  destinationLocation: LocationPoint;
  vehicleType: VehicleType;
  tripMode?: 'STANDARD' | 'PRIVATE_HIRE';
  distanceKm: number;
  estimatedMinutes: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  totalFare: number;
  paymentMethod: 'PAYSTACK_CARD' | 'FLUTTERWAVE_CARD' | 'BANK_TRANSFER' | 'USSD';
  paymentStatus: PaymentStatus;
  paymentVerifiedAt?: string;
  paymentGatewayRef?: string;
  status: RideStatus;
  driver?: Driver;
  createdAt: string;
  completedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'ORDER' | 'PAYMENT' | 'RIDE' | 'TAILORING' | 'BAKERY' | 'CATERING' | 'VTU';
  createdAt: string;
  read: boolean;
  isDemoNotification: boolean;
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
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
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
  paymentReference?: string;
  paymentVerifiedBy?: string;
  paymentVerifiedAt?: string;
  inventoryDeducted?: boolean;
  orderStatus: OrderStatus;
  createdAt: string;
  estimatedDeliveryTime?: string;
  notes?: string;
}

export type UserRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN';

export interface UserProfile {
  id?: string;
  name: string;
  phone: string;
  email: string;
  defaultAddress: string;
  defaultArea: string;
  role: 'CUSTOMER' | 'DRIVER' | 'ADMIN';
  isAuthenticated?: boolean;
}

export type PaymentLifecycleStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'ABANDONED'
  | 'REFUNDED';

export type PayableEntityType =
  | 'ORDER'
  | 'TAILORING'
  | 'CAKE'
  | 'CATERING'
  | 'RIDE'
  | 'VTU';

export interface PaymentRecord {
  id: string;
  reference: string;
  idempotencyKey?: string;
  entityType: PayableEntityType;
  entityId: string;
  customerId?: string;
  customerEmail: string;
  customerPhone?: string;
  amountNaira: number;
  amountKobo: number;
  currency: 'NGN';
  channel: PaymentMethod;
  provider: 'PAYSTACK' | 'DEMO_GATEWAY' | 'CASH_ON_DELIVERY';
  mode: 'TEST_MODE' | 'LIVE_MODE';
  status: PaymentLifecycleStatus;
  authorizationUrl?: string;
  accessCode?: string;
  gatewayTransactionId?: string;
  verifiedAt?: string;
  verifiedBy?: 'PAYSTACK_API' | 'PAYSTACK_WEBHOOK' | 'DEMO_VERIFIER' | 'ADMIN_MANUAL';
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEventRecord {
  id: string;
  paymentId: string;
  reference: string;
  eventType: string;
  previousStatus?: PaymentLifecycleStatus;
  newStatus: PaymentLifecycleStatus;
  source: 'BACKEND_INIT' | 'BACKEND_VERIFY' | 'PAYSTACK_WEBHOOK' | 'ADMIN_ACTION';
  signatureValid?: boolean;
  payloadSummary?: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'SYSTEM' | 'WEBHOOK';
  action: string;
  entityType:
    | 'PRODUCT'
    | 'INVENTORY'
    | 'ORDER'
    | 'PAYMENT'
    | 'TAILORING'
    | 'CAKE'
    | 'CATERING'
    | 'RIDE'
    | 'DRIVER'
    | 'VTU'
    | 'AUTH'
    | 'SETTINGS';
  entityId: string;
  summary: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  entityType: PayableEntityType;
  entityId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  subtotal: number;
  deliveryOrServiceFee: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  issuedAt: string;
  paidAt?: string;
}

export interface SystemArchitectureStatus {
  environment: string;
  operationalMode: 'DEMO_MODE' | 'PRODUCTION_MODE';
  database: {
    mode: 'DEMO_PERSISTENT' | 'POSTGRESQL_LIVE';
    connected: boolean;
    engine: string;
    entitiesCount: Record<string, number>;
  };
  paystack: {
    mode: 'TEST_MODE' | 'LIVE_MODE';
    configured: boolean;
    webhookEndpoint: string;
  };
  vtu: {
    mode: 'TEST_MODE' | 'LIVE_MODE';
    providerName: string;
    configured: boolean;
  };
  security: {
    jwtConfigured: boolean;
    rbacEnabled: boolean;
    webhookHmacEnabled: boolean;
    auditLoggingEnabled: boolean;
    rateLimitingEnabled: boolean;
  };
}

export interface BespokeTailoringSample {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  turnaroundDays: number;
  fabric: string;
  badge?: string;
}

export interface CakeCustomSample {
  id: string;
  name: string;
  tier: string;
  flavor: string;
  servings: string;
  price: number;
  image: string;
  design: string;
  badge?: string;
}

export interface CateringSampleDish {
  id: string;
  name: string;
  category: string;
  pricePerPortion: number;
  image: string;
  description: string;
  isEbiraSpecialty?: boolean;
}

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

export interface BusinessInfoConfig {
  name: string;
  subtitle: string;
  location: string;
  address: string;
  phone: string;
  formattedPhone: string;
  whatsappNumber: string;
  whatsappUrl: string;
  email: string;
  workingHours: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  divisionsEnabled: {
    FASHION: boolean;
    BAKERY: boolean;
    CATERING: boolean;
    GROCERY: boolean;
    TRANSPORT: boolean;
    VTU?: boolean;
  };
}

export interface AnnouncementConfig {
  enabled: boolean;
  badgeText: string;
  message: string;
  actionText: string;
  actionDivision?: Division;
}

export interface FareConfig {
  kekeBaseFare: number;
  kekePerKm: number;
  carBaseFare: number;
  carPerKm: number;
  surgeMultiplier: number;
}

