import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Package, 
  Scissors, 
  Cake, 
  UtensilsCrossed, 
  Car, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck,
  Clock, 
  MapPin, 
  Phone, 
  FileText,
  DollarSign,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Save,
  RotateCcw,
  Download,
  Upload,
  Layers,
  Settings,
  Sparkles,
  Navigation,
  UserCheck,
  Building,
  CreditCard,
  Eye,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, BespokeTailoringSample, CakeCustomSample, CateringPackage, CateringSampleDish, TransportSampleRoute, Driver } from '../../types';

// Modals
import { ProductFormModal } from './ProductFormModal';
import { BespokeSampleModal } from './BespokeSampleModal';
import { CakeSampleModal } from './CakeSampleModal';
import { CateringPackageModal } from './CateringPackageModal';
import { CateringDishModal } from './CateringDishModal';
import { TransportRouteModal } from './TransportRouteModal';
import { DriverFormModal } from './DriverFormModal';

export const AdminDashboard: React.FC = () => {
  const { 
    orders, 
    tailoringRequests, 
    cakeOrders, 
    cateringBookings, 
    rideHistory, 
    updateOrderStatus,
    updateTailoringStatus,
    verifyOrderCoDPayment,
    verifyRidePayment,
    sendReceiptNotification,
    setActiveInvoice,
    showToast,
    // CMS State & Actions
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStock,
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
    businessInfo,
    updateBusinessInfo,
    announcement,
    updateAnnouncement,
    fareConfig,
    updateFareConfig,
    resetAllToFactoryDefaults,
    exportSiteDataBackup,
    importSiteDataBackup
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'PRODUCTS' | 'TAILORING' | 'CAKES' | 'CATERING' | 'TRANSPORT' | 'ORDERS' | 'PAYMENTS' | 'SETTINGS'
  >('OVERVIEW');

  // Product filters
  const [productDivisionFilter, setProductDivisionFilter] = useState<'ALL' | 'FASHION' | 'BAKERY' | 'GROCERY'>('ALL');
  const [productSearch, setProductSearch] = useState('');

  // Payment filters
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'COD_PENDING' | 'COD_VERIFIED' | 'ONLINE'>('ALL');

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isBespokeModalOpen, setIsBespokeModalOpen] = useState(false);
  const [bespokeToEdit, setBespokeToEdit] = useState<BespokeTailoringSample | null>(null);

  const [isCakeModalOpen, setIsCakeModalOpen] = useState(false);
  const [cakeToEdit, setCakeToEdit] = useState<CakeCustomSample | null>(null);

  const [isCateringPkgModalOpen, setIsCateringPkgModalOpen] = useState(false);
  const [cateringPkgToEdit, setCateringPkgToEdit] = useState<CateringPackage | null>(null);

  const [isCateringDishModalOpen, setIsCateringDishModalOpen] = useState(false);
  const [cateringDishToEdit, setCateringDishToEdit] = useState<CateringSampleDish | null>(null);

  const [isTransportRouteModalOpen, setIsTransportRouteModalOpen] = useState(false);
  const [transportRouteToEdit, setTransportRouteToEdit] = useState<TransportSampleRoute | null>(null);

  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);

  // Settings local state form
  const [settingsForm, setSettingsForm] = useState({ ...businessInfo });
  const [announcementForm, setAnnouncementForm] = useState({ ...announcement });
  const [fareForm, setFareForm] = useState({ ...fareConfig });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats Calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : 0), 0) +
    tailoringRequests.reduce((sum, t) => sum + (t.depositPaid || t.estimatedCost), 0) +
    cakeOrders.reduce((sum, c) => sum + c.estimatedPrice, 0) +
    cateringBookings.reduce((sum, cat) => sum + (cat.depositPaid || 0), 0) +
    rideHistory.reduce((sum, r) => sum + r.totalFare, 0);

  const pendingCodOrders = orders.filter(o => o.paymentMethod === 'CASH_ON_DELIVERY' && o.paymentStatus === 'PENDING');
  const pendingCodRides = rideHistory.filter(r => r.paymentStatus === 'PENDING');

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesDiv = productDivisionFilter === 'ALL' || p.division === productDivisionFilter;
    const matchesQuery = productSearch === '' || 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase());
    return matchesDiv && matchesQuery;
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessInfo(settingsForm);
    updateAnnouncement(announcementForm);
    updateFareConfig(fareForm);
    showToast('Site settings, business information & tariff updated successfully!', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importSiteDataBackup(content);
      if (success) {
        showToast('Site backup restored successfully!', 'success');
      } else {
        showToast('Invalid backup file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Modals */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => { setIsProductModalOpen(false); setProductToEdit(null); }}
        onSave={(prod) => {
          if (productToEdit) {
            updateProduct(prod);
            showToast(`Product "${prod.name}" updated!`, 'success');
          } else {
            addProduct(prod);
            showToast(`Product "${prod.name}" published!`, 'success');
          }
        }}
        productToEdit={productToEdit}
      />

      <BespokeSampleModal
        isOpen={isBespokeModalOpen}
        onClose={() => { setIsBespokeModalOpen(false); setBespokeToEdit(null); }}
        onSave={(sample) => {
          if (bespokeToEdit) {
            updateBespokeSample(sample);
            showToast('Tailoring style sample updated!', 'success');
          } else {
            addBespokeSample(sample);
            showToast('Tailoring style sample added!', 'success');
          }
        }}
        sampleToEdit={bespokeToEdit}
      />

      <CakeSampleModal
        isOpen={isCakeModalOpen}
        onClose={() => { setIsCakeModalOpen(false); setCakeToEdit(null); }}
        onSave={(cake) => {
          if (cakeToEdit) {
            updateCakeSample(cake);
            showToast('Cake design sample updated!', 'success');
          } else {
            addCakeSample(cake);
            showToast('Cake design sample added!', 'success');
          }
        }}
        sampleToEdit={cakeToEdit}
      />

      <CateringPackageModal
        isOpen={isCateringPkgModalOpen}
        onClose={() => { setIsCateringPkgModalOpen(false); setCateringPkgToEdit(null); }}
        onSave={(pkg) => {
          if (cateringPkgToEdit) {
            updateCateringPackage(pkg);
            showToast('Catering package updated!', 'success');
          } else {
            addCateringPackage(pkg);
            showToast('Catering package published!', 'success');
          }
        }}
        packageToEdit={cateringPkgToEdit}
      />

      <CateringDishModal
        isOpen={isCateringDishModalOpen}
        onClose={() => { setIsCateringDishModalOpen(false); setCateringDishToEdit(null); }}
        onSave={(dish) => {
          if (cateringDishToEdit) {
            updateCateringDish(dish);
            showToast('Catering dish updated!', 'success');
          } else {
            addCateringDish(dish);
            showToast('Catering dish added!', 'success');
          }
        }}
        dishToEdit={cateringDishToEdit}
      />

      <TransportRouteModal
        isOpen={isTransportRouteModalOpen}
        onClose={() => { setIsTransportRouteModalOpen(false); setTransportRouteToEdit(null); }}
        onSave={(route) => {
          if (transportRouteToEdit) {
            updateTransportRoute(route);
            showToast('Transit route guide updated!', 'success');
          } else {
            addTransportRoute(route);
            showToast('Transit route guide added!', 'success');
          }
        }}
        routeToEdit={transportRouteToEdit}
      />

      <DriverFormModal
        isOpen={isDriverModalOpen}
        onClose={() => { setIsDriverModalOpen(false); setDriverToEdit(null); }}
        onSave={(driver) => {
          if (driverToEdit) {
            updateDriver(driver);
            showToast('Driver profile updated!', 'success');
          } else {
            addDriver(driver);
            showToast('New driver registered!', 'success');
          }
        }}
        driverToEdit={driverToEdit}
      />

      {/* Header Bar */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Admin & CMS Command Center • Okene HQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Flourish Destiny Multi-Business Control
          </h2>
          <p className="text-xs text-stone-300 max-w-2xl">
            Full administrative authority: add & edit catalog products, manage custom tailoring & cake design galleries, adjust banquet packages, configure Kogi transit routes & drivers, and update site features.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>

          <a
            href={`tel:${businessInfo.phone}`}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold border border-stone-700"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>{businessInfo.phone}</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Total Gross Revenue</span>
          <div className="text-2xl font-black text-stone-900 mt-1">
            ₦{totalRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Settled across all 5 divisions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Active Catalog Items</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {products.length} Products
          </div>
          <span className="text-[11px] text-stone-500 block mt-1">
            {bespokeSamples.length} Bespoke • {cakeSamples.length} Cake Samples
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Pending CoD Verifications</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {pendingCodOrders.length + pendingCodRides.length}
          </div>
          <span className="text-[11px] text-rose-700 font-bold block mt-1">
            {pendingCodOrders.length} Orders • {pendingCodRides.length} Rides
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Fleet & Transit Network</span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {drivers.length} Drivers
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {transportRoutes.length} Fixed Routes • {cateringPackages.length} Catering Pkgs
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {[
          { key: 'OVERVIEW', label: '📊 Overview' },
          { key: 'PRODUCTS', label: `🛍️ Products & Inventory (${products.length})` },
          { key: 'TAILORING', label: `✂️ Fashion & Bespoke (${tailoringRequests.length})` },
          { key: 'CAKES', label: `🎂 Bakery & Cakes (${cakeOrders.length})` },
          { key: 'CATERING', label: `🍽️ Catering (${cateringBookings.length})` },
          { key: 'TRANSPORT', label: `🛺 Transport (${drivers.length} Drivers)` },
          { key: 'ORDERS', label: `📦 Orders (${orders.length})` },
          { key: 'PAYMENTS', label: `💳 Payments & CoD (${pendingCodOrders.length})` },
          { key: 'SETTINGS', label: '⚙️ Site CMS & Settings' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Orders List */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-stone-900 font-display flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-600" /> Recent Retail & Supermarket Orders
                </h3>
                <button
                  onClick={() => setActiveTab('ORDERS')}
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  View All ({orders.length})
                </button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-stone-900">{order.customerName}</div>
                      <div className="text-stone-500 font-mono text-[11px]">{order.orderNumber} • {order.deliveryArea}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-stone-900">₦{order.total.toLocaleString()}</div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Division Summary */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-stone-900 font-display flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-600" /> Multi-Hub Operating Status
              </h3>
              <div className="space-y-2.5 text-xs">
                <div 
                  onClick={() => setActiveTab('TAILORING')}
                  className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex justify-between items-center hover:bg-amber-100/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Scissors className="w-4 h-4 text-amber-700" />
                    <div>
                      <div className="font-bold text-amber-950">Fashion Store & Bespoke Studio</div>
                      <div className="text-[11px] text-amber-800">{bespokeSamples.length} Style Samples • {products.filter(p => p.division === 'FASHION').length} Catalog Items</div>
                    </div>
                  </div>
                  <strong className="text-stone-900 font-bold">{tailoringRequests.length} Custom Requests</strong>
                </div>

                <div 
                  onClick={() => setActiveTab('CAKES')}
                  className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200 flex justify-between items-center hover:bg-orange-100/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Cake className="w-4 h-4 text-orange-700" />
                    <div>
                      <div className="font-bold text-orange-950">Artisanal Bakery & Custom Cakes</div>
                      <div className="text-[11px] text-orange-800">{cakeSamples.length} Cake Designs • {products.filter(p => p.division === 'BAKERY').length} Pastry Items</div>
                    </div>
                  </div>
                  <strong className="text-stone-900 font-bold">{cakeOrders.length} Scheduled Deliveries</strong>
                </div>

                <div 
                  onClick={() => setActiveTab('CATERING')}
                  className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 flex justify-between items-center hover:bg-rose-100/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <UtensilsCrossed className="w-4 h-4 text-rose-700" />
                    <div>
                      <div className="font-bold text-rose-950">Royal Catering & Event Hospitality</div>
                      <div className="text-[11px] text-rose-800">{cateringPackages.length} Banquet Packages • {cateringDishes.length} Dishes</div>
                    </div>
                  </div>
                  <strong className="text-stone-900 font-bold">{cateringBookings.length} Booked Banquets</strong>
                </div>

                <div 
                  onClick={() => setActiveTab('TRANSPORT')}
                  className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex justify-between items-center hover:bg-blue-100/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Car className="w-4 h-4 text-blue-700" />
                    <div>
                      <div className="font-bold text-blue-950">Kogi Intra-City Ride Dispatch</div>
                      <div className="text-[11px] text-blue-800">{drivers.length} Drivers Online • {transportRoutes.length} Fixed Routes</div>
                    </div>
                  </div>
                  <strong className="text-stone-900 font-bold">{rideHistory.length} Trips Dispatched</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRODUCTS & INVENTORY CMS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'PRODUCTS' && (
        <div className="space-y-5">
          {/* Action & Filter Bar */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Division:
              </span>
              {[
                { id: 'ALL', label: `All Items (${products.length})` },
                { id: 'FASHION', label: `Fashion (${products.filter(p => p.division === 'FASHION').length})` },
                { id: 'BAKERY', label: `Bakery (${products.filter(p => p.division === 'BAKERY').length})` },
                { id: 'GROCERY', label: `Grocery (${products.filter(p => p.division === 'GROCERY').length})` }
              ].map((div) => (
                <button
                  key={div.id}
                  onClick={() => setProductDivisionFilter(div.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    productDivisionFilter === div.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {div.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              </div>

              <button
                onClick={() => {
                  setProductToEdit(null);
                  setIsProductModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Division & Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Stock Status</th>
                    <th className="p-3.5">Quantity</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-500">
                        No products found matching your filter. Click "Add Product" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-stone-50/50">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-stone-100 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="font-bold text-stone-900">{product.name}</div>
                              <div className="text-stone-500 text-[11px] line-clamp-1">{product.description}</div>
                              {product.badge && (
                                <span className="inline-block px-1.5 py-0.5 mt-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            product.division === 'FASHION' ? 'bg-amber-100 text-amber-900' :
                            product.division === 'BAKERY' ? 'bg-orange-100 text-orange-900' :
                            'bg-emerald-100 text-emerald-900'
                          }`}>
                            {product.division}
                          </span>
                          <div className="text-stone-600 mt-1 font-medium">{product.category}</div>
                        </td>
                        <td className="p-3.5 font-bold text-stone-900">
                          ₦{product.price.toLocaleString()}
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="block text-[10px] text-stone-400 line-through">
                              ₦{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => toggleProductStock(product.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              product.inStock
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                            title="Click to toggle In-Stock / Out-of-Stock"
                          >
                            {product.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                          </button>
                        </td>
                        <td className="p-3.5 font-medium text-stone-700">
                          {product.stockCount} units
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setProductToEdit(product);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-950 transition-colors"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                                  deleteProduct(product.id);
                                  showToast(`Product "${product.name}" removed.`, 'info');
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FASHION & BESPOKE TAILORING CMS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'TAILORING' && (
        <div className="space-y-8">
          {/* Bespoke Showcase Style Samples CMS */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 font-display flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-600" />
                  Bespoke Tailoring Price Guide & Style Samples CMS
                </h3>
                <p className="text-xs text-stone-500">
                  Manage the signature clothing samples and custom pricing displayed to clients.
                </p>
              </div>
              <button
                onClick={() => {
                  setBespokeToEdit(null);
                  setIsBespokeModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Tailoring Sample</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {bespokeSamples.map((sample) => (
                <div
                  key={sample.id}
                  className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-square w-full bg-stone-200 overflow-hidden">
                    <img
                      src={sample.image}
                      alt={sample.name}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-stone-900/90 text-amber-300 font-bold text-xs rounded-md">
                      From ₦{sample.price.toLocaleString()}
                    </span>
                    {sample.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-stone-950 font-bold text-[10px] rounded-md">
                        {sample.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase">{sample.category}</span>
                      <h4 className="font-bold text-stone-900 text-xs">{sample.name}</h4>
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5">{sample.description}</p>
                      <div className="text-[10px] text-stone-500 mt-2 font-medium">
                        ⏱️ {sample.turnaroundDays} Days • 🧵 {sample.fabric}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                      <button
                        onClick={() => {
                          setBespokeToEdit(sample);
                          setIsBespokeModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-[11px] flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete sample "${sample.name}"?`)) {
                            deleteBespokeSample(sample.id);
                            showToast('Bespoke sample removed.', 'info');
                          }
                        }}
                        className="p-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700"
                        title="Delete Sample"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Commissions Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900">Client Bespoke Commission Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Request ID</th>
                    <th className="p-3.5">Client & Phone</th>
                    <th className="p-3.5">Garment Details</th>
                    <th className="p-3.5">Est. Price</th>
                    <th className="p-3.5">Production Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {tailoringRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-stone-500">
                        No bespoke requests currently submitted.
                      </td>
                    </tr>
                  ) : (
                    tailoringRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-stone-50/50">
                        <td className="p-3.5 font-mono font-bold text-stone-900">{req.id}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900">{req.customerName}</div>
                          <div className="text-stone-500">{req.customerPhone}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-stone-900">{req.garmentType}</div>
                          <div className="text-stone-500">{req.fabricPreference} • {req.colorTheme}</div>
                        </td>
                        <td className="p-3.5 font-black text-amber-700">₦{req.estimatedCost.toLocaleString()}</td>
                        <td className="p-3.5">
                          <select
                            value={req.status}
                            onChange={(e) => updateTailoringStatus(req.id, e.target.value as any)}
                            className="bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 text-xs font-semibold"
                          >
                            <option value="PAYMENT_CONFIRMED">Payment Confirmed</option>
                            <option value="MEASUREMENTS_VERIFIED">Measurements Verified</option>
                            <option value="FABRIC_CUTTING">Fabric Cutting</option>
                            <option value="STITCHING_IN_PROGRESS">Stitching in Progress</option>
                            <option value="QUALITY_INSPECTION">Quality Inspection</option>
                            <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BAKERY & CUSTOM CAKES CMS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'CAKES' && (
        <div className="space-y-8">
          {/* Custom Cake Design Gallery CMS */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 font-display flex items-center gap-2">
                  <Cake className="w-4 h-4 text-orange-600" />
                  Custom Cake Design Samples & Showcase CMS
                </h3>
                <p className="text-xs text-stone-500">
                  Manage signature wedding, birthday, and celebration cake designs and starting rates.
                </p>
              </div>
              <button
                onClick={() => {
                  setCakeToEdit(null);
                  setIsCakeModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Cake Design</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {cakeSamples.map((cake) => (
                <div
                  key={cake.id}
                  className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-square w-full bg-stone-200 overflow-hidden">
                    <img
                      src={cake.image}
                      alt={cake.name}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-stone-900/90 text-orange-400 font-bold text-xs rounded-md">
                      ₦{cake.price.toLocaleString()}
                    </span>
                    {cake.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white font-bold text-[10px] rounded-md">
                        {cake.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-orange-800 uppercase">{cake.tier}</span>
                      <h4 className="font-bold text-stone-900 text-xs">{cake.name}</h4>
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5">{cake.design}</p>
                      <div className="text-[10px] text-stone-500 mt-2 font-medium">
                        🍰 {cake.flavor} • 👥 {cake.servings}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                      <button
                        onClick={() => {
                          setCakeToEdit(cake);
                          setIsCakeModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-[11px] flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete cake sample "${cake.name}"?`)) {
                            deleteCakeSample(cake.id);
                            showToast('Cake sample removed.', 'info');
                          }
                        }}
                        className="p-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700"
                        title="Delete Cake"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Custom Cake Orders Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900">Custom Celebration Cake Deliveries</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Recipient & Contact</th>
                    <th className="p-3.5">Cake Specs & Inscription</th>
                    <th className="p-3.5">Delivery Slot</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {cakeOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-stone-500">
                        No custom cake orders currently scheduled.
                      </td>
                    </tr>
                  ) : (
                    cakeOrders.map((cake) => (
                      <tr key={cake.id} className="hover:bg-stone-50/50">
                        <td className="p-3.5 font-mono font-bold text-stone-900">{cake.id}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900">{cake.recipientName}</div>
                          <div className="text-stone-500">{cake.recipientPhone}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900">{cake.cakeType} ({cake.cakeSize})</div>
                          <div className="text-stone-500 font-serif italic">&quot;{cake.inscription}&quot;</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-stone-900">{cake.deliveryDate}</div>
                          <div className="text-stone-500">{cake.deliveryTimeSlot}</div>
                        </td>
                        <td className="p-3.5 font-black text-stone-900">₦{cake.estimatedPrice.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            {cake.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CATERING & BANQUET CMS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'CATERING' && (
        <div className="space-y-8">
          {/* Catering Packages CMS */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 font-display flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-rose-600" />
                  Catering Banquet Packages CMS
                </h3>
                <p className="text-xs text-stone-500">
                  Configure per-guest rates, menu courses, and staff provision for Kogi events.
                </p>
              </div>
              <button
                onClick={() => {
                  setCateringPkgToEdit(null);
                  setIsCateringPkgModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Banquet Package</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {cateringPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-stone-50 rounded-2xl border border-stone-200 p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-rose-800 uppercase">{pkg.tier}</span>
                        <h4 className="font-bold text-stone-900 text-sm">{pkg.name}</h4>
                      </div>
                      {pkg.popular && (
                        <span className="px-2 py-0.5 bg-amber-500 text-stone-950 font-bold text-[10px] rounded-md">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-black text-rose-700">
                      ₦{pkg.pricePerGuest.toLocaleString()} <span className="text-xs font-normal text-stone-500">/ guest</span>
                    </div>
                    <p className="text-[11px] text-stone-600">{pkg.description}</p>
                    <div className="text-[11px] text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200">
                      <strong className="block text-[10px] text-stone-500 mb-1 uppercase">Sample Courses:</strong>
                      {pkg.menuItems.slice(0, 3).join(', ')}...
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                    <button
                      onClick={() => {
                        setCateringPkgToEdit(pkg);
                        setIsCateringPkgModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-[11px] flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete package "${pkg.name}"?`)) {
                          deleteCateringPackage(pkg.id);
                          showToast('Catering package removed.', 'info');
                        }
                      }}
                      className="p-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700"
                      title="Delete Package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Catering Dishes & Live Stations CMS */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 font-display flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-rose-600" />
                  Signature Catering Dishes & Live Stations CMS
                </h3>
                <p className="text-xs text-stone-500">
                  Manage individual event dish samples and live cooking stations.
                </p>
              </div>
              <button
                onClick={() => {
                  setCateringDishToEdit(null);
                  setIsCateringDishModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-4 h-4 text-rose-400" />
                <span>Add Dish Sample</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {cateringDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-square w-full bg-stone-200 overflow-hidden">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-stone-900/90 text-rose-300 font-bold text-xs rounded-md">
                      ₦{dish.pricePerPortion.toLocaleString()}
                    </span>
                    {dish.isEbiraSpecialty && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-stone-950 font-bold text-[10px] rounded-md">
                        Ebira Native
                      </span>
                    )}
                  </div>
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-rose-800 uppercase">{dish.category}</span>
                      <h4 className="font-bold text-stone-900 text-xs">{dish.name}</h4>
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5">{dish.description}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                      <button
                        onClick={() => {
                          setCateringDishToEdit(dish);
                          setIsCateringDishModalOpen(true);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-[10px] flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete dish "${dish.name}"?`)) {
                            deleteCateringDish(dish.id);
                            showToast('Dish removed.', 'info');
                          }
                        }}
                        className="p-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. KOGI TRANSPORT & LOGISTICS CMS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'TRANSPORT' && (
        <div className="space-y-8">
          {/* Tariff Configurator */}
          <div className="bg-gradient-to-r from-stone-900 to-blue-950 text-white p-6 rounded-3xl border border-blue-900/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-lg text-blue-300 font-display flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Kogi Transport Dynamic Tariff & Base Rates
                </h3>
                <p className="text-xs text-stone-300">
                  Update live fare calculation factors for Keke and Taxi cars across Okene & Kogi State.
                </p>
              </div>
              <button
                onClick={() => {
                  updateFareConfig(fareForm);
                  showToast('Fare rates and surge pricing updated!', 'success');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-stone-950 font-extrabold text-xs shadow-md transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Tariff Rates</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-xs">
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-blue-900/40">
                <label className="block text-stone-400 text-[10px] mb-1 font-semibold">🛺 Keke Base Fare (₦)</label>
                <input
                  type="number"
                  value={fareForm.kekeBaseFare}
                  onChange={(e) => setFareForm({ ...fareForm, kekeBaseFare: Number(e.target.value) })}
                  className="w-full bg-stone-800 text-white font-bold p-2 rounded-xl border border-stone-700"
                />
              </div>

              <div className="p-3 bg-stone-950/80 rounded-2xl border border-blue-900/40">
                <label className="block text-stone-400 text-[10px] mb-1 font-semibold">🛺 Keke Per-Km (₦)</label>
                <input
                  type="number"
                  value={fareForm.kekePerKm}
                  onChange={(e) => setFareForm({ ...fareForm, kekePerKm: Number(e.target.value) })}
                  className="w-full bg-stone-800 text-white font-bold p-2 rounded-xl border border-stone-700"
                />
              </div>

              <div className="p-3 bg-stone-950/80 rounded-2xl border border-blue-900/40">
                <label className="block text-stone-400 text-[10px] mb-1 font-semibold">🚗 Car Base Fare (₦)</label>
                <input
                  type="number"
                  value={fareForm.carBaseFare}
                  onChange={(e) => setFareForm({ ...fareForm, carBaseFare: Number(e.target.value) })}
                  className="w-full bg-stone-800 text-white font-bold p-2 rounded-xl border border-stone-700"
                />
              </div>

              <div className="p-3 bg-stone-950/80 rounded-2xl border border-blue-900/40">
                <label className="block text-stone-400 text-[10px] mb-1 font-semibold">🚗 Car Per-Km (₦)</label>
                <input
                  type="number"
                  value={fareForm.carPerKm}
                  onChange={(e) => setFareForm({ ...fareForm, carPerKm: Number(e.target.value) })}
                  className="w-full bg-stone-800 text-white font-bold p-2 rounded-xl border border-stone-700"
                />
              </div>

              <div className="p-3 bg-stone-950/80 rounded-2xl border border-blue-900/40">
                <label className="block text-stone-400 text-[10px] mb-1 font-semibold">⚡ Surge Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="3"
                  value={fareForm.surgeMultiplier}
                  onChange={(e) => setFareForm({ ...fareForm, surgeMultiplier: Number(e.target.value) })}
                  className="w-full bg-stone-800 text-amber-300 font-bold p-2 rounded-xl border border-stone-700"
                />
              </div>
            </div>
          </div>

          {/* Driver Fleet Roster CMS */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 font-display flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Verified Driver Fleet Roster CMS
                </h3>
                <p className="text-xs text-stone-500">
                  Onboard and manage vetted Keke and Car operators for immediate dispatch.
                </p>
              </div>
              <button
                onClick={() => {
                  setDriverToEdit(null);
                  setIsDriverModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Driver</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={driver.avatar}
                      alt={driver.name}
                      className="w-12 h-12 rounded-full object-cover border border-stone-300 bg-stone-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs">{driver.name}</h4>
                      <div className="text-[11px] text-stone-500">{driver.phone}</div>
                      <span className={`inline-block px-1.5 py-0.2 mt-0.5 rounded text-[9px] font-bold ${
                        driver.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {driver.isAvailable ? '● ONLINE' : '○ OFFLINE'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200 space-y-1">
                    <div className="font-semibold text-stone-900">
                      {driver.vehicleType === 'KEKE' ? '🛺 Keke' : '🚗 Car'}: {driver.vehicleModel}
                    </div>
                    <div className="font-mono text-stone-600 font-bold">{driver.plateNumber}</div>
                    <div className="text-amber-600 font-bold text-[10px]">★ {driver.rating} ({driver.totalTrips} trips)</div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                    <button
                      onClick={() => {
                        setDriverToEdit(driver);
                        setIsDriverModalOpen(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-[10px] flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete driver "${driver.name}"?`)) {
                          deleteDriver(driver.id);
                          showToast('Driver removed from roster.', 'info');
                        }
                      }}
                      className="p-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700"
                      title="Delete Driver"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Route Tariff Guides CMS */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 font-display flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" />
                  Popular Fixed Route Guides & Tariffs CMS
                </h3>
                <p className="text-xs text-stone-500">
                  Showcase estimated fares and travel times for popular corridors from Okene Hub.
                </p>
              </div>
              <button
                onClick={() => {
                  setTransportRouteToEdit(null);
                  setIsTransportRouteModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Route Guide</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {transportRoutes.map((route) => (
                <div
                  key={route.id}
                  className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-16/9 bg-stone-200">
                    <img
                      src={route.image}
                      alt={`${route.pickup} to ${route.destination}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-blue-600 text-white font-bold text-xs rounded-md">
                      {route.distanceKm} km
                    </span>
                  </div>
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs">{route.pickup.split(',')[0]} → {route.destination.split(',')[0]}</h4>
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5">{route.description}</p>
                      <div className="mt-2 text-[10px] font-bold text-stone-800 bg-white p-2 rounded-lg border border-stone-200">
                        {route.estimatedKekeFare > 0 && <span>🛺 ₦{route.estimatedKekeFare.toLocaleString()} • </span>}
                        <span>🚗 ₦{route.estimatedCarFare.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                      <button
                        onClick={() => {
                          setTransportRouteToEdit(route);
                          setIsTransportRouteModalOpen(true);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-[10px] flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete route "${route.pickup} → ${route.destination}"?`)) {
                            deleteTransportRoute(route.id);
                            showToast('Route guide removed.', 'info');
                          }
                        }}
                        className="p-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700"
                        title="Delete Route"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. ORDERS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-stone-50">
            <h3 className="font-bold text-base text-stone-900">Customer Orders Management</h3>
            <span className="text-xs font-semibold text-stone-500">{orders.length} Total Orders</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer & Phone</th>
                  <th className="p-3.5">Delivery Zone</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50">
                    <td className="p-3.5 font-mono font-bold text-stone-900">{order.orderNumber}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{order.customerName}</div>
                      <div className="text-stone-500">{order.customerPhone}</div>
                    </td>
                    <td className="p-3.5 text-stone-600">{order.deliveryArea}</td>
                    <td className="p-3.5 text-stone-600">{order.items.length} items</td>
                    <td className="p-3.5 font-black text-stone-900">₦{order.total.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.paymentStatus} ({order.paymentMethod.replace(/_/g, ' ')})
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          className="bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 text-xs font-semibold"
                        >
                          <option value="RECEIVED">Received</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="DISPATCHED">Dispatched</option>
                          <option value="DELIVERED">Delivered</option>
                        </select>
                        <button
                          onClick={() => setActiveInvoice(order)}
                          className="p-1 text-stone-500 hover:text-stone-900"
                          title="View Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. PAYMENTS & COD VERIFICATION TAB */}
      {/* ========================================================================= */}
      {activeTab === 'PAYMENTS' && (
        <div className="space-y-6">
          <div className="bg-stone-900 text-white rounded-3xl p-6 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-lg text-amber-300 font-display">
                  Dual-Payment Engine Verification Hub
                </h3>
                <p className="text-xs text-stone-300">
                  Verify Cash on Delivery (CoD) remittances and field collections from delivery agents & riders before final settlement.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { key: 'ALL', label: 'All Transactions' },
                  { key: 'COD_PENDING', label: `Pending CoD (${pendingCodOrders.length + pendingCodRides.length})` },
                  { key: 'COD_VERIFIED', label: 'CoD Verified' },
                  { key: 'ONLINE', label: 'Paystack / Flutterwave Settled' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setPaymentFilter(f.key as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      paymentFilter === f.key
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-800 text-stone-300 hover:text-white border border-stone-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Live Verification Queue
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Ref / ID</th>
                    <th className="p-3.5">Customer & Phone</th>
                    <th className="p-3.5">Type & Channel</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Payment State</th>
                    <th className="p-3.5">Verification & Receipt Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders
                    .filter(o => {
                      if (paymentFilter === 'COD_PENDING') return o.paymentMethod === 'CASH_ON_DELIVERY' && o.paymentStatus === 'PENDING';
                      if (paymentFilter === 'COD_VERIFIED') return o.paymentMethod === 'CASH_ON_DELIVERY' && o.paymentStatus === 'PAID';
                      if (paymentFilter === 'ONLINE') return o.paymentStatus === 'PAID' && o.paymentMethod !== 'CASH_ON_DELIVERY';
                      return true;
                    })
                    .map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50/50">
                        <td className="p-3.5 font-mono font-bold text-stone-900">{order.orderNumber}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900">{order.customerName}</div>
                          <div className="text-stone-500">{order.customerPhone}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-stone-800">Retail / Grocery Order</span>
                          <div className="text-[11px] text-stone-500">
                            {order.paymentMethod === 'CASH_ON_DELIVERY' ? '💵 Cash on Delivery (CoD)' : '💳 Online Gateway'}
                          </div>
                        </td>
                        <td className="p-3.5 font-black text-stone-900">₦{order.total.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {order.paymentStatus === 'PAID' ? '✓ PAID & SETTLED' : '⏳ PENDING COLLECTION'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {order.paymentStatus === 'PENDING' ? (
                              <button
                                onClick={() => verifyOrderCoDPayment(order.id, 'Agent Okene HQ')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Payment Received</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </span>
                            )}

                            <button
                              onClick={() => sendReceiptNotification(order, 'WHATSAPP')}
                              className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-[11px] border border-stone-300 flex items-center gap-1"
                            >
                              <span>📱 WhatsApp Receipt</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. SITE CMS & BUSINESS SETTINGS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'SETTINGS' && (
        <div className="space-y-8">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Business Contact & Physical Store Profile */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-stone-900 font-display flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-600" />
                Store Identity & Okene Hub Contact Settings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">HQ Hotline Phone</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Official WhatsApp Link URL</label>
                  <input
                    type="text"
                    value={settingsForm.whatsappUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappUrl: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Hub Location</label>
                  <input
                    type="text"
                    value={settingsForm.location}
                    onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Official Bank Account Details */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-stone-900 font-display flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Official Bank Transfer Credentials (Shown on Checkout & Invoices)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={settingsForm.bankName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={settingsForm.accountNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, accountNumber: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-black"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={settingsForm.accountName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, accountName: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Announcement Banner CMS */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-stone-900 font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Site-Wide Header Announcement Banner CMS
                </h3>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={announcementForm.enabled}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, enabled: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span>Show Announcement Banner</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Announcement Message Text</label>
                  <input
                    type="text"
                    value={announcementForm.message}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={announcementForm.badge || ''}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, badge: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold shadow-lg transition-colors text-xs"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>Save All Site Configurations</span>
              </button>
            </div>
          </form>

          {/* Backup, Restore & Factory Defaults */}
          <div className="bg-stone-900 text-white p-6 rounded-3xl border border-stone-800 shadow-xl space-y-4">
            <h3 className="font-extrabold text-base text-amber-400 font-display flex items-center gap-2">
              <Settings className="w-4 h-4" />
              System Data Backup & Disaster Recovery Tools
            </h3>
            <p className="text-xs text-stone-300">
              Export all CMS configurations, catalogs, samples, drivers, and orders into an offline JSON file, or restore from a backup.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={exportSiteDataBackup}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs border border-stone-700"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export Full Site JSON Backup</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportBackup}
                accept=".json"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs border border-stone-700"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Import / Restore Backup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all site catalogs, samples, and configurations back to factory defaults?')) {
                    resetAllToFactoryDefaults();
                    setSettingsForm({ ...businessInfo });
                    setAnnouncementForm({ ...announcement });
                    setFareForm({ ...fareConfig });
                    showToast('All configurations reset to factory defaults.', 'info');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold text-xs border border-rose-800/60 ml-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Factory Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
