-- ============================================================================
-- FLOURISH DESTINY COLLECTION — PRODUCTION RELATIONAL DATABASE SCHEMA
-- Compatible with PostgreSQL 15+ / Supabase / Cloud SQL
-- Note: Raw card details and Paystack secret keys are NEVER stored in the DB.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS (Core Identity & Authentication)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'DRIVER', 'ADMIN', 'SUPER_ADMIN')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CUSTOMERS (Customer Profile & Default Kogi Delivery Preferences)
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  email VARCHAR(255),
  default_address TEXT NOT NULL DEFAULT 'Okene Central, Kogi State',
  default_area VARCHAR(128) NOT NULL DEFAULT 'Okene Central',
  loyalty_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ADMINS (Authorized Staff & Role Permissions)
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(128) UNIQUE NOT NULL,
  department VARCHAR(128) NOT NULL DEFAULT 'HQ Master Control',
  access_level VARCHAR(32) NOT NULL DEFAULT 'SUPER_ADMIN',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DRIVERS (Kogi Intra-State Ride-Hailing Fleet)
CREATE TABLE IF NOT EXISTS drivers (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  photo TEXT,
  vehicle_type VARCHAR(16) NOT NULL CHECK (vehicle_type IN ('KEKE', 'CAR')),
  vehicle_model VARCHAR(128) NOT NULL,
  plate_number VARCHAR(32) UNIQUE NOT NULL,
  rating NUMERIC(3,2) NOT NULL DEFAULT 4.90,
  total_trips INTEGER NOT NULL DEFAULT 0,
  current_lat NUMERIC(10,6) NOT NULL DEFAULT 7.552200,
  current_lng NUMERIC(10,6) NOT NULL DEFAULT 6.235800,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CATEGORIES (Store Divisions & Sub-Categories)
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  division VARCHAR(32) NOT NULL CHECK (division IN ('FASHION', 'BAKERY', 'CATERING', 'GROCERY', 'TRANSPORT', 'VTU')),
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PRODUCTS (Fashion, Bakery, Grocery Catalog)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  division VARCHAR(32) NOT NULL CHECK (division IN ('FASHION', 'BAKERY', 'GROCERY')),
  category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
  category VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(12,2),
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  stock_count INTEGER NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  rating NUMERIC(3,2) NOT NULL DEFAULT 4.80,
  review_count INTEGER NOT NULL DEFAULT 0,
  badge VARCHAR(64),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. INVENTORY (Stock Ledger & Reservation Safety)
CREATE TABLE IF NOT EXISTS inventory (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  available_qty INTEGER NOT NULL DEFAULT 0 CHECK (available_qty >= 0),
  reserved_qty INTEGER NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  last_restocked_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ORDERS (Unified Store Orders)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(64) UNIQUE NOT NULL,
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  customer_email VARCHAR(255),
  customer_address TEXT NOT NULL,
  delivery_area VARCHAR(128) NOT NULL,
  division VARCHAR(32) NOT NULL DEFAULT 'MULTI',
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  discount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  tax NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
  total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  payment_method VARCHAR(32) NOT NULL,
  payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  payment_reference VARCHAR(128),
  payment_verified_by VARCHAR(128),
  payment_verified_at TIMESTAMPTZ,
  inventory_deducted BOOLEAN NOT NULL DEFAULT FALSE,
  order_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  estimated_delivery_time VARCHAR(128),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ORDER_ITEMS (Line Items per Order)
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  division VARCHAR(32) NOT NULL,
  name VARCHAR(255) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  selected_size VARCHAR(64),
  selected_color VARCHAR(64),
  special_notes TEXT,
  line_total NUMERIC(12,2) NOT NULL CHECK (line_total >= 0)
);

-- 10. PAYMENTS (Paystack & Gateway Payment Lifecycle State Machine)
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  reference VARCHAR(128) UNIQUE NOT NULL,
  idempotency_key VARCHAR(128) UNIQUE,
  entity_type VARCHAR(32) NOT NULL CHECK (entity_type IN ('ORDER', 'TAILORING', 'CAKE', 'CATERING', 'RIDE', 'VTU')),
  entity_id VARCHAR(64) NOT NULL,
  customer_id VARCHAR(64),
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(32),
  amount_naira NUMERIC(12,2) NOT NULL CHECK (amount_naira > 0),
  amount_kobo BIGINT NOT NULL CHECK (amount_kobo > 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN',
  channel VARCHAR(32) NOT NULL,
  provider VARCHAR(32) NOT NULL DEFAULT 'PAYSTACK',
  mode VARCHAR(16) NOT NULL DEFAULT 'TEST_MODE',
  status VARCHAR(32) NOT NULL DEFAULT 'INITIATED' CHECK (status IN ('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'ABANDONED', 'REFUNDED')),
  authorization_url TEXT,
  access_code VARCHAR(128),
  gateway_transaction_id VARCHAR(128),
  verified_at TIMESTAMPTZ,
  verified_by VARCHAR(64),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PAYMENT_EVENTS (Webhook & Verification Idempotency Log)
CREATE TABLE IF NOT EXISTS payment_events (
  id VARCHAR(64) PRIMARY KEY,
  payment_id VARCHAR(64) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  reference VARCHAR(128) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  previous_status VARCHAR(32),
  new_status VARCHAR(32) NOT NULL,
  source VARCHAR(32) NOT NULL,
  signature_valid BOOLEAN,
  payload_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. TAILORING_ORDERS (Bespoke Fashion Commissions)
CREATE TABLE IF NOT EXISTS tailoring_orders (
  id VARCHAR(64) PRIMARY KEY,
  order_reference VARCHAR(64) UNIQUE NOT NULL,
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  customer_email VARCHAR(255),
  garment_type VARCHAR(255) NOT NULL,
  fabric_preference VARCHAR(255) NOT NULL,
  color_theme VARCHAR(128) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  design_description TEXT NOT NULL,
  reference_image TEXT,
  preferred_completion_date VARCHAR(64) NOT NULL,
  estimated_cost NUMERIC(12,2) NOT NULL CHECK (estimated_cost >= 0),
  deposit_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(64) NOT NULL DEFAULT 'ORDER_RECEIVED',
  payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. TAILORING_MEASUREMENTS (Body Measurements Linked to Tailoring Orders)
CREATE TABLE IF NOT EXISTS tailoring_measurements (
  id VARCHAR(64) PRIMARY KEY,
  tailoring_order_id VARCHAR(64) UNIQUE NOT NULL REFERENCES tailoring_orders(id) ON DELETE CASCADE,
  chest NUMERIC(6,2),
  waist NUMERIC(6,2),
  shoulder NUMERIC(6,2),
  sleeve NUMERIC(6,2),
  length NUMERIC(6,2),
  trouser_length NUMERIC(6,2),
  thigh NUMERIC(6,2),
  neck NUMERIC(6,2),
  custom_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. CAKE_ORDERS (Custom Celebration Cakes)
CREATE TABLE IF NOT EXISTS cake_orders (
  id VARCHAR(64) PRIMARY KEY,
  order_reference VARCHAR(64) UNIQUE NOT NULL,
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  cake_type VARCHAR(128) NOT NULL,
  cake_size VARCHAR(128) NOT NULL,
  flavor VARCHAR(128) NOT NULL,
  layers INTEGER NOT NULL DEFAULT 1,
  design_style VARCHAR(128) NOT NULL,
  color_theme VARCHAR(128) NOT NULL,
  inscription TEXT,
  reference_image TEXT,
  delivery_date VARCHAR(64) NOT NULL,
  delivery_time_slot VARCHAR(64) NOT NULL,
  delivery_address TEXT NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  recipient_phone VARCHAR(32) NOT NULL,
  special_instructions TEXT,
  estimated_price NUMERIC(12,2) NOT NULL CHECK (estimated_price >= 0),
  status VARCHAR(64) NOT NULL DEFAULT 'ORDER_RECEIVED',
  payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. CATERING_BOOKINGS (Event Catering & Hospitality)
CREATE TABLE IF NOT EXISTS catering_bookings (
  id VARCHAR(64) PRIMARY KEY,
  booking_reference VARCHAR(64) UNIQUE NOT NULL,
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  customer_email VARCHAR(255),
  event_type VARCHAR(128) NOT NULL,
  event_date VARCHAR(64) NOT NULL,
  event_time VARCHAR(64) NOT NULL,
  event_location TEXT NOT NULL,
  expected_guests INTEGER NOT NULL CHECK (expected_guests > 0),
  selected_package_id VARCHAR(64),
  custom_menu_preferences JSONB DEFAULT '[]'::jsonb,
  service_style VARCHAR(64) NOT NULL,
  special_requirements TEXT,
  base_food_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  service_charge NUMERIC(12,2) NOT NULL DEFAULT 0,
  transport_charge NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_quote NUMERIC(12,2) NOT NULL CHECK (total_quote >= 0),
  deposit_required NUMERIC(12,2) NOT NULL DEFAULT 0,
  deposit_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(64) NOT NULL DEFAULT 'REQUEST_RECEIVED',
  payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. RIDES (Kogi State Ride-Hailing Dispatches)
CREATE TABLE IF NOT EXISTS rides (
  id VARCHAR(64) PRIMARY KEY,
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  driver_id VARCHAR(64) REFERENCES drivers(id) ON DELETE SET NULL,
  pickup_location JSONB NOT NULL,
  destination_location JSONB NOT NULL,
  vehicle_type VARCHAR(16) NOT NULL CHECK (vehicle_type IN ('KEKE', 'CAR')),
  trip_mode VARCHAR(32) NOT NULL DEFAULT 'STANDARD',
  distance_km NUMERIC(8,2) NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  base_fare NUMERIC(12,2) NOT NULL,
  distance_fare NUMERIC(12,2) NOT NULL,
  time_fare NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_fare NUMERIC(12,2) NOT NULL,
  payment_method VARCHAR(32) NOT NULL,
  payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  payment_verified_at TIMESTAMPTZ,
  payment_gateway_ref VARCHAR(128),
  status VARCHAR(64) NOT NULL DEFAULT 'SEARCHING_FOR_DRIVER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 17. RIDE_EVENTS (Telemetry & Trip Lifecycle Audit Trail)
CREATE TABLE IF NOT EXISTS ride_events (
  id VARCHAR(64) PRIMARY KEY,
  ride_id VARCHAR(64) NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  driver_id VARCHAR(64),
  previous_status VARCHAR(64),
  new_status VARCHAR(64) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. VTU_TRANSACTIONS (Airtime & Mobile Data Fulfillment Ledger)
CREATE TABLE IF NOT EXISTS vtu_transactions (
  id VARCHAR(64) PRIMARY KEY,
  reference VARCHAR(128) UNIQUE NOT NULL,
  idempotency_key VARCHAR(128) UNIQUE,
  type VARCHAR(16) NOT NULL CHECK (type IN ('AIRTIME', 'DATA')),
  network VARCHAR(16) NOT NULL CHECK (network IN ('MTN', 'AIRTEL', 'GLO', '9MOBILE')),
  phone_number VARCHAR(32) NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount > 0),
  provider_cost NUMERIC(12,2),
  plan_id VARCHAR(64),
  plan_name VARCHAR(128),
  plan_validity VARCHAR(64),
  payment_method VARCHAR(32) NOT NULL,
  payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  payment_gateway_ref VARCHAR(128),
  payment_verified_at TIMESTAMPTZ,
  vtu_provider VARCHAR(128) NOT NULL,
  vtu_provider_ref VARCHAR(128),
  vtu_status_message TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  mode VARCHAR(16) NOT NULL DEFAULT 'TEST_MODE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 19. NOTIFICATIONS (Customer & Admin In-App Notification Center)
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(32) NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_demo_notification BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. INVOICES (Official Receipts & Financial Documents)
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(64) PRIMARY KEY,
  invoice_number VARCHAR(64) UNIQUE NOT NULL,
  entity_type VARCHAR(32) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  customer_email VARCHAR(255),
  subtotal NUMERIC(12,2) NOT NULL,
  delivery_or_service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  payment_status VARCHAR(32) NOT NULL,
  payment_reference VARCHAR(128),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- 21. AUDIT_LOGS (Immutable Security & Administrative Action Ledger)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  actor_id VARCHAR(64) NOT NULL,
  actor_name VARCHAR(255) NOT NULL,
  actor_role VARCHAR(32) NOT NULL,
  action VARCHAR(128) NOT NULL,
  entity_type VARCHAR(32) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  summary TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_entity ON payments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_vtu_phone ON vtu_transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
