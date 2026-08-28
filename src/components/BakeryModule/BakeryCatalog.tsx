import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { BUSINESS_INFO, CAKE_CUSTOM_SAMPLES } from '../../data/mockData';
import { 
  Cake, 
  ShoppingBag, 
  Sparkles, 
  Clock, 
  Calendar, 
  Heart, 
  Filter,
  Phone,
  Flame,
  Users,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface BakeryCatalogProps {
  onOpenCustomCakeModal: () => void;
}

export const BakeryCatalog: React.FC<BakeryCatalogProps> = ({ onOpenCustomCakeModal }) => {
  const { products, addToCart, searchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const bakeryProducts = products.filter(p => p.division === 'BAKERY');
  const categories = ['ALL', 'Bread', 'Pastries', 'Cakes', 'Snacks'];

  const filteredProducts = bakeryProducts.filter(product => {
    const matchesCat = selectedCategory === 'ALL' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Hero Banner for Bakery */}
      <div className="bg-gradient-to-r from-amber-950 via-orange-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-orange-800/40 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Cake className="w-3.5 h-3.5" />
            <span>Freshly Baked Every Morning in Okene, Kogi State</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Flourish Artisanal Bakery & Custom Cake Studio
          </h2>

          <p className="text-sm text-stone-300 leading-relaxed">
            From our famous soft, pillowy Agege Butter Bread and golden flaky beef meat pies to opulent multi-tiered wedding and birthday cakes. Order standard daily treats with Cash on Delivery option or design a custom celebration cake with scheduled delivery.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenCustomCakeModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Design & Schedule Custom Cake</span>
            </button>

            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900/80 text-stone-300 hover:text-white border border-stone-800 text-xs"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Bakery Desk: {BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Daily Ovens Hot from 7:00 AM</span>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            {/* Image */}
            <div className="relative h-60 w-full bg-stone-100 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 shadow-xs">
                  {product.badge}
                </span>
              )}
              <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-900/80 text-white backdrop-blur-xs shadow-xs">
                {product.category}
              </span>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-700 transition-colors">
                  {product.name}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                {product.shelfLife && (
                  <div className="text-[11px] text-stone-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span><strong>Freshness:</strong> {product.shelfLife}</span>
                  </div>
                )}
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-lg font-extrabold text-stone-900">
                    ₦{product.price.toLocaleString()}
                  </div>
                  {product.originalPrice && (
                    <div className="text-xs text-stone-400 line-through">
                      ₦{product.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => addToCart(product, 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custom Cake Samples & Inspiration Showcase */}
      <div className="pt-6 border-t border-stone-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 uppercase tracking-wider">
              <Cake className="w-3.5 h-3.5" />
              <span>Celebration Cake Samples & Price Guide</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display">
              Signature Cake Samples & Custom Estimates
            </h3>
          </div>
          <button
            onClick={onOpenCustomCakeModal}
            className="self-start sm:self-auto inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:text-orange-900 transition-colors"
          >
            <span>Start Custom Cake Request</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAKE_CUSTOM_SAMPLES.map((sample) => (
            <div
              key={sample.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                  <img
                    src={sample.image}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {sample.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-stone-900/90 backdrop-blur-xs text-amber-300 font-bold text-[11px] rounded-lg border border-stone-700">
                      {sample.badge}
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-orange-600 text-white font-black text-xs rounded-lg shadow-sm">
                    ₦{sample.price.toLocaleString()}
                  </span>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="text-[11px] font-semibold text-orange-700 uppercase tracking-wider">
                    {sample.tier}
                  </div>
                  <h4 className="font-bold text-base text-stone-900">{sample.name}</h4>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {sample.design}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Cake className="w-3.5 h-3.5 text-orange-600" />
                      {sample.flavor}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-orange-600" />
                      {sample.servings}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={onOpenCustomCakeModal}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Customize This Cake (₦{sample.price.toLocaleString()})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Cake Order Promotional Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-amber-300 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/70 px-2.5 py-1 rounded-full">
            <Cake className="w-3.5 h-3.5 text-amber-800" />
            <span>Special Celebration & Wedding Cakes</span>
          </div>
          <h3 className="text-xl font-extrabold text-stone-900 font-display">
            Designing a Birthday, Anniversary or Traditional Wedding Cake?
          </h3>
          <p className="text-xs text-stone-700 max-w-2xl leading-relaxed">
            Customize flavors (Red Velvet, Chocolate Ganache, Marble, Vanilla), tiers, fondant inscriptions, and lock in your delivery time slot anywhere in Okene, Adavi, Okehi, or Lokoja.
          </p>
        </div>

        <button
          onClick={onOpenCustomCakeModal}
          className="shrink-0 px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-extrabold text-xs shadow-md transition-all hover:scale-105"
        >
          Open Custom Cake Builder
        </button>
      </div>
    </div>
  );
};
