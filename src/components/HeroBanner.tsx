import React from 'react';
import { useApp } from '../context/AppContext';
import { BUSINESS_INFO } from '../data/mockData';
import { Division } from '../types';
import { 
  Sparkles, 
  Cake, 
  UtensilsCrossed, 
  ShoppingBag, 
  Car, 
  MapPin, 
  Phone, 
  ArrowRight, 
  ShieldCheck,
  Search,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

export const HeroBanner: React.FC = () => {
  const { setActiveDivision, searchQuery, setSearchQuery } = useApp();

  const hubs: {
    id: Division;
    title: string;
    subtitle: string;
    tag: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    badge: string;
    cta: string;
    image: string;
  }[] = [
    {
      id: 'FASHION',
      title: 'Fashion Store & Tailoring',
      subtitle: 'Ebira Aso-Oke, Senator Suits, Ready-to-wear & Bespoke Tailoring',
      tag: 'Custom Fit & Ready-to-Wear',
      icon: Sparkles,
      accentColor: 'from-amber-600 to-amber-900',
      badge: 'Bespoke Tailoring',
      cta: 'Explore Fashion',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'BAKERY',
      title: 'Artisanal Bakery',
      subtitle: 'Agege Butter Bread, Flaky Meat Pies, Custom Birthday & Wedding Cakes',
      tag: 'Fresh Daily Oven Bakes',
      icon: Cake,
      accentColor: 'from-orange-600 to-amber-800',
      badge: 'Custom Cakes',
      cta: 'Order Bakery',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'CATERING',
      title: 'Catering Services',
      subtitle: 'Weddings, Traditional Celebrations, Corporate Banquets & VIP Feasts',
      tag: 'Full Event Hospitality',
      icon: UtensilsCrossed,
      accentColor: 'from-rose-600 to-amber-900',
      badge: 'Package Quotes',
      cta: 'Book Catering',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'GROCERY',
      title: 'Grocery Hub',
      subtitle: 'Kogi Farm Yams, Pure Palm Oil, Supermarket Essentials & Fast Delivery',
      tag: 'Daily Supermarket & Farm Produce',
      icon: ShoppingBag,
      accentColor: 'from-emerald-600 to-teal-900',
      badge: 'Fast Delivery',
      cta: 'Shop Groceries',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'TRANSPORT',
      title: 'Kogi State Ride-Hailing',
      subtitle: 'Okene base intra-state Keke & Car dispatch. 100% Upfront Online Payment',
      tag: 'Keke (Tricycle) & Car Rides',
      icon: Car,
      accentColor: 'from-blue-600 to-indigo-900',
      badge: 'Kogi Geofenced',
      cta: 'Book a Ride',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white pb-12 pt-8 sm:pt-12 px-4 sm:px-6">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Okene, Kogi State Headquarters • Call: {BUSINESS_INFO.phone}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display text-white">
            Everything You Need. <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-300 bg-clip-text text-transparent">
              One Flourishing Destination.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to <strong>FLOURISH DESTINY COLLECTION</strong>. Experience seamless commerce, bespoke Ebira tailoring, artisan bakery delights, royal event catering, everyday groceries, and fast intra-city ride-hailing across Kogi State.
          </p>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveDivision('TRANSPORT')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
            >
              <Car className="w-4 h-4" />
              <span>Book Keke / Car Ride</span>
            </button>

            <button
              onClick={() => setActiveDivision('FASHION')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Shop Fashion & Tailoring</span>
            </button>

            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-semibold text-xs sm:text-sm border border-stone-700 transition-colors"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>{BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>

        {/* 5 Distinct Business Hub Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {hubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <motion.div
                key={hub.id}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => setActiveDivision(hub.id)}
                className="group relative cursor-pointer rounded-2xl overflow-hidden bg-stone-800/80 border border-stone-700 hover:border-amber-400/60 shadow-lg transition-all flex flex-col justify-between"
              >
                {/* Background Image with Overlay */}
                <div className="relative h-32 w-full overflow-hidden">
                  <img
                    src={hub.image}
                    alt={hub.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${hub.accentColor} opacity-70 group-hover:opacity-60 transition-opacity`} />
                  
                  {/* Badge */}
                  <span className="absolute top-2.5 right-2.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-950/80 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
                    {hub.badge}
                  </span>

                  {/* Icon */}
                  <div className="absolute bottom-2.5 left-2.5 p-2 rounded-xl bg-stone-950/70 backdrop-blur-xs text-amber-400">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                      {hub.title}
                    </h3>
                    <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                      {hub.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-700/60 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                    <span>{hub.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Payment & Location Rule Highlights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-stone-950/80 p-4 rounded-xl border border-stone-800">
          <div className="flex items-center gap-2.5 text-stone-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Intra-City Rides:</strong> 100% Upfront Online Payment ONLY. Geofenced in Kogi State.</span>
          </div>

          <div className="flex items-center gap-2.5 text-stone-300">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Cash on Delivery (CoD):</strong> Enabled for Grocery, ready Fashion, & standard Bakery.</span>
          </div>

          <div className="flex items-center gap-2.5 text-stone-300">
            <Phone className="w-4 h-4 text-blue-400 shrink-0" />
            <span><strong>Okene Hub Hotline:</strong> 09162723865 for customer bookings and queries.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
