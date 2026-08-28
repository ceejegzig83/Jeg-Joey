import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BUSINESS_INFO } from '../../data/mockData';
import { 
  Scissors, 
  X, 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  Ruler, 
  Sparkles, 
  CheckCircle2, 
  Upload,
  Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TailoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TailoringModal: React.FC<TailoringModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { userProfile, createTailoringRequest, showToast, setActiveInvoice } = useApp();

  const [garmentType, setGarmentType] = useState('Ebira Traditional Aso-Oke Agbada 3-Piece');
  const [fabricPreference, setFabricPreference] = useState('Ebira Woven Cloth (Okene Origin)');
  const [colorTheme, setColorTheme] = useState('Emerald Green & Gold Thread');
  const [customerName, setCustomerName] = useState(userProfile.name || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile.phone || '');
  const [customerEmail, setCustomerEmail] = useState(userProfile.email || '');
  const [preferredCompletionDate, setPreferredCompletionDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });
  const [designDescription, setDesignDescription] = useState('Classic embroidery on front placket with traditional matching cap.');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');

  // Measurements
  const [chest, setChest] = useState<number | ''>(40);
  const [waist, setWaist] = useState<number | ''>(34);
  const [shoulder, setShoulder] = useState<number | ''>(18.5);
  const [sleeve, setSleeve] = useState<number | ''>(25);
  const [length, setLength] = useState<number | ''>(42);
  const [trouserLength, setTrouserLength] = useState<number | ''>(40);
  const [neck, setNeck] = useState<number | ''>(16);
  const [customNotes, setCustomNotes] = useState('');

  // Payment state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<'PAYSTACK' | 'FLUTTERWAVE'>('PAYSTACK');

  // Dynamic cost calculation based on garment & fabric
  const calculateEstimatedCost = () => {
    let base = 25000;
    if (garmentType.includes('Agbada')) base = 48000;
    else if (garmentType.includes('Senator')) base = 32000;
    else if (garmentType.includes('Gown')) base = 28000;
    else if (garmentType.includes('Corporate')) base = 38000;

    if (fabricPreference.includes('Ebira Woven')) base += 12000;
    else if (fabricPreference.includes('Italian Wool') || fabricPreference.includes('Cashmere')) base += 15000;
    else if (fabricPreference.includes('Customer Provided')) base -= 8000;

    return base;
  };

  const estimatedCost = calculateEstimatedCost();

  const handleSubmitAndPay = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone) {
      showToast('Please enter your full name and phone number', 'error');
      return;
    }

    setIsProcessingPayment(true);

    // Simulate Paystack/Flutterwave 100% Upfront verification
    setTimeout(() => {
      setIsProcessingPayment(false);

      const request = createTailoringRequest({
        customerName,
        customerPhone,
        customerEmail,
        garmentType,
        fabricPreference,
        colorTheme,
        measurements: {
          chest: Number(chest) || undefined,
          waist: Number(waist) || undefined,
          shoulder: Number(shoulder) || undefined,
          sleeve: Number(sleeve) || undefined,
          length: Number(length) || undefined,
          trouserLength: Number(trouserLength) || undefined,
          neck: Number(neck) || undefined,
          customNotes
        },
        designDescription,
        referenceImage: referenceImageUrl || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
        preferredCompletionDate,
        estimatedCost,
        depositPaid: estimatedCost, // 100% Upfront as per strict rule
      });

      onSuccess();
      onClose();
    }, 1600);
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
          <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-amber-100 font-display">
                  Bespoke Tailoring & Traditional Ebira Attire Request
                </h3>
                <p className="text-xs text-stone-300">
                  Custom sewing by master tailors in Okene, Kogi State.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitAndPay} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Strict Online Rule Notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Global Payment Rule:</strong> Custom tailoring requires 100% upfront online payment (Cash on Delivery is strictly disabled for bespoke tailoring). Materials are sourced immediately upon order.
              </div>
            </div>

            {/* Garment Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Garment & Fabric Specification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Garment Type</label>
                  <select
                    value={garmentType}
                    onChange={(e) => setGarmentType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600 font-medium"
                  >
                    <option>Ebira Traditional Aso-Oke Agbada 3-Piece</option>
                    <option>Executive Senator Kaftan 2-Piece Suit</option>
                    <option>Grand 3-Piece Ceremonial Agbada</option>
                    <option>Women&apos;s Royal Ankara Maxi Gown</option>
                    <option>Corporate 2-Piece Business Suit</option>
                    <option>Custom Traditional Attire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Fabric Preference</label>
                  <select
                    value={fabricPreference}
                    onChange={(e) => setFabricPreference(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600 font-medium"
                  >
                    <option>Ebira Woven Cloth (Okene Origin)</option>
                    <option>Super 140s Cashmere Wool</option>
                    <option>Guinea Brocade (Gold Tier)</option>
                    <option>100% Hollandis Cotton Wax</option>
                    <option>Customer Will Provide Own Fabric</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Color Theme / Combination</label>
                  <input
                    type="text"
                    value={colorTheme}
                    onChange={(e) => setColorTheme(e.target.value)}
                    placeholder="e.g. Royal Gold & Emerald Green, Midnight Black"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Preferred Completion Date</label>
                  <input
                    type="date"
                    value={preferredCompletionDate}
                    onChange={(e) => setPreferredCompletionDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Special Design Description / Notes</label>
                <textarea
                  value={designDescription}
                  onChange={(e) => setDesignDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe embroidery patterns, neck style (Mandarin/Round), pocket design, cuff style..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden focus:border-amber-600"
                />
              </div>
            </div>

            {/* Measurements Section */}
            <div className="space-y-4 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-amber-600" /> Body Measurements (Inches)
                </h4>
                <span className="text-[11px] text-stone-400">Standard Nigerian sizing metrics</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Chest / Bust</label>
                  <input
                    type="number"
                    step="0.5"
                    value={chest}
                    onChange={(e) => setChest(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                    placeholder="40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Waist</label>
                  <input
                    type="number"
                    step="0.5"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                    placeholder="34"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Shoulder</label>
                  <input
                    type="number"
                    step="0.5"
                    value={shoulder}
                    onChange={(e) => setShoulder(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                    placeholder="18.5"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Sleeve Length</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleeve}
                    onChange={(e) => setSleeve(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Top Length</label>
                  <input
                    type="number"
                    step="0.5"
                    value={length}
                    onChange={(e) => setLength(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                    placeholder="42"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Trouser Length</label>
                  <input
                    type="number"
                    step="0.5"
                    value={trouserLength}
                    onChange={(e) => setTrouserLength(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                    placeholder="40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Neck Circumference</label>
                  <input
                    type="number"
                    step="0.5"
                    value={neck}
                    onChange={(e) => setNeck(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs"
                    placeholder="16"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Upload Sample / Photo</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={referenceImageUrl}
                      onChange={(e) => setReferenceImageUrl(e.target.value)}
                      placeholder="Image URL or leave default"
                      className="w-full bg-stone-50 border border-stone-300 rounded-lg px-2 py-1.5 text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-4 pt-2 border-t border-stone-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Customer Contact Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone (for Fitting Updates)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Payment Summary & Online Checkout */}
            <div className="bg-stone-900 text-white rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-stone-400">Total Bespoke Cost (100% Upfront Mandatory)</div>
                  <div className="text-2xl font-black text-amber-300">
                    ₦{estimatedCost.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-stone-800 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentGateway('PAYSTACK')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      selectedPaymentGateway === 'PAYSTACK'
                        ? 'bg-amber-500 text-stone-950'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    Paystack
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentGateway('FLUTTERWAVE')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      selectedPaymentGateway === 'FLUTTERWAVE'
                        ? 'bg-amber-500 text-stone-950'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    Flutterwave
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Supports Naira Master/Visa/Verve Debit Cards, Instant Bank Transfer, USSD (*737#, *901#).</span>
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Secured Online Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₦{estimatedCost.toLocaleString()} & Confirm Tailoring Order</span>
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
