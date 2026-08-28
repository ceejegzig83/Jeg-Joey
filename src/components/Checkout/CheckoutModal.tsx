import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BUSINESS_INFO } from '../../data/mockData';
import { PaymentMethod } from '../../types';
import { 
  CreditCard, 
  X, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Building, 
  Phone, 
  Smartphone, 
  Clock, 
  DollarSign, 
  Lock, 
  ArrowRight,
  AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    cartSubtotal, 
    selectedDeliveryZone, 
    cartTotal, 
    isCoDAllowedInCart, 
    createOrder, 
    userProfile, 
    setActiveInvoice,
    showToast 
  } = useApp();

  const [customerName, setCustomerName] = useState(userProfile.name || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile.phone || '');
  const [customerAddress, setCustomerAddress] = useState(userProfile.defaultAddress || '');
  const [deliveryArea, setDeliveryArea] = useState(selectedDeliveryZone.name);
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Method
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    isCoDAllowedInCart ? 'PAYSTACK_CARD' : 'PAYSTACK_CARD'
  );

  // Online gateway sub-type
  const [gatewayProvider, setGatewayProvider] = useState<'PAYSTACK' | 'FLUTTERWAVE'>('PAYSTACK');
  const [activeOnlineTab, setActiveOnlineTab] = useState<'CARD' | 'BANK_TRANSFER' | 'USSD'>('CARD');
  const [cardBrand, setCardBrand] = useState<'VERVE' | 'MASTERCARD' | 'VISA'>('VERVE');
  
  // Card inputs
  const [cardNumber, setCardNumber] = useState('5061 0920 1492 8401');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('321');

  // Virtual bank transfer account details (Simulated dynamic generation)
  const virtualAccount = {
    bank: 'Wema Bank / Moniepoint Microfinance',
    accountNumber: '9162723865',
    accountName: 'FLOURISH DESTINY - OKENE HUB',
    expiresIn: '29:59 mins'
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen) return null;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone || !customerAddress) {
      showToast('Please provide your full name, phone number, and delivery address', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const newOrder = createOrder({
        customerName,
        customerPhone,
        customerAddress,
        deliveryArea: selectedDeliveryZone.name,
        division: 'MULTI',
        items: cart,
        subtotal: cartSubtotal,
        deliveryFee: selectedDeliveryZone.fee,
        discount: 0,
        tax: 0,
        total: cartTotal,
        paymentMethod: selectedMethod,
        paymentStatus: selectedMethod === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
        orderStatus: 'PROCESSING',
        notes: orderNotes,
        estimatedDeliveryTime: selectedDeliveryZone.time
      });

      setIsCheckoutOpen(false);
      setActiveInvoice(newOrder);
    }, 1600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-2xl w-full my-8 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-6 relative">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-amber-100 font-display">
                  Secure Checkout & Delivery
                </h3>
                <p className="text-xs text-stone-300">
                  FLOURISH DESTINY COLLECTION • Okene Hub Dispatch
                </p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handlePlaceOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Delivery Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" /> Delivery Address & Contact in Kogi State
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Destiny Audu"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number (Required for Dispatch)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 08034567890"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Detailed Street Address & Landmarks</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="House number, Street, Near landmark, Okene / Adavi / Lokoja"
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Delivery Zone</label>
                  <input
                    type="text"
                    disabled
                    value={`${selectedDeliveryZone.name} (₦${selectedDeliveryZone.fee.toLocaleString()})`}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Delivery Notes (Optional)</label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Leave with security, call when outside"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector & Rule Enforcement */}
            <div className="space-y-4 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Select Payment Method
                </h4>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
                </span>
              </div>

              {/* Payment Option Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Online Gateway Option (Paystack/Flutterwave) */}
                <div
                  onClick={() => setSelectedMethod('PAYSTACK_CARD')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedMethod === 'PAYSTACK_CARD' || selectedMethod === 'BANK_TRANSFER' || selectedMethod === 'USSD'
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/40 shadow-xs'
                      : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-xs text-stone-900">Pay Online (Instant)</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-stone-950">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                    Paystack / Flutterwave • Naira Debit Card, Instant Bank Transfer, or USSD code.
                  </p>
                </div>

                {/* Cash on Delivery (CoD) Option */}
                <div
                  onClick={() => {
                    if (isCoDAllowedInCart) {
                      setSelectedMethod('CASH_ON_DELIVERY');
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all ${
                    !isCoDAllowedInCart
                      ? 'opacity-40 cursor-not-allowed bg-stone-100 border-stone-200'
                      : selectedMethod === 'CASH_ON_DELIVERY'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/40 cursor-pointer shadow-xs'
                      : 'border-stone-200 bg-stone-50/50 hover:border-stone-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs text-stone-900">Cash on Delivery (CoD)</span>
                    </div>
                    {isCoDAllowedInCart ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Available
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        Online Only
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                    {isCoDAllowedInCart
                      ? 'Pay with cash upon physical package delivery in Okene.'
                      : 'Disabled: Transport, Tailoring, & Catering require upfront payment.'}
                  </p>
                </div>
              </div>

              {/* Online Payment Sub-Channel Tabs (Card / Bank Transfer / USSD) */}
              {(selectedMethod === 'PAYSTACK_CARD' || selectedMethod === 'BANK_TRANSFER' || selectedMethod === 'USSD' || selectedMethod === 'FLUTTERWAVE_CARD') && (
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-4">
                  {/* Gateway selector toggle */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-700">Processor:</span>
                      <div className="flex items-center gap-1 bg-stone-200 p-0.5 rounded-lg text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setGatewayProvider('PAYSTACK');
                            if (activeOnlineTab === 'CARD') setSelectedMethod('PAYSTACK_CARD');
                          }}
                          className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                            gatewayProvider === 'PAYSTACK' ? 'bg-blue-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Paystack
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setGatewayProvider('FLUTTERWAVE');
                            if (activeOnlineTab === 'CARD') setSelectedMethod('FLUTTERWAVE_CARD');
                          }}
                          className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                            gatewayProvider === 'FLUTTERWAVE' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Flutterwave
                        </button>
                      </div>
                    </div>

                    <span className="text-[11px] text-stone-500 font-medium">
                      Debit Cards • Direct Transfer • USSD
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <div className="flex gap-2">
                      {(['CARD', 'BANK_TRANSFER', 'USSD'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => {
                            setActiveOnlineTab(tab);
                            if (tab === 'CARD') setSelectedMethod(gatewayProvider === 'PAYSTACK' ? 'PAYSTACK_CARD' : 'FLUTTERWAVE_CARD');
                            else if (tab === 'BANK_TRANSFER') setSelectedMethod('BANK_TRANSFER');
                            else if (tab === 'USSD') setSelectedMethod('USSD');
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            activeOnlineTab === tab
                              ? 'bg-stone-900 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          {tab === 'CARD' ? '💳 Debit Card' : tab === 'BANK_TRANSFER' ? '🏦 Bank Transfer' : '📱 USSD'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card View */}
                  {activeOnlineTab === 'CARD' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-1">
                        <span className="text-[11px] text-stone-500 font-semibold">Card Type:</span>
                        {(['VERVE', 'MASTERCARD', 'VISA'] as const).map((brand) => (
                          <button
                            key={brand}
                            type="button"
                            onClick={() => setCardBrand(brand)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                              cardBrand === brand
                                ? 'bg-amber-100 text-amber-900 border-amber-400'
                                : 'bg-white text-stone-600 border-stone-300'
                            }`}
                          >
                            {brand}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          {cardBrand} Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="5061 0000 0000 0000"
                          className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">CVV Security Code</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="123"
                            className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer View */}
                  {activeOnlineTab === 'BANK_TRANSFER' && (
                    <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
                      <div className="text-stone-500">Transfer exactly <strong>₦{cartTotal.toLocaleString()}</strong> to:</div>
                      <div className="p-3 bg-stone-100 rounded-lg space-y-1">
                        <div className="flex justify-between">
                          <span className="text-stone-500">Bank:</span>
                          <strong className="text-stone-900">{virtualAccount.bank}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Account Number:</span>
                          <strong className="text-amber-700 font-mono text-sm tracking-wider">{virtualAccount.accountNumber}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-500">Account Name:</span>
                          <strong className="text-stone-900">{virtualAccount.accountName}</strong>
                        </div>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        ✓ Instant automated payment detection once transfer is completed.
                      </p>
                    </div>
                  )}

                  {/* USSD View */}
                  {activeOnlineTab === 'USSD' && (
                    <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
                      <div className="text-stone-600 font-medium">Dial the USSD shortcode on your registered banking phone:</div>
                      <div className="p-3 bg-stone-900 text-amber-300 rounded-lg font-mono text-center text-sm font-bold">
                        *737*2*{cartTotal}*9162723865#
                      </div>
                      <div className="text-[11px] text-stone-500 text-center">
                        GTBank, Zenith (*966#), First Bank (*894#), Access (*901#) supported.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary & Confirm Action */}
            <div className="bg-stone-900 text-white rounded-2xl p-5 space-y-4">
              <div className="space-y-1 text-xs text-stone-400">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items):</span>
                  <span>₦{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ({selectedDeliveryZone.name}):</span>
                  <span>₦{selectedDeliveryZone.fee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-800 text-base font-black text-white">
                  <span>Total Payable:</span>
                  <span className="text-amber-400">₦{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order & Verifying Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {selectedMethod === 'CASH_ON_DELIVERY'
                        ? `Confirm Order ₦${cartTotal.toLocaleString()} (Cash on Delivery)`
                        : `Pay ₦${cartTotal.toLocaleString()} & Complete Order`}
                    </span>
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
