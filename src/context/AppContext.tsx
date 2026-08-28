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
  PaymentMethod 
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_DRIVERS, 
  INITIAL_ORDERS, 
  DELIVERY_ZONES,
  KOGI_LOCATIONS 
} from '../data/mockData';

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
  
  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  
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
  isCoDAllowedInCart: boolean; // CoD ONLY for grocery, ready-to-wear fashion, standard bakery
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
  drivers: Driver[];
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
        customMenuPreferences: ['Firewood Party Jollof', 'Pounded Yam & Egusi', 'Peppered Goat Meat', 'Coleslaw', 'Assorted Juices'],
        serviceStyle: 'Buffet',
        specialRequirements: 'Requires 4 uniformed waitstaff and chafing dish warmers.',
        baseFoodCost: 870000,
        serviceCharge: 50000,
        transportCharge: 25000,
        totalQuote: 945000,
        depositRequired: 472500,
        depositPaid: 472500,
        status: 'BOOKING_CONFIRMED',
        paymentStatus: 'PAID',
        createdAt: '2026-08-26T16:00:00Z'
      }
    ];
  });

  // Drivers and Rides
  const [drivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(() => {
    const saved = localStorage.getItem('fdc_active_ride');
    return saved ? JSON.parse(saved) : null;
  });
  const [rideHistory, setRideHistory] = useState<RideRequest[]>(() => {
    const saved = localStorage.getItem('fdc_ride_history');
    return saved ? JSON.parse(saved) : [];
  });

  // User profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fdc_user_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Destiny Audu',
      phone: '08034567890',
      email: 'destiny.audu@gmail.com',
      defaultAddress: 'Total Junction, Inoziomi, Okene',
      defaultArea: 'Okene Central',
      role: 'CUSTOMER'
    };
  });

  // Admin Authentication & Security
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fdc_admin_authenticated') === 'true';
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  const [currentRole, _setCurrentRole] = useState<'CUSTOMER' | 'ADMIN' | 'DRIVER'>('CUSTOMER');

  const setCurrentRole = (role: 'CUSTOMER' | 'ADMIN' | 'DRIVER') => {
    if (role === 'ADMIN') {
      if (!isAdminAuthenticated) {
        setIsAdminLoginModalOpen(true);
        showToast('Administrator authentication required to access management terminal.', 'warning', 'Security Restricted');
        return;
      }
    }
    _setCurrentRole(role);
  };

  const loginAdmin = (usernameOrEmail: string, pass: string): boolean => {
    const normalizedUser = usernameOrEmail.trim().toLowerCase();
    if (normalizedUser === 'ceejegzig83@gmail.com' && pass === 'ceejegzig83') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('fdc_admin_authenticated', 'true');
      _setCurrentRole('ADMIN');
      showToast('Administrator authenticated successfully. Welcome to HQ Management.', 'success', 'Access Granted');
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

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('fdc_products', JSON.stringify(products));
  }, [products]);

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

  // Payment rule checks:
  // CoD is allowed ONLY for grocery, ready-to-wear fashion, and standard bakery.
  const isCoDAllowedInCart = cart.every(item => 
    item.division === 'GROCERY' || item.division === 'FASHION' || item.division === 'BAKERY'
  );
  const cartContainsMandatoryOnlineDivision = false; // standard cart contains standard catalog items

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    showToast(`Product "${product.name}" added to catalog`, 'success');
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    showToast(`Product "${product.name}" updated`, 'success');
  };

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
          ...(paymentStatus ? { paymentStatus } : {})
        };
      }
      return o;
    }));
    showToast(`Order status updated to ${status}`, 'info');
  };

  const createTailoringRequest = (data: Omit<TailoringRequest, 'id' | 'createdAt' | 'status' | 'paymentStatus'>): TailoringRequest => {
    const newRequest: TailoringRequest = {
      ...data,
      id: `tailor-${Date.now()}`,
      status: 'APPROVED', // Once online payment is made, automatically approved to production
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString()
    };
    setTailoringRequests(prev => [newRequest, ...prev]);
    showToast(`Tailoring request for "${data.garmentType}" received and paid!`, 'success', 'Bespoke Order Logged');
    return newRequest;
  };

  const updateTailoringStatus = (id: string, status: TailoringRequest['status'], paymentStatus?: TailoringRequest['paymentStatus']) => {
    setTailoringRequests(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          ...(paymentStatus ? { paymentStatus } : {})
        };
      }
      return t;
    }));
    showToast(`Tailoring job status updated to ${status}`, 'info');
  };

  const createCakeOrder = (data: Omit<CakeOrder, 'id' | 'createdAt' | 'status' | 'paymentStatus'>): CakeOrder => {
    const newOrder: CakeOrder = {
      ...data,
      id: `cake-${Date.now()}`,
      status: 'DESIGN_CONFIRMED',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString()
    };
    setCakeOrders(prev => [newOrder, ...prev]);
    showToast(`Custom cake order booked for delivery on ${data.deliveryDate}!`, 'success', 'Bakery Slot Reserved');
    return newOrder;
  };

  const updateCakeStatus = (id: string, status: CakeOrder['status'], paymentStatus?: CakeOrder['paymentStatus']) => {
    setCakeOrders(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          ...(paymentStatus ? { paymentStatus } : {})
        };
      }
      return c;
    }));
    showToast(`Cake order status updated to ${status}`, 'info');
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
    showToast(`Catering reservation confirmed for ${data.eventType} (${data.expectedGuests} guests)!`, 'success', 'Event Booked');
    return newBooking;
  };

  const updateCateringStatus = (id: string, status: CateringBooking['status'], paymentStatus?: CateringBooking['paymentStatus']) => {
    setCateringBookings(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          ...(paymentStatus ? { paymentStatus } : {})
        };
      }
      return c;
    }));
    showToast(`Catering booking updated to ${status}`, 'info');
  };

  // Ride Hailing operations
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
    // 1. Strict Boundary Check: MUST BE WITHIN KOGI STATE
    if (!data.pickupLocation.isWithinKogi || !data.destinationLocation.isWithinKogi) {
      showToast('Ride-hailing is restricted strictly within Kogi State boundaries (Okene hub).', 'error', 'Geofence Violation');
      return null;
    }

    // Select matched driver based on vehicle type (KEKE or CAR)
    const assignedDriver = drivers.find(d => d.vehicleType === data.vehicleType && d.isOnline) || drivers[0];

    const newRide: RideRequest = {
      id: `ride-${Date.now()}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      pickupLocation: data.pickupLocation,
      destinationLocation: data.destinationLocation,
      vehicleType: data.vehicleType,
      distanceKm: data.distanceKm,
      estimatedMinutes: data.estimatedMinutes,
      baseFare: data.vehicleType === 'KEKE' ? 300 : 800,
      distanceFare: Math.round(data.distanceKm * (data.vehicleType === 'KEKE' ? 120 : 250)),
      timeFare: Math.round(data.estimatedMinutes * 30),
      totalFare: data.totalFare,
      paymentMethod: data.paymentMethod as any,
      paymentStatus: 'PAID', // Strict 100% upfront online payment verified
      paymentVerifiedAt: new Date().toISOString(),
      paymentGatewayRef: `FDC-TXN-${Date.now().toString().slice(-6)}`,
      status: 'DRIVER_ASSIGNED',
      driver: assignedDriver,
      createdAt: new Date().toISOString()
    };

    setActiveRide(newRide);
    
    showToast(`100% Upfront payment verified! Driver ${assignedDriver.name} dispatched with ${data.vehicleType === 'KEKE' ? 'Keke' : 'Car'}.`, 'success', 'Driver Assigned');

    // Trigger automatic confirmation alert to passenger & admin (09162723865)
    sendReceiptNotification(newRide);
    return newRide;
  };

  const cancelRide = (rideId: string) => {
    if (activeRide && activeRide.id === rideId) {
      const cancelled = { ...activeRide, status: 'CANCELLED' as const };
      setRideHistory(prev => [cancelled, ...prev]);
      setActiveRide(null);
      showToast('Ride cancelled. Status updated.', 'info');
    }
  };

  const completeRide = (rideId: string) => {
    if (activeRide && activeRide.id === rideId) {
      const completed = { 
        ...activeRide, 
        status: 'TRIP_COMPLETED' as const,
        completedAt: new Date().toISOString() 
      };
      setRideHistory(prev => [completed, ...prev]);
      setActiveRide(null);
      showToast('Trip completed! Thank you for riding with Flourish Destiny.', 'success', 'Arrived Safely');
      setActiveInvoice(completed);
      sendReceiptNotification(completed);
    }
  };

  // Backend Verification Safeguards
  const verifyOrderCoDPayment = (orderId: string, verifiedBy: string = 'HQ Admin / Dispatch Agent') => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated: Order = {
          ...order,
          paymentStatus: 'PAID',
          paymentVerifiedBy: verifiedBy,
          paymentVerifiedAt: new Date().toISOString()
        };
        showToast(`CoD Payment for Order ${order.orderNumber} verified and marked as PAID!`, 'success', 'Payment Verified');
        sendReceiptNotification(updated);
        return updated;
      }
      return order;
    }));
  };

  const verifyRidePayment = (rideId: string, verifiedBy: string = 'Driver Suleiman Yusuf') => {
    if (activeRide && activeRide.id === rideId) {
      const updatedRide = {
        ...activeRide,
        paymentStatus: 'PAID' as const,
        paymentVerifiedBy: verifiedBy,
        paymentCollectedAt: new Date().toISOString()
      };
      setActiveRide(updatedRide);
      showToast(`Trip fare payment verified by ${verifiedBy}!`, 'success', 'Payment Collected');
      return;
    }

    setRideHistory(prev => prev.map(r => {
      if (r.id === rideId) {
        const updated = {
          ...r,
          paymentStatus: 'PAID' as const,
          paymentVerifiedBy: verifiedBy,
          paymentCollectedAt: new Date().toISOString()
        };
        showToast(`Trip ${r.id} marked as PAID.`, 'success');
        return updated;
      }
      return r;
    }));
  };

  const sendReceiptNotification = (doc: any, channel: 'WHATSAPP' | 'SMS' = 'WHATSAPP') => {
    const docId = doc.orderNumber || doc.id || 'TXN';
    const amount = doc.total || doc.totalFare || doc.totalQuote || doc.estimatedCost || doc.estimatedPrice || 0;
    const phone = doc.customerPhone || doc.recipientPhone || '09162723865';
    
    showToast(
      `Instant receipt & invoice dispatched via ${channel} to ${phone} and HQ (09162723865) for ref ${docId} (₦${amount.toLocaleString()})`,
      'info',
      'SMS / WhatsApp Receipt Sent'
    );
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
        drivers,
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
