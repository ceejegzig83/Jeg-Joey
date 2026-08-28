import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { BUSINESS_INFO, BESPOKE_TAILORING_SAMPLES } from '../../data/mockData';
import { 
  Sparkles, 
  Scissors, 
  ShoppingBag, 
  Check, 
  Star, 
  Filter, 
  Layers, 
  Info,
  Phone,
  Clock,
  Tag,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface FashionCatalogProps {
  onOpenTailoringModal: () => void;
  onOpenTailoringTracker: () => void;
}

export const FashionCatalog: React.FC<FashionCatalogProps> = ({ 
  onOpenTailoringModal,
  onOpenTailoringTracker
}) => {
  const { products, addToCart, searchQuery, tailoringRequests } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [selectedSizeMap, setSelectedSizeMap] = useState<Record<string, string>>({});

  const fashionProducts = products.filter(p => p.division === 'FASHION');

  const categories = ['ALL', 'Traditional Wear', "Men's Wear", "Women's Wear", 'Corporate Wear', 'Shoes'];

  const filteredProducts = fashionProducts.filter(product => {
    const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
    const matchesGender = selectedGender === 'ALL' || product.gender === selectedGender || product.gender === 'Unisex';
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesGender && matchesSearch;
  });

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizeMap(prev => ({ ...prev, [productId]: size }));
  };

  return (
    <div className="space-y-8">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Okene Authentic Weaving & Modern African Couture</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Flourish Destiny Fashion & Custom Tailoring
          </h2>

          <p className="text-sm text-stone-300 leading-relaxed">
            Shop ready-to-wear Senator suits, traditional Ebira hand-woven Aso-Oke, elegant gowns, and genuine leather footwear. Or commission our master tailors for precision bespoke outfits made to your exact measurements.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenTailoringModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
            >
              <Scissors className="w-4 h-4" />
              <span>Book Bespoke Tailoring Request</span>
            </button>

            {tailoringRequests.length > 0 && (
              <button
                onClick={onOpenTailoringTracker}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 font-semibold text-xs sm:text-sm transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>Track Tailoring Orders ({tailoringRequests.length})</span>
              </button>
            )}

            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900/80 text-stone-300 hover:text-white border border-stone-800 text-xs"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Fashion Desk: {BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        {/* Category Pills */}
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
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gender Filter */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs">
          {['ALL', 'Men', 'Women'].map(gender => (
            <button
              key={gender}
              onClick={() => setSelectedGender(gender)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedGender === gender
                  ? 'bg-white text-stone-900 font-bold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {gender === 'ALL' ? 'All Genders' : gender}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
          <Sparkles className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="text-base font-bold text-stone-800">No fashion items match your filter</h4>
          <p className="text-xs text-stone-500">Try selecting another category or clear your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const currentSize = selectedSizeMap[product.id] || (product.sizes ? product.sizes[0] : undefined);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Image */}
                <div className="relative h-64 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-stone-900/90 text-amber-300 border border-amber-400/40 backdrop-blur-xs">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-stone-800 backdrop-blur-xs shadow-xs">
                    {product.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-700 transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {product.fabric && (
                      <div className="text-[11px] text-stone-500">
                        <strong className="text-stone-700">Fabric:</strong> {product.fabric}
                      </div>
                    )}

                    {/* Size Selector */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="pt-2">
                        <div className="text-[11px] font-semibold text-stone-600 mb-1.5">
                          Select Size:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {product.sizes.map(size => (
                            <button
                              key={size}
                              onClick={() => handleSizeSelect(product.id, size)}
                              className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-all ${
                                currentSize === size
                                  ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                                  : 'border-stone-200 text-stone-600 hover:border-stone-400'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
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
                      onClick={() => addToCart(product, 1, currentSize)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bespoke Tailoring Samples & Price Guide */}
      <div className="pt-6 border-t border-stone-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <Scissors className="w-3.5 h-3.5" />
              <span>Bespoke Style Samples & Price Guide</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display">
              Custom Craft Samples & Estimated Rates
            </h3>
          </div>
          <button
            onClick={onOpenTailoringModal}
            className="self-start sm:self-auto inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-600 transition-colors"
          >
            <span>Commission Any Style</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BESPOKE_TAILORING_SAMPLES.map((sample) => (
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
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-amber-500 text-stone-950 font-black text-xs rounded-lg shadow-sm">
                    Starting ₦{sample.price.toLocaleString()}
                  </span>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                    {sample.category}
                  </div>
                  <h4 className="font-bold text-base text-stone-900">{sample.name}</h4>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
                    <span className="inline-flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      {sample.fabric}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      {sample.turnaroundDays} Days Sew Time
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={onOpenTailoringModal}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  <span>Request Custom Order (₦{sample.price.toLocaleString()})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tailoring Promotion Callout */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <Scissors className="w-4 h-4" />
            <span>Need Custom Tailoring or Traditional Ebira Attire?</span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed max-w-2xl">
            We sew custom Senator styles, Agbada sets, women&apos;s gowns, and authentic Okene woven cloth to your exact measurements. (Note: In line with platform rules, custom tailoring requires 100% upfront online payment upon order confirmation).
          </p>
        </div>

        <button
          onClick={onOpenTailoringModal}
          className="shrink-0 px-5 py-3 rounded-xl bg-stone-900 text-amber-300 hover:bg-stone-800 font-bold text-xs shadow-md transition-colors"
        >
          Submit Measurements & Request
        </button>
      </div>
    </div>
  );
};
