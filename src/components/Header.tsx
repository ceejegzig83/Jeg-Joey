import React from 'react';
import { useApp } from '../context/AppContext';
import { BUSINESS_INFO } from '../data/mockData';
import { Division } from '../types';
import { 
  Phone, 
  MessageSquare, 
  MapPin, 
  ShoppingCart, 
  Car, 
  Sparkles, 
  Cake, 
  UtensilsCrossed, 
  ShoppingBag, 
  ShieldCheck, 
  Search, 
  User, 
  Grid, 
  Clock,
  Menu,
  X,
  Lock,
  LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

export const Header: React.FC = () => {
  const { 
    activeDivision, 
    setActiveDivision, 
    cart, 
    setIsCartOpen, 
    activeRide, 
    currentRole, 
    setCurrentRole,
    isAdminAuthenticated,
    logoutAdmin,
    setIsAdminLoginModalOpen,
    setIsContactModalOpen,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems: { id: Division; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'ALL', label: 'All Services Hub', icon: Grid },
    { id: 'FASHION', label: 'Fashion Store', icon: Sparkles },
    { id: 'BAKERY', label: 'Artisanal Bakery', icon: Cake },
    { id: 'CATERING', label: 'Catering Services', icon: UtensilsCrossed },
    { id: 'GROCERY', label: 'Grocery Hub', icon: ShoppingBag },
    { id: 'TRANSPORT', label: 'Kogi Ride-Hailing', icon: Car },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 shadow-md border-b border-stone-800">
      {/* Top Utility Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-stone-950 px-4 py-1.5 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Location & Tag */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold">
              <MapPin className="w-3.5 h-3.5" /> Okene, Kogi State
            </span>
            <span className="hidden md:inline text-stone-900/60">•</span>
            <span className="hidden md:inline">Hub Base & Intra-State Transport</span>
          </div>

          {/* Contact Direct Phone & WhatsApp Actions */}
          <div className="flex items-center gap-3 ml-auto">
            <a 
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center gap-1.5 bg-stone-950 text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold hover:bg-stone-900 transition-colors shadow-xs"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Call: {BUSINESS_INFO.phone}</span>
            </a>

            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-emerald-700 text-white px-2 py-0.5 rounded-full text-xs font-semibold hover:bg-emerald-800 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div 
            onClick={() => setActiveDivision('ALL')} 
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
              FDC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-amber-100 font-display">
                  FLOURISH DESTINY
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Collection
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium">
                Multi-Service Commerce & Logistics • Okene, Kogi
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fashion, bakery, grocery, catering packages..."
                className="w-full bg-stone-800/90 text-stone-100 placeholder-stone-400 text-xs rounded-full pl-9 pr-4 py-2 border border-stone-700 focus:outline-hidden focus:border-amber-400 transition-colors"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Ride indicator if trip is ongoing */}
            {activeRide && (
              <button
                onClick={() => setActiveDivision('TRANSPORT')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 text-xs font-semibold animate-pulse hover:bg-blue-500/30"
              >
                <Car className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Active Trip:</span>
                <span>{activeRide.status.replace(/_/g, ' ')}</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* View Mode Controls (Admin hidden from public) */}
            <div className="hidden sm:flex items-center bg-stone-800/90 rounded-xl p-0.5 border border-stone-700 text-xs">
              <button
                onClick={() => setCurrentRole('CUSTOMER')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  currentRole === 'CUSTOMER'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => setCurrentRole('DRIVER')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  currentRole === 'DRIVER'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Driver Mode
              </button>

              {isAdminAuthenticated && (
                <button
                  onClick={() => setCurrentRole('ADMIN')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                    currentRole === 'ADMIN'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : 'text-amber-400 hover:text-amber-200 font-semibold'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin HQ</span>
                </button>
              )}
            </div>

            {/* If Admin is logged in, show quick sign out button */}
            {isAdminAuthenticated && (
              <button
                onClick={logoutAdmin}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-950/80 text-stone-300 hover:text-rose-200 border border-stone-700 hover:border-rose-700 text-xs transition-colors"
                title="Logout Administrator Session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-medium">Exit Admin</span>
              </button>
            )}

            {/* Support / Contact Modal Trigger */}
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
              title="Contact Flourish Destiny Collection (09162723865)"
            >
              <Phone className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-stone-800 text-stone-300 lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-2 lg:hidden">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, cakes, catering, food..."
              className="w-full bg-stone-800 text-stone-100 placeholder-stone-400 text-xs rounded-lg pl-8 pr-3 py-2 border border-stone-700 focus:outline-hidden focus:border-amber-400"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* Division Navigation Tabs */}
      <div className="bg-stone-950/80 border-t border-stone-800/80 overflow-x-auto scrollbar-none px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeDivision === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveDivision(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950' : 'text-amber-400/80'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Navigation for Role Switching & Quick Links */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-900 border-t border-stone-800 p-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wider">
              Switch View Mode
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setCurrentRole('CUSTOMER');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                  currentRole === 'CUSTOMER'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-stone-300'
                }`}
              >
                Customer Store
              </button>
              <button
                onClick={() => {
                  setCurrentRole('DRIVER');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                  currentRole === 'DRIVER'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-stone-300'
                }`}
              >
                Driver Dispatch
              </button>
            </div>

            {isAdminAuthenticated && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCurrentRole('ADMIN');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 ${
                    currentRole === 'ADMIN'
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-amber-950/40 text-amber-300 border border-amber-800/60'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Terminal</span>
                </button>
                <button
                  onClick={() => {
                    logoutAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-stone-800 text-rose-300 border border-stone-700 flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Admin</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-stone-800 flex flex-col gap-2">
            <div className="text-xs text-stone-400">
              Official Contact: <span className="text-amber-300 font-bold">{BUSINESS_INFO.phone}</span>
            </div>
            <div className="text-xs text-stone-400">
              Location: <span className="text-stone-200">{BUSINESS_INFO.address}</span>
            </div>
            {!isAdminAuthenticated && (
              <div className="pt-2 text-right">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAdminLoginModalOpen(true);
                  }}
                  className="text-[11px] text-stone-500 hover:text-stone-300 inline-flex items-center gap-1 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>Staff Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
