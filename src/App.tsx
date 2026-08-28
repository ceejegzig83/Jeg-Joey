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
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { CartDrawer } from './components/Cart/CartDrawer';
import { CheckoutModal } from './components/Checkout/CheckoutModal';
import { InvoiceModal } from './components/Invoices/InvoiceModal';
import { ContactModal } from './components/Common/ContactModal';
import { ToastContainer } from './components/Common/ToastContainer';
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
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { activeDivision, setActiveDivision, currentRole, isAdminAuthenticated } = useApp();

  // Modals state
  const [isTailoringModalOpen, setIsTailoringModalOpen] = useState(false);
  const [isTailoringTrackerOpen, setIsTailoringTrackerOpen] = useState(false);
  const [isCustomCakeModalOpen, setIsCustomCakeModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-sans antialiased selection:bg-amber-500 selection:text-stone-950">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Global Application Header */}
      <Header onOpenContactModal={() => setIsContactModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10">
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
              {/* ALL HUBS OVERVIEW */}
              {activeDivision === 'ALL' && (
                <div className="space-y-12">
                  <HeroBanner
                    onOpenTailoringModal={() => setIsTailoringModalOpen(true)}
                    onOpenCustomCakeModal={() => setIsCustomCakeModalOpen(true)}
                  />

                  {/* Division Quick Access Cards */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                          Explore 5 Business Hubs
                        </h2>
                        <p className="text-xs text-stone-500">
                          Operated by FLOURISH DESTINY COLLECTION in Okene, Kogi State.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {/* Fashion Card */}
                      <div 
                        onClick={() => setActiveDivision('FASHION')}
                        className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                            <Scissors className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                            Fashion & Tailoring
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Bespoke Ebira hand-woven Aso-Oke, Senator suits, Ankara kaftans with measurement inputs & production tracker.
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700">
                          <span>Enter Fashion Store</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Bakery Card */}
                      <div 
                        onClick={() => setActiveDivision('BAKERY')}
                        className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-900 flex items-center justify-center font-bold">
                            <Cake className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 group-hover:text-orange-700 transition-colors">
                            Artisanal Bakery
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Oven-fresh Agege butter bread, spicy meat pies, and custom multi-tiered wedding & birthday cake scheduler.
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-orange-700">
                          <span>Enter Bakery Studio</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Catering Card */}
                      <div 
                        onClick={() => setActiveDivision('CATERING')}
                        className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold">
                            <UtensilsCrossed className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                            Catering & Events
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Full-service event hospitality, firewood party Jollof, live quote calculator & online deposit reservation.
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-rose-700">
                          <span>View Catering Packages</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Grocery Card */}
                      <div 
                        onClick={() => setActiveDivision('GROCERY')}
                        className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                            Grocery Hub
                          </h3>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Okene tubers of yam, pure palm oil, rice bags, and daily supermarket essentials with Cash on Delivery option.
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                          <span>Shop Farm & Market</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Transport Card */}
                      <div 
                        onClick={() => setActiveDivision('TRANSPORT')}
                        className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between sm:col-span-2 lg:col-span-2"
                      >
                        <div className="space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                            <Car className="w-6 h-6" />
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                              Intra-City Kogi Ride-Hailing (Keke & Car)
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                              100% Upfront Online
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Geofenced exclusively within Kogi State boundaries with our base in Okene. Book Keke (Tricycle) or Saloon Car with live driver tracking and instant dispatch upon online payment.
                          </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-blue-700">
                          <span>Book Kogi Ride Now</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
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

      <ContactModal />
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
