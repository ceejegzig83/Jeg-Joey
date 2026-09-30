import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroBanner } from './components/HeroBanner';
import { FashionCatalog } from './components/FashionStore/FashionCatalog';
import { TailoringModal } from './components/FashionStore/TailoringModal';
import { TailoringTrackerModal } from './components/FashionStore/TailoringTrackerModal';
import { BakeryCatalog } from './components/BakeryModule/BakeryCatalog';
import { CustomCakeModal } from './components/BakeryModule/CustomCakeModal';
import { CateringSection } from './components/CateringModule/CateringSection';
import { GroceryCatalog } from './components/GroceryHub/GroceryCatalog';
import { TransportSection } from './components/TransportModule/TransportSection';
import { DriverPortal } from './components/TransportModule/DriverPortal';
import { VTUSection } from './components/VTUModule/VTUSection';
import { VTUReceiptModal } from './components/VTUModule/VTUReceiptModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { CartDrawer } from './components/Cart/CartDrawer';
import { CheckoutModal } from './components/Checkout/CheckoutModal';
import { InvoiceModal } from './components/Invoices/InvoiceModal';
import { ContactModal } from './components/Common/ContactModal';
import { ToastContainer } from './components/Common/ToastContainer';
import { GlobalSearchOverlay } from './components/Common/GlobalSearchOverlay';
import { CustomerAccountModal } from './components/Common/CustomerAccountModal';
import { MobileBottomNav } from './components/Common/MobileBottomNav';
import { BUSINESS_INFO } from './data/mockData';
import { 
  ShoppingBag, 
  Cake, 
  UtensilsCrossed, 
  Car, 
  Scissors, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Zap,
  Smartphone,
  Search,
  User,
  Package,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const HOME_SEARCH_TAGS = [
  'Ankara',
  'Senator',
  'Bread',
  'Meat Pie',
  'Wedding Cake',
  'Rice',
  'Yam',
  'Palm Oil',
  'Airtime',
  'Data',
  'Keke Ride'
];

const AppContent: React.FC = () => {
  const {
    activeDivision,
    setActiveDivision,
    currentRole,
    isAdminAuthenticated,
    searchQuery,
    setSearchQuery,
    orders,
    tailoringRequests,
    activeRide,
    openCustomerAccount,
    products,
    addToCart
  } = useApp();

  // Modals state
  const [isTailoringModalOpen, setIsTailoringModalOpen] = useState(false);
  const [isTailoringTrackerOpen, setIsTailoringTrackerOpen] = useState(false);
  const [isCustomCakeModalOpen, setIsCustomCakeModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const featuredBakeryAndGrocery = products
    .filter((p) => (p.division === 'BAKERY' || p.division === 'GROCERY') && p.featured)
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-sans antialiased selection:bg-amber-500 selection:text-stone-950 pb-16 lg:pb-0">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Global Application Header */}
      <Header onOpenContactModal={() => setIsContactModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
        {/* Global Multi-Service Search Results Overlay when searchQuery is active */}
        {currentRole === 'CUSTOMER' && searchQuery.trim().length > 0 && (
          <GlobalSearchOverlay
            onOpenTailoringModal={() => setIsTailoringModalOpen(true)}
            onOpenCustomCakeModal={() => setIsCustomCakeModalOpen(true)}
          />
        )}

        {/* If Admin Role is active and authenticated, show Admin Dashboard */}
        {currentRole === 'ADMIN' && isAdminAuthenticated ? (
          <AdminDashboard />
        ) : currentRole === 'DRIVER' ? (
          <DriverPortal />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDivision}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* ALL HUBS OVERVIEW (SUPER APP HOME DASHBOARD) */}
              {activeDivision === 'ALL' && (
                <div className="space-y-10">
                  <HeroBanner
                    onOpenTailoringModal={() => setIsTailoringModalOpen(true)}
                    onOpenCustomCakeModal={() => setIsCustomCakeModalOpen(true)}
                  />

                  {/* Super App Universal Search & Quick Discovery Bar */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-stone-900 font-display flex items-center gap-2">
                          <Search className="w-4 h-4 text-amber-600" />
                          <span>Search Products, Rides, Food & Services</span>
                        </h2>
                        <p className="text-xs text-stone-500">
                          One unified search across Fashion, Bakery, Catering, Grocery, Kogi Ride & VTU Recharge.
                        </p>
                      </div>
                      <button
                        onClick={() => openCustomerAccount('ORDERS')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Track Orders, Tailoring & Rides →</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Try searching 'Ankara', 'Senator', 'Bread', 'Meat Pie', 'Wedding Cake', 'Rice', 'Yam', 'Palm Oil', 'Airtime', 'Keke Ride'..."
                        className="w-full pl-12 pr-24 py-3.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">
                        Quick Search:
                      </span>
                      {HOME_SEARCH_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                            searchQuery.toLowerCase() === tag.toLowerCase()
                              ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold'
                              : 'bg-stone-50 hover:bg-amber-50 text-stone-700 border-stone-200 hover:border-amber-300'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Customer Status Strip (Orders / Tailoring / Active Ride) */}
                  {(activeRide || orders.length > 0 || tailoringRequests.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {activeRide && (
                        <div
                          onClick={() => setActiveDivision('TRANSPORT')}
                          className="bg-blue-950 text-white rounded-2xl p-4 border border-blue-800 flex items-center justify-between cursor-pointer hover:bg-blue-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                              <Car className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                                Active Kogi Ride • {activeRide.status.replace(/_/g, ' ')}
                              </span>
                              <h4 className="text-xs font-bold text-white line-clamp-1">
                                {activeRide.pickupLocation.name} → {activeRide.destinationLocation.name}
                              </h4>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-blue-300 shrink-0" />
                        </div>
                      )}

                      {tailoringRequests.length > 0 && (
                        <div
                          onClick={() => setIsTailoringTrackerOpen(true)}
                          className="bg-stone-900 text-white rounded-2xl p-4 border border-stone-800 flex items-center justify-between cursor-pointer hover:bg-stone-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                              <Scissors className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                                Tailoring Tracker ({tailoringRequests.length})
                              </span>
                              <h4 className="text-xs font-bold text-white line-clamp-1">
                                {tailoringRequests[0].garmentType} • {tailoringRequests[0].status.replace(/_/g, ' ')}
                              </h4>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-amber-300 shrink-0" />
                        </div>
                      )}

                      {orders.length > 0 && (
                        <div
                          onClick={() => openCustomerAccount('ORDERS')}
                          className="bg-emerald-950 text-white rounded-2xl p-4 border border-emerald-800 flex items-center justify-between cursor-pointer hover:bg-emerald-900 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">
                                Store Orders ({orders.length})
                              </span>
                              <h4 className="text-xs font-bold text-white line-clamp-1">
                                {orders[0].orderNumber} • {orders[0].orderStatus}
                              </h4>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-emerald-300 shrink-0" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Division Quick Access Cards */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                          Explore 6 Super App Services
                        </h2>
                        <p className="text-xs text-stone-500">
                          SHOP • EAT • RIDE • RECHARGE — Operated by FLOURISH DESTINY COLLECTION in Okene, Kogi State.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {/* 1. Fashion Card */}
                      <div 
                        onClick={() => setActiveDivision('FASHION')}
                        className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                              <Scissors className="w-6 h-6" />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900">
                              SHOP & TAILORING
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                            1. Fashion & Bespoke Tailoring
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Ankara, Senator wear, Aso-Oke, shoes, bags, wristwatches, and custom garment tailoring with 9-stage live production tracking.
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700">
                          <span>Shop Fashion & Tailoring</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* 2. Bakery Card */}
                      <div 
                        onClick={() => setActiveDivision('BAKERY')}
                        className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-900 flex items-center justify-center font-bold">
                              <Cake className="w-6 h-6" />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-900">
                              EAT & PASTRIES
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 group-hover:text-orange-700 transition-colors">
                            2. Artisanal Bakery & Cakes
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Oven-fresh Agege butter bread, meat pies, sausage rolls, and custom wedding & birthday cakes with message inscription.
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-orange-700">
                          <span>Order Bread, Pastries & Cakes</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* 3. Catering Card */}
                      <div 
                        onClick={() => setActiveDivision('CATERING')}
                        className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold">
                              <UtensilsCrossed className="w-6 h-6" />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-900">
                              EVENTS & BANQUETS
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                            3. Catering & Event Services
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Weddings, birthdays, naming ceremonies, graduations & corporate banquets with instant per-guest quote calculator.
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-rose-700">
                          <span>Book Event Catering</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* 4. Grocery Card */}
                      <div 
                        onClick={() => setActiveDivision('GROCERY')}
                        className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                              <ShoppingBag className="w-6 h-6" />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900">
                              FARM & MARKET
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                            4. Grocery & Supermarket
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Okene farm yams, pure red palm oil, rice, beans, garri, semovita, spices & household essentials with Cash on Delivery.
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                          <span>Shop Grocery & Staples</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* 5. Ride / Transport Card */}
                      <div 
                        onClick={() => setActiveDivision('TRANSPORT')}
                        className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                              <Car className="w-6 h-6" />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900">
                              RIDE & MOBILITY
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                            5. Kogi Ride (Keke & Saloon Car)
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Book Keke Tricycle, Saloon Car, or Private Charter across all 21 Kogi LGAs with live route mapping and instant driver dispatch.
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-blue-700">
                          <span>Book Kogi Ride Now</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* 6. Airtime & Data VTU Card */}
                      <div 
                        onClick={() => setActiveDivision('VTU')}
                        className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                              <Smartphone className="w-6 h-6" />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-900">
                              INSTANT RECHARGE
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 group-hover:text-purple-700 transition-colors">
                            6. Airtime & Mobile Data VTU
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Instant Nigerian airtime & mobile data bundles for MTN, Airtel, Glo, and 9mobile with automated verification & digital receipts.
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-purple-700">
                          <span>Buy Airtime & Data</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fresh Bakery & Farm Grocery Quick Picks */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                          Daily Essentials & Oven Fresh
                        </span>
                        <h3 className="text-xl font-black text-stone-900 font-display">
                          Popular Bakery & Grocery Staples in Okene
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveDivision('BAKERY')}
                          className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Full Bakery Menu →
                        </button>
                        <button
                          onClick={() => setActiveDivision('GROCERY')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          All Grocery Items →
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {featuredBakeryAndGrocery.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-stone-200 overflow-hidden bg-stone-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900/85 text-amber-300">
                                {item.division}
                              </span>
                            </div>
                            <div className="p-4 space-y-1">
                              <div className="text-[10px] font-bold text-stone-400 uppercase">{item.category}</div>
                              <h4 className="font-bold text-sm text-stone-900 line-clamp-1">{item.name}</h4>
                              <p className="text-xs text-stone-500 line-clamp-2">{item.description}</p>
                            </div>
                          </div>
                          <div className="p-4 pt-0 flex items-center justify-between">
                            <span className="font-extrabold text-base text-stone-900 tabular-nums">
                              ₦{item.price.toLocaleString()}
                            </span>
                            <button
                              disabled={!item.inStock || item.stockCount <= 0}
                              onClick={() => addToCart(item, 1)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                !item.inStock || item.stockCount <= 0
                                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                  : 'bg-stone-900 hover:bg-amber-500 text-white hover:text-stone-950 cursor-pointer'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>{!item.inStock || item.stockCount <= 0 ? 'Out of Stock' : 'Add'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Featured Fashion Showcase */}
                  <FashionCatalog
                    onOpenTailoringModal={() => setIsTailoringModalOpen(true)}
                    onOpenTrackerModal={() => setIsTailoringTrackerOpen(true)}
                  />
                </div>
              )}

              {/* FASHION DIVISION */}
              {activeDivision === 'FASHION' && (
                <FashionCatalog
                  onOpenTailoringModal={() => setIsTailoringModalOpen(true)}
                  onOpenTrackerModal={() => setIsTailoringTrackerOpen(true)}
                />
              )}

              {/* BAKERY DIVISION */}
              {activeDivision === 'BAKERY' && (
                <BakeryCatalog
                  onOpenCustomCakeModal={() => setIsCustomCakeModalOpen(true)}
                />
              )}

              {/* CATERING DIVISION */}
              {activeDivision === 'CATERING' && <CateringSection />}

              {/* GROCERY DIVISION */}
              {activeDivision === 'GROCERY' && <GroceryCatalog />}

              {/* TRANSPORT DIVISION */}
              {activeDivision === 'TRANSPORT' && <TransportSection />}

              {/* AIRTIME & DATA VTU DIVISION */}
              {activeDivision === 'VTU' && <VTUSection />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Global Footer with Phone 09162723865 */}
      <Footer />

      {/* Slide-out Cart Drawer */}
      <CartDrawer />

      {/* Modal Dialogs */}
      <AdminLoginModal />

      <TailoringModal
        isOpen={isTailoringModalOpen}
        onClose={() => setIsTailoringModalOpen(false)}
        onSuccess={() => setIsTailoringTrackerOpen(true)}
      />

      <TailoringTrackerModal
        isOpen={isTailoringTrackerOpen}
        onClose={() => setIsTailoringTrackerOpen(false)}
      />

      <CustomCakeModal
        isOpen={isCustomCakeModalOpen}
        onClose={() => setIsCustomCakeModalOpen(false)}
        onSuccess={() => {}}
      />

      <CheckoutModal />

      <InvoiceModal />

      <VTUReceiptModal />

      <ContactModal />

      <CustomerAccountModal
        onOpenTailoringModal={() => setIsTailoringModalOpen(true)}
        onOpenCustomCakeModal={() => setIsCustomCakeModalOpen(true)}
      />

      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
