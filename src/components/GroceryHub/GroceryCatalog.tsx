import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { BUSINESS_INFO } from '../../data/mockData';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  Check, 
  Truck, 
  ShieldCheck, 
  Phone, 
  Sparkles, 
  Zap 
} from 'lucide-react';
import { motion } from 'motion/react';

export const GroceryCatalog: React.FC = () => {
  const { products, addToCart, cart, updateCartQuantity, searchQuery, setSearchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const groceryProducts = products.filter(p => p.division === 'GROCERY');

  const categories = [
    'ALL',
    'Tubers & Roots',
    'Oils & Spices',
    'Grains & Rice',
    'Grains & Flours',
    'Soup Ingredients',
    'Proteins & Meat',
    'Supermarket Essentials'
  ];

  const filteredProducts = groceryProducts.filter(product => {
    const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getItemQuantityInCart = (productId: string) => {
    const item = cart.find(i => i.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Okene Local Farm Produce & Daily Supermarket Essentials</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Flourish Grocery Hub & Supermarket
          </h2>

          <p className="text-sm text-stone-300 leading-relaxed">
            Fresh giant Okene yams, pure unadulterated palm oil, rice sacks, local yellow garri, smoked catfish, soup spices, and household toiletries delivered directly to your doorstep in Okene and across Kogi State.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800/60 text-emerald-200 border border-emerald-600 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cash on Delivery (CoD) Fully Enabled</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-stone-300 border border-stone-800 text-xs">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Same-Day Express Dispatch in Okene</span>
            </div>

            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 text-amber-300 border border-stone-800 text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Department:
            </span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Farm Fresh Stocks</span>
          </div>
        </div>
      </div>

      {/* Grocery Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map(product => {
          const qtyInCart = getItemQuantityInCart(product.id);
          const cartItem = cart.find(i => i.productId === product.id);

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Image */}
              <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.badge && (
                  <span className="absolute top-2.5 left-2.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-100 shadow-xs">
                    {product.badge}
                  </span>
                )}
                {product.unit && (
                  <span className="absolute bottom-2.5 right-2.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-950/80 text-white backdrop-blur-xs">
                    {product.unit}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-stone-400">
                    {product.category}
                  </div>
                  <h3 className="font-bold text-sm text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Price & Quantity Adder */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-base font-extrabold text-stone-900">
                      ₦{product.price.toLocaleString()}
                    </div>
                    {product.originalPrice && (
                      <div className="text-[11px] text-stone-400 line-through">
                        ₦{product.originalPrice.toLocaleString()}
                      </div>
                    )}
                  </div>

                  {qtyInCart > 0 && cartItem ? (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl p-1">
                      <button
                        onClick={() => updateCartQuantity(cartItem.id, qtyInCart - 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold hover:bg-stone-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-emerald-950 w-5 text-center">
                        {qtyInCart}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(cartItem.id, qtyInCart + 1)}
                        className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold hover:bg-emerald-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
