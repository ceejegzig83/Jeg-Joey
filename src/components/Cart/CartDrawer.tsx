import React from 'react';
import { useApp } from '../../context/AppContext';
import { DELIVERY_ZONES, BUSINESS_INFO } from '../../data/mockData';
import { 
  ShoppingCart, 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  ShoppingBag,
  Sparkles,
  Cake,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    cartSubtotal,
    selectedDeliveryZone,
    setSelectedDeliveryZone,
    cartTotal,
    isCoDAllowedInCart,
    setIsCheckoutOpen
  } = useApp();

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-amber-100 font-display">
                    Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Flourish Multi-Division Commerce Hub
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-stone-800 text-base">Your Cart is Empty</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Browse our Fashion collection, freshly baked bread & pastries, or everyday grocery staples to add items.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-100">
                    <span>Order Items</span>
                    <button
                      onClick={clearCart}
                      className="text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Cart
                    </button>
                  </div>

                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl border border-stone-200 bg-stone-50/60 flex items-start gap-3 relative"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                        />

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-bold text-xs text-stone-900 line-clamp-1">
                              {item.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-stone-400 hover:text-rose-600 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-stone-500">
                            <span className="px-1.5 py-0.2 rounded bg-stone-200 font-semibold text-[10px] text-stone-700">
                              {item.division}
                            </span>
                            {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="text-xs font-black text-stone-900">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded text-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-stone-900 w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="w-5 h-5 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded text-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location in Kogi State */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 mt-4">
                    <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>Select Kogi Delivery Zone</span>
                    </label>
                    <select
                      value={selectedDeliveryZone.id}
                      onChange={(e) => {
                        const zone = DELIVERY_ZONES.find(z => z.id === e.target.value);
                        if (zone) setSelectedDeliveryZone(zone);
                      }}
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:border-amber-600"
                    >
                      {DELIVERY_ZONES.map(z => (
                        <option key={z.id} value={z.id}>
                          {z.name} (+₦{z.fee.toLocaleString()} • {z.time})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-5 bg-stone-900 text-white border-t border-stone-800 space-y-4">
                <div className="space-y-1.5 text-xs text-stone-400">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="text-stone-200 font-semibold">₦{cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee ({selectedDeliveryZone.name}):</span>
                    <span className="text-stone-200 font-semibold">₦{selectedDeliveryZone.fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-stone-800 text-sm font-black text-white">
                    <span>Total Amount:</span>
                    <span className="text-amber-400 text-base">₦{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* CoD Status Badge */}
                <div className="text-[11px] p-2.5 rounded-xl bg-stone-800/80 border border-stone-700 flex items-center gap-2 text-stone-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {isCoDAllowedInCart 
                      ? 'Cash on Delivery (CoD) & Online Payment available for this cart.' 
                      : 'Online payment required for this selection.'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
