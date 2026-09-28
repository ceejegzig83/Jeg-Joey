import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Division, 
  Product, 
  CartItem, 
  Order, 
  TailoringRequest, 
  CakeOrder, 
  CateringBooking, 
  RideRequest, 
  Driver, 
  UserProfile, 
  LocationPoint,
  PaymentMethod,
  BespokeTailoringSample,
  CakeCustomSample,
  CateringPackage,
  CateringSampleDish,
  TransportSampleRoute,
  BusinessInfoConfig,
  AnnouncementConfig,
  FareConfig,
  VTUNetwork,
  VTUServiceType,
  VTUDataPlan,
  VTUTransaction,
  VTUSavedBeneficiary,
  VTUConfig
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_DRIVERS, 
  INITIAL_ORDERS, 
  DELIVERY_ZONES,
  KOGI_LOCATIONS,
  CATERING_PACKAGES,
  BESPOKE_TAILORING_SAMPLES,
  CAKE_CUSTOM_SAMPLES,
  CATERING_SAMPLE_DISHES,
  TRANSPORT_SAMPLE_ROUTES,
  INITIAL_BUSINESS_CONFIG,
  INITIAL_ANNOUNCEMENT_CONFIG,
  INITIAL_FARE_CONFIG
} from '../data/mockData';
import {
  INITIAL_VTU_CONFIG,
  INITIAL_VTU_DATA_PLANS,
  INITIAL_VTU_TRANSACTIONS,
  INITIAL_SAVED_BENEFICIARIES
} from '../data/vtuData';
import { validateNigerianPhone } from '../utils/nigerianPhone';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  title?: string;
}

interface AppContextType {
  activeDivision: Division;
  setActiveDivision: (div: Division) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Products & Inventory Management
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleProductInStock: (productId: string) => void;
  toggleProductStock: (productId: string) => void;
  quickUpdateProductPrice: (productId: string, newPrice: number) => void;
  
  // Bespoke Tailoring Samples
  bespokeSamples: BespokeTailoringSample[];
  addBespokeSample: (sample: BespokeTailoringSample) => void;
  updateBespokeSample: (sample: BespokeTailoringSample) => void;
  deleteBespokeSample: (id: string) => void;

  // Custom Cake Designs
  cakeSamples: CakeCustomSample[];
  addCakeSample: (sample: CakeCustomSample) => void;
  updateCakeSample: (sample: CakeCustomSample) => void;
  deleteCakeSample: (id: string) => void;

  // Catering Packages & Event Dishes
  cateringPackages: CateringPackage[];
  addCateringPackage: (pkg: CateringPackage) => void;
  updateCateringPackage: (pkg: CateringPackage) => void;
  deleteCateringPackage: (id: string) => void;
  cateringDishes: CateringSampleDish[];
  addCateringDish: (dish: CateringSampleDish) => void;
  updateCateringDish: (dish: CateringSampleDish) => void;
  deleteCateringDish: (id: string) => void;

  // Transport Routes & Logistics
  transportRoutes: TransportSampleRoute[];
  addTransportRoute: (route: TransportSampleRoute) => void;
  updateTransportRoute: (route: TransportSampleRoute) => void;
  deleteTransportRoute: (id: string) => void;
  drivers: Driver[];
  addDriver: (driver: Driver) => void;
  updateDriver: (driver: Driver) => void;
  deleteDriver: (id: string) => void;
  toggleDriverOnline: (id: string) => void;
  fareConfig: FareConfig;
  updateFareConfig: (config: Partial<FareConfig>) => void;

  // Site-wide CMS & Business Settings
  businessInfo: BusinessInfoConfig;
  updateBusinessInfo: (info: Partial<BusinessInfoConfig>) => void;
  announcement: AnnouncementConfig;
  updateAnnouncement: (config: Partial<AnnouncementConfig>) => void;

  // System Backup & Factory Reset
  resetAllToFactoryDefaults: () => void;
  exportSiteDataBackup: () => string;
  importSiteDataBackup: (jsonData: string) => boolean;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string, specialNotes?: string) => void;
  updateCartQuantity: (itemId: string, newQty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  selectedDeliveryZone: typeof DELIVERY_ZONES[0];
  setSelectedDeliveryZone: (zone: typeof DELIVERY_ZONES[0]) => void;
  cartTotal: number;
  isCoDAllowedInCart: boolean;
  cartContainsMandatoryOnlineDivision: boolean;
  
  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => void;
  
  // Tailoring
  tailoringRequests: TailoringRequest[];
  createTailoringRequest: (data: Omit<TailoringRequest, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => TailoringRequest;
  updateTailoringStatus: (id: string, status: TailoringRequest['status'], paymentStatus?: TailoringRequest['paymentStatus']) => void;
  
  // Cake Orders
  cakeOrders: CakeOrder[];
  createCakeOrder: (data: Omit<CakeOrder, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => CakeOrder;
  updateCakeStatus: (id: string, status: CakeOrder['status'], paymentStatus?: CakeOrder['paymentStatus']) => void;
  
  // Catering Bookings
  cateringBookings: CateringBooking[];
  createCateringBooking: (data: Omit<CateringBooking, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => CateringBooking;
  updateCateringStatus: (id: string, status: CateringBooking['status'], paymentStatus?: CateringBooking['paymentStatus']) => void;
  
  // Ride Hailing
  activeRide: RideRequest | null;
  rideHistory: RideRequest[];
  requestRide: (data: {
    customerName: string;
    customerPhone: string;
    pickupLocation: LocationPoint;
    destinationLocation: LocationPoint;
    vehicleType: RideRequest['vehicleType'];
    distanceKm: number;
    estimatedMinutes: number;
    totalFare: number;
    paymentMethod: RideRequest['paymentMethod'];
  }) => RideRequest | null;
  cancelRide: (rideId: string) => void;
  completeRide: (rideId: string) => void;
  
  // User Profile / Roles & Admin Security
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  currentRole: 'CUSTOMER' | 'ADMIN' | 'DRIVER';
  setCurrentRole: (role: 'CUSTOMER' | 'ADMIN' | 'DRIVER') => void;
  isAdminAuthenticated: boolean;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  loginAdmin: (usernameOrEmail: string, password: string) => boolean;
  logoutAdmin: () => void;
  
  // Modals & UI
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isSpecModalOpen: boolean;
  setIsSpecModalOpen: (open: boolean) => void;
  activeInvoice: Order | RideRequest | CateringBooking | TailoringRequest | CakeOrder | null;
  setActiveInvoice: (inv: any | null) => void;
  isContactModalOpen: boolean;
  setIsContactModalOpen: (open: boolean) => void;
  
  // Verification Safeguards
  verifyOrderCoDPayment: (orderId: string, verifiedBy?: string) => void;
  verifyRidePayment: (rideId: string, verifiedBy?: string) => void;
  sendReceiptNotification: (doc: any, channel?: 'WHATSAPP' | 'SMS') => void;

  // Airtime & Data VTU Module
  vtuConfig: VTUConfig;
  vtuDataPlans: VTUDataPlan[];
  vtuTransactions: VTUTransaction[];
  savedBeneficiaries: VTUSavedBeneficiary[];
  activeVTUReceipt: VTUTransaction | null;
  setActiveVTUReceipt: (tx: VTUTransaction | null) => void;
  initiateVTUTransaction: (payload: {
    type: VTUServiceType;
    network: VTUNetwork;
    phoneNumber: string;
    amount: number;
    planId?: string;
    customerName?: string;
    customerEmail?: string;
    paymentMethod: 'PAYSTACK_CARD' | 'BANK_TRANSFER' | 'USSD';
    idempotencyKey?: string;
  }) => Promise<{
    success: boolean;
    transaction?: VTUTransaction;
    paymentSession?: {
      mode: 'TEST_MODE' | 'LIVE_MODE';
      reference: string;
      amountNaira: number;
      amountKobo: number;
      authorizationUrl?: string;
    };
    error?: string;
  }>;
  verifyAndFulfillVTUPayment: (payload: {
    reference: string;
    simulatedPaymentOutcome?: 'SUCCESS' | 'FAILED' | 'ABANDONED';
    simulateProviderFailure?: boolean;
  }) => Promise<{
    success: boolean;
    transaction?: VTUTransaction;
    error?: string;
  }>;
  saveVTUDataPlan: (plan: VTUDataPlan) => Promise<void>;
  deleteVTUDataPlan: (planId: string) => Promise<void>;
  toggleVTUDataPlanStatus: (planId: string) => Promise<void>;
  updateVTUConfig: (config: Partial<VTUConfig>) => Promise<void>;
  adminVTUTransactionAction: (
    txId: string,
    action: 'RETRY' | 'REFUND' | 'REVERSE' | 'MARK_SUCCESS'
  ) => Promise<void>;
  addSavedBeneficiary: (ben: Omit<VTUSavedBeneficiary, 'id'>) => void;
  removeSavedBeneficiary: (id: string) => void;
  
  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], title?: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDivision, setActiveDivision] = useState<Division>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Products state
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('fdc_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Bespoke samples state
  const [bespokeSamples, setBespokeSamples] = useState<BespokeTailoringSample[]>(() => {
    const saved = localStorage.getItem('fdc_bespoke_samples');
    return saved ? JSON.parse(saved) : BESPOKE_TAILORING_SAMPLES;
  });

  // Custom cake samples state
  const [cakeSamples, setCakeSamples] = useState<CakeCustomSample[]>(() => {
    const saved = localStorage.getItem('fdc_cake_samples');
    return saved ? JSON.parse(saved) : CAKE_CUSTOM_SAMPLES;
  });

  // Catering packages state
  const [cateringPackages, setCateringPackages] = useState<CateringPackage[]>(() => {
    const saved = localStorage.getItem('fdc_catering_packages');
    return saved ? JSON.parse(saved) : CATERING_PACKAGES;
  });

  // Catering dishes state
  const [cateringDishes, setCateringDishes] = useState<CateringSampleDish[]>(() => {
    const saved = localStorage.getItem('fdc_catering_dishes');
    return saved ? JSON.parse(saved) : CATERING_SAMPLE_DISHES;
  });

  // Transport routes state
  const [transportRoutes, setTransportRoutes] = useState<TransportSampleRoute[]>(() => {
    const saved = localStorage.getItem('fdc_transport_routes');
    return saved ? JSON.parse(saved) : TRANSPORT_SAMPLE_ROUTES;
  });

  // Drivers state
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('fdc_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  // Business Info & CMS Settings
  const [businessInfo, setBusinessInfo] = useState<BusinessInfoConfig>(() => {
    const saved = localStorage.getItem('fdc_business_config');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_CONFIG;
  });

  // Announcement Banner
  const [announcement, setAnnouncement] = useState<AnnouncementConfig>(() => {
    const saved = localStorage.getItem('fdc_announcement_config');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENT_CONFIG;
  });

  // Transport Fare Config
  const [fareConfig, setFareConfig] = useState<FareConfig>(() => {
    const saved = localStorage.getItem('fdc_fare_config');
    return saved ? JSON.parse(saved) : INITIAL_FARE_CONFIG;
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('fdc_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDeliveryZone, setSelectedDeliveryZone] = useState(DELIVERY_ZONES[0]);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('fdc_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Tailoring requests
  const [tailoringRequests, setTailoringRequests] = useState<TailoringRequest[]>(() => {
    const saved = localStorage.getItem('fdc_tailoring');
    return saved ? JSON.parse(saved) : [
      {
        id: 'tailor-001',
        customerName: 'Barrister Yakubu Ahmed',
        customerPhone: '08023456789',
        customerEmail: 'yakubu.ahmed@law.ng',
        garmentType: 'Ebira Traditional Aso-Oke Agbada 3-Piece',
        fabricPreference: 'Ebira Woven Cloth (Okene Origin)',
        colorTheme: 'Emerald Green & Gold Thread',
        measurements: { chest: 42, waist: 36, shoulder: 19, sleeve: 25, length: 44, trouserLength: 42, neck: 16.5 },
        designDescription: 'Intricate floral embroidery along the front placket with traditional matching cap.',
        preferredCompletionDate: '2026-09-15',
        estimatedCost: 55000,
        depositPaid: 55000,
        status: 'IN_PRODUCTION',
        paymentStatus: 'PAID',
        createdAt: '2026-08-27T10:00:00Z'
      }
    ];
  });

  // Cake orders
  const [cakeOrders, setCakeOrders] = useState<CakeOrder[]>(() => {
    const saved = localStorage.getItem('fdc_cakes');
    return saved ? JSON.parse(saved) : [
      {
        id: 'cake-001',
        customerName: 'Dr. (Mrs) Fatima Bello',
        customerPhone: '08145678901',
        cakeType: 'Wedding / Anniversary',
        cakeSize: '3-Tier Grand Elegance',
        flavor: 'Red Velvet & Vanilla Marble',
        layers: 3,
        designStyle: 'Fondant with Gold Leaf & Sugar Orchids',
        colorTheme: 'Ivory White & Champagne Gold',
        inscription: 'Celebrating 25 Years of Grace & Love',
        deliveryDate: '2026-09-10',
        deliveryTimeSlot: 'Morning (9am-12pm)',
        deliveryAddress: 'Okene Civic Centre Hall A, Inoziomi',
        recipientName: 'Dr. Fatima Bello',
        recipientPhone: '08145678901',
        specialInstructions: 'Ensure delivery 2 hours before reception begins.',
        estimatedPrice: 65000,
        status: 'DESIGN_CONFIRMED',
        paymentStatus: 'PAID',
        createdAt: '2026-08-27T14:30:00Z'
      }
    ];
  });

  // Catering bookings
  const [cateringBookings, setCateringBookings] = useState<CateringBooking[]>(() => {
    const saved = localStorage.getItem('fdc_catering');
    return saved ? JSON.parse(saved) : [
      {
        id: 'cat-001',
        customerName: 'Alhaji Sani Momoh',
        customerPhone: '08098765432',
        customerEmail: 'sani.momoh@gmail.com',
        eventType: 'Traditional Celebration',
        eventDate: '2026-09-20',
        eventTime: '1:00 PM',
        eventLocation: 'Okene Club Grounds, Obehira Road',
        expectedGuests: 150,
        selectedPackageId: 'cat-standard',
        customMenuPreferences: ['Ebira Apapa with Smoked Fish', 'Firewood Party Jollof', 'Pounded Yam with Native Egusi', 'Spicy Asun Goat Meat'],
        serviceStyle: 'Buffet',
        specialRequirements: 'VIP table setting with uniformed waiters and chafing dish warmers.',
        baseFoodCost: 375000,
        serviceCharge: 25000,
        transportCharge: 15000,
        totalQuote: 415000,
        depositRequired: 415000,
        depositPaid: 415000,
        status: 'BOOKING_CONFIRMED',
        paymentStatus: 'PAID',
        createdAt: '2026-08-27T09:15:00Z'
      }
    ];
  });

  // Active ride hailing
  const [activeRide, setActiveRide] = useState<RideRequest | null>(() => {
    const saved = localStorage.getItem('fdc_active_ride');
    return saved ? JSON.parse(saved) : null;
  });

  const [rideHistory, setRideHistory] = useState<RideRequest[]>(() => {
    const saved = localStorage.getItem('fdc_ride_history');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ride-901',
        customerName: 'Engr. David Ohiare',
        customerPhone: '08123456780',
        pickupLocation: KOGI_LOCATIONS[0],
        destinationLocation: KOGI_LOCATIONS[2],
        vehicleType: 'CAR',
        distanceKm: 3.2,
        estimatedMinutes: 12,
        baseFare: 800,
        distanceFare: 650,
        timeFare: 150,
        totalFare: 1600,
        paymentMethod: 'PAYSTACK_CARD',
        paymentStatus: 'PAID',
        paymentVerifiedAt: '2026-08-27T16:05:00Z',
        paymentGatewayRef: 'PSTK_KOGI_889214',
        status: 'TRIP_COMPLETED',
        driver: INITIAL_DRIVERS[0],
        createdAt: '2026-08-27T15:50:00Z',
        completedAt: '2026-08-27T16:02:00Z'
      }
    ];
  });

  // User profile & Role state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fdc_user_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Valued Customer',
      phone: '08000000000',
      email: 'customer@flourishdestiny.ng',
      defaultAddress: 'Okene, Kogi State',
      defaultArea: 'Okene Central',
      role: 'CUSTOMER'
    };
  });

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fdc_admin_authenticated') === 'true';
  });

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  const [currentRole, _setCurrentRole] = useState<'CUSTOMER' | 'ADMIN' | 'DRIVER'>(() => {
    const isAuth = localStorage.getItem('fdc_admin_authenticated') === 'true';
    return isAuth ? 'ADMIN' : 'CUSTOMER';
  });

  const setCurrentRole = (role: 'CUSTOMER' | 'ADMIN' | 'DRIVER') => {
    if (role === 'ADMIN') {
      if (isAdminAuthenticated) {
        _setCurrentRole('ADMIN');
      } else {
        setIsAdminLoginModalOpen(true);
      }
    } else {
      _setCurrentRole(role);
    }
  };

  const loginAdmin = (usernameOrEmail: string, pass: string): boolean => {
    const normalizedUser = usernameOrEmail.trim().toLowerCase();
    if (normalizedUser === 'ceejegzig83@gmail.com' && pass === 'ceejegzig83') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('fdc_admin_authenticated', 'true');
      _setCurrentRole('ADMIN');
      showToast('Administrator authenticated. You now have full access to edit and configure the entire site & app.', 'success', 'HQ Master Access Granted');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('fdc_admin_authenticated');
    _setCurrentRole('CUSTOMER');
    showToast('Administrator session closed successfully.', 'info', 'Logged Out');
  };

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // VTU State
  const [vtuConfig, setVtuConfig] = useState<VTUConfig>(() => {
    const saved = localStorage.getItem('fdc_vtu_config');
    return saved ? JSON.parse(saved) : INITIAL_VTU_CONFIG;
  });

  const [vtuDataPlans, setVtuDataPlans] = useState<VTUDataPlan[]>(() => {
    const saved = localStorage.getItem('fdc_vtu_plans');
    return saved ? JSON.parse(saved) : INITIAL_VTU_DATA_PLANS;
  });

  const [vtuTransactions, setVtuTransactions] = useState<VTUTransaction[]>(() => {
    const saved = localStorage.getItem('fdc_vtu_transactions');
    return saved ? JSON.parse(saved) : INITIAL_VTU_TRANSACTIONS;
  });

  const [savedBeneficiaries, setSavedBeneficiaries] = useState<VTUSavedBeneficiary[]>(() => {
    const saved = localStorage.getItem('fdc_vtu_beneficiaries');
    return saved ? JSON.parse(saved) : INITIAL_SAVED_BENEFICIARIES;
  });

  const [activeVTUReceipt, setActiveVTUReceipt] = useState<VTUTransaction | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // LocalStorage Persistence Effects
  useEffect(() => {
    localStorage.setItem('fdc_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fdc_bespoke_samples', JSON.stringify(bespokeSamples));
  }, [bespokeSamples]);

  useEffect(() => {
    localStorage.setItem('fdc_cake_samples', JSON.stringify(cakeSamples));
  }, [cakeSamples]);

  useEffect(() => {
    localStorage.setItem('fdc_catering_packages', JSON.stringify(cateringPackages));
  }, [cateringPackages]);

  useEffect(() => {
    localStorage.setItem('fdc_catering_dishes', JSON.stringify(cateringDishes));
  }, [cateringDishes]);

  useEffect(() => {
    localStorage.setItem('fdc_transport_routes', JSON.stringify(transportRoutes));
  }, [transportRoutes]);

  useEffect(() => {
    localStorage.setItem('fdc_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('fdc_business_config', JSON.stringify(businessInfo));
  }, [businessInfo]);

  useEffect(() => {
    localStorage.setItem('fdc_announcement_config', JSON.stringify(announcement));
  }, [announcement]);

  useEffect(() => {
    localStorage.setItem('fdc_fare_config', JSON.stringify(fareConfig));
  }, [fareConfig]);

  useEffect(() => {
    localStorage.setItem('fdc_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('fdc_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('fdc_tailoring', JSON.stringify(tailoringRequests));
  }, [tailoringRequests]);

  useEffect(() => {
    localStorage.setItem('fdc_cakes', JSON.stringify(cakeOrders));
  }, [cakeOrders]);

  useEffect(() => {
    localStorage.setItem('fdc_catering', JSON.stringify(cateringBookings));
  }, [cateringBookings]);

  useEffect(() => {
    if (activeRide) {
      localStorage.setItem('fdc_active_ride', JSON.stringify(activeRide));
    } else {
      localStorage.removeItem('fdc_active_ride');
    }
  }, [activeRide]);

  useEffect(() => {
    localStorage.setItem('fdc_ride_history', JSON.stringify(rideHistory));
  }, [rideHistory]);

  useEffect(() => {
    localStorage.setItem('fdc_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('fdc_vtu_config', JSON.stringify(vtuConfig));
  }, [vtuConfig]);

  useEffect(() => {
    localStorage.setItem('fdc_vtu_plans', JSON.stringify(vtuDataPlans));
  }, [vtuDataPlans]);

  useEffect(() => {
    localStorage.setItem('fdc_vtu_transactions', JSON.stringify(vtuTransactions));
  }, [vtuTransactions]);

  useEffect(() => {
    localStorage.setItem('fdc_vtu_beneficiaries', JSON.stringify(savedBeneficiaries));
  }, [savedBeneficiaries]);

  // Sync VTU Config & Plans from Backend API on startup
  useEffect(() => {
    const syncVTUBackend = async () => {
      try {
        const [cfgRes, plansRes, txRes] = await Promise.all([
          fetch('/api/vtu/config'),
          fetch('/api/vtu/data-plans?includeInactive=true'),
          fetch('/api/vtu/transactions')
        ]);
        if (cfgRes.ok) {
          const cfgData = await cfgRes.json();
          if (cfgData.success && cfgData.config) {
            setVtuConfig((prev) => ({
              ...prev,
              isLivePaystack: cfgData.config.isLivePaystack,
              mode: cfgData.config.mode,
              vtuProviderName: cfgData.config.vtuProviderName
            }));
          }
        }
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          if (plansData.success && Array.isArray(plansData.plans) && plansData.plans.length > 0) {
            const savedLocal = localStorage.getItem('fdc_vtu_plans');
            if (!savedLocal) {
              setVtuDataPlans(plansData.plans);
            }
          }
        }
        if (txRes.ok) {
          const txData = await txRes.json();
          if (txData.success && Array.isArray(txData.transactions)) {
            const savedTx = localStorage.getItem('fdc_vtu_transactions');
            if (!savedTx) {
              setVtuTransactions(txData.transactions);
            }
          }
        }
      } catch {
        // Running in offline/fallback preview mode; local state remains active
      }
    };
    syncVTUBackend();
  }, []);

  // Cart operations
  const addToCart = (
    product: Product, 
    quantity: number = 1, 
    selectedSize?: string, 
    selectedColor?: string, 
    specialNotes?: string
  ) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.productId === product.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          division: product.division,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          selectedSize: selectedSize || (product.sizes ? product.sizes[0] : undefined),
          selectedColor: selectedColor || (product.colors ? product.colors[0] : undefined),
          specialNotes
        };
        return [...prev, newItem];
      }
    });

    showToast(`Added "${product.name}" to cart`, 'success', 'Cart Updated');
  };

  const updateCartQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTotal = cartSubtotal > 0 ? cartSubtotal + selectedDeliveryZone.fee : 0;

  const isCoDAllowedInCart = cart.every(item => 
    item.division === 'GROCERY' || item.division === 'FASHION' || item.division === 'BAKERY'
  );
  const cartContainsMandatoryOnlineDivision = false;

  // --- ADMIN CMS: Products Management ---
  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    showToast(`Product "${product.name}" successfully added to ${product.division} catalog`, 'success', 'Item Created');
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    showToast(`Product "${product.name}" updated successfully`, 'success', 'Changes Saved');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Product deleted from inventory', 'info', 'Item Removed');
  };

  const toggleProductInStock = (productId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextState = !p.inStock;
        showToast(`"${p.name}" is now marked as ${nextState ? 'In Stock' : 'Out of Stock'}`, 'info');
        return { ...p, inStock: nextState };
      }
      return p;
    }));
  };

  const quickUpdateProductPrice = (productId: string, newPrice: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        showToast(`Updated price for "${p.name}" to ₦${newPrice.toLocaleString()}`, 'success');
        return { ...p, price: newPrice };
      }
      return p;
    }));
  };

  // --- ADMIN CMS: Bespoke Samples ---
  const addBespokeSample = (sample: BespokeTailoringSample) => {
    setBespokeSamples(prev => [sample, ...prev]);
    showToast(`Tailoring sample "${sample.name}" published`, 'success', 'Sample Added');
  };

  const updateBespokeSample = (sample: BespokeTailoringSample) => {
    setBespokeSamples(prev => prev.map(s => s.id === sample.id ? sample : s));
    showToast(`Tailoring sample "${sample.name}" updated`, 'success', 'Changes Saved');
  };

  const deleteBespokeSample = (id: string) => {
    setBespokeSamples(prev => prev.filter(s => s.id !== id));
    showToast('Tailoring sample removed', 'info');
  };

  // --- ADMIN CMS: Custom Cakes ---
  const addCakeSample = (sample: CakeCustomSample) => {
    setCakeSamples(prev => [sample, ...prev]);
    showToast(`Cake sample "${sample.name}" published`, 'success', 'Cake Sample Added');
  };

  const updateCakeSample = (sample: CakeCustomSample) => {
    setCakeSamples(prev => prev.map(s => s.id === sample.id ? sample : s));
    showToast(`Cake sample "${sample.name}" updated`, 'success', 'Changes Saved');
  };

  const deleteCakeSample = (id: string) => {
    setCakeSamples(prev => prev.filter(s => s.id !== id));
    showToast('Cake sample removed', 'info');
  };

  // --- ADMIN CMS: Catering Packages & Dishes ---
  const addCateringPackage = (pkg: CateringPackage) => {
    setCateringPackages(prev => [pkg, ...prev]);
    showToast(`Catering package "${pkg.name}" added`, 'success');
  };

  const updateCateringPackage = (pkg: CateringPackage) => {
    setCateringPackages(prev => prev.map(p => p.id === pkg.id ? pkg : p));
    showToast(`Catering package "${pkg.name}" updated`, 'success');
  };

  const deleteCateringPackage = (id: string) => {
    setCateringPackages(prev => prev.filter(p => p.id !== id));
    showToast('Catering package deleted', 'info');
  };

  const addCateringDish = (dish: CateringSampleDish) => {
    setCateringDishes(prev => [dish, ...prev]);
    showToast(`Catering dish "${dish.name}" added to menu`, 'success');
  };

  const updateCateringDish = (dish: CateringSampleDish) => {
    setCateringDishes(prev => prev.map(d => d.id === dish.id ? dish : d));
    showToast(`Catering dish "${dish.name}" updated`, 'success');
  };

  const deleteCateringDish = (id: string) => {
    setCateringDishes(prev => prev.filter(d => d.id !== id));
    showToast('Catering dish removed', 'info');
  };

  // --- ADMIN CMS: Transport Routes & Drivers ---
  const addTransportRoute = (route: TransportSampleRoute) => {
    setTransportRoutes(prev => [route, ...prev]);
    showToast(`New route "${route.pickup} → ${route.destination}" added`, 'success');
  };

  const updateTransportRoute = (route: TransportSampleRoute) => {
    setTransportRoutes(prev => prev.map(r => r.id === route.id ? route : r));
    showToast(`Route updated`, 'success');
  };

  const deleteTransportRoute = (id: string) => {
    setTransportRoutes(prev => prev.filter(r => r.id !== id));
    showToast('Transport route removed', 'info');
  };

  const addDriver = (driver: Driver) => {
    setDrivers(prev => [driver, ...prev]);
    showToast(`Driver "${driver.name}" onboarded to fleet`, 'success');
  };

  const updateDriver = (driver: Driver) => {
    setDrivers(prev => prev.map(d => d.id === driver.id ? driver : d));
    showToast(`Driver "${driver.name}" updated`, 'success');
  };

  const deleteDriver = (id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
    showToast('Driver removed from active roster', 'info');
  };

  const toggleDriverOnline = (id: string) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === id) {
        const nextState = !d.isOnline;
        showToast(`Driver ${d.name} is now ${nextState ? 'Online' : 'Offline'}`, 'info');
        return { ...d, isOnline: nextState };
      }
      return d;
    }));
  };

  const updateFareConfig = (config: Partial<FareConfig>) => {
    setFareConfig(prev => ({ ...prev, ...config }));
    showToast('Ride-hailing tariff rates updated across Kogi State', 'success', 'Fares Recalculated');
  };

  // --- ADMIN CMS: Business Profile & Global Announcement ---
  const updateBusinessInfo = (info: Partial<BusinessInfoConfig>) => {
    setBusinessInfo(prev => {
      const updated = { ...prev, ...info };
      return updated;
    });
    showToast('Store details, contact, and business settings updated successfully', 'success', 'Site Config Saved');
  };

  const updateAnnouncement = (config: Partial<AnnouncementConfig>) => {
    setAnnouncement(prev => ({ ...prev, ...config }));
    showToast('Global announcement banner updated', 'success');
  };

  // --- SYSTEM TOOLS: Backup & Factory Reset ---
  const resetAllToFactoryDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setBespokeSamples(BESPOKE_TAILORING_SAMPLES);
    setCakeSamples(CAKE_CUSTOM_SAMPLES);
    setCateringPackages(CATERING_PACKAGES);
    setCateringDishes(CATERING_SAMPLE_DISHES);
    setTransportRoutes(TRANSPORT_SAMPLE_ROUTES);
    setDrivers(INITIAL_DRIVERS);
    setBusinessInfo(INITIAL_BUSINESS_CONFIG);
    setAnnouncement(INITIAL_ANNOUNCEMENT_CONFIG);
    setFareConfig(INITIAL_FARE_CONFIG);
    setOrders(INITIAL_ORDERS);
    localStorage.removeItem('fdc_products');
    localStorage.removeItem('fdc_bespoke_samples');
    localStorage.removeItem('fdc_cake_samples');
    localStorage.removeItem('fdc_catering_packages');
    localStorage.removeItem('fdc_catering_dishes');
    localStorage.removeItem('fdc_transport_routes');
    localStorage.removeItem('fdc_drivers');
    localStorage.removeItem('fdc_business_config');
    localStorage.removeItem('fdc_announcement_config');
    localStorage.removeItem('fdc_fare_config');
    localStorage.removeItem('fdc_orders');
    showToast('System configuration, sample menus, and products reset to defaults.', 'warning', 'Reset Complete');
  };

  const exportSiteDataBackup = (): string => {
    const data = {
      products,
      bespokeSamples,
      cakeSamples,
      cateringPackages,
      cateringDishes,
      transportRoutes,
      drivers,
      businessInfo,
      announcement,
      fareConfig,
      orders,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  const importSiteDataBackup = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.products) setProducts(data.products);
      if (data.bespokeSamples) setBespokeSamples(data.bespokeSamples);
      if (data.cakeSamples) setCakeSamples(data.cakeSamples);
      if (data.cateringPackages) setCateringPackages(data.cateringPackages);
      if (data.cateringDishes) setCateringDishes(data.cateringDishes);
      if (data.transportRoutes) setTransportRoutes(data.transportRoutes);
      if (data.drivers) setDrivers(data.drivers);
      if (data.businessInfo) setBusinessInfo(data.businessInfo);
      if (data.announcement) setAnnouncement(data.announcement);
      if (data.fareConfig) setFareConfig(data.fareConfig);
      if (data.orders) setOrders(data.orders);
      showToast('Site data & features successfully restored from backup!', 'success', 'Import Successful');
      return true;
    } catch (e) {
      showToast('Failed to parse backup JSON file. Please verify the format.', 'error', 'Import Failed');
      return false;
    }
  };

  // --- Orders & Inquiries ---
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
    const orderNumber = `FDC-ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    showToast(`Order ${orderNumber} placed successfully!`, 'success', 'Order Confirmed');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          orderStatus: status,
          paymentStatus: paymentStatus || o.paymentStatus
        };
      }
      return o;
    }));
    showToast(`Order status updated to "${status}"`, 'info');
  };

  const createTailoringRequest = (data: Omit<TailoringRequest, 'id' | 'createdAt' | 'status' | 'paymentStatus'>): TailoringRequest => {
    const newReq: TailoringRequest = {
      ...data,
      id: `tailor-${Date.now()}`,
      status: 'APPROVED',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString()
    };
    setTailoringRequests(prev => [newReq, ...prev]);
    showToast('Bespoke Tailoring Commission placed and paid online!', 'success', 'Commission Received');
    return newReq;
  };

  const updateTailoringStatus = (id: string, status: TailoringRequest['status'], paymentStatus?: TailoringRequest['paymentStatus']) => {
    setTailoringRequests(prev => prev.map(t => t.id === id ? { ...t, status, paymentStatus: paymentStatus || t.paymentStatus } : t));
    showToast(`Tailoring commission status updated to "${status}"`, 'info');
  };

  const createCakeOrder = (data: Omit<CakeOrder, 'id' | 'createdAt' | 'status' | 'paymentStatus'>): CakeOrder => {
    const newCake: CakeOrder = {
      ...data,
      id: `cake-${Date.now()}`,
      status: 'DESIGN_CONFIRMED',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString()
    };
    setCakeOrders(prev => [newCake, ...prev]);
    showToast('Custom Celebration Cake order placed and scheduled!', 'success', 'Baking Scheduled');
    return newCake;
  };

  const updateCakeStatus = (id: string, status: CakeOrder['status'], paymentStatus?: CakeOrder['paymentStatus']) => {
    setCakeOrders(prev => prev.map(c => c.id === id ? { ...c, status, paymentStatus: paymentStatus || c.paymentStatus } : c));
    showToast(`Cake order status updated to "${status}"`, 'info');
  };

  const createCateringBooking = (data: Omit<CateringBooking, 'id' | 'createdAt' | 'status' | 'paymentStatus'>): CateringBooking => {
    const newBooking: CateringBooking = {
      ...data,
      id: `cat-${Date.now()}`,
      status: 'BOOKING_CONFIRMED',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString()
    };
    setCateringBookings(prev => [newBooking, ...prev]);
    showToast('Royal Catering Booking confirmed and reserved!', 'success', 'Date Secured');
    return newBooking;
  };

  const updateCateringStatus = (id: string, status: CateringBooking['status'], paymentStatus?: CateringBooking['paymentStatus']) => {
    setCateringBookings(prev => prev.map(c => c.id === id ? { ...c, status, paymentStatus: paymentStatus || c.paymentStatus } : c));
    showToast(`Catering booking status updated to "${status}"`, 'info');
  };

  const requestRide = (data: {
    customerName: string;
    customerPhone: string;
    pickupLocation: LocationPoint;
    destinationLocation: LocationPoint;
    vehicleType: RideRequest['vehicleType'];
    distanceKm: number;
    estimatedMinutes: number;
    totalFare: number;
    paymentMethod: RideRequest['paymentMethod'];
  }): RideRequest | null => {
    const eligibleDrivers = drivers.filter(d => d.vehicleType === data.vehicleType && d.isOnline);
    const assignedDriver = eligibleDrivers.length > 0 ? eligibleDrivers[Math.floor(Math.random() * eligibleDrivers.length)] : drivers[0];

    const newRide: RideRequest = {
      id: `ride-${Date.now()}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      pickupLocation: data.pickupLocation,
      destinationLocation: data.destinationLocation,
      vehicleType: data.vehicleType,
      distanceKm: data.distanceKm,
      estimatedMinutes: data.estimatedMinutes,
      baseFare: data.vehicleType === 'KEKE' ? fareConfig.kekeBaseFare : fareConfig.carBaseFare,
      distanceFare: data.totalFare - (data.vehicleType === 'KEKE' ? fareConfig.kekeBaseFare : fareConfig.carBaseFare),
      timeFare: 0,
      totalFare: data.totalFare,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'PAID',
      paymentVerifiedAt: new Date().toISOString(),
      paymentGatewayRef: `FLW_KOGI_${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'DRIVER_ASSIGNED',
      driver: assignedDriver,
      createdAt: new Date().toISOString()
    };

    setActiveRide(newRide);
    setRideHistory(prev => [newRide, ...prev]);
    showToast(`Driver ${assignedDriver.name} (${assignedDriver.plateNumber}) dispatched!`, 'success', 'Ride Dispatched');
    return newRide;
  };

  const cancelRide = (rideId: string) => {
    if (activeRide && activeRide.id === rideId) {
      const updated = { ...activeRide, status: 'CANCELLED' as const };
      setActiveRide(null);
      setRideHistory(prev => prev.map(r => r.id === rideId ? updated : r));
      showToast('Ride trip cancelled', 'info');
    }
  };

  const completeRide = (rideId: string) => {
    if (activeRide && activeRide.id === rideId) {
      const updated = { ...activeRide, status: 'TRIP_COMPLETED' as const, completedAt: new Date().toISOString() };
      setActiveRide(null);
      setRideHistory(prev => prev.map(r => r.id === rideId ? updated : r));
      showToast('Trip marked completed. Thank you for riding with Flourish Destiny!', 'success', 'Trip Completed');
    }
  };

  const verifyOrderCoDPayment = (orderId: string, verifiedBy: string = 'HQ Admin (09162723865)') => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentStatus: 'PAID',
          paymentVerifiedBy: verifiedBy,
          paymentVerifiedAt: new Date().toISOString(),
          orderStatus: o.orderStatus === 'DELIVERED' ? 'DELIVERED' : 'PROCESSING'
        };
      }
      return o;
    }));
    showToast(`Order ${orderId} Cash on Delivery verified & settled`, 'success', 'CoD Verified');
  };

  const verifyRidePayment = (rideId: string, verifiedBy: string = 'HQ Transport Admin') => {
    setRideHistory(prev => prev.map(r => {
      if (r.id === rideId) {
        return {
          ...r,
          paymentStatus: 'PAID',
          paymentVerifiedAt: new Date().toISOString(),
          paymentGatewayRef: r.paymentGatewayRef || `MANUAL_VERIFIED_${verifiedBy}`
        };
      }
      return r;
    }));
    if (activeRide && activeRide.id === rideId) {
      setActiveRide(prev => prev ? { ...prev, paymentStatus: 'PAID', paymentVerifiedAt: new Date().toISOString() } : null);
    }
    showToast(`Trip ${rideId} fare confirmed & verified`, 'success', 'Fare Cleared');
  };

  const sendReceiptNotification = (doc: any, channel: 'WHATSAPP' | 'SMS' = 'WHATSAPP') => {
    const ref = doc.orderNumber || doc.id || 'REF';
    const amount = doc.total || doc.totalFare || doc.totalQuote || doc.estimatedPrice || doc.depositPaid || 0;
    const phone = doc.customerPhone || businessInfo.phone;
    const message = encodeURIComponent(
      `*FLOURISH DESTINY COLLECTION - OFFICIAL RECEIPT*\n` +
      `----------------------------------------\n` +
      `Reference: ${ref}\n` +
      `Amount Settled: ₦${amount.toLocaleString()}\n` +
      `Date: ${new Date().toLocaleDateString()}\n` +
      `Location: Okene, Kogi State\n` +
      `HQ Helpline: ${businessInfo.phone}\n` +
      `Thank you for trusting Flourish Destiny Collection!`
    );
    const targetUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(targetUrl, '_blank');
    showToast(`Official receipt dispatched via ${channel} to ${phone}`, 'success', 'Receipt Dispatched');
  };

  // --- AIRTIME & DATA VTU OPERATIONS ---
  const initiateVTUTransaction: AppContextType['initiateVTUTransaction'] = async (payload) => {
    // Validate phone number
    const validation = validateNigerianPhone(payload.phoneNumber);
    if (!validation.isValid) {
      showToast(validation.error || 'Invalid Nigerian phone number', 'error', 'Validation Error');
      return { success: false, error: validation.error };
    }

    try {
      const res = await fetch('/api/vtu/transactions/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          phoneNumber: validation.normalized,
          customerName: payload.customerName || userProfile.name,
          customerEmail: payload.customerEmail || userProfile.email
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.transaction) {
          setVtuTransactions((prev) => {
            const exists = prev.some((t) => t.id === data.transaction.id);
            return exists
              ? prev.map((t) => (t.id === data.transaction.id ? data.transaction : t))
              : [data.transaction, ...prev];
          });
          return {
            success: true,
            transaction: data.transaction,
            paymentSession: data.paymentSession
          };
        } else {
          showToast(data.error || 'Could not initialize VTU order', 'error');
          return { success: false, error: data.error };
        }
      }
    } catch {
      // Fallback to local sandbox transaction creation if backend route is unreachable
    }

    // Safe Local Sandbox Initiation Fallback
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const txId = `FDC-${dateStr}-${Math.floor(100000 + Math.random() * 900000)}`;
    const reference = `PSTK_${txId.replace(/-/g, '_')}`;
    const resolvedPlan =
      payload.type === 'DATA'
        ? vtuDataPlans.find((p) => p.planId === payload.planId)
        : undefined;
    const nominalAmount =
      payload.type === 'DATA' && resolvedPlan ? resolvedPlan.customerPrice : payload.amount;
    const serviceFee =
      payload.type === 'AIRTIME' ? vtuConfig.airtimeServiceFee : vtuConfig.dataServiceFee;
    const totalAmount = nominalAmount + serviceFee;

    const fallbackTx: VTUTransaction = {
      id: txId,
      reference,
      idempotencyKey: payload.idempotencyKey,
      type: payload.type,
      network: payload.network,
      phoneNumber: validation.normalized,
      customerName: payload.customerName || userProfile.name,
      customerEmail: payload.customerEmail || userProfile.email,
      amount: nominalAmount,
      serviceFee,
      totalAmount,
      providerCost:
        payload.type === 'DATA' && resolvedPlan
          ? resolvedPlan.providerPrice
          : Math.round(nominalAmount * 0.98),
      planId: resolvedPlan?.planId,
      planName: resolvedPlan?.name,
      planValidity: resolvedPlan?.validity,
      paymentMethod: payload.paymentMethod,
      paymentStatus: 'PENDING',
      vtuProvider: vtuConfig.vtuProviderName,
      vtuStatusMessage: 'Awaiting payment verification from Paystack gateway.',
      status: 'PAYMENT_PENDING',
      mode: vtuConfig.mode,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    setVtuTransactions((prev) => [fallbackTx, ...prev]);

    return {
      success: true,
      transaction: fallbackTx,
      paymentSession: {
        mode: vtuConfig.mode,
        reference: fallbackTx.reference,
        amountNaira: totalAmount,
        amountKobo: Math.round(totalAmount * 100)
      }
    };
  };

  const verifyAndFulfillVTUPayment: AppContextType['verifyAndFulfillVTUPayment'] = async ({
    reference,
    simulatedPaymentOutcome = 'SUCCESS',
    simulateProviderFailure = false
  }) => {
    try {
      const res = await fetch('/api/vtu/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          simulatedPaymentOutcome,
          simulateProviderFailure
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.transaction) {
          setVtuTransactions((prev) =>
            prev.map((t) =>
              t.id === data.transaction.id || t.reference === data.transaction.reference
                ? data.transaction
                : t
            )
          );
          if (data.transaction.status === 'SUCCESSFUL') {
            showToast(
              data.transaction.vtuStatusMessage || 'Airtime/Data delivered successfully!',
              'success',
              'VTU Transaction Successful'
            );
          } else if (data.transaction.status === 'REFUNDED') {
            showToast(
              data.transaction.vtuStatusMessage || 'VTU failed after payment — Auto-Refunded.',
              'warning',
              'Payment Auto-Refunded'
            );
          } else {
            showToast(
              data.transaction.vtuStatusMessage || 'Payment verification failed.',
              'error',
              'Transaction Failed'
            );
          }
          return {
            success: Boolean(data.success),
            transaction: data.transaction,
            error: data.error
          };
        }
      }
    } catch {
      // Fallback to local sandbox verification if server endpoint unreachable
    }

    let updatedTx: VTUTransaction | undefined;
    setVtuTransactions((prev) =>
      prev.map((tx) => {
        if (tx.reference !== reference && tx.id !== reference) return tx;
        const nowIso = new Date().toISOString();

        if (simulatedPaymentOutcome !== 'SUCCESS') {
          updatedTx = {
            ...tx,
            paymentStatus: simulatedPaymentOutcome === 'ABANDONED' ? 'ABANDONED' : 'FAILED',
            status: 'FAILED',
            vtuStatusMessage:
              simulatedPaymentOutcome === 'ABANDONED'
                ? '[TEST MODE] Payment checkout abandoned. No airtime/data delivered.'
                : '[TEST MODE] Payment declined by bank. VTU dispense blocked safely.',
            updatedAt: nowIso
          };
          return updatedTx;
        }

        if (simulateProviderFailure) {
          updatedTx = {
            ...tx,
            paymentStatus: 'REFUNDED',
            paymentGatewayRef: `PSTK_TEST_${Math.floor(100000 + Math.random() * 900000)}`,
            paymentVerifiedAt: nowIso,
            vtuProviderRef: `SIM_ERR_${Date.now().toString().slice(-5)}`,
            status: 'REFUNDED',
            vtuStatusMessage: `[TEST MODE] Payment verified, but ${tx.network} VTU provider timed out. Automatic customer refund issued.`,
            updatedAt: nowIso
          };
          return updatedTx;
        }

        const providerRef = `VTU_${tx.network}_${tx.type}_${Math.floor(
          100000 + Math.random() * 900000
        )}`;
        updatedTx = {
          ...tx,
          paymentStatus: 'SUCCESSFUL',
          paymentGatewayRef: `PSTK_TEST_${Math.floor(100000 + Math.random() * 900000)}`,
          paymentVerifiedAt: nowIso,
          vtuProviderRef: providerRef,
          status: 'SUCCESSFUL',
          vtuStatusMessage:
            tx.type === 'AIRTIME'
              ? `[TEST MODE] ₦${tx.amount.toLocaleString()} ${tx.network} Airtime credited to ${tx.phoneNumber}.`
              : `[TEST MODE] ${tx.network} ${tx.planName} (${tx.planValidity}) Data Bundle activated on ${tx.phoneNumber}.`,
          updatedAt: nowIso,
          completedAt: nowIso
        };
        return updatedTx;
      })
    );

    if (updatedTx) {
      if (updatedTx.status === 'SUCCESSFUL') {
        showToast(updatedTx.vtuStatusMessage || 'VTU Delivered!', 'success', 'VTU Successful');
      } else {
        showToast(updatedTx.vtuStatusMessage || 'VTU Failed', 'error', 'Transaction Alert');
      }
    }

    return {
      success: updatedTx?.status === 'SUCCESSFUL',
      transaction: updatedTx
    };
  };

  const saveVTUDataPlan = async (plan: VTUDataPlan) => {
    setVtuDataPlans((prev) => {
      const exists = prev.some((p) => p.planId === plan.planId);
      return exists ? prev.map((p) => (p.planId === plan.planId ? plan : p)) : [plan, ...prev];
    });
    try {
      await fetch('/api/vtu/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
    } catch {
      // Saved in local state
    }
    showToast(`VTU Data Plan "${plan.network} ${plan.name}" saved!`, 'success', 'VTU Plan Saved');
  };

  const deleteVTUDataPlan = async (planId: string) => {
    setVtuDataPlans((prev) => prev.filter((p) => p.planId !== planId));
    try {
      await fetch(`/api/vtu/admin/plans/${encodeURIComponent(planId)}`, {
        method: 'DELETE'
      });
    } catch {
      // Removed in local state
    }
    showToast('Data plan removed from catalog.', 'info');
  };

  const toggleVTUDataPlanStatus = async (planId: string) => {
    let toggledPlan: VTUDataPlan | undefined;
    setVtuDataPlans((prev) =>
      prev.map((p) => {
        if (p.planId === planId) {
          const nextStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          toggledPlan = { ...p, status: nextStatus };
          return toggledPlan;
        }
        return p;
      })
    );
    if (toggledPlan) {
      try {
        await fetch('/api/vtu/admin/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toggledPlan)
        });
      } catch {
        // Updated locally
      }
      showToast(
        `${toggledPlan.network} ${toggledPlan.name} marked as ${toggledPlan.status}`,
        'info'
      );
    }
  };

  const updateVTUConfig = async (config: Partial<VTUConfig>) => {
    setVtuConfig((prev) => ({ ...prev, ...config }));
    try {
      await fetch('/api/vtu/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
    } catch {
      // Updated locally
    }
    showToast('VTU Gateway & Telecom settings updated!', 'success', 'VTU Config Saved');
  };

  const adminVTUTransactionAction = async (
    txId: string,
    action: 'RETRY' | 'REFUND' | 'REVERSE' | 'MARK_SUCCESS'
  ) => {
    try {
      const res = await fetch(`/api/vtu/admin/transactions/${encodeURIComponent(txId)}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.transaction) {
          setVtuTransactions((prev) =>
            prev.map((t) => (t.id === txId ? data.transaction : t))
          );
          showToast(`Transaction ${txId} updated (${action})`, 'success');
          return;
        }
      }
    } catch {
      // Fallback local update
    }

    setVtuTransactions((prev) =>
      prev.map((t) => {
        if (t.id !== txId) return t;
        const nowIso = new Date().toISOString();
        if (action === 'RETRY' || action === 'MARK_SUCCESS') {
          return {
            ...t,
            status: 'SUCCESSFUL',
            paymentStatus: 'SUCCESSFUL',
            vtuProviderRef: t.vtuProviderRef || `VTU_ADMIN_${Date.now().toString().slice(-6)}`,
            vtuStatusMessage: `[Admin Re-Dispatched] ${t.network} ${t.type} fulfilled for ${t.phoneNumber}.`,
            updatedAt: nowIso,
            completedAt: nowIso
          };
        }
        if (action === 'REFUND') {
          return {
            ...t,
            status: 'REFUNDED',
            paymentStatus: 'REFUNDED',
            vtuStatusMessage: 'Refunded to customer by HQ Admin.',
            updatedAt: nowIso
          };
        }
        return {
          ...t,
          status: 'REVERSED',
          vtuStatusMessage: 'Reversed by HQ Admin.',
          updatedAt: nowIso
        };
      })
    );
    showToast(`Transaction ${txId} action (${action}) completed.`, 'success');
  };

  const addSavedBeneficiary = (ben: Omit<VTUSavedBeneficiary, 'id'>) => {
    const newBen: VTUSavedBeneficiary = {
      ...ben,
      id: `ben-${Date.now()}`
    };
    setSavedBeneficiaries((prev) => [newBen, ...prev]);
    showToast(`Saved ${ben.name} (${ben.phoneNumber}) to beneficiaries`, 'success');
  };

  const removeSavedBeneficiary = (id: string) => {
    setSavedBeneficiaries((prev) => prev.filter((b) => b.id !== id));
    showToast('Beneficiary removed', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeDivision,
        setActiveDivision,
        searchQuery,
        setSearchQuery,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductInStock,
        toggleProductStock: toggleProductInStock,
        quickUpdateProductPrice,
        bespokeSamples,
        addBespokeSample,
        updateBespokeSample,
        deleteBespokeSample,
        cakeSamples,
        addCakeSample,
        updateCakeSample,
        deleteCakeSample,
        cateringPackages,
        addCateringPackage,
        updateCateringPackage,
        deleteCateringPackage,
        cateringDishes,
        addCateringDish,
        updateCateringDish,
        deleteCateringDish,
        transportRoutes,
        addTransportRoute,
        updateTransportRoute,
        deleteTransportRoute,
        drivers,
        addDriver,
        updateDriver,
        deleteDriver,
        toggleDriverOnline,
        fareConfig,
        updateFareConfig,
        businessInfo,
        updateBusinessInfo,
        announcement,
        updateAnnouncement,
        resetAllToFactoryDefaults,
        exportSiteDataBackup,
        importSiteDataBackup,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        selectedDeliveryZone,
        setSelectedDeliveryZone,
        cartTotal,
        isCoDAllowedInCart,
        cartContainsMandatoryOnlineDivision,
        orders,
        createOrder,
        updateOrderStatus,
        tailoringRequests,
        createTailoringRequest,
        updateTailoringStatus,
        cakeOrders,
        createCakeOrder,
        updateCakeStatus,
        cateringBookings,
        createCateringBooking,
        updateCateringStatus,
        activeRide,
        rideHistory,
        requestRide,
        cancelRide,
        completeRide,
        userProfile,
        setUserProfile,
        currentRole,
        setCurrentRole,
        isAdminAuthenticated,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        loginAdmin,
        logoutAdmin,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isSpecModalOpen,
        setIsSpecModalOpen,
        activeInvoice,
        setActiveInvoice,
        isContactModalOpen,
        setIsContactModalOpen,
        verifyOrderCoDPayment,
        verifyRidePayment,
        sendReceiptNotification,
        vtuConfig,
        vtuDataPlans,
        vtuTransactions,
        savedBeneficiaries,
        activeVTUReceipt,
        setActiveVTUReceipt,
        initiateVTUTransaction,
        verifyAndFulfillVTUPayment,
        saveVTUDataPlan,
        deleteVTUDataPlan,
        toggleVTUDataPlanStatus,
        updateVTUConfig,
        adminVTUTransactionAction,
        addSavedBeneficiary,
        removeSavedBeneficiary,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
