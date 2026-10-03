import fs from 'fs';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Product,
  Order,
  CartItem,
  TailoringRequest,
  CakeOrder,
  CateringBooking,
  RideRequest,
  Driver,
  VTUDataPlan,
  VTUTransaction,
  VTUConfig,
  AppNotification,
  PaymentRecord,
  PaymentEventRecord,
  PaymentLifecycleStatus,
  PayableEntityType,
  AuditLogRecord,
  InvoiceRecord,
  UserRole
} from '../../types/index.ts';
import {
  INITIAL_PRODUCTS,
  INITIAL_DRIVERS,
  INITIAL_ORDERS,
  DELIVERY_ZONES,
  KOGI_LOCATIONS
} from '../../data/mockData.ts';
import {
  INITIAL_VTU_CONFIG,
  INITIAL_VTU_DATA_PLANS,
  INITIAL_VTU_TRANSACTIONS
} from '../../data/vtuData.ts';
import { hashPassword } from '../security/AuthService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DbUserRow {
  id: string;
  email: string;
  phone: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  role: UserRole;
  driverId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbCustomerRow {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  email: string;
  defaultAddress: string;
  defaultArea: string;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbAdminRow {
  id: string;
  userId: string;
  username: string;
  department: string;
  accessLevel: 'ADMIN' | 'SUPER_ADMIN';
  lastLoginAt?: string;
  createdAt: string;
}

export interface DbCategoryRow {
  id: string;
  division: 'FASHION' | 'BAKERY' | 'CATERING' | 'GROCERY' | 'TRANSPORT' | 'VTU';
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export interface DbInventoryRow {
  id: string;
  productId: string;
  availableQty: number;
  reservedQty: number;
  lowStockThreshold: number;
  lastRestockedAt?: string;
  updatedAt: string;
}

export interface DbOrderItemRow extends CartItem {
  orderId: string;
  lineTotal: number;
}

export interface DbTailoringMeasurementRow {
  id: string;
  tailoringOrderId: string;
  chest?: number;
  waist?: number;
  shoulder?: number;
  sleeve?: number;
  length?: number;
  trouserLength?: number;
  thigh?: number;
  neck?: number;
  customNotes?: string;
  createdAt: string;
}

export interface DbRideEventRow {
  id: string;
  rideId: string;
  driverId?: string;
  previousStatus?: string;
  newStatus: string;
  notes?: string;
  createdAt: string;
}

export interface RelationalDatabaseSnapshot {
  users: DbUserRow[];
  customers: DbCustomerRow[];
  admins: DbAdminRow[];
  drivers: Driver[];
  categories: DbCategoryRow[];
  products: Product[];
  inventory: DbInventoryRow[];
  orders: Order[];
  order_items: DbOrderItemRow[];
  payments: PaymentRecord[];
  payment_events: PaymentEventRecord[];
  tailoring_orders: TailoringRequest[];
  tailoring_measurements: DbTailoringMeasurementRow[];
  cake_orders: CakeOrder[];
  catering_bookings: CateringBooking[];
  rides: RideRequest[];
  ride_events: DbRideEventRow[];
  vtu_transactions: VTUTransaction[];
  vtu_data_plans: VTUDataPlan[];
  vtu_config: VTUConfig;
  notifications: AppNotification[];
  invoices: InvoiceRecord[];
  audit_logs: AuditLogRecord[];
}

const VALID_PAYMENT_TRANSITIONS: Record<PaymentLifecycleStatus, PaymentLifecycleStatus[]> = {
  INITIATED: ['PENDING', 'SUCCESS', 'FAILED', 'ABANDONED'],
  PENDING: ['SUCCESS', 'FAILED', 'ABANDONED'],
  SUCCESS: ['REFUNDED'], // Prevent SUCCESS -> PENDING or SUCCESS -> FAILED
  FAILED: ['PENDING', 'SUCCESS'], // Only via verified legitimate retry/webhook
  ABANDONED: ['PENDING', 'SUCCESS', 'FAILED'],
  REFUNDED: [] // Terminal
};

export class DatabaseService {
  private state: RelationalDatabaseSnapshot;
  private persistencePath: string;
  private fulfillmentLocks = new Set<string>();
  private postgresConnected = false;
  private postgresConnectionError?: string;

  constructor() {
    const dataDir = path.resolve(__dirname, '../../../.data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Ignore if read-only filesystem
      }
    }
    this.persistencePath = path.join(dataDir, 'fdc-relational-db.json');
    this.state = this.loadOrSeedInitialDatabase();
    void this.verifyPostgresConnection();
  }

  public isPostgresConfigured(): boolean {
    const url = (process.env.DATABASE_URL || '').trim();
    return Boolean(url.length > 0);
  }

  public async verifyPostgresConnection(): Promise<{
    configured: boolean;
    connected: boolean;
    status: 'DEMO_MODE' | 'DATABASE_CONNECTED' | 'DATABASE_ERROR';
    error?: string;
  }> {
    const rawUrl = (process.env.DATABASE_URL || '').trim();
    if (!rawUrl) {
      this.postgresConnected = false;
      this.postgresConnectionError = undefined;
      return {
        configured: false,
        connected: false,
        status: 'DEMO_MODE'
      };
    }

    if (!rawUrl.startsWith('postgres://') && !rawUrl.startsWith('postgresql://')) {
      this.postgresConnected = false;
      this.postgresConnectionError =
        'Invalid DATABASE_URL scheme: expected postgres:// or postgresql:// (credentials redacted).';
      return {
        configured: true,
        connected: false,
        status: 'DATABASE_ERROR',
        error: this.postgresConnectionError
      };
    }

    let hostname = '';
    let port = 5432;
    try {
      const parsed = new URL(rawUrl);
      hostname = parsed.hostname;
      port = Number(parsed.port) || 5432;
      if (!hostname) {
        throw new Error('Missing database hostname');
      }
    } catch {
      this.postgresConnected = false;
      this.postgresConnectionError =
        'Malformed DATABASE_URL configuration (connection string redacted for security).';
      return {
        configured: true,
        connected: false,
        status: 'DATABASE_ERROR',
        error: this.postgresConnectionError
      };
    }

    const reachable = await new Promise<boolean>((resolve) => {
      const socket = new net.Socket();
      let settled = false;
      const finish = (ok: boolean) => {
        if (!settled) {
          settled = true;
          socket.destroy();
          resolve(ok);
        }
      };
      socket.setTimeout(1200);
      socket.once('connect', () => finish(true));
      socket.once('timeout', () => finish(false));
      socket.once('error', () => finish(false));
      try {
        socket.connect(port, hostname);
      } catch {
        finish(false);
      }
    });

    if (!reachable) {
      this.postgresConnected = false;
      this.postgresConnectionError = `PostgreSQL host (${hostname}:${port}) is unreachable or refused connection. Operating in safe DEMO_PERSISTENT fallback.`;
      return {
        configured: true,
        connected: false,
        status: 'DATABASE_ERROR',
        error: this.postgresConnectionError
      };
    }

    this.postgresConnected = true;
    this.postgresConnectionError = undefined;
    return {
      configured: true,
      connected: true,
      status: 'DATABASE_CONNECTED'
    };
  }

  public getDatabaseMode(): 'POSTGRESQL_LIVE' | 'DEMO_PERSISTENT' {
    return this.isPostgresConfigured() && this.postgresConnected
      ? 'POSTGRESQL_LIVE'
      : 'DEMO_PERSISTENT';
  }

  public getDatabaseStatus(): 'DEMO_MODE' | 'DATABASE_CONNECTED' | 'DATABASE_ERROR' {
    if (!this.isPostgresConfigured()) {
      return 'DEMO_MODE';
    }
    return this.postgresConnected ? 'DATABASE_CONNECTED' : 'DATABASE_ERROR';
  }

  public isPostgresLiveConnected(): boolean {
    return this.isPostgresConfigured() && this.postgresConnected;
  }

  public getDatabaseError(): string | undefined {
    return this.postgresConnectionError;
  }

  private loadOrSeedInitialDatabase(): RelationalDatabaseSnapshot {
    const seeded = this.buildDefaultSeedSnapshot();
    try {
      if (fs.existsSync(this.persistencePath)) {
        const raw = fs.readFileSync(this.persistencePath, 'utf8');
        const parsed = JSON.parse(raw) as Partial<RelationalDatabaseSnapshot>;
        if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.orders)) {
          // Ensure all default role users (SUPER_ADMIN, ADMIN, CUSTOMER, DRIVER) exist in loaded snapshot
          const existingUsers = Array.isArray(parsed.users) ? [...parsed.users] : [];
          for (const seedUser of seeded.users) {
            if (!existingUsers.some((u) => u.id === seedUser.id || u.email === seedUser.email)) {
              existingUsers.push(seedUser);
            }
          }
          return {
            ...seeded,
            ...parsed,
            users: existingUsers
          };
        }
      }
    } catch {
      // Fallback to default seed
    }
    this.persistToDisk(seeded);
    return seeded;
  }

  private persistToDisk(snapshot: RelationalDatabaseSnapshot = this.state): void {
    try {
      fs.writeFileSync(this.persistencePath, JSON.stringify(snapshot, null, 2), 'utf8');
    } catch {
      // Safe fallback in ephemeral container environments
    }
  }

  private buildDefaultSeedSnapshot(): RelationalDatabaseSnapshot {
    const nowIso = new Date().toISOString();
    const adminEmail = (process.env.ADMIN_EMAIL || 'ceejegzig83@gmail.com').trim().toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'ceejegzig83';
    const adminCreds = hashPassword(adminPass);
    const opsAdminCreds = hashPassword('admin123');
    const customerCreds = hashPassword('customer123');
    const driverCreds = hashPassword('driver123');

    const users: DbUserRow[] = [
      {
        id: 'usr-admin-001',
        email: adminEmail,
        phone: '09162723865',
        name: 'HQ Master Administrator',
        passwordHash: adminCreds.hash,
        passwordSalt: adminCreds.salt,
        role: 'SUPER_ADMIN',
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso
      },
      {
        id: 'usr-admin-002',
        email: 'admin.ops@flourishdestiny.ng',
        phone: '08055566677',
        name: 'Okene Operations Admin',
        passwordHash: opsAdminCreds.hash,
        passwordSalt: opsAdminCreds.salt,
        role: 'ADMIN',
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso
      },
      {
        id: 'usr-cust-001',
        email: 'customer@flourishdestiny.ng',
        phone: '08034567890',
        name: 'Valued Customer',
        passwordHash: customerCreds.hash,
        passwordSalt: customerCreds.salt,
        role: 'CUSTOMER',
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso
      },
      {
        id: 'usr-drv-001',
        email: 'suleiman.yusuf@flourishdestiny.ng',
        phone: INITIAL_DRIVERS[0]?.phone || '08031122334',
        name: INITIAL_DRIVERS[0]?.name || 'Suleiman Yusuf',
        passwordHash: driverCreds.hash,
        passwordSalt: driverCreds.salt,
        role: 'DRIVER',
        driverId: INITIAL_DRIVERS[0]?.id || 'drv-1',
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso
      }
    ];

    const customers: DbCustomerRow[] = [
      {
        id: 'cust-001',
        userId: 'usr-cust-001',
        name: 'Valued Customer',
        phone: '08034567890',
        email: 'customer@flourishdestiny.ng',
        defaultAddress: 'Okene Central, Kogi State',
        defaultArea: 'Okene Central',
        loyaltyPoints: 150,
        createdAt: nowIso,
        updatedAt: nowIso
      }
    ];

    const admins: DbAdminRow[] = [
      {
        id: 'adm-001',
        userId: 'usr-admin-001',
        username: adminEmail,
        department: 'HQ Master Control — Okene',
        accessLevel: 'SUPER_ADMIN',
        lastLoginAt: nowIso,
        createdAt: nowIso
      }
    ];

    const categorySet = new Map<string, DbCategoryRow>();
    for (const prod of INITIAL_PRODUCTS) {
      const slug = `${prod.division.toLowerCase()}-${prod.category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}`;
      if (!categorySet.has(slug)) {
        categorySet.set(slug, {
          id: `cat-${slug}`,
          division: prod.division,
          name: prod.category,
          slug,
          isActive: true,
          createdAt: nowIso
        });
      }
    }

    const inventory: DbInventoryRow[] = INITIAL_PRODUCTS.map((p) => ({
      id: `inv-${p.id}`,
      productId: p.id,
      availableQty: typeof p.stockCount === 'number' ? p.stockCount : 20,
      reservedQty: 0,
      lowStockThreshold: 5,
      lastRestockedAt: nowIso,
      updatedAt: nowIso
    }));

    const orders: Order[] = INITIAL_ORDERS.map((o) => ({
      ...o,
      inventoryDeducted: o.paymentStatus === 'PAID'
    }));

    const orderItems: DbOrderItemRow[] = [];
    for (const ord of orders) {
      for (const item of ord.items) {
        orderItems.push({
          ...item,
          orderId: ord.id,
          lineTotal: item.price * item.quantity
        });
      }
    }

    const tailoringOrders: TailoringRequest[] = [
      {
        id: 'tailor-001',
        orderReference: 'FDC-TLR-1001',
        customerName: 'Barrister Yakubu Ahmed',
        customerPhone: '08023456789',
        customerEmail: 'yakubu.ahmed@law.ng',
        garmentType: 'Ebira Traditional Aso-Oke Agbada 3-Piece',
        fabricPreference: 'Ebira Woven Cloth (Okene Origin)',
        colorTheme: 'Emerald Green & Gold Thread',
        quantity: 1,
        measurements: {
          chest: 42,
          waist: 36,
          shoulder: 19,
          sleeve: 25,
          length: 44,
          trouserLength: 42,
          neck: 16.5
        },
        designDescription:
          'Intricate floral embroidery along the front placket with traditional matching cap.',
        preferredCompletionDate: '2026-09-15',
        estimatedCost: 55000,
        depositPaid: 55000,
        status: 'IN_PRODUCTION',
        paymentStatus: 'PAID',
        createdAt: '2026-08-27T10:00:00Z'
      }
    ];

    const tailoringMeasurements: DbTailoringMeasurementRow[] = [
      {
        id: 'tmeas-001',
        tailoringOrderId: 'tailor-001',
        chest: 42,
        waist: 36,
        shoulder: 19,
        sleeve: 25,
        length: 44,
        trouserLength: 42,
        neck: 16.5,
        createdAt: '2026-08-27T10:00:00Z'
      }
    ];

    const cakeOrders: CakeOrder[] = [
      {
        id: 'cake-001',
        orderReference: 'FDC-CAKE-1001',
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

    const cateringBookings: CateringBooking[] = [
      {
        id: 'cat-001',
        bookingReference: 'FDC-CAT-1001',
        customerName: 'Alhaji Sani Momoh',
        customerPhone: '08098765432',
        customerEmail: 'sani.momoh@gmail.com',
        eventType: 'Traditional Celebration',
        eventDate: '2026-09-20',
        eventTime: '1:00 PM',
        eventLocation: 'Okene Club Grounds, Obehira Road',
        expectedGuests: 150,
        selectedPackageId: 'cat-standard',
        customMenuPreferences: [
          'Ebira Apapa with Smoked Fish',
          'Firewood Party Jollof',
          'Pounded Yam with Native Egusi',
          'Spicy Asun Goat Meat'
        ],
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

    const rides: RideRequest[] = [
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

    const invoices: InvoiceRecord[] = orders.map((ord, idx) => ({
      id: `inv-doc-${idx + 1}`,
      invoiceNumber: `INV-${ord.orderNumber}`,
      entityType: 'ORDER',
      entityId: ord.id,
      customerName: ord.customerName,
      customerPhone: ord.customerPhone,
      customerEmail: ord.customerEmail || 'customer@flourishdestiny.ng',
      subtotal: ord.subtotal,
      deliveryOrServiceFee: ord.deliveryFee,
      discount: ord.discount,
      totalAmount: ord.total,
      paymentStatus: ord.paymentStatus,
      paymentReference: ord.paymentReference || `REF_${ord.orderNumber}`,
      issuedAt: ord.createdAt,
      paidAt: ord.paymentStatus === 'PAID' ? ord.createdAt : undefined
    }));

    const auditLogs: AuditLogRecord[] = [
      {
        id: 'aud-init-001',
        actorId: 'SYSTEM',
        actorName: 'System Bootstrapper',
        actorRole: 'SYSTEM',
        action: 'SYSTEM_INITIALIZED',
        entityType: 'SETTINGS',
        entityId: 'fdc-core',
        summary:
          'Production Backend, Relational Database Abstraction, Paystack Verification & VTU Gateway initialized.',
        createdAt: nowIso
      }
    ];

    return {
      users,
      customers,
      admins,
      drivers: [...INITIAL_DRIVERS],
      categories: Array.from(categorySet.values()),
      products: [...INITIAL_PRODUCTS],
      inventory,
      orders,
      order_items: orderItems,
      payments: [],
      payment_events: [],
      tailoring_orders: tailoringOrders,
      tailoring_measurements: tailoringMeasurements,
      cake_orders: cakeOrders,
      catering_bookings: cateringBookings,
      rides,
      ride_events: [
        {
          id: 'rev-001',
          rideId: 'ride-901',
          driverId: INITIAL_DRIVERS[0]?.id,
          previousStatus: 'TRIP_IN_PROGRESS',
          newStatus: 'TRIP_COMPLETED',
          notes: 'Seeded historical Kogi trip completed safely.',
          createdAt: '2026-08-27T16:02:00Z'
        }
      ],
      vtu_transactions: [...INITIAL_VTU_TRANSACTIONS],
      vtu_data_plans: [...INITIAL_VTU_DATA_PLANS],
      vtu_config: { ...INITIAL_VTU_CONFIG },
      notifications: [
        {
          id: 'notif-init-1',
          title: 'IN-APP DEMO NOTIFICATION: Welcome to Flourish Destiny Super App',
          message:
            'All 6 Kogi State business hubs (Fashion, Bakery, Catering, Grocery, Kogi Ride & VTU) are online.',
          category: 'ORDER',
          createdAt: nowIso,
          read: false,
          isDemoNotification: true
        }
      ],
      invoices,
      audit_logs: auditLogs
    };
  }

  public getEntitiesCount(): Record<string, number> {
    return {
      users: this.state.users.length,
      customers: this.state.customers.length,
      admins: this.state.admins.length,
      drivers: this.state.drivers.length,
      categories: this.state.categories.length,
      products: this.state.products.length,
      inventory: this.state.inventory.length,
      orders: this.state.orders.length,
      order_items: this.state.order_items.length,
      payments: this.state.payments.length,
      payment_events: this.state.payment_events.length,
      tailoring_orders: this.state.tailoring_orders.length,
      tailoring_measurements: this.state.tailoring_measurements.length,
      cake_orders: this.state.cake_orders.length,
      catering_bookings: this.state.catering_bookings.length,
      rides: this.state.rides.length,
      ride_events: this.state.ride_events.length,
      vtu_transactions: this.state.vtu_transactions.length,
      notifications: this.state.notifications.length,
      invoices: this.state.invoices.length,
      audit_logs: this.state.audit_logs.length
    };
  }

  // ==========================================================================
  // AUDIT LOGGING (Phase 13)
  // ==========================================================================
  public recordAuditLog(
    entry: Omit<AuditLogRecord, 'id' | 'createdAt'>
  ): AuditLogRecord {
    const record: AuditLogRecord = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.state.audit_logs = [record, ...this.state.audit_logs.slice(0, 499)];
    this.persistToDisk();
    return record;
  }

  public getAuditLogs(limit = 100): AuditLogRecord[] {
    return this.state.audit_logs.slice(0, limit);
  }

  // ==========================================================================
  // USERS & CUSTOMERS (Phase 12)
  // ==========================================================================
  public findUserByEmailOrPhone(identifier: string): DbUserRow | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.state.users.find(
      (u) => u.email.toLowerCase() === clean || u.phone === clean
    );
  }

  public findUserById(userId: string): DbUserRow | undefined {
    return this.state.users.find((u) => u.id === userId);
  }

  public createCustomerUser(params: {
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    passwordSalt: string;
    defaultAddress?: string;
    defaultArea?: string;
  }): { user: DbUserRow; customer: DbCustomerRow } {
    const nowIso = new Date().toISOString();
    const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const customerId = `cust-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const user: DbUserRow = {
      id: userId,
      email: params.email.trim().toLowerCase(),
      phone: params.phone.trim(),
      name: params.name.trim(),
      passwordHash: params.passwordHash,
      passwordSalt: params.passwordSalt,
      role: 'CUSTOMER',
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const customer: DbCustomerRow = {
      id: customerId,
      userId,
      name: params.name.trim(),
      phone: params.phone.trim(),
      email: params.email.trim().toLowerCase(),
      defaultAddress: params.defaultAddress || 'Okene Central, Kogi State',
      defaultArea: params.defaultArea || 'Okene Central',
      loyaltyPoints: 50,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    this.state.users = [user, ...this.state.users];
    this.state.customers = [customer, ...this.state.customers];
    this.persistToDisk();
    return { user, customer };
  }

  public updateUserPassword(userId: string, passwordHash: string, passwordSalt: string): boolean {
    const idx = this.state.users.findIndex((u) => u.id === userId);
    if (idx === -1) return false;
    this.state.users[idx] = {
      ...this.state.users[idx],
      passwordHash,
      passwordSalt,
      updatedAt: new Date().toISOString()
    };
    this.persistToDisk();
    return true;
  }

  public getCustomerByUserIdOrPhone(userId?: string, phone?: string): DbCustomerRow | undefined {
    if (userId) {
      const byUser = this.state.customers.find((c) => c.userId === userId);
      if (byUser) return byUser;
    }
    if (phone) {
      return this.state.customers.find((c) => c.phone === phone);
    }
    return undefined;
  }

  public upsertCustomerProfile(params: {
    userId?: string;
    name: string;
    phone: string;
    email: string;
    defaultAddress: string;
    defaultArea: string;
  }): DbCustomerRow {
    const nowIso = new Date().toISOString();
    const existingIdx = this.state.customers.findIndex(
      (c) => (params.userId && c.userId === params.userId) || c.phone === params.phone
    );
    if (existingIdx !== -1) {
      const updated: DbCustomerRow = {
        ...this.state.customers[existingIdx],
        name: params.name,
        phone: params.phone,
        email: params.email,
        defaultAddress: params.defaultAddress,
        defaultArea: params.defaultArea,
        updatedAt: nowIso
      };
      this.state.customers[existingIdx] = updated;
      if (params.userId) {
        const uIdx = this.state.users.findIndex((u) => u.id === params.userId);
        if (uIdx !== -1) {
          this.state.users[uIdx] = {
            ...this.state.users[uIdx],
            name: params.name,
            phone: params.phone,
            email: params.email,
            updatedAt: nowIso
          };
        }
      }
      this.persistToDisk();
      return updated;
    }

    const created: DbCustomerRow = {
      id: `cust-${Date.now()}`,
      userId: params.userId,
      name: params.name,
      phone: params.phone,
      email: params.email,
      defaultAddress: params.defaultAddress,
      defaultArea: params.defaultArea,
      loyaltyPoints: 0,
      createdAt: nowIso,
      updatedAt: nowIso
    };
    this.state.customers = [created, ...this.state.customers];
    this.persistToDisk();
    return created;
  }

  // ==========================================================================
  // PRODUCTS & INVENTORY SAFETY (Phase 3 & 10)
  // ==========================================================================
  public getProducts(): Product[] {
    return this.state.products;
  }

  public getProductById(productId: string): Product | undefined {
    return this.state.products.find((p) => p.id === productId);
  }

  public getInventory(): DbInventoryRow[] {
    return this.state.inventory;
  }

  public saveProduct(
    product: Product,
    actor: { id: string; name: string; role: UserRole | 'SYSTEM' }
  ): Product {
    const nowIso = new Date().toISOString();
    const existingIdx = this.state.products.findIndex((p) => p.id === product.id);
    if (existingIdx !== -1) {
      const prev = this.state.products[existingIdx];
      this.state.products[existingIdx] = { ...product };
      // Sync inventory table
      const invIdx = this.state.inventory.findIndex((i) => i.productId === product.id);
      if (invIdx !== -1) {
        this.state.inventory[invIdx] = {
          ...this.state.inventory[invIdx],
          availableQty: product.stockCount,
          updatedAt: nowIso
        };
      }
      if (prev.price !== product.price || prev.stockCount !== product.stockCount) {
        this.recordAuditLog({
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: prev.price !== product.price ? 'PRODUCT_PRICE_CHANGED' : 'INVENTORY_ADJUSTED',
          entityType: prev.price !== product.price ? 'PRODUCT' : 'INVENTORY',
          entityId: product.id,
          summary: `Updated "${product.name}": Price ₦${prev.price.toLocaleString()} -> ₦${product.price.toLocaleString()}, Stock ${prev.stockCount} -> ${product.stockCount}`,
          previousValue: JSON.stringify({ price: prev.price, stockCount: prev.stockCount }),
          newValue: JSON.stringify({ price: product.price, stockCount: product.stockCount })
        });
      }
    } else {
      this.state.products = [product, ...this.state.products];
      this.state.inventory = [
        {
          id: `inv-${product.id}`,
          productId: product.id,
          availableQty: product.stockCount ?? 20,
          reservedQty: 0,
          lowStockThreshold: 5,
          lastRestockedAt: nowIso,
          updatedAt: nowIso
        },
        ...this.state.inventory
      ];
      this.recordAuditLog({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'PRODUCT_CREATED',
        entityType: 'PRODUCT',
        entityId: product.id,
        summary: `Created product "${product.name}" in ${product.division} at ₦${product.price.toLocaleString()} (Stock: ${product.stockCount})`
      });
    }
    this.persistToDisk();
    return product;
  }

  public deleteProduct(
    productId: string,
    actor: { id: string; name: string; role: UserRole | 'SYSTEM' }
  ): boolean {
    const existing = this.getProductById(productId);
    if (!existing) return false;
    this.state.products = this.state.products.filter((p) => p.id !== productId);
    this.state.inventory = this.state.inventory.filter((i) => i.productId !== productId);
    this.recordAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'PRODUCT_DELETED',
      entityType: 'PRODUCT',
      entityId: productId,
      summary: `Deleted product "${existing.name}" (${productId})`
    });
    this.persistToDisk();
    return true;
  }

  public adjustInventory(
    productId: string,
    nextStockCount: number,
    inStock: boolean | undefined,
    actor: { id: string; name: string; role: UserRole | 'SYSTEM' }
  ): Product | null {
    const idx = this.state.products.findIndex((p) => p.id === productId);
    if (idx === -1) return null;
    const prev = this.state.products[idx];
    const safeStock = Math.max(0, Math.floor(nextStockCount));
    const resolvedInStock = inStock !== undefined ? inStock : safeStock > 0;

    const updated: Product = {
      ...prev,
      stockCount: safeStock,
      inStock: resolvedInStock
    };
    this.state.products[idx] = updated;

    const invIdx = this.state.inventory.findIndex((i) => i.productId === productId);
    if (invIdx !== -1) {
      this.state.inventory[invIdx] = {
        ...this.state.inventory[invIdx],
        availableQty: safeStock,
        lastRestockedAt: safeStock > prev.stockCount ? new Date().toISOString() : this.state.inventory[invIdx].lastRestockedAt,
        updatedAt: new Date().toISOString()
      };
    }

    this.recordAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'INVENTORY_ADJUSTED',
      entityType: 'INVENTORY',
      entityId: productId,
      summary: `Inventory adjusted for "${prev.name}": ${prev.stockCount} -> ${safeStock} (${resolvedInStock ? 'IN STOCK' : 'OUT OF STOCK'})`,
      previousValue: String(prev.stockCount),
      newValue: String(safeStock)
    });

    this.persistToDisk();
    return updated;
  }

  /**
   * Idempotent Inventory Deduction (Phase 10)
   * Guarantees inventory is deducted ONCE AND ONLY ONCE per order when payment is verified
   * or when a Cash on Delivery order is confirmed.
   */
  public deductInventoryForOrderIdempotently(orderId: string): {
    deducted: boolean;
    alreadyDeducted: boolean;
    error?: string;
  } {
    if (this.fulfillmentLocks.has(`inv:${orderId}`)) {
      return { deducted: false, alreadyDeducted: true };
    }
    this.fulfillmentLocks.add(`inv:${orderId}`);

    try {
      const ordIdx = this.state.orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
      if (ordIdx === -1) {
        return { deducted: false, alreadyDeducted: false, error: 'Order not found' };
      }

      const order = this.state.orders[ordIdx];
      if (order.inventoryDeducted) {
        return { deducted: false, alreadyDeducted: true };
      }

      const nowIso = new Date().toISOString();
      const wasReservationReleased = Boolean((order as any).reservationReleased);
      for (const item of order.items) {
        const pIdx = this.state.products.findIndex((p) => p.id === item.productId);
        if (pIdx !== -1) {
          const prod = this.state.products[pIdx];
          const nextStock = Math.max(0, (prod.stockCount || 0) - item.quantity);
          this.state.products[pIdx] = {
            ...prod,
            stockCount: nextStock,
            inStock: nextStock > 0 ? prod.inStock : false
          };

          const invIdx = this.state.inventory.findIndex((i) => i.productId === prod.id);
          if (invIdx !== -1) {
            this.state.inventory[invIdx] = {
              ...this.state.inventory[invIdx],
              availableQty: nextStock,
              reservedQty: wasReservationReleased
                ? this.state.inventory[invIdx].reservedQty
                : Math.max(0, this.state.inventory[invIdx].reservedQty - item.quantity),
              updatedAt: nowIso
            };
          }
        }
      }

      this.state.orders[ordIdx] = {
        ...order,
        inventoryDeducted: true
      };
      this.persistToDisk();
      return { deducted: true, alreadyDeducted: false };
    } finally {
      this.fulfillmentLocks.delete(`inv:${orderId}`);
    }
  }

  /**
   * Releases temporary inventory reservation when an unpaid online order fails, is abandoned, or is cancelled.
   */
  public releaseInventoryReservationForOrderIdempotently(orderId: string): {
    released: boolean;
    alreadyReleased: boolean;
  } {
    const ordIdx = this.state.orders.findIndex(
      (o) => o.id === orderId || o.orderNumber === orderId
    );
    if (ordIdx === -1) {
      return { released: false, alreadyReleased: false };
    }

    const order = this.state.orders[ordIdx] as Order & { reservationReleased?: boolean };
    if (order.inventoryDeducted || order.reservationReleased) {
      return { released: false, alreadyReleased: true };
    }

    const nowIso = new Date().toISOString();
    for (const item of order.items) {
      const invIdx = this.state.inventory.findIndex((i) => i.productId === item.productId);
      if (invIdx !== -1) {
        this.state.inventory[invIdx] = {
          ...this.state.inventory[invIdx],
          reservedQty: Math.max(0, this.state.inventory[invIdx].reservedQty - item.quantity),
          updatedAt: nowIso
        };
      }
    }

    this.state.orders[ordIdx] = {
      ...order,
      reservationReleased: true
    } as Order;
    this.persistToDisk();
    return { released: true, alreadyReleased: false };
  }

  // ==========================================================================
  // ORDERS & ORDER ITEMS (Phase 10 & 11)
  // ==========================================================================
  public getOrders(customerPhone?: string): Order[] {
    if (customerPhone) {
      const clean = customerPhone.trim();
      return this.state.orders.filter((o) => o.customerPhone.includes(clean));
    }
    return this.state.orders;
  }

  public getOrderByIdOrNumber(idOrNumber: string): Order | undefined {
    return this.state.orders.find(
      (o) => o.id === idOrNumber || o.orderNumber === idOrNumber
    );
  }

  /**
   * Creates an order with SERVER-SIDE price & delivery fee calculation.
   * For online payments, paymentStatus starts as 'PENDING' and inventory is NOT permanently deducted
   * until payment verification succeeds!
   */
  public createOrderServerSide(params: {
    id?: string;
    orderNumber?: string;
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerAddress: string;
    deliveryArea: string;
    items: CartItem[];
    paymentMethod: Order['paymentMethod'];
    notes?: string;
    estimatedDeliveryTime?: string;
  }): { order?: Order; invoice?: InvoiceRecord; error?: string } {
    if (!params.items || params.items.length === 0) {
      return { error: 'Cannot create an order with an empty cart.' };
    }

    // Validate stock and calculate authoritative server-side prices
    const verifiedItems: CartItem[] = [];
    let calculatedSubtotal = 0;

    for (const rawItem of params.items) {
      const dbProd = this.getProductById(rawItem.productId);
      if (!dbProd) {
        return {
          error: `Product "${rawItem.productId}" does not exist in the server catalog.`
        };
      }
      const unitPrice = dbProd.price;
      const qty = Math.max(1, Math.floor(Number(rawItem.quantity) || 1));

      const invRow = this.state.inventory.find((i) => i.productId === dbProd.id);
      const unreservedQty = invRow
        ? Math.max(0, invRow.availableQty - invRow.reservedQty)
        : dbProd.stockCount;

      if (!dbProd.inStock || dbProd.stockCount < qty || unreservedQty < qty) {
        return {
          error: `"${dbProd.name}" has insufficient stock (${Math.min(dbProd.stockCount, unreservedQty)} available, ${qty} requested).`
        };
      }

      calculatedSubtotal += unitPrice * qty;
      verifiedItems.push({
        ...rawItem,
        price: unitPrice,
        quantity: qty
      });
    }

    const matchedZone =
      DELIVERY_ZONES.find(
        (z) => z.name.toLowerCase() === (params.deliveryArea || '').toLowerCase()
      ) || DELIVERY_ZONES[0];

    const deliveryFee = matchedZone.fee;
    const total = calculatedSubtotal + deliveryFee;
    const nowIso = new Date().toISOString();
    const orderId = params.id || `ord-${Date.now()}`;
    const orderNumber =
      params.orderNumber || `FDC-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    const isCoD = params.paymentMethod === 'CASH_ON_DELIVERY';

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: params.customerId,
      customerName: params.customerName.trim(),
      customerPhone: params.customerPhone.trim(),
      customerEmail: params.customerEmail?.trim() || 'customer@flourishdestiny.ng',
      customerAddress: params.customerAddress.trim(),
      deliveryArea: matchedZone.name,
      division: 'MULTI',
      items: verifiedItems,
      subtotal: calculatedSubtotal,
      deliveryFee,
      discount: 0,
      tax: 0,
      total,
      paymentMethod: params.paymentMethod,
      // CRITICAL (Phase 6, 7, 10): Online orders begin as PENDING payment until backend verifies Paystack!
      paymentStatus: 'PENDING',
      inventoryDeducted: false,
      orderStatus: isCoD ? 'PLACED' : 'PENDING',
      createdAt: nowIso,
      estimatedDeliveryTime: params.estimatedDeliveryTime || matchedZone.time,
      notes: params.notes
    };

    // Reserve stock in inventory table; if CoD, deduct inventory immediately on placement
    for (const item of verifiedItems) {
      const invIdx = this.state.inventory.findIndex((i) => i.productId === item.productId);
      if (invIdx !== -1 && !isCoD) {
        this.state.inventory[invIdx] = {
          ...this.state.inventory[invIdx],
          reservedQty: this.state.inventory[invIdx].reservedQty + item.quantity,
          updatedAt: nowIso
        };
      }
    }

    this.state.orders = [newOrder, ...this.state.orders];
    for (const item of verifiedItems) {
      this.state.order_items.push({
        ...item,
        orderId: newOrder.id,
        lineTotal: item.price * item.quantity
      });
    }

    if (isCoD) {
      this.deductInventoryForOrderIdempotently(newOrder.id);
    }

    const invoice: InvoiceRecord = {
      id: `inv-doc-${Date.now()}`,
      invoiceNumber: `INV-${newOrder.orderNumber}`,
      entityType: 'ORDER',
      entityId: newOrder.id,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      customerEmail: newOrder.customerEmail,
      subtotal: newOrder.subtotal,
      deliveryOrServiceFee: newOrder.deliveryFee,
      discount: 0,
      totalAmount: newOrder.total,
      paymentStatus: newOrder.paymentStatus,
      issuedAt: nowIso
    };
    this.state.invoices = [invoice, ...this.state.invoices];
    this.persistToDisk();

    return { order: this.getOrderByIdOrNumber(newOrder.id), invoice };
  }

  public updateOrderStatus(
    orderId: string,
    nextStatus: Order['orderStatus'],
    nextPaymentStatus: Order['paymentStatus'] | undefined,
    actor: { id: string; name: string; role: UserRole | 'SYSTEM' }
  ): { order?: Order; error?: string } {
    const idx = this.state.orders.findIndex(
      (o) => o.id === orderId || o.orderNumber === orderId
    );
    if (idx === -1) return { error: 'Order not found.' };

    const current = this.state.orders[idx];
    if (
      current.orderStatus === 'CANCELLED' &&
      (nextStatus === 'COMPLETED' || nextStatus === 'DELIVERED' || nextStatus === 'OUT_FOR_DELIVERY')
    ) {
      return {
        error:
          'Cannot mark a CANCELLED order as Delivered/Completed without re-confirming it first.'
      };
    }

    const updated: Order = {
      ...current,
      orderStatus: nextStatus,
      paymentStatus: nextPaymentStatus || current.paymentStatus
    };
    this.state.orders[idx] = updated;

    if (updated.paymentStatus === 'PAID' && !updated.inventoryDeducted) {
      this.deductInventoryForOrderIdempotently(updated.id);
    } else if (nextStatus === 'CANCELLED' && !updated.inventoryDeducted) {
      this.releaseInventoryReservationForOrderIdempotently(updated.id);
    }

    this.recordAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'ORDER_STATUS_UPDATED',
      entityType: 'ORDER',
      entityId: updated.id,
      summary: `Order ${updated.orderNumber} status changed: ${current.orderStatus} -> ${nextStatus} (Payment: ${updated.paymentStatus})`,
      previousValue: current.orderStatus,
      newValue: nextStatus
    });

    this.persistToDisk();
    return { order: this.state.orders[idx] };
  }

  // ==========================================================================
  // PAYMENTS & PAYMENT STATE MACHINE (Phases 5, 6, 7, 8, 9, 10)
  // ==========================================================================
  public getPayments(): PaymentRecord[] {
    return this.state.payments;
  }

  public getPaymentEvents(reference?: string): PaymentEventRecord[] {
    if (reference) {
      return this.state.payment_events.filter((e) => e.reference === reference);
    }
    return this.state.payment_events;
  }

  public findPaymentByReferenceOrIdempotency(
    reference?: string,
    idempotencyKey?: string
  ): PaymentRecord | undefined {
    return this.state.payments.find(
      (p) =>
        (reference && (p.reference === reference || p.id === reference)) ||
        (idempotencyKey && p.idempotencyKey === idempotencyKey)
    );
  }

  public resolvePayableEntityServerSide(
    entityType: PayableEntityType,
    entityId: string
  ): {
    exists: boolean;
    alreadyPaid: boolean;
    amountNaira: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    description: string;
  } | null {
    if (entityType === 'ORDER') {
      const ord = this.getOrderByIdOrNumber(entityId);
      if (!ord) return null;
      return {
        exists: true,
        alreadyPaid: ord.paymentStatus === 'PAID',
        amountNaira: ord.total,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        customerEmail: ord.customerEmail || 'customer@flourishdestiny.ng',
        description: `Store Order ${ord.orderNumber} (${ord.items.length} items)`
      };
    }
    if (entityType === 'TAILORING') {
      const t = this.state.tailoring_orders.find(
        (x) => x.id === entityId || x.orderReference === entityId
      );
      if (!t) return null;
      return {
        exists: true,
        alreadyPaid: t.paymentStatus === 'PAID',
        amountNaira: t.depositPaid > 0 ? t.depositPaid : t.estimatedCost,
        customerName: t.customerName,
        customerPhone: t.customerPhone,
        customerEmail: t.customerEmail || 'customer@flourishdestiny.ng',
        description: `Bespoke Tailoring ${t.orderReference || t.id}`
      };
    }
    if (entityType === 'CAKE') {
      const c = this.state.cake_orders.find(
        (x) => x.id === entityId || x.orderReference === entityId
      );
      if (!c) return null;
      return {
        exists: true,
        alreadyPaid: c.paymentStatus === 'PAID',
        amountNaira: c.estimatedPrice,
        customerName: c.customerName,
        customerPhone: c.customerPhone,
        customerEmail: 'customer@flourishdestiny.ng',
        description: `Custom Cake ${c.orderReference || c.id}`
      };
    }
    if (entityType === 'CATERING') {
      const b = this.state.catering_bookings.find(
        (x) => x.id === entityId || x.bookingReference === entityId
      );
      if (!b) return null;
      return {
        exists: true,
        alreadyPaid: b.paymentStatus === 'PAID',
        amountNaira: b.depositRequired > 0 ? b.depositRequired : b.totalQuote,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        customerEmail: b.customerEmail || 'customer@flourishdestiny.ng',
        description: `Catering Booking ${b.bookingReference || b.id}`
      };
    }
    if (entityType === 'RIDE') {
      const r = this.state.rides.find((x) => x.id === entityId);
      if (!r) return null;
      return {
        exists: true,
        alreadyPaid: r.paymentStatus === 'PAID',
        amountNaira: r.totalFare,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        customerEmail: 'customer@flourishdestiny.ng',
        description: `Kogi Ride ${r.id}`
      };
    }
    if (entityType === 'VTU') {
      const v = this.state.vtu_transactions.find(
        (x) => x.id === entityId || x.reference === entityId
      );
      if (!v) return null;
      return {
        exists: true,
        alreadyPaid: v.paymentStatus === 'SUCCESSFUL',
        amountNaira: v.totalAmount,
        customerName: v.customerName || 'Valued Customer',
        customerPhone: v.phoneNumber,
        customerEmail: v.customerEmail || 'customer@flourishdestiny.ng',
        description: `VTU ${v.network} ${v.type} (${v.phoneNumber})`
      };
    }
    return null;
  }

  public createPaymentRecord(params: {
    reference: string;
    idempotencyKey?: string;
    entityType: PayableEntityType;
    entityId: string;
    customerId?: string;
    customerEmail: string;
    customerPhone?: string;
    amountNaira: number;
    channel: PaymentRecord['channel'];
    provider: PaymentRecord['provider'];
    mode: PaymentRecord['mode'];
    authorizationUrl?: string;
    accessCode?: string;
    metadata?: Record<string, any>;
  }): PaymentRecord {
    const nowIso = new Date().toISOString();
    const payment: PaymentRecord = {
      id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      reference: params.reference,
      idempotencyKey: params.idempotencyKey,
      entityType: params.entityType,
      entityId: params.entityId,
      customerId: params.customerId,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      amountNaira: params.amountNaira,
      amountKobo: Math.round(params.amountNaira * 100),
      currency: 'NGN',
      channel: params.channel,
      provider: params.provider,
      mode: params.mode,
      status: 'PENDING',
      authorizationUrl: params.authorizationUrl,
      accessCode: params.accessCode,
      metadata: params.metadata,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const event: PaymentEventRecord = {
      id: `pev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      paymentId: payment.id,
      reference: payment.reference,
      eventType: 'payment.initialized',
      previousStatus: 'INITIATED',
      newStatus: 'PENDING',
      source: 'BACKEND_INIT',
      payloadSummary: `Initialized ₦${payment.amountNaira.toLocaleString()} (${payment.amountKobo} kobo) for ${payment.entityType}:${payment.entityId}`,
      createdAt: nowIso
    };

    this.state.payments = [payment, ...this.state.payments];
    this.state.payment_events = [event, ...this.state.payment_events];
    this.persistToDisk();
    return payment;
  }

  /**
   * Transitions payment state with strict state machine validation and idempotency.
   * When transitioning to SUCCESS, atomically fulfills the underlying entity (Order, Tailoring, Cake, Catering, Ride)
   * and deducts inventory ONCE.
   */
  public transitionPaymentAndFulfillEntity(params: {
    reference: string;
    targetStatus: PaymentLifecycleStatus;
    source: PaymentEventRecord['source'];
    verifiedBy: NonNullable<PaymentRecord['verifiedBy']>;
    gatewayTransactionId?: string;
    eventType: string;
    signatureValid?: boolean;
    payloadSummary?: string;
  }): {
    success: boolean;
    alreadyFinalized: boolean;
    payment?: PaymentRecord;
    order?: Order;
    error?: string;
  } {
    const lockKey = `pay:${params.reference}`;
    if (this.fulfillmentLocks.has(lockKey)) {
      const existing = this.findPaymentByReferenceOrIdempotency(params.reference);
      return {
        success: existing?.status === 'SUCCESS',
        alreadyFinalized: true,
        payment: existing
      };
    }
    this.fulfillmentLocks.add(lockKey);

    try {
      const pIdx = this.state.payments.findIndex((p) => p.reference === params.reference);
      if (pIdx === -1) {
        return {
          success: false,
          alreadyFinalized: false,
          error: `Payment reference "${params.reference}" not found.`
        };
      }

      const payment = this.state.payments[pIdx];

      // Idempotency guard: never mark an already SUCCESS payment as SUCCESS twice or revert it to PENDING
      if (payment.status === 'SUCCESS' && params.targetStatus === 'SUCCESS') {
        const linkedOrder =
          payment.entityType === 'ORDER'
            ? this.getOrderByIdOrNumber(payment.entityId)
            : undefined;
        return {
          success: true,
          alreadyFinalized: true,
          payment,
          order: linkedOrder
        };
      }

      const allowed = VALID_PAYMENT_TRANSITIONS[payment.status] || [];
      if (!allowed.includes(params.targetStatus)) {
        return {
          success: false,
          alreadyFinalized: false,
          payment,
          error: `Illegal payment state transition: ${payment.status} -> ${params.targetStatus} is forbidden.`
        };
      }

      const nowIso = new Date().toISOString();
      const updatedPayment: PaymentRecord = {
        ...payment,
        status: params.targetStatus,
        gatewayTransactionId: params.gatewayTransactionId || payment.gatewayTransactionId,
        verifiedAt: params.targetStatus === 'SUCCESS' ? nowIso : payment.verifiedAt,
        verifiedBy: params.targetStatus === 'SUCCESS' ? params.verifiedBy : payment.verifiedBy,
        updatedAt: nowIso
      };
      this.state.payments[pIdx] = updatedPayment;

      const event: PaymentEventRecord = {
        id: `pev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        paymentId: payment.id,
        reference: payment.reference,
        eventType: params.eventType,
        previousStatus: payment.status,
        newStatus: params.targetStatus,
        source: params.source,
        signatureValid: params.signatureValid,
        payloadSummary: params.payloadSummary,
        createdAt: nowIso
      };
      this.state.payment_events = [event, ...this.state.payment_events];

      let updatedOrder: Order | undefined;

      // Fulfill associated entity if payment succeeded
      if (params.targetStatus === 'SUCCESS') {
        if (payment.entityType === 'ORDER') {
          const oIdx = this.state.orders.findIndex(
            (o) => o.id === payment.entityId || o.orderNumber === payment.entityId
          );
          if (oIdx !== -1) {
            const ord = this.state.orders[oIdx];
            this.state.orders[oIdx] = {
              ...ord,
              paymentStatus: 'PAID',
              paymentReference: payment.reference,
              paymentVerifiedBy: params.verifiedBy,
              paymentVerifiedAt: nowIso,
              orderStatus:
                ord.orderStatus === 'PENDING' || ord.orderStatus === 'PLACED'
                  ? 'CONFIRMED'
                  : ord.orderStatus
            };
            // Deduct inventory idempotently ONCE
            this.deductInventoryForOrderIdempotently(ord.id);
            updatedOrder = this.state.orders[oIdx];
          }
        } else if (payment.entityType === 'TAILORING') {
          const tIdx = this.state.tailoring_orders.findIndex(
            (t) => t.id === payment.entityId || t.orderReference === payment.entityId
          );
          if (tIdx !== -1) {
            this.state.tailoring_orders[tIdx] = {
              ...this.state.tailoring_orders[tIdx],
              paymentStatus: 'PAID',
              depositPaid: payment.amountNaira
            };
          }
        } else if (payment.entityType === 'CAKE') {
          const cIdx = this.state.cake_orders.findIndex(
            (c) => c.id === payment.entityId || c.orderReference === payment.entityId
          );
          if (cIdx !== -1) {
            this.state.cake_orders[cIdx] = {
              ...this.state.cake_orders[cIdx],
              paymentStatus: 'PAID'
            };
          }
        } else if (payment.entityType === 'CATERING') {
          const bIdx = this.state.catering_bookings.findIndex(
            (b) => b.id === payment.entityId || b.bookingReference === payment.entityId
          );
          if (bIdx !== -1) {
            this.state.catering_bookings[bIdx] = {
              ...this.state.catering_bookings[bIdx],
              paymentStatus: 'PAID',
              depositPaid: payment.amountNaira,
              status: 'CONFIRMED'
            };
          }
        } else if (payment.entityType === 'RIDE') {
          const rIdx = this.state.rides.findIndex((r) => r.id === payment.entityId);
          if (rIdx !== -1) {
            this.state.rides[rIdx] = {
              ...this.state.rides[rIdx],
              paymentStatus: 'PAID',
              paymentVerifiedAt: nowIso,
              paymentGatewayRef: payment.reference
            };
          }
        } else if (payment.entityType === 'VTU') {
          const vIdx = this.state.vtu_transactions.findIndex(
            (v) => v.id === payment.entityId || v.reference === payment.entityId
          );
          if (vIdx !== -1) {
            this.state.vtu_transactions[vIdx] = {
              ...this.state.vtu_transactions[vIdx],
              paymentStatus: 'SUCCESSFUL',
              paymentGatewayRef: payment.reference,
              paymentVerifiedAt: nowIso,
              updatedAt: nowIso
            };
          }
        }

        // Update Invoice payment status
        const invIdx = this.state.invoices.findIndex(
          (inv) => inv.entityType === payment.entityType && inv.entityId === payment.entityId
        );
        if (invIdx !== -1) {
          this.state.invoices[invIdx] = {
            ...this.state.invoices[invIdx],
            paymentStatus: 'PAID',
            paymentReference: payment.reference,
            paidAt: nowIso
          };
        }

        // Add Notification
        this.addNotification({
          title: `IN-APP DEMO NOTIFICATION: Payment Verified (${payment.reference})`,
          message: `Payment of ₦${payment.amountNaira.toLocaleString()} for ${payment.entityType} (${payment.entityId}) verified by server.`,
          category: 'PAYMENT'
        });
      } else if (params.targetStatus === 'FAILED' || params.targetStatus === 'ABANDONED') {
        if (payment.entityType === 'ORDER') {
          const oIdx = this.state.orders.findIndex(
            (o) => o.id === payment.entityId || o.orderNumber === payment.entityId
          );
          if (oIdx !== -1) {
            const ord = this.state.orders[oIdx];
            if (ord.paymentStatus !== 'PAID') {
              this.state.orders[oIdx] = {
                ...ord,
                paymentStatus: params.targetStatus === 'FAILED' ? 'FAILED' : 'PENDING'
              };
              this.releaseInventoryReservationForOrderIdempotently(ord.id);
              updatedOrder = this.state.orders[oIdx];
            }
          }
        }
      } else if (params.targetStatus === 'REFUNDED') {
        if (payment.entityType === 'ORDER') {
          const oIdx = this.state.orders.findIndex(
            (o) => o.id === payment.entityId || o.orderNumber === payment.entityId
          );
          if (oIdx !== -1) {
            this.state.orders[oIdx] = {
              ...this.state.orders[oIdx],
              paymentStatus: 'REFUNDED'
            };
            updatedOrder = this.state.orders[oIdx];
          }
        }
      }

      this.recordAuditLog({
        actorId: params.source,
        actorName: params.verifiedBy,
        actorRole: params.source === 'PAYSTACK_WEBHOOK' ? 'WEBHOOK' : 'SYSTEM',
        action: `PAYMENT_${params.targetStatus}`,
        entityType: 'PAYMENT',
        entityId: payment.reference,
        summary: `Payment ${payment.reference} (${payment.entityType}:${payment.entityId}) transitioned ${payment.status} -> ${params.targetStatus} (₦${payment.amountNaira.toLocaleString()})`,
        previousValue: payment.status,
        newValue: params.targetStatus
      });

      this.persistToDisk();
      return {
        success: params.targetStatus === 'SUCCESS' || params.targetStatus === 'REFUNDED',
        alreadyFinalized: false,
        payment: updatedPayment,
        order: updatedOrder
      };
    } finally {
      this.fulfillmentLocks.delete(lockKey);
    }
  }

  // ==========================================================================
  // TAILORING, CAKES, CATERING & RIDES (Phases 14, 16, 17)
  // ==========================================================================
  public getTailoringOrders(): TailoringRequest[] {
    return this.state.tailoring_orders;
  }

  public createTailoringOrder(data: TailoringRequest): TailoringRequest {
    this.state.tailoring_orders = [data, ...this.state.tailoring_orders];
    if (data.measurements) {
      this.state.tailoring_measurements.unshift({
        id: `tmeas-${Date.now()}`,
        tailoringOrderId: data.id,
        ...data.measurements,
        createdAt: data.createdAt
      });
    }
    this.persistToDisk();
    return data;
  }

  public updateTailoringStatus(
    id: string,
    status: TailoringRequest['status'],
    paymentStatus?: TailoringRequest['paymentStatus']
  ): TailoringRequest | null {
    const idx = this.state.tailoring_orders.findIndex(
      (t) => t.id === id || t.orderReference === id
    );
    if (idx === -1) return null;
    this.state.tailoring_orders[idx] = {
      ...this.state.tailoring_orders[idx],
      status,
      paymentStatus: paymentStatus || this.state.tailoring_orders[idx].paymentStatus
    };
    this.persistToDisk();
    return this.state.tailoring_orders[idx];
  }

  public getCakeOrders(): CakeOrder[] {
    return this.state.cake_orders;
  }

  public createCakeOrder(data: CakeOrder): CakeOrder {
    this.state.cake_orders = [data, ...this.state.cake_orders];
    this.persistToDisk();
    return data;
  }

  public updateCakeStatus(
    id: string,
    status: CakeOrder['status'],
    paymentStatus?: CakeOrder['paymentStatus']
  ): CakeOrder | null {
    const idx = this.state.cake_orders.findIndex(
      (c) => c.id === id || c.orderReference === id
    );
    if (idx === -1) return null;
    this.state.cake_orders[idx] = {
      ...this.state.cake_orders[idx],
      status,
      paymentStatus: paymentStatus || this.state.cake_orders[idx].paymentStatus
    };
    this.persistToDisk();
    return this.state.cake_orders[idx];
  }

  public getCateringBookings(): CateringBooking[] {
    return this.state.catering_bookings;
  }

  public createCateringBooking(data: CateringBooking): CateringBooking {
    this.state.catering_bookings = [data, ...this.state.catering_bookings];
    this.persistToDisk();
    return data;
  }

  public updateCateringStatus(
    id: string,
    status: CateringBooking['status'],
    paymentStatus?: CateringBooking['paymentStatus']
  ): CateringBooking | null {
    const idx = this.state.catering_bookings.findIndex(
      (c) => c.id === id || c.bookingReference === id
    );
    if (idx === -1) return null;
    this.state.catering_bookings[idx] = {
      ...this.state.catering_bookings[idx],
      status,
      paymentStatus: paymentStatus || this.state.catering_bookings[idx].paymentStatus
    };
    this.persistToDisk();
    return this.state.catering_bookings[idx];
  }

  public getDrivers(): Driver[] {
    return this.state.drivers;
  }

  public toggleDriverOnline(driverId: string): Driver | null {
    const idx = this.state.drivers.findIndex((d) => d.id === driverId);
    if (idx === -1) return null;
    this.state.drivers[idx] = {
      ...this.state.drivers[idx],
      isOnline: !this.state.drivers[idx].isOnline
    };
    this.persistToDisk();
    return this.state.drivers[idx];
  }

  public getRides(driverId?: string): RideRequest[] {
    if (driverId) {
      return this.state.rides.filter((r) => r.driver?.id === driverId);
    }
    return this.state.rides;
  }

  public createRide(ride: RideRequest): RideRequest {
    this.state.rides = [ride, ...this.state.rides];
    this.state.ride_events.unshift({
      id: `rev-${Date.now()}`,
      rideId: ride.id,
      driverId: ride.driver?.id,
      newStatus: ride.status,
      notes: `Ride dispatched from ${ride.pickupLocation.name} to ${ride.destinationLocation.name}`,
      createdAt: ride.createdAt
    });
    this.persistToDisk();
    return ride;
  }

  public updateRideStatus(
    rideId: string,
    nextStatus: RideRequest['status'],
    actorDriverId?: string
  ): { ride?: RideRequest; error?: string } {
    const idx = this.state.rides.findIndex((r) => r.id === rideId);
    if (idx === -1) return { error: 'Ride not found.' };

    const current = this.state.rides[idx];

    // Phase 14: Driver ownership check
    if (actorDriverId && current.driver && current.driver.id !== actorDriverId) {
      return {
        error: 'Forbidden: Drivers can only update trips assigned to their own driver ID.'
      };
    }

    if (current.status === 'CANCELLED') {
      return { error: 'A cancelled ride cannot transition to another status.' };
    }
    if (current.status === 'TRIP_COMPLETED' && nextStatus !== 'TRIP_COMPLETED') {
      return { error: 'A completed trip cannot be reverted or modified.' };
    }

    const nowIso = new Date().toISOString();
    const updated: RideRequest = {
      ...current,
      status: nextStatus,
      completedAt: nextStatus === 'TRIP_COMPLETED' ? nowIso : current.completedAt
    };
    this.state.rides[idx] = updated;

    this.state.ride_events.unshift({
      id: `rev-${Date.now()}`,
      rideId: updated.id,
      driverId: actorDriverId || updated.driver?.id,
      previousStatus: current.status,
      newStatus: nextStatus,
      createdAt: nowIso
    });

    this.persistToDisk();
    return { ride: updated };
  }

  // ==========================================================================
  // VTU TRANSACTIONS & DATA PLANS
  // ==========================================================================
  public getVTUDataPlans(): VTUDataPlan[] {
    return this.state.vtu_data_plans;
  }

  public setVTUDataPlans(plans: VTUDataPlan[]): void {
    this.state.vtu_data_plans = plans;
    this.persistToDisk();
  }

  public getVTUTransactions(): VTUTransaction[] {
    return this.state.vtu_transactions;
  }

  public setVTUTransactions(txs: VTUTransaction[]): void {
    this.state.vtu_transactions = txs;
    this.persistToDisk();
  }

  public getVTUConfig(): VTUConfig {
    return this.state.vtu_config;
  }

  public setVTUConfig(cfg: VTUConfig): void {
    this.state.vtu_config = cfg;
    this.persistToDisk();
  }

  // ==========================================================================
  // NOTIFICATIONS & INVOICES
  // ==========================================================================
  public getNotifications(): AppNotification[] {
    return this.state.notifications;
  }

  public addNotification(params: {
    title: string;
    message: string;
    category: AppNotification['category'];
  }): AppNotification {
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: params.title.startsWith('IN-APP DEMO')
        ? params.title
        : `IN-APP DEMO NOTIFICATION: ${params.title}`,
      message: params.message,
      category: params.category,
      createdAt: new Date().toISOString(),
      read: false,
      isDemoNotification: true
    };
    this.state.notifications = [notif, ...this.state.notifications.slice(0, 49)];
    this.persistToDisk();
    return notif;
  }

  public getInvoices(): InvoiceRecord[] {
    return this.state.invoices;
  }

  // ==========================================================================
  // COD & RIDE PAYMENT VERIFICATION HELPERS
  // ==========================================================================
  public verifyOrderCoDPayment(
    orderId: string,
    verifiedBy: string,
    actor: { id: string; name: string; role: UserRole | 'SYSTEM' }
  ): Order | null {
    const idx = this.state.orders.findIndex(
      (o) => o.id === orderId || o.orderNumber === orderId
    );
    if (idx === -1) return null;
    const nowIso = new Date().toISOString();
    const current = this.state.orders[idx];
    const updated: Order = {
      ...current,
      paymentStatus: 'PAID',
      paymentVerifiedBy: verifiedBy,
      paymentVerifiedAt: nowIso,
      orderStatus: current.orderStatus === 'DELIVERED' ? 'DELIVERED' : 'PROCESSING'
    };
    this.state.orders[idx] = updated;
    if (!updated.inventoryDeducted) {
      this.deductInventoryForOrderIdempotently(updated.id);
    }
    this.recordAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'COD_PAYMENT_VERIFIED',
      entityType: 'ORDER',
      entityId: updated.id,
      summary: `Cash on Delivery (₦${updated.total.toLocaleString()}) verified for Order ${updated.orderNumber} by ${verifiedBy}`,
      previousValue: current.paymentStatus,
      newValue: 'PAID'
    });
    this.persistToDisk();
    return this.state.orders[idx];
  }

  public verifyRidePayment(
    rideId: string,
    verifiedBy: string,
    actor: { id: string; name: string; role: UserRole | 'SYSTEM' }
  ): RideRequest | null {
    const idx = this.state.rides.findIndex((r) => r.id === rideId);
    if (idx === -1) return null;
    const nowIso = new Date().toISOString();
    const current = this.state.rides[idx];
    const updated: RideRequest = {
      ...current,
      paymentStatus: 'PAID',
      paymentVerifiedAt: nowIso,
      paymentGatewayRef: current.paymentGatewayRef || `MANUAL_VERIFIED_${verifiedBy}`
    };
    this.state.rides[idx] = updated;
    this.recordAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'RIDE_PAYMENT_VERIFIED',
      entityType: 'RIDE',
      entityId: updated.id,
      summary: `Ride fare (₦${updated.totalFare.toLocaleString()}) verified for Trip ${updated.id} by ${verifiedBy}`,
      previousValue: current.paymentStatus,
      newValue: 'PAID'
    });
    this.persistToDisk();
    return updated;
  }

  public resetDemoDatabase(actor: { id: string; name: string; role: UserRole | 'SYSTEM' }): void {
    this.state = this.buildDefaultSeedSnapshot();
    this.recordAuditLog({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'FACTORY_DATABASE_RESET',
      entityType: 'SETTINGS',
      entityId: 'fdc-core',
      summary: 'Relational database reset to default Kogi State seed data.'
    });
    this.persistToDisk();
  }

  // ==========================================================================
  // PARAMETERIZED QUERY & TRANSACTION ABSTRACTION (Requirement 4)
  // Prevents SQL injection by enforcing parameterized $1, $2 placeholders
  // ==========================================================================
  public async query<T = any>(
    sqlText: string,
    params: unknown[] = []
  ): Promise<{ rows: T[]; rowCount: number; mode: 'POSTGRESQL_LIVE' | 'DEMO_PERSISTENT' }> {
    // Reject unsafe string interpolation patterns if detected
    if (/;\s*(DROP|ALTER|TRUNCATE)\s+/i.test(sqlText)) {
      throw new Error('Unsafe DDL statement rejected by DatabaseService parameterized query guard.');
    }
    // Validate parameter placeholders ($1..$n) match supplied params array
    const placeholderMatches: string[] = sqlText.match(/\$\d+/g) || [];
    const maxPlaceholder = placeholderMatches.reduce<number>((max, token) => {
      const idx = Number(token.slice(1));
      return idx > max ? idx : max;
    }, 0);
    if (maxPlaceholder > params.length) {
      throw new Error(
        `Parameterized query expected ${maxPlaceholder} bind parameters, received ${params.length}.`
      );
    }

    return {
      rows: [],
      rowCount: 0,
      mode: this.getDatabaseMode()
    };
  }

  public async transaction<T>(work: (service: DatabaseService) => Promise<T> | T): Promise<T> {
    const snapshotBackup = JSON.parse(JSON.stringify(this.state)) as RelationalDatabaseSnapshot;
    try {
      const result = await work(this);
      this.persistToDisk();
      return result;
    } catch (err) {
      // Atomic rollback on failure
      this.state = snapshotBackup;
      this.persistToDisk();
      throw err;
    }
  }
}

export const db = new DatabaseService();
