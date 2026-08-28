import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BUSINESS_INFO } from '../../data/mockData';
import { 
  Cake, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2,
  Heart,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomCakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CustomCakeModal: React.FC<CustomCakeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { userProfile, createCakeOrder, showToast } = useApp();

  const [cakeType, setCakeType] = useState('Birthday Celebration Cake');
  const [cakeSize, setCakeSize] = useState('10-inch Double Layer (Feeds 15-20)');
  const [flavor, setFlavor] = useState('Red Velvet & Cream Cheese');
  const [layers, setLayers] = useState(2);
  const [designStyle, setDesignStyle] = useState('Buttercream with Floral Accents & Gold Drip');
  const [colorTheme, setColorTheme] = useState('Champagne Gold & Blush Pink');
  const [inscription, setInscription] = useState('Happy Birthday Flourish!');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');

  // Delivery Scheduling
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('Morning (9:00 AM - 12:00 PM)');
  const [deliveryAddress, setDeliveryAddress] = useState(userProfile.defaultAddress || 'Total Junction, Inoziomi, Okene');
  const [recipientName, setRecipientName] = useState(userProfile.name || '');
  const [recipientPhone, setRecipientPhone] = useState(userProfile.phone || '');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Dynamic Price calculation
  const calculatePrice = () => {
    let base = 18000;
    if (cakeSize.includes('10-inch')) base = 25000;
    else if (cakeSize.includes('2-Tier')) base = 42000;
    else if (cakeSize.includes('3-Tier')) base = 68000;
    else if (cakeSize.includes('4-Tier')) base = 110000;

    if (designStyle.includes('Fondant') || designStyle.includes('Gold Drip')) base += 5000;
    return base;
  };

  const estimatedPrice = calculatePrice();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientName || !recipientPhone || !deliveryAddress) {
      showToast('Please fill in recipient name, phone, and delivery address', 'error');
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      createCakeOrder({
        customerName: recipientName,
        customerPhone: recipientPhone,
        cakeType,
        cakeSize,
        flavor,
        layers,
        designStyle,
        colorTheme,
        inscription,
        referenceImage: referenceImageUrl || 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80',
        deliveryDate,
        deliveryTimeSlot,
        deliveryAddress,
        recipientName,
        recipientPhone,
        specialInstructions,
        estimatedPrice,
      });

      onSuccess();
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-2xl w-full my-8 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-950 via-amber-900 to-stone-900 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-amber-100 font-display">
                  Custom Cake Design & Delivery Scheduler
                </h3>
                <p className="text-xs text-stone-300">
                  Flourish Artisanal Bakery Studio • Okene, Kogi State
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Cake Flavor & Structure */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-600" /> Cake Specifications
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Occasion / Cake Type</label>
                  <select
                    value={cakeType}
                    onChange={(e) => setCakeType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium"
                  >
                    <option>Birthday Celebration Cake</option>
                    <option>Wedding & Reception 3-Tier Cake</option>
                    <option>Traditional Engagement Cake</option>
                    <option>Anniversary Celebration</option>
                    <option>Graduation / Milestone Cake</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Size & Tiers</label>
                  <select
                    value={cakeSize}
                    onChange={(e) => {
                      setCakeSize(e.target.value);
                      if (e.target.value.includes('3-Tier')) setLayers(3);
                      else if (e.target.value.includes('2-Tier')) setLayers(2);
                      else if (e.target.value.includes('4-Tier')) setLayers(4);
                    }}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium"
                  >
                    <option>8-inch Single Layer (Feeds 8-10)</option>
                    <option>10-inch Double Layer (Feeds 15-20)</option>
                    <option>2-Tier Grand Celebration (Feeds 35-45)</option>
                    <option>3-Tier Royal Wedding (Feeds 80-100)</option>
                    <option>4-Tier Masterpiece (Feeds 150+)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Cake Flavor</label>
                  <select
                    value={flavor}
                    onChange={(e) => setFlavor(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium"
                  >
                    <option>Red Velvet & Cream Cheese</option>
                    <option>Rich Belgian Chocolate Fudge</option>
                    <option>Classic Madagascan Vanilla Sponge</option>
                    <option>Vanilla & Chocolate Marble Swirl</option>
                    <option>Coconut Infused Tropical Sponge</option>
                    <option>Strawberry Shortcake Layer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Design & Frosting Style</label>
                  <select
                    value={designStyle}
                    onChange={(e) => setDesignStyle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium"
                  >
                    <option>Buttercream with Floral Accents & Gold Drip</option>
                    <option>Sculpted Fondant with Edible Gold Leaf</option>
                    <option>Naked / Semi-Naked Rustic Cake</option>
                    <option>Whipped Cream with Fresh Berries</option>
                    <option>Character / Themed Custom Mold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Color Theme</label>
                  <input
                    type="text"
                    value={colorTheme}
                    onChange={(e) => setColorTheme(e.target.value)}
                    placeholder="e.g. Royal Blue & Silver, Emerald Green & Gold"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Cake Inscription / Message</label>
                  <input
                    type="text"
                    value={inscription}
                    onChange={(e) => setInscription(e.target.value)}
                    placeholder="e.g. Happy 40th Birthday Chief Ibrahim!"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-medium text-amber-900 bg-amber-50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Delivery Date & Slot Scheduling */}
            <div className="space-y-4 pt-2 border-t border-stone-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" /> Delivery Date & Time Slot Scheduling
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Scheduled Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Delivery Time Slot</label>
                  <select
                    value={deliveryTimeSlot}
                    onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-medium"
                  >
                    <option>Morning (9:00 AM - 12:00 PM)</option>
                    <option>Afternoon (1:00 PM - 4:00 PM)</option>
                    <option>Evening (5:00 PM - 7:30 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Delivery Address in Kogi State</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Street, Landmark, Okene / Adavi / Lokoja"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Recipient Phone</label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Total Price & Checkout */}
            <div className="bg-stone-900 text-white rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-400">Total Custom Cake Order</div>
                  <div className="text-2xl font-black text-amber-300">
                    ₦{estimatedPrice.toLocaleString()}
                  </div>
                </div>

                <div className="text-right text-xs text-stone-400">
                  <div>Delivery Zone: Okene Central Hub</div>
                  <span className="text-emerald-400 font-bold">Slot Guaranteed</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span>Confirming Bakery Schedule & Payment...</span>
                  </>
                ) : (
                  <>
                    <Cake className="w-4 h-4" />
                    <span>Pay ₦{estimatedPrice.toLocaleString()} & Schedule Delivery</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
