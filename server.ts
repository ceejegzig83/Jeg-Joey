import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  VTUNetwork,
  VTUDataPlan,
  VTUTransaction,
  VTUConfig,
  SystemArchitectureStatus,
  PayableEntityType
} from './src/types/index.ts';
import { VTU_NETWORKS } from './src/data/vtuData.ts';
import { validateNigerianPhone } from './src/utils/nigerianPhone.ts';
import { createVTUProvider } from './src/server/vtu/VTUProvider.ts';
import { db } from './src/server/db/DatabaseService.ts';
import {
  attachAuthContext,
  requireAuth,
  requireRole,
  hashPassword,
  verifyPassword,
  signJwtToken,
  isLiveJwtConfigured,
  createRateLimiter,
  securityHeadersMiddleware
} from './src/server/security/AuthService.ts';
import { paystackService } from './src/server/payments/PaystackService.ts';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Idempotency map for VTU transactions
const processedVTUIdempotencyKeys = new Map<string, string>();

function generateTransactionId(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `FDC-${yyyy}${mm}${dd}-${randomDigits}`;
}

function resolveActor(req: express.Request): {
  id: string;
  name: string;
  role: 'CUSTOMER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN' | 'SYSTEM';
} {
  if (req.authUser) {
    return {
      id: req.authUser.userId,
      name: req.authUser.name,
      role: req.authUser.role
    };
  }
  return {
    id: 'ADMIN_PORTAL',
    name: 'HQ Administrator',
    role: 'SUPER_ADMIN'
  };
}

function buildSystemStatus(): SystemArchitectureStatus {
  const vtuProvider = createVTUProvider(db.getVTUDataPlans());
  const isLivePaystack = paystackService.isLiveConfigured();
  const isLiveDb = db.isPostgresConfigured();

  return {
    environment: process.env.NODE_ENV || 'development',
    operationalMode: isLivePaystack || isLiveDb ? 'PRODUCTION_MODE' : 'DEMO_MODE',
    database: {
      mode: db.getDatabaseMode(),
      connected: true,
      engine: isLiveDb ? 'PostgreSQL 15+ (Connection Pool)' : 'Relational Snapshot Engine (Demo Persistent)',
      entitiesCount: db.getEntitiesCount()
    },
    paystack: {
      mode: paystackService.getMode(),
      configured: isLivePaystack,
      webhookEndpoint: '/api/payments/webhook'
    },
    vtu: {
      mode: vtuProvider.isLive ? 'LIVE_MODE' : 'TEST_MODE',
      providerName: vtuProvider.providerName,
      configured: vtuProvider.isLive
    },
    security: {
      jwtConfigured: isLiveJwtConfigured(),
      rbacEnabled: true,
      webhookHmacEnabled: true,
      auditLoggingEnabled: true,
      rateLimitingEnabled: true
    }
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Capture raw body for Paystack HMAC SHA512 webhook signature verification
  app.use(
    express.json({
      limit: '2mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf8');
      }
    })
  );

  app.use(securityHeadersMiddleware);
  app.use(attachAuthContext);

  const authRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 25,
    message: 'Too many authentication attempts. Please wait 60 seconds and try again.'
  });

  const paymentRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 40,
    message: 'Too many payment requests from this IP. Please wait a moment.'
  });

  // ==========================================================================
  // 1. HEALTH & SYSTEM ARCHITECTURE STATUS (Requirement 20)
  // ==========================================================================
  app.get('/api/health', (_req, res) => {
    const status = buildSystemStatus();
    res.json({
      ok: true,
      service: 'FLOURISH DESTINY COLLECTION — SUPER APP API',
      timestamp: new Date().toISOString(),
      status
    });
  });

  app.get('/api/system/status', (_req, res) => {
    res.json({
      success: true,
      status: buildSystemStatus()
    });
  });

  // ==========================================================================
  // 2. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (Requirements 5, 14, 15, 16)
  // ==========================================================================
  app.post('/api/auth/register', authRateLimiter, (req, res) => {
    try {
      const { name, email, phone, password, defaultAddress, defaultArea } = req.body || {};
      if (!name || !phone || !password) {
        return res.status(400).json({
          success: false,
          error: 'Name, Nigerian phone number, and password are required.'
        });
      }

      const phoneCheck = validateNigerianPhone(String(phone));
      if (!phoneCheck.isValid) {
        return res.status(400).json({
          success: false,
          error: phoneCheck.error || 'Invalid 11-digit Nigerian phone number.'
        });
      }

      const cleanEmail = String(email || `${phoneCheck.normalized}@flourishdestiny.ng`)
        .trim()
        .toLowerCase();

      const existing =
        db.findUserByEmailOrPhone(cleanEmail) ||
        db.findUserByEmailOrPhone(phoneCheck.normalized);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email or phone number already exists. Please sign in.'
        });
      }

      const { hash, salt } = hashPassword(String(password));
      const { user, customer } = db.createCustomerUser({
        name: String(name).trim(),
        email: cleanEmail,
        phone: phoneCheck.normalized,
        passwordHash: hash,
        passwordSalt: salt,
        defaultAddress: defaultAddress || 'Okene Central, Kogi State',
        defaultArea: defaultArea || 'Okene Central'
      });

      const token = signJwtToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role
      });

      db.recordAuditLog({
        actorId: user.id,
        actorName: user.name,
        actorRole: 'CUSTOMER',
        action: 'CUSTOMER_REGISTERED',
        entityType: 'AUTH',
        entityId: user.id,
        summary: `Customer account registered: ${user.name} (${user.phone})`
      });

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          defaultAddress: customer.defaultAddress,
          defaultArea: customer.defaultArea
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Unable to complete registration at this time.'
      });
    }
  });

  app.post('/api/auth/login', authRateLimiter, (req, res) => {
    try {
      const { identifier, email, phone, username, password } = req.body || {};
      const lookup = String(identifier || email || phone || username || '').trim();
      const plainPass = String(password || '');

      if (!lookup || !plainPass) {
        return res.status(400).json({
          success: false,
          error: 'Email/phone and password are required.'
        });
      }

      const user = db.findUserByEmailOrPhone(lookup);
      if (!user || !verifyPassword(plainPass, user.passwordHash, user.passwordSalt)) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials. Please check your email/phone and password.'
        });
      }

      const customer = db.getCustomerByUserIdOrPhone(user.id, user.phone);
      const token = signJwtToken({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        driverId: user.driverId
      });

      db.recordAuditLog({
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        action: 'USER_LOGIN',
        entityType: 'AUTH',
        entityId: user.id,
        summary: `${user.role} signed in: ${user.name} (${user.email})`
      });

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          driverId: user.driverId,
          defaultAddress: customer?.defaultAddress || 'Okene Central, Kogi State',
          defaultArea: customer?.defaultArea || 'Okene Central'
        }
      });
    } catch {
      return res.status(500).json({
        success: false,
        error: 'Authentication service error.'
      });
    }
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const auth = req.authUser!;
    const customer = db.getCustomerByUserIdOrPhone(auth.userId, auth.phone);
    res.json({
      success: true,
      user: {
        id: auth.userId,
        name: auth.name,
        email: auth.email,
        phone: auth.phone,
        role: auth.role,
        driverId: auth.driverId,
        defaultAddress: customer?.defaultAddress || 'Okene Central, Kogi State',
        defaultArea: customer?.defaultArea || 'Okene Central'
      }
    });
  });

  app.put('/api/auth/profile', (req, res) => {
    const { name, phone, email, defaultAddress, defaultArea } = req.body || {};
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name and phone number are required.'
      });
    }
    const updated = db.upsertCustomerProfile({
      userId: req.authUser?.userId,
      name: String(name).trim(),
      phone: String(phone).trim(),
      email: String(email || 'customer@flourishdestiny.ng').trim(),
      defaultAddress: String(defaultAddress || 'Okene Central, Kogi State').trim(),
      defaultArea: String(defaultArea || 'Okene Central').trim()
    });
    return res.json({
      success: true,
      customer: updated
    });
  });

  // Admin Portal Authentication (Supports both env credentials and hashed DB admin record)
  app.post('/api/admin/login', authRateLimiter, (req, res) => {
    const { username, password } = req.body || {};
    const expectedEmail = (process.env.ADMIN_EMAIL || 'ceejegzig83@gmail.com')
      .trim()
      .toLowerCase();
    const expectedPass = process.env.ADMIN_PASSWORD || 'ceejegzig83';

    const normalizedUser = String(username || '').trim().toLowerCase();
    const dbUser = db.findUserByEmailOrPhone(normalizedUser);

    const isEnvAdminMatch =
      (normalizedUser === expectedEmail || normalizedUser === 'admin') &&
      String(password || '') === expectedPass;

    const isDbAdminMatch =
      dbUser &&
      (dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN') &&
      verifyPassword(String(password || ''), dbUser.passwordHash, dbUser.passwordSalt);

    if (isEnvAdminMatch || isDbAdminMatch) {
      const token = signJwtToken({
        userId: dbUser?.id || 'usr-admin-001',
        email: dbUser?.email || expectedEmail,
        phone: dbUser?.phone || '09162723865',
        name: dbUser?.name || 'HQ Master Administrator',
        role: 'SUPER_ADMIN'
      });

      db.recordAuditLog({
        actorId: dbUser?.id || 'usr-admin-001',
        actorName: dbUser?.name || 'HQ Master Administrator',
        actorRole: 'SUPER_ADMIN',
        action: 'ADMIN_LOGIN_SUCCESS',
        entityType: 'AUTH',
        entityId: 'adm-001',
        summary: `Administrator authenticated via HQ Admin Portal (${normalizedUser}).`,
        ipAddress: req.socket.remoteAddress
      });

      return res.json({
        success: true,
        role: 'SUPER_ADMIN',
        token,
        authenticatedAt: new Date().toISOString()
      });
    }

    db.recordAuditLog({
      actorId: 'UNAUTHENTICATED',
      actorName: normalizedUser || 'Unknown',
      actorRole: 'CUSTOMER',
      action: 'ADMIN_LOGIN_FAILED',
      entityType: 'AUTH',
      entityId: 'adm-001',
      summary: `Failed administrator login attempt for username "${normalizedUser}".`,
      ipAddress: req.socket.remoteAddress
    });

    return res.status(401).json({
      success: false,
      error: 'Invalid Administrator username or password. Access denied.'
    });
  });

  // ==========================================================================
  // 3. PAYSTACK PAYMENT API (Requirements 6, 7, 8, 9, 10, 11)
  // ==========================================================================
  app.post('/api/payments/initialize', paymentRateLimiter, async (req, res) => {
    try {
      const {
        entityType = 'ORDER',
        entityId,
        orderId,
        channel,
        customerEmail,
        customerPhone,
        idempotencyKey,
        callbackUrl,
        amount // Browser-submitted amount is checked for tampering, NEVER trusted
      } = req.body || {};

      const result = await paystackService.initializeTransaction({
        entityType: entityType as PayableEntityType,
        entityId: String(entityId || orderId || ''),
        orderId: orderId ? String(orderId) : undefined,
        channel,
        customerEmail,
        customerPhone,
        customerId: req.authUser?.userId,
        idempotencyKey,
        callbackUrl,
        clientSubmittedAmount: amount !== undefined ? Number(amount) : undefined
      });

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Failed to initialize payment transaction.'
      });
    }
  });

  app.get('/api/payments/verify/:reference', async (req, res) => {
    try {
      const simulatedOutcome =
        (req.query.simulatedOutcome as 'SUCCESS' | 'FAILED' | 'ABANDONED' | undefined) ||
        'SUCCESS';
      const result = await paystackService.verifyTransaction({
        reference: req.params.reference,
        simulatedOutcome
      });
      return res.status(result.statusCode || 200).json(result);
    } catch {
      return res.status(500).json({
        success: false,
        error: 'Payment verification error.'
      });
    }
  });

  app.post('/api/payments/verify', async (req, res) => {
    try {
      const { reference, simulatedOutcome = 'SUCCESS' } = req.body || {};
      const result = await paystackService.verifyTransaction({
        reference: String(reference || ''),
        simulatedOutcome
      });
      return res.status(result.statusCode || 200).json(result);
    } catch {
      return res.status(500).json({
        success: false,
        error: 'Payment verification error.'
      });
    }
  });

  // Official Paystack Webhook Endpoint (Requirement 7 & 9)
  app.post('/api/payments/webhook', async (req: any, res) => {
    try {
      const rawPayload =
        typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(req.body || {});
      const signatureHeader = req.headers['x-paystack-signature'] as string | undefined;

      const result = await paystackService.processWebhookEvent({
        rawPayload,
        body: req.body,
        signatureHeader
      });

      return res.status(result.statusCode).json({
        received: result.accepted,
        idempotentReplay: result.idempotentReplay,
        message: result.message
      });
    } catch {
      return res.status(500).json({ error: 'Webhook processing error' });
    }
  });

  app.get('/api/payments', (_req, res) => {
    res.json({
      success: true,
      mode: paystackService.getMode(),
      payments: db.getPayments(),
      events: db.getPaymentEvents().slice(0, 100)
    });
  });

  app.post(
    '/api/payments/:reference/refund',
    requireRole(['ADMIN', 'SUPER_ADMIN']),
    (req, res) => {
      const transition = db.transitionPaymentAndFulfillEntity({
        reference: req.params.reference,
        targetStatus: 'REFUNDED',
        source: 'ADMIN_ACTION',
        verifiedBy: 'ADMIN_MANUAL',
        eventType: 'admin.refund',
        payloadSummary: req.body?.reason || 'Refunded by HQ Administrator'
      });

      if (!transition.success) {
        return res.status(400).json({
          success: false,
          error: transition.error || 'Could not refund payment.'
        });
      }

      return res.json({
        success: true,
        payment: transition.payment,
        order: transition.order
      });
    }
  );

  // ==========================================================================
  // 4. PRODUCTS & INVENTORY API (Requirements 3, 11, 14, 16)
  // ==========================================================================
  app.get('/api/products', (_req, res) => {
    res.json({
      success: true,
      products: db.getProducts(),
      inventory: db.getInventory()
    });
  });

  app.post('/api/admin/products', requireRole(['ADMIN', 'SUPER_ADMIN']), (req, res) => {
    const product = req.body;
    if (!product || !product.id || !product.name || Number(product.price) < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid product id, name, and non-negative price are required.'
      });
    }
    const saved = db.saveProduct(product, resolveActor(req));
    return res.json({
      success: true,
      product: saved,
      products: db.getProducts()
    });
  });

  app.put('/api/admin/products/:id', requireRole(['ADMIN', 'SUPER_ADMIN']), (req, res) => {
    const product = { ...req.body, id: req.params.id };
    const saved = db.saveProduct(product, resolveActor(req));
    return res.json({
      success: true,
      product: saved,
      products: db.getProducts()
    });
  });

  app.delete('/api/admin/products/:id', requireRole(['ADMIN', 'SUPER_ADMIN']), (req, res) => {
    const deleted = db.deleteProduct(req.params.id, resolveActor(req));
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    return res.json({
      success: true,
      products: db.getProducts()
    });
  });

  app.patch(
    '/api/admin/inventory/:productId',
    requireRole(['ADMIN', 'SUPER_ADMIN']),
    (req, res) => {
      const { stockCount, inStock } = req.body || {};
      const updated = db.adjustInventory(
        req.params.productId,
        Number(stockCount ?? 0),
        inStock,
        resolveActor(req)
      );
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }
      return res.json({
        success: true,
        product: updated,
        products: db.getProducts()
      });
    }
  );

  // ==========================================================================
  // 5. UNIFIED STORE ORDERS API (Requirements 8, 10, 11, 12)
  // ==========================================================================
  app.get('/api/orders', (req, res) => {
    const phone = req.query.phone as string | undefined;
    res.json({
      success: true,
      orders: db.getOrders(phone)
    });
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = db.getOrderByIdOrNumber(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }
    return res.json({ success: true, order });
  });

  app.post('/api/orders', (req, res) => {
    try {
      const {
        id,
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        deliveryArea,
        items,
        paymentMethod,
        notes,
        estimatedDeliveryTime
      } = req.body || {};

      if (!customerName || !customerPhone || !customerAddress) {
        return res.status(400).json({
          success: false,
          error: 'Customer name, Nigerian phone number, and delivery address are required.'
        });
      }

      const phoneCheck = validateNigerianPhone(String(customerPhone));
      if (!phoneCheck.isValid) {
        return res.status(400).json({
          success: false,
          error: phoneCheck.error || 'Invalid Nigerian phone number.'
        });
      }

      const created = db.createOrderServerSide({
        id,
        orderNumber,
        customerId: req.authUser?.userId,
        customerName: String(customerName),
        customerPhone: phoneCheck.normalized,
        customerEmail: customerEmail ? String(customerEmail) : req.authUser?.email,
        customerAddress: String(customerAddress),
        deliveryArea: String(deliveryArea || 'Okene Central'),
        items: Array.isArray(items) ? items : [],
        paymentMethod: paymentMethod || 'PAYSTACK_CARD',
        notes,
        estimatedDeliveryTime
      });

      if (created.error || !created.order) {
        return res.status(400).json({
          success: false,
          error: created.error || 'Could not create order.'
        });
      }

      return res.status(201).json({
        success: true,
        order: created.order,
        invoice: created.invoice,
        products: db.getProducts()
      });
    } catch {
      return res.status(500).json({
        success: false,
        error: 'Failed to create order on server.'
      });
    }
  });

  app.patch(
    '/api/orders/:id/status',
    requireRole(['ADMIN', 'SUPER_ADMIN']),
    (req, res) => {
      const { orderStatus, paymentStatus } = req.body || {};
      const result = db.updateOrderStatus(
        req.params.id,
        orderStatus,
        paymentStatus,
        resolveActor(req)
      );
      if (result.error || !result.order) {
        return res.status(400).json({
          success: false,
          error: result.error || 'Could not update order status.'
        });
      }
      return res.json({
        success: true,
        order: result.order,
        products: db.getProducts()
      });
    }
  );

  app.post(
    '/api/orders/:id/verify-cod',
    requireRole(['ADMIN', 'SUPER_ADMIN']),
    (req, res) => {
      const verifiedBy = req.body?.verifiedBy || 'HQ Admin (09162723865)';
      const order = db.verifyOrderCoDPayment(req.params.id, verifiedBy, resolveActor(req));
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found.' });
      }
      return res.json({
        success: true,
        order,
        products: db.getProducts()
      });
    }
  );

  // ==========================================================================
  // 6. TAILORING, CAKES, CATERING, RIDES & DRIVERS (Requirements 15, 17, 18)
  // ==========================================================================
  app.get('/api/tailoring', (_req, res) => {
    res.json({ success: true, tailoringRequests: db.getTailoringOrders() });
  });

  app.post('/api/tailoring', (req, res) => {
    const created = db.createTailoringOrder(req.body);
    res.status(201).json({ success: true, tailoringRequest: created });
  });

  app.patch('/api/tailoring/:id/status', requireRole(['ADMIN', 'SUPER_ADMIN']), (req, res) => {
    const { status, paymentStatus } = req.body || {};
    const updated = db.updateTailoringStatus(req.params.id, status, paymentStatus);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Tailoring order not found.' });
    }
    db.recordAuditLog({
      actorId: resolveActor(req).id,
      actorName: resolveActor(req).name,
      actorRole: resolveActor(req).role,
      action: 'TAILORING_STAGE_UPDATED',
      entityType: 'TAILORING',
      entityId: updated.id,
      summary: `Tailoring ${updated.orderReference || updated.id} stage updated to ${status}`
    });
    return res.json({ success: true, tailoringRequest: updated });
  });

  app.get('/api/cakes', (_req, res) => {
    res.json({ success: true, cakeOrders: db.getCakeOrders() });
  });

  app.post('/api/cakes', (req, res) => {
    const created = db.createCakeOrder(req.body);
    res.status(201).json({ success: true, cakeOrder: created });
  });

  app.patch('/api/cakes/:id/status', requireRole(['ADMIN', 'SUPER_ADMIN']), (req, res) => {
    const { status, paymentStatus } = req.body || {};
    const updated = db.updateCakeStatus(req.params.id, status, paymentStatus);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Cake order not found.' });
    }
    db.recordAuditLog({
      actorId: resolveActor(req).id,
      actorName: resolveActor(req).name,
      actorRole: resolveActor(req).role,
      action: 'CAKE_STATUS_UPDATED',
      entityType: 'CAKE',
      entityId: updated.id,
      summary: `Cake order ${updated.orderReference || updated.id} updated to ${status}`
    });
    return res.json({ success: true, cakeOrder: updated });
  });

  app.get('/api/catering', (_req, res) => {
    res.json({ success: true, cateringBookings: db.getCateringBookings() });
  });

  app.post('/api/catering', (req, res) => {
    const created = db.createCateringBooking(req.body);
    res.status(201).json({ success: true, cateringBooking: created });
  });

  app.patch('/api/catering/:id/status', requireRole(['ADMIN', 'SUPER_ADMIN']), (req, res) => {
    const { status, paymentStatus } = req.body || {};
    const updated = db.updateCateringStatus(req.params.id, status, paymentStatus);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Catering booking not found.' });
    }
    db.recordAuditLog({
      actorId: resolveActor(req).id,
      actorName: resolveActor(req).name,
      actorRole: resolveActor(req).role,
      action: 'CATERING_STATUS_UPDATED',
      entityType: 'CATERING',
      entityId: updated.id,
      summary: `Catering booking ${updated.bookingReference || updated.id} updated to ${status}`
    });
    return res.json({ success: true, cateringBooking: updated });
  });

  app.get('/api/drivers', (_req, res) => {
    res.json({ success: true, drivers: db.getDrivers() });
  });

  app.post('/api/drivers/:id/toggle-online', (req, res) => {
    const driver = db.toggleDriverOnline(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found.' });
    }
    return res.json({ success: true, driver, drivers: db.getDrivers() });
  });

  app.get('/api/rides', (req, res) => {
    const driverId = req.query.driverId as string | undefined;
    res.json({ success: true, rides: db.getRides(driverId) });
  });

  app.post('/api/rides', (req, res) => {
    const ride = db.createRide(req.body);
    res.status(201).json({ success: true, ride });
  });

  app.patch('/api/rides/:id/status', (req, res) => {
    const { status, driverId } = req.body || {};
    const actorDriverId = req.authUser?.driverId || driverId;
    const result = db.updateRideStatus(req.params.id, status, actorDriverId);
    if (result.error || !result.ride) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Unable to update ride status.'
      });
    }
    return res.json({ success: true, ride: result.ride });
  });

  app.post('/api/rides/:id/verify-payment', requireRole(['ADMIN', 'SUPER_ADMIN']), (req, res) => {
    const verifiedBy = req.body?.verifiedBy || 'HQ Transport Admin';
    const ride = db.verifyRidePayment(req.params.id, verifiedBy, resolveActor(req));
    if (!ride) {
      return res.status(404).json({ success: false, error: 'Ride not found.' });
    }
    return res.json({ success: true, ride });
  });

  app.get('/api/invoices', (_req, res) => {
    res.json({ success: true, invoices: db.getInvoices() });
  });

  app.get('/api/notifications', (_req, res) => {
    res.json({ success: true, notifications: db.getNotifications() });
  });

  app.get('/api/admin/audit-logs', (_req, res) => {
    res.json({
      success: true,
      auditLogs: db.getAuditLogs(150)
    });
  });

  app.post('/api/admin/reset-demo-db', requireRole(['ADMIN', 'SUPER_ADMIN']), (req, res) => {
    db.resetDemoDatabase(resolveActor(req));
    res.json({
      success: true,
      status: buildSystemStatus()
    });
  });

  // ==========================================================================
  // 7. VTU MODULE ENDPOINTS (Requirement 13 — Backed by DatabaseService)
  // ==========================================================================
  app.get('/api/vtu/config', (_req, res) => {
    const vtuDataPlans = db.getVTUDataPlans();
    const provider = createVTUProvider(vtuDataPlans);
    const livePaystack = paystackService.isLiveConfigured();
    const storedCfg = db.getVTUConfig();
    const currentConfig: VTUConfig = {
      ...storedCfg,
      isLivePaystack: livePaystack,
      mode: livePaystack && provider.isLive ? 'LIVE_MODE' : 'TEST_MODE',
      vtuProviderName: provider.providerName
    };
    res.json({
      success: true,
      config: currentConfig,
      networks: VTU_NETWORKS.map((n) => ({
        ...n,
        enabled: currentConfig.networksEnabled[n.id] ?? true
      }))
    });
  });

  app.get('/api/vtu/networks', async (_req, res) => {
    const provider = createVTUProvider(db.getVTUDataPlans());
    const networks = await provider.getNetworks();
    const vtuConfig = db.getVTUConfig();
    res.json({
      success: true,
      networks: networks.map((n) => ({
        ...n,
        enabled: vtuConfig.networksEnabled[n.id] ?? true
      }))
    });
  });

  app.get('/api/vtu/data-plans', async (req, res) => {
    const network = (req.query.network as VTUNetwork | undefined)?.toUpperCase() as
      | VTUNetwork
      | undefined;
    const includeInactive = req.query.includeInactive === 'true';

    let plans = [...db.getVTUDataPlans()];
    if (!includeInactive) {
      plans = plans.filter((p) => p.status === 'ACTIVE');
    }
    if (network && ['MTN', 'AIRTEL', 'GLO', '9MOBILE'].includes(network)) {
      plans = plans.filter((p) => p.network === network);
    }

    res.json({
      success: true,
      mode: paystackService.getMode(),
      plans
    });
  });

  app.post('/api/vtu/transactions/initiate', paymentRateLimiter, async (req, res) => {
    try {
      const {
        type,
        network,
        phoneNumber,
        amount,
        planId,
        customerName,
        customerEmail,
        paymentMethod,
        idempotencyKey
      } = req.body || {};

      const vtuTransactions = db.getVTUTransactions();
      const vtuDataPlans = db.getVTUDataPlans();
      const vtuConfig = db.getVTUConfig();

      // Idempotency check
      if (idempotencyKey && processedVTUIdempotencyKeys.has(idempotencyKey)) {
        const existingId = processedVTUIdempotencyKeys.get(idempotencyKey)!;
        const existingTx = vtuTransactions.find((t) => t.id === existingId);
        if (existingTx) {
          return res.json({
            success: true,
            idempotentReplay: true,
            transaction: existingTx
          });
        }
      }

      const validNetworks: VTUNetwork[] = ['MTN', 'AIRTEL', 'GLO', '9MOBILE'];
      if (!validNetworks.includes(network)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid mobile network selected. Choose MTN, Airtel, Glo, or 9mobile.'
        });
      }

      if (!vtuConfig.networksEnabled[network as VTUNetwork]) {
        return res.status(400).json({
          success: false,
          error: `${network} VTU service is temporarily disabled for maintenance.`
        });
      }

      const phoneValidation = validateNigerianPhone(phoneNumber);
      if (!phoneValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: phoneValidation.error || 'Invalid Nigerian 11-digit phone number.'
        });
      }

      const normalizedPhone = phoneValidation.normalized;
      let nominalAmount = Number(amount);
      let serviceFee = 0;
      let providerCost = 0;
      let resolvedPlan: VTUDataPlan | undefined;

      if (type === 'AIRTIME') {
        if (
          isNaN(nominalAmount) ||
          nominalAmount < vtuConfig.minAirtimeAmount ||
          nominalAmount > vtuConfig.maxAirtimeAmount
        ) {
          return res.status(400).json({
            success: false,
            error: `Airtime amount must be between ₦${vtuConfig.minAirtimeAmount.toLocaleString()} and ₦${vtuConfig.maxAirtimeAmount.toLocaleString()}.`
          });
        }
        serviceFee = vtuConfig.airtimeServiceFee || 0;
        providerCost = Math.round(nominalAmount * 0.98);
      } else if (type === 'DATA') {
        resolvedPlan = vtuDataPlans.find(
          (p) => p.planId === planId && p.network === network && p.status === 'ACTIVE'
        );
        if (!resolvedPlan) {
          return res.status(400).json({
            success: false,
            error: 'Selected data plan is unavailable or inactive.'
          });
        }
        nominalAmount = resolvedPlan.customerPrice;
        serviceFee = vtuConfig.dataServiceFee || 0;
        providerCost = resolvedPlan.providerPrice;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid VTU service type. Must be AIRTIME or DATA.'
        });
      }

      const totalAmount = nominalAmount + serviceFee;
      const txId = generateTransactionId();
      const reference = `PSTK_${txId.replace(/-/g, '_')}`;
      const provider = createVTUProvider(vtuDataPlans);
      const isLive = paystackService.isLiveConfigured();

      const newTx: VTUTransaction = {
        id: txId,
        reference,
        idempotencyKey: idempotencyKey || undefined,
        type,
        network,
        phoneNumber: normalizedPhone,
        customerName: customerName || 'Valued Customer',
        customerEmail: customerEmail || 'customer@flourishdestiny.ng',
        amount: nominalAmount,
        serviceFee,
        totalAmount,
        providerCost,
        planId: resolvedPlan?.planId,
        planName: resolvedPlan?.name,
        planValidity: resolvedPlan?.validity,
        paymentMethod: paymentMethod || 'PAYSTACK_CARD',
        paymentStatus: 'PENDING',
        vtuProvider: provider.providerName,
        vtuStatusMessage: 'Awaiting payment confirmation from Paystack gateway.',
        status: 'PAYMENT_PENDING',
        mode: isLive && provider.isLive ? 'LIVE_MODE' : 'TEST_MODE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.setVTUTransactions([newTx, ...vtuTransactions]);
      if (idempotencyKey) {
        processedVTUIdempotencyKeys.set(idempotencyKey, newTx.id);
      }

      // Initialize corresponding PaymentRecord in DatabaseService
      const payInit = await paystackService.initializeTransaction({
        entityType: 'VTU',
        entityId: newTx.id,
        channel: newTx.paymentMethod,
        customerEmail: newTx.customerEmail,
        customerPhone: newTx.phoneNumber,
        idempotencyKey: idempotencyKey ? `vtu-pay-${idempotencyKey}` : undefined
      });

      return res.json({
        success: true,
        transaction: newTx,
        paymentSession: {
          mode: isLive ? 'LIVE_MODE' : 'TEST_MODE',
          reference: newTx.reference,
          amountNaira: totalAmount,
          amountKobo: Math.round(totalAmount * 100),
          authorizationUrl: payInit.authorizationUrl,
          accessCode: payInit.accessCode
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Failed to initiate VTU transaction.'
      });
    }
  });

  app.post('/api/vtu/payments/verify', async (req, res) => {
    try {
      const {
        reference,
        simulatedPaymentOutcome = 'SUCCESS',
        simulateProviderFailure = false
      } = req.body || {};

      const vtuTransactions = db.getVTUTransactions();
      const vtuDataPlans = db.getVTUDataPlans();

      const txIndex = vtuTransactions.findIndex(
        (t) => t.reference === reference || t.id === reference
      );

      if (txIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Transaction reference not found.'
        });
      }

      const tx = { ...vtuTransactions[txIndex] };

      // Requirement 11 & 13: Idempotent guard — never dispense airtime/data twice
      if (tx.status === 'SUCCESSFUL' || tx.status === 'REFUNDED' || tx.status === 'REVERSED') {
        return res.json({
          success: true,
          alreadyProcessed: true,
          transaction: tx
        });
      }

      const isLive = paystackService.isLiveConfigured();
      let isPaymentVerifiedSuccess = false;
      let gatewayReference = tx.paymentGatewayRef || '';

      if (isLive) {
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(tx.reference)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${paystackService.getSecretKey()}`
            }
          }
        );
        const verifyData = await verifyRes.json();
        if (
          verifyData.status &&
          verifyData.data &&
          verifyData.data.status === 'success' &&
          verifyData.data.amount >= Math.round(tx.totalAmount * 100)
        ) {
          isPaymentVerifiedSuccess = true;
          gatewayReference = String(verifyData.data.id || verifyData.data.reference);
        } else {
          tx.paymentStatus =
            verifyData?.data?.status === 'abandoned' ? 'ABANDONED' : 'FAILED';
          tx.status = 'FAILED';
          tx.vtuStatusMessage =
            'Paystack payment verification failed or was not completed. No airtime/data dispensed.';
          tx.updatedAt = new Date().toISOString();
          vtuTransactions[txIndex] = tx;
          db.setVTUTransactions(vtuTransactions);
          return res.json({
            success: false,
            error: tx.vtuStatusMessage,
            transaction: tx
          });
        }
      } else {
        if (simulatedPaymentOutcome === 'SUCCESS') {
          isPaymentVerifiedSuccess = true;
          gatewayReference = `PSTK_TEST_${Math.floor(100000 + Math.random() * 900000)}`;
        } else if (simulatedPaymentOutcome === 'ABANDONED') {
          tx.paymentStatus = 'ABANDONED';
          tx.status = 'FAILED';
          tx.vtuStatusMessage =
            '[TEST MODE] Payment checkout was abandoned by customer. VTU request cancelled.';
          tx.updatedAt = new Date().toISOString();
          vtuTransactions[txIndex] = tx;
          db.setVTUTransactions(vtuTransactions);
          return res.json({
            success: false,
            error: tx.vtuStatusMessage,
            transaction: tx
          });
        } else {
          tx.paymentStatus = 'FAILED';
          tx.status = 'FAILED';
          tx.paymentGatewayRef = `PSTK_TEST_DECLINED_${Date.now().toString().slice(-5)}`;
          tx.vtuStatusMessage =
            '[TEST MODE] Simulated payment declined by bank. VTU fulfillment blocked safely.';
          tx.updatedAt = new Date().toISOString();
          vtuTransactions[txIndex] = tx;
          db.setVTUTransactions(vtuTransactions);
          return res.json({
            success: false,
            error: tx.vtuStatusMessage,
            transaction: tx
          });
        }
      }

      if (!isPaymentVerifiedSuccess) {
        return res.status(400).json({
          success: false,
          error: 'Payment could not be verified.'
        });
      }

      tx.paymentStatus = 'SUCCESSFUL';
      tx.paymentGatewayRef = gatewayReference;
      tx.paymentVerifiedAt = new Date().toISOString();
      tx.status = 'PROCESSING';
      tx.updatedAt = new Date().toISOString();
      vtuTransactions[txIndex] = tx;
      db.setVTUTransactions(vtuTransactions);

      const provider = createVTUProvider(vtuDataPlans);
      const providerResult =
        tx.type === 'AIRTIME'
          ? await provider.purchaseAirtime({
              reference: tx.id,
              network: tx.network,
              phoneNumber: tx.phoneNumber,
              amount: tx.amount,
              simulateProviderFailure
            })
          : await provider.purchaseData({
              reference: tx.id,
              network: tx.network,
              phoneNumber: tx.phoneNumber,
              planId: tx.planId || '',
              planName: tx.planName || 'Data Bundle',
              amount: tx.amount,
              simulateProviderFailure
            });

      if (providerResult.success) {
        tx.status = 'SUCCESSFUL';
        tx.vtuProvider = providerResult.providerName;
        tx.vtuProviderRef = providerResult.providerReference;
        tx.vtuStatusMessage = providerResult.message;
        tx.completedAt = new Date().toISOString();
        tx.updatedAt = new Date().toISOString();
      } else {
        tx.status = 'REFUNDED';
        tx.paymentStatus = 'REFUNDED';
        tx.vtuProvider = providerResult.providerName;
        tx.vtuProviderRef = providerResult.providerReference;
        tx.vtuStatusMessage = providerResult.message;
        tx.updatedAt = new Date().toISOString();
      }

      vtuTransactions[txIndex] = tx;
      db.setVTUTransactions(vtuTransactions);

      db.recordAuditLog({
        actorId: 'VTU_GATEWAY',
        actorName: provider.providerName,
        actorRole: 'SYSTEM',
        action: `VTU_${tx.status}`,
        entityType: 'VTU',
        entityId: tx.id,
        summary: `VTU ${tx.network} ${tx.type} (₦${tx.totalAmount.toLocaleString()}) for ${tx.phoneNumber}: ${tx.status}`
      });

      return res.json({
        success: providerResult.success,
        transaction: tx
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: 'Error verifying payment and fulfilling VTU order.'
      });
    }
  });

  app.post('/api/vtu/webhooks/paystack', async (req: any, res) => {
    try {
      const rawPayload =
        typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(req.body || {});
      const signatureHeader = req.headers['x-paystack-signature'] as string | undefined;

      if (!paystackService.verifyWebhookSignature(rawPayload, signatureHeader)) {
        return res.status(401).json({ error: 'Invalid Paystack webhook signature' });
      }

      const event = req.body;
      if (event && event.event === 'charge.success' && event.data?.reference) {
        const reference = event.data.reference;
        const vtuTransactions = db.getVTUTransactions();
        const txIndex = vtuTransactions.findIndex((t) => t.reference === reference);
        if (txIndex !== -1) {
          const tx = { ...vtuTransactions[txIndex] };
          if (tx.status !== 'SUCCESSFUL' && tx.status !== 'PROCESSING') {
            tx.paymentStatus = 'SUCCESSFUL';
            tx.paymentGatewayRef = String(event.data.id || reference);
            tx.paymentVerifiedAt = new Date().toISOString();
            tx.status = 'PROCESSING';

            const provider = createVTUProvider(db.getVTUDataPlans());
            const result =
              tx.type === 'AIRTIME'
                ? await provider.purchaseAirtime({
                    reference: tx.id,
                    network: tx.network,
                    phoneNumber: tx.phoneNumber,
                    amount: tx.amount
                  })
                : await provider.purchaseData({
                    reference: tx.id,
                    network: tx.network,
                    phoneNumber: tx.phoneNumber,
                    planId: tx.planId || '',
                    planName: tx.planName || 'Data',
                    amount: tx.amount
                  });

            tx.status = result.success ? 'SUCCESSFUL' : 'REFUNDED';
            tx.vtuProviderRef = result.providerReference;
            tx.vtuStatusMessage = result.message;
            tx.updatedAt = new Date().toISOString();
            if (result.success) tx.completedAt = new Date().toISOString();
            vtuTransactions[txIndex] = tx;
            db.setVTUTransactions(vtuTransactions);
          }
        } else {
          // Delegate to general Paystack webhook handler if not a VTU reference
          await paystackService.processWebhookEvent({
            rawPayload,
            body: req.body,
            signatureHeader
          });
        }
      }

      return res.status(200).json({ received: true });
    } catch {
      return res.status(500).json({ error: 'Webhook processing error' });
    }
  });

  app.get('/api/vtu/transactions', (req, res) => {
    const { phone, type, status, network } = req.query;
    let list = [...db.getVTUTransactions()];

    if (phone && typeof phone === 'string' && phone.trim() !== '') {
      const clean = phone.trim();
      list = list.filter((t) => t.phoneNumber.includes(clean));
    }
    if (type && type !== 'ALL') {
      list = list.filter((t) => t.type === type);
    }
    if (status && status !== 'ALL') {
      list = list.filter((t) => t.status === status);
    }
    if (network && network !== 'ALL') {
      list = list.filter((t) => t.network === network);
    }

    res.json({
      success: true,
      transactions: list
    });
  });

  app.get('/api/vtu/transactions/:id', (req, res) => {
    const tx = db
      .getVTUTransactions()
      .find((t) => t.id === req.params.id || t.reference === req.params.id);
    if (!tx) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    return res.json({ success: true, transaction: tx });
  });

  app.post('/api/vtu/admin/plans', (req, res) => {
    const plan: VTUDataPlan = req.body;
    if (!plan.planId || !plan.network || !plan.name) {
      return res.status(400).json({ success: false, error: 'Missing required plan fields.' });
    }
    const plans = [...db.getVTUDataPlans()];
    const existingIdx = plans.findIndex((p) => p.planId === plan.planId);
    if (existingIdx > -1) {
      plans[existingIdx] = plan;
    } else {
      plans.unshift(plan);
    }
    db.setVTUDataPlans(plans);
    db.recordAuditLog({
      actorId: resolveActor(req).id,
      actorName: resolveActor(req).name,
      actorRole: resolveActor(req).role,
      action: 'VTU_PLAN_SAVED',
      entityType: 'VTU',
      entityId: plan.planId,
      summary: `Saved VTU Data Plan: ${plan.network} ${plan.name} (₦${plan.customerPrice})`
    });
    return res.json({ success: true, plan, plans });
  });

  app.delete('/api/vtu/admin/plans/:planId', (req, res) => {
    const nextPlans = db.getVTUDataPlans().filter((p) => p.planId !== req.params.planId);
    db.setVTUDataPlans(nextPlans);
    db.recordAuditLog({
      actorId: resolveActor(req).id,
      actorName: resolveActor(req).name,
      actorRole: resolveActor(req).role,
      action: 'VTU_PLAN_DELETED',
      entityType: 'VTU',
      entityId: req.params.planId,
      summary: `Deleted VTU Data Plan ${req.params.planId}`
    });
    return res.json({ success: true, plans: nextPlans });
  });

  app.post('/api/vtu/admin/settings', (req, res) => {
    const updated = {
      ...db.getVTUConfig(),
      ...req.body
    };
    db.setVTUConfig(updated);
    db.recordAuditLog({
      actorId: resolveActor(req).id,
      actorName: resolveActor(req).name,
      actorRole: resolveActor(req).role,
      action: 'VTU_CONFIG_UPDATED',
      entityType: 'SETTINGS',
      entityId: 'vtu-config',
      summary: 'Updated VTU gateway fees & telecom network availability.'
    });
    return res.json({ success: true, config: updated });
  });

  app.post('/api/vtu/admin/transactions/:id/action', async (req, res) => {
    const { action } = req.body || {};
    const vtuTransactions = [...db.getVTUTransactions()];
    const txIndex = vtuTransactions.findIndex((t) => t.id === req.params.id);
    if (txIndex === -1) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    const tx = { ...vtuTransactions[txIndex] };
    const provider = createVTUProvider(db.getVTUDataPlans());

    if (action === 'RETRY') {
      const result =
        tx.type === 'AIRTIME'
          ? await provider.purchaseAirtime({
              reference: tx.id,
              network: tx.network,
              phoneNumber: tx.phoneNumber,
              amount: tx.amount
            })
          : await provider.purchaseData({
              reference: tx.id,
              network: tx.network,
              phoneNumber: tx.phoneNumber,
              planId: tx.planId || '',
              planName: tx.planName || 'Data',
              amount: tx.amount
            });

      if (result.success) {
        tx.status = 'SUCCESSFUL';
        tx.paymentStatus = 'SUCCESSFUL';
        tx.vtuProviderRef = result.providerReference;
        tx.vtuStatusMessage = `[Admin Re-Dispatch] ${result.message}`;
        tx.completedAt = new Date().toISOString();
      }
    } else if (action === 'REFUND') {
      tx.status = 'REFUNDED';
      tx.paymentStatus = 'REFUNDED';
      tx.vtuStatusMessage = 'Payment refunded to customer by HQ Admin.';
    } else if (action === 'REVERSE') {
      tx.status = 'REVERSED';
      tx.vtuStatusMessage = 'Transaction reversed by HQ Admin.';
    } else if (action === 'MARK_SUCCESS') {
      tx.status = 'SUCCESSFUL';
      tx.paymentStatus = 'SUCCESSFUL';
      tx.completedAt = new Date().toISOString();
      tx.vtuStatusMessage = 'Manually verified & fulfilled by HQ Admin.';
    }

    tx.updatedAt = new Date().toISOString();
    vtuTransactions[txIndex] = tx;
    db.setVTUTransactions(vtuTransactions);

    db.recordAuditLog({
      actorId: resolveActor(req).id,
      actorName: resolveActor(req).name,
      actorRole: resolveActor(req).role,
      action: `VTU_ADMIN_${action}`,
      entityType: 'VTU',
      entityId: tx.id,
      summary: `Admin executed ${action} on VTU transaction ${tx.id} (${tx.phoneNumber})`
    });

    return res.json({ success: true, transaction: tx });
  });

  // ==========================================================================
  // VITE MIDDLEWARE (DEVELOPMENT) OR STATIC DIST (PRODUCTION)
  // ==========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const sys = buildSystemStatus();
    console.log(
      `[FLOURISH DESTINY COLLECTION] Server running on http://0.0.0.0:${PORT} | Mode: ${sys.operationalMode} | DB: ${sys.database.mode} | Paystack: ${sys.paystack.mode}`
    );
  });
}

startServer();
