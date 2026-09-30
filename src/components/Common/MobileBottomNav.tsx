import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Grid,
  Sparkles,
  Cake,
  ShoppingBag,
  Car,
  Smartphone,
  User
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const {
    activeDivision,
    setActiveDivision,
    currentRole,
    openCustomerAccount,
    orders,
    tailoringRequests
  } = useApp();

  if (currentRole !== 'CUSTOMER') return null;

  const activeOrdersCount = orders.length + tailoringRequests.length;

  return (
    <nav
      aria-label="Mobile Super-App Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-stone-950/95 backdrop-blur-md border-t border-stone-800 px-2 py-1.5 text-stone-300 shadow-2xl"
    >
      <div className="grid grid-cols-6 gap-1 max-w-md mx-auto">
        <button
          onClick={() => setActiveDivision('ALL')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
            activeDivision === 'ALL' ? 'text-amber-400 bg-stone-900' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveDivision('FASHION')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
            activeDivision === 'FASHION' ? 'text-amber-400 bg-stone-900' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span>Fashion</span>
        </button>

        <button
          onClick={() => setActiveDivision('GROCERY')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
            activeDivision === 'GROCERY' ? 'text-amber-400 bg-stone-900' : 'text-stone-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4 mb-0.5" />
          <span>Grocery</span>
        </button>

        <button
          onClick={() => setActiveDivision('BAKERY')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
            activeDivision === 'BAKERY' || activeDivision === 'CATERING'
              ? 'text-amber-400 bg-stone-900'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Cake className="w-4 h-4 mb-0.5" />
          <span>Food/Bake</span>
        </button>

        <button
          onClick={() => setActiveDivision('TRANSPORT')}
          className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
            activeDivision === 'TRANSPORT' ? 'text-amber-400 bg-stone-900' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Car className="w-4 h-4 mb-0.5" />
          <span>Ride</span>
        </button>

        <button
          onClick={() => openCustomerAccount('OVERVIEW')}
          className="relative flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-bold text-stone-400 hover:text-white transition-colors"
        >
          <User className="w-4 h-4 mb-0.5 text-amber-400" />
          <span>Account</span>
          {activeOrdersCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>
      </div>
    </nav>
  );
};
