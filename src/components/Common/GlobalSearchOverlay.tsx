import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  ShoppingBag,
  Scissors,
  Cake,
  UtensilsCrossed,
  Car,
  Smartphone,
  ArrowRight,
  Plus,
  Sparkles,
  MapPin
} from 'lucide-react';

interface GlobalSearchOverlayProps {
  onOpenTailoringModal: () => void;
  onOpenCustomCakeModal: () => void;
}

const POPULAR_SEARCH_CHIPS = [
  'Ankara',
  'Senator',
  'Aso-Oke',
  'Shoes',
  'Bags',
  'Watch',
  'Agege Bread',
  'Meat Pie',
  'Wedding Cake',
  'Jollof',
  'Rice',
  'Yam',
  'Palm Oil',
  'Airtime',
  'MTN Data',
  'Keke Ride'
];

export const GlobalSearchOverlay: React.FC<GlobalSearchOverlayProps> = ({
  onOpenTailoringModal,
  onOpenCustomCakeModal
}) => {
  const {
    searchQuery,
    setSearchQuery,
    products,
    addToCart,
    bespokeSamples,
    cakeSamples,
    cateringPackages,
    cateringDishes,
    transportRoutes,
    vtuDataPlans,
    setActiveDivision
  } = useApp();

  const q = searchQuery.trim().toLowerCase();

  if (!q) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-stone-500 flex items-center gap-1.5 mr-1">
          <Search className="w-3.5 h-3.5 text-amber-600" />
          <span>Quick Super-App Search:</span>
        </span>
        {POPULAR_SEARCH_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setSearchQuery(chip)}
            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-50 hover:text-amber-900 text-stone-700 text-xs font-medium border border-stone-200/80 hover:border-amber-300 transition-colors cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>
    );
  }

  // 1. Match Products (Fashion, Bakery, Grocery)
  const matchedProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.division.toLowerCase().includes(q) ||
      (p.fabric && p.fabric.toLowerCase().includes(q))
  );

  // 2. Match Bespoke Tailoring
  const matchedTailoring = bespokeSamples.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.fabric.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      'tailoring bespoke sew measurement agbada senator kaftan aso-oke ebira'.includes(q)
  );

  // 3. Match Custom Cakes
  const matchedCakes = cakeSamples.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.flavor.toLowerCase().includes(q) ||
      c.design.toLowerCase().includes(q) ||
      c.tier.toLowerCase().includes(q) ||
      'cake wedding birthday custom bakery'.includes(q)
  );

  // 4. Match Catering Packages & Event Dishes
  const matchedCateringDishes = cateringDishes.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      'catering event wedding jollof apapa pounded yam egusi asun party food'.includes(q)
  );

  const matchedCateringPackages = cateringPackages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(q) ||
      pkg.description.toLowerCase().includes(q) ||
      pkg.menuItems.some((m) => m.toLowerCase().includes(q))
  );

  // 5. Match Transport Routes / Ride-Hailing
  const isRideKeyword =
    'keke ride car transport cab tricycle okene lokoja ajaokuta adavi okehi kabba'.includes(q) ||
    q.includes('ride') ||
    q.includes('keke') ||
    q.includes('car');

  const matchedRoutes = transportRoutes.filter(
    (r) =>
      isRideKeyword ||
      r.pickup.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
  );

  // 6. Match Airtime & Data VTU
  const isVTUKeyword =
    'airtime data vtu recharge topup mtn airtel glo 9mobile sub bundle'.includes(q) ||
    q.includes('airtime') ||
    q.includes('data') ||
    q.includes('mtn') ||
    q.includes('airtel') ||
    q.includes('glo') ||
    q.includes('9mobile');

  const matchedVTUPlans = vtuDataPlans.filter(
    (plan) =>
      plan.status === 'ACTIVE' &&
      (isVTUKeyword ||
        plan.network.toLowerCase().includes(q) ||
        plan.name.toLowerCase().includes(q) ||
        plan.description.toLowerCase().includes(q))
  );

  const totalResultsCount =
    matchedProducts.length +
    matchedTailoring.length +
    matchedCakes.length +
    matchedCateringDishes.length +
    matchedCateringPackages.length +
    matchedRoutes.length +
    matchedVTUPlans.length;

  return (
    <div className="bg-white rounded-3xl border-2 border-amber-500/60 shadow-xl p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-stone-900 font-display">
              Global Super-App Search Results for &ldquo;{searchQuery}&rdquo;
            </h3>
            <p className="text-xs text-stone-500">
              Found <strong>{totalResultsCount}</strong> matching items & services across Fashion, Bakery, Catering, Grocery, Kogi Rides & VTU
            </p>
          </div>
        </div>

        <button
          onClick={() => setSearchQuery('')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear Search</span>
        </button>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-stone-400 mr-1">Try searching:</span>
        {POPULAR_SEARCH_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setSearchQuery(chip)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              searchQuery.toLowerCase() === chip.toLowerCase()
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {totalResultsCount === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 p-6 space-y-3">
          <Search className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-bold text-base text-stone-800">
            No exact matches found for &ldquo;{searchQuery}&rdquo;
          </h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Try searching for items like Ankara, Senator, Shoes, Bags, Agege Bread, Meat Pie, Wedding Cake, Rice, Yam, Palm Oil, Airtime, Data, or Keke Ride.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Store Products (Fashion, Bakery, Grocery) */}
          {matchedProducts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Store Products ({matchedProducts.length})</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {matchedProducts.slice(0, 8).map((product) => (
                  <div
                    key={product.id}
                    className="bg-stone-50 rounded-2xl border border-stone-200 p-3 flex flex-col justify-between gap-3 hover:border-amber-400 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-amber-700">
                          {product.division} · {product.category}
                        </div>
                        <h5 className="font-bold text-xs text-stone-900 line-clamp-2 mt-0.5">
                          {product.name}
                        </h5>
                        <div className="text-sm font-black text-stone-900 mt-1 tabular-nums">
                          ₦{product.price.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-200/70">
                      <button
                        disabled={!product.inStock || product.stockCount <= 0}
                        onClick={() => addToCart(product, 1)}
                        className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                          !product.inStock || product.stockCount <= 0
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            : 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>{!product.inStock || product.stockCount <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveDivision(product.division);
                          setSearchQuery('');
                        }}
                        className="py-1.5 px-2.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold cursor-pointer"
                      >
                        View Hub
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Airtime & Data VTU Matches */}
          {(isVTUKeyword || matchedVTUPlans.length > 0) && (
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Airtime & Mobile Data VTU ({matchedVTUPlans.length} Plans)</span>
                </h4>
                <button
                  onClick={() => {
                    setActiveDivision('VTU');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open VTU Recharge Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div
                  onClick={() => {
                    setActiveDivision('VTU');
                    setSearchQuery('');
                  }}
                  className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 hover:border-purple-400 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-[10px] font-bold text-purple-700">INSTANT TOP-UP</div>
                    <div className="font-bold text-xs text-stone-900 mt-0.5">
                      Buy MTN, Airtel, Glo & 9mobile Airtime
                    </div>
                    <div className="text-xs text-purple-800 font-semibold mt-1">₦100 – ₦50,000</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-700 shrink-0" />
                </div>

                {matchedVTUPlans.slice(0, 3).map((plan) => (
                  <div
                    key={plan.planId}
                    onClick={() => {
                      setActiveDivision('VTU');
                      setSearchQuery('');
                    }}
                    className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-purple-400 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[10px] font-bold text-purple-700">
                        {plan.network} DATA · {plan.validity}
                      </div>
                      <div className="font-bold text-xs text-stone-900 mt-0.5">
                        {plan.network} {plan.name} Bundle
                      </div>
                      <div className="text-sm font-black text-stone-900 mt-1 tabular-nums">
                        ₦{plan.customerPrice.toLocaleString()}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Bespoke Tailoring & Custom Cakes */}
          {(matchedTailoring.length > 0 || matchedCakes.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
              {matchedTailoring.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Bespoke Tailoring & Ebira Couture ({matchedTailoring.length})</span>
                    </span>
                    <button
                      onClick={onOpenTailoringModal}
                      className="px-3 py-1 rounded-lg bg-stone-900 text-amber-300 text-xs font-bold cursor-pointer"
                    >
                      Book Tailoring
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {matchedTailoring.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        onClick={onOpenTailoringModal}
                        className="p-2 rounded-xl bg-white border border-amber-200/80 flex items-center justify-between text-xs cursor-pointer hover:border-amber-400"
                      >
                        <span className="font-semibold text-stone-800 truncate">{item.name}</span>
                        <span className="font-bold text-amber-800 shrink-0 ml-2 tabular-nums">
                          ₦{item.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedCakes.length > 0 && (
                <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                      <Cake className="w-3.5 h-3.5" />
                      <span>Custom Wedding & Birthday Cakes ({matchedCakes.length})</span>
                    </span>
                    <button
                      onClick={onOpenCustomCakeModal}
                      className="px-3 py-1 rounded-lg bg-orange-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Design Cake
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {matchedCakes.slice(0, 3).map((cake) => (
                      <div
                        key={cake.id}
                        onClick={onOpenCustomCakeModal}
                        className="p-2 rounded-xl bg-white border border-orange-200/80 flex items-center justify-between text-xs cursor-pointer hover:border-orange-400"
                      >
                        <span className="font-semibold text-stone-800 truncate">{cake.name}</span>
                        <span className="font-bold text-orange-800 shrink-0 ml-2 tabular-nums">
                          ₦{cake.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Catering & Kogi Ride-Hailing */}
          {(matchedCateringDishes.length > 0 || matchedCateringPackages.length > 0 || matchedRoutes.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
              {(matchedCateringDishes.length > 0 || matchedCateringPackages.length > 0) && (
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>Catering & Event Menu Matches</span>
                    </span>
                    <button
                      onClick={() => {
                        setActiveDivision('CATERING');
                        setSearchQuery('');
                      }}
                      className="px-3 py-1 rounded-lg bg-rose-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Book Catering
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {matchedCateringDishes.slice(0, 3).map((dish) => (
                      <div
                        key={dish.id}
                        onClick={() => {
                          setActiveDivision('CATERING');
                          setSearchQuery('');
                        }}
                        className="p-2 rounded-xl bg-white border border-rose-200/80 flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="font-semibold text-stone-800 truncate">{dish.name}</span>
                        <span className="font-bold text-rose-700 shrink-0 ml-2 tabular-nums">
                          ₦{dish.pricePerPortion.toLocaleString()}/portion
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedRoutes.length > 0 && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5" />
                      <span>Kogi State Keke & Car Ride-Hailing</span>
                    </span>
                    <button
                      onClick={() => {
                        setActiveDivision('TRANSPORT');
                        setSearchQuery('');
                      }}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Book Ride
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {matchedRoutes.slice(0, 3).map((rt) => (
                      <div
                        key={rt.id}
                        onClick={() => {
                          setActiveDivision('TRANSPORT');
                          setSearchQuery('');
                        }}
                        className="p-2 rounded-xl bg-white border border-blue-200/80 flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="font-semibold text-stone-800 truncate">
                          {rt.pickup.split(',')[0]} → {rt.destination.split('/')[0]}
                        </span>
                        <span className="font-bold text-blue-700 shrink-0 ml-2 tabular-nums">
                          {rt.kekeFare > 0 ? `Keke ₦${rt.kekeFare}` : `Car ₦${rt.carFare.toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
