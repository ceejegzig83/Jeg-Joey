import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TailoringProductionStage } from '../../types';
import {
  User,
  X,
  ShoppingBag,
  Scissors,
  Cake,
  UtensilsCrossed,
  Car,
  Smartphone,
  FileText,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Save,
  Package,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NINE_TAILORING_STAGES: { key: TailoringProductionStage; label: string }[] = [
  { key: 'ORDER_RECEIVED', label: 'ORDER RECEIVED' },
  { key: 'MEASUREMENT_CONFIRMED', label: 'MEASUREMENT CONFIRMED' },
  { key: 'CUTTING', label: 'CUTTING' },
  { key: 'SEWING', label: 'SEWING' },
  { key: 'FINISHING', label: 'FINISHING' },
  { key: 'QUALITY_CHECK', label: 'QUALITY CHECK' },
  { key: 'READY', label: 'READY' },
  { key: 'OUT_FOR_DELIVERY', label: 'OUT FOR DELIVERY' },
  { key: 'COMPLETED', label: 'COMPLETED' }
];

export const getNineStageIndex = (status: TailoringProductionStage): number => {
  switch (status) {
    case 'ORDER_RECEIVED':
    case 'REQUESTED':
      return 0;
    case 'MEASUREMENT_CONFIRMED':
    case 'REVIEWING':
    case 'QUOTED':
    case 'APPROVED':
      return 1;
    case 'CUTTING':
      return 2;
    case 'SEWING':
    case 'IN_PRODUCTION':
      return 3;
    case 'FINISHING':
      return 4;
    case 'QUALITY_CHECK':
      return 5;
    case 'READY':
      return 6;
    case 'OUT_FOR_DELIVERY':
      return 7;
    case 'COMPLETED':
      return 8;
    default:
      return 0;
  }
};

export interface CustomerAccountModalProps {
  onOpenTailoringModal?: () => void;
  onOpenCustomCakeModal?: () => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  onOpenTailoringModal,
  onOpenCustomCakeModal
}) => {
  const {
    isCustomerAccountOpen,
    setIsCustomerAccountOpen,
    customerAccountTab,
    setCustomerAccountTab,
    userProfile,
    setUserProfile,
    logoutCustomer,
    orders,
    tailoringRequests,
    cakeOrders,
    cateringBookings,
    rideHistory,
    activeRide,
    vtuTransactions,
    initializeOrderPayment,
    verifyOrderPayment,
    setActiveInvoice,
    setActiveVTUReceipt,
    setActiveDivision,
    showToast
  } = useApp();

  const [profileForm, setProfileForm] = useState({ ...userProfile });
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  if (!isCustomerAccountOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile((prev) => ({
      ...prev,
      name: profileForm.name,
      phone: profileForm.phone,
      email: profileForm.email,
      defaultAddress: profileForm.defaultAddress,
      defaultArea: profileForm.defaultArea
    }));
    fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm)
    }).catch(() => {});
    showToast('Customer profile & default Kogi delivery address saved!', 'success', 'Profile Updated');
  };

  const handleRetryOnlineOrderPayment = async (orderId: string, method: any) => {
    setRetryingOrderId(orderId);
    try {
      const initRes = await initializeOrderPayment({
        entityType: 'ORDER',
        entityId: orderId,
        channel: method || 'PAYSTACK_CARD',
        customerEmail: userProfile.email,
        customerPhone: userProfile.phone
      });
      if (initRes.success && initRes.reference) {
        const verifyRes = await verifyOrderPayment({
          reference: initRes.reference,
          simulatedOutcome: 'SUCCESS'
        });
        if (verifyRes.success && verifyRes.order) {
          setActiveInvoice(verifyRes.order);
        }
      }
    } finally {
      setRetryingOrderId(null);
    }
  };

  const tabs = [
    { id: 'OVERVIEW', label: 'Overview', icon: User },
    { id: 'ORDERS', label: `Store Orders (${orders.length})`, icon: ShoppingBag },
    { id: 'TAILORING', label: `Tailoring (${tailoringRequests.length})`, icon: Scissors },
    { id: 'CAKES_CATERING', label: `Cakes & Catering (${cakeOrders.length + cateringBookings.length})`, icon: Cake },
    { id: 'RIDES', label: `Rides (${rideHistory.length})`, icon: Car },
    { id: 'VTU', label: `VTU History (${vtuTransactions.length})`, icon: Smartphone },
    { id: 'PROFILE', label: 'My Profile', icon: MapPin }
  ];

  const orderSteps = ['PLACED', 'PROCESSING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  const getOrderStepIndex = (status: string): number => {
    switch (status) {
      case 'PENDING':
      case 'PLACED':
      case 'CONFIRMED':
      case 'RECEIVED':
        return 0;
      case 'PROCESSING':
        return 1;
      case 'READY':
      case 'READY_FOR_PICKUP':
        return 2;
      case 'DISPATCHED':
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-4xl w-full my-6 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Header */}
          <div className="bg-stone-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-stone-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-base">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-amber-100 font-display">
                  {userProfile.name} • Super-App Account & Order Tracker
                </h3>
                <p className="text-xs text-stone-400">
                  {userProfile.phone} · {userProfile.defaultAddress}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCustomerAccountOpen(false)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-stone-100 border-b border-stone-200 px-4 py-2 overflow-x-auto shrink-0">
            <div className="flex items-center gap-1.5 min-w-max">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = customerAccountTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setCustomerAccountTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-stone-900 text-amber-300 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {/* 1. OVERVIEW TAB */}
            {customerAccountTab === 'OVERVIEW' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div
                    onClick={() => setCustomerAccountTab('ORDERS')}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-500 cursor-pointer transition-all"
                  >
                    <ShoppingBag className="w-5 h-5 text-amber-600 mb-2" />
                    <div className="text-xl font-black text-stone-900 tabular-nums">{orders.length}</div>
                    <div className="text-xs font-semibold text-stone-500">Store Orders</div>
                  </div>

                  <div
                    onClick={() => setCustomerAccountTab('TAILORING')}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-500 cursor-pointer transition-all"
                  >
                    <Scissors className="w-5 h-5 text-amber-700 mb-2" />
                    <div className="text-xl font-black text-stone-900 tabular-nums">{tailoringRequests.length}</div>
                    <div className="text-xs font-semibold text-stone-500">Tailoring Orders</div>
                  </div>

                  <div
                    onClick={() => setCustomerAccountTab('CAKES_CATERING')}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-500 cursor-pointer transition-all"
                  >
                    <Cake className="w-5 h-5 text-orange-600 mb-2" />
                    <div className="text-xl font-black text-stone-900 tabular-nums">
                      {cakeOrders.length + cateringBookings.length}
                    </div>
                    <div className="text-xs font-semibold text-stone-500">Cakes & Events</div>
                  </div>

                  <div
                    onClick={() => setCustomerAccountTab('RIDES')}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-500 cursor-pointer transition-all"
                  >
                    <Car className="w-5 h-5 text-blue-600 mb-2" />
                    <div className="text-xl font-black text-stone-900 tabular-nums">{rideHistory.length}</div>
                    <div className="text-xs font-semibold text-stone-500">Kogi Rides</div>
                  </div>

                  <div
                    onClick={() => setCustomerAccountTab('VTU')}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-amber-500 cursor-pointer transition-all"
                  >
                    <Smartphone className="w-5 h-5 text-purple-600 mb-2" />
                    <div className="text-xl font-black text-stone-900 tabular-nums">{vtuTransactions.length}</div>
                    <div className="text-xs font-semibold text-stone-500">VTU Recharges</div>
                  </div>
                </div>

                {/* Quick Recent Activity */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Recent Multi-Service Activity
                  </h4>

                  {activeRide && (
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 uppercase">ACTIVE RIDE IN PROGRESS</span>
                        <div className="font-bold text-sm text-stone-900">
                          {activeRide.pickupLocation.name} → {activeRide.destinationLocation.name}
                        </div>
                        <div className="text-xs text-stone-600">
                          Driver: {activeRide.driver?.name} ({activeRide.driver?.plateNumber})
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsCustomerAccountOpen(false);
                          setActiveDivision('TRANSPORT');
                        }}
                        className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Track Live Map
                      </button>
                    </div>
                  )}

                  {orders.slice(0, 2).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-900">
                          Order {ord.orderNumber} · {ord.items.length} item(s)
                        </div>
                        <div className="text-xs text-stone-500">
                          Status: <strong className="text-amber-700">{ord.orderStatus.replace(/_/g, ' ')}</strong> · Delivery: {ord.deliveryArea}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-stone-900 tabular-nums">
                          ₦{ord.total.toLocaleString()}
                        </span>
                        <button
                          onClick={() => setActiveInvoice(ord)}
                          className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-bold cursor-pointer"
                        >
                          Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. STORE ORDERS TAB */}
            {customerAccountTab === 'ORDERS' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-stone-500 text-xs">
                    No store orders yet. Add Fashion, Bakery, or Grocery items to your cart to place an order.
                  </div>
                ) : (
                  orders.map((ord) => {
                    const stepIdx = getOrderStepIndex(ord.orderStatus);
                    return (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="font-black text-sm text-stone-900">
                              {ord.orderNumber} · {ord.customerName}
                            </div>
                            <div className="text-xs text-stone-500">
                              {new Date(ord.createdAt).toLocaleString()} · {ord.deliveryArea}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-base text-stone-900 tabular-nums">
                              ₦{ord.total.toLocaleString()}
                            </div>
                            <div className="text-[11px] font-semibold text-emerald-700">
                              {ord.paymentStatus} ({ord.paymentMethod.replace(/_/g, ' ')})
                            </div>
                          </div>
                        </div>

                        {/* Order Progress Stepper */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {orderSteps.map((st, idx) => {
                            const done = idx <= stepIdx;
                            return (
                              <div
                                key={st}
                                className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 ${
                                  done
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    : 'bg-white border-stone-200 text-stone-400'
                                }`}
                              >
                                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${done ? 'text-emerald-600' : 'text-stone-300'}`} />
                                <span className="truncate">{st.replace(/_/g, ' ')}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200 text-xs">
                          <span className="text-stone-600">
                            Items: {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </span>
                          <div className="flex items-center gap-2">
                            {ord.paymentStatus === 'PENDING' && ord.paymentMethod !== 'CASH_ON_DELIVERY' && (
                              <button
                                type="button"
                                disabled={retryingOrderId === ord.id}
                                onClick={() => handleRetryOnlineOrderPayment(ord.id, ord.paymentMethod)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shrink-0 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>
                                  {retryingOrderId === ord.id ? 'Verifying...' : 'Pay & Verify Now'}
                                </span>
                              </button>
                            )}
                            <button
                              onClick={() => setActiveInvoice(ord)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 text-white font-bold cursor-pointer shrink-0"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                              <span>Receipt / Invoice</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 3. TAILORING TRACKER (9 STAGES) */}
            {customerAccountTab === 'TAILORING' && (
              <div className="space-y-4">
                {tailoringRequests.map((req) => {
                  const activeStageIdx = getNineStageIndex(req.status);
                  return (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-amber-700">
                            Ref: {req.orderReference || req.id.toUpperCase()} · Qty: {req.quantity || 1}
                          </div>
                          <h4 className="font-black text-sm text-stone-900">{req.garmentType}</h4>
                          <p className="text-xs text-stone-500">
                            Fabric: {req.fabricPreference} · Delivery Target: {req.preferredCompletionDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-base text-amber-800 tabular-nums">
                            ₦{req.estimatedCost.toLocaleString()}
                          </div>
                          <button
                            onClick={() => setActiveInvoice(req)}
                            className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 text-white text-xs font-bold cursor-pointer"
                          >
                            <FileText className="w-3 h-3 text-amber-400" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-1.5">
                        {NINE_TAILORING_STAGES.map((stage, idx) => {
                          const isDone = idx <= activeStageIdx;
                          const isCurrent = idx === activeStageIdx;
                          return (
                            <div
                              key={stage.key}
                              className={`p-2 rounded-xl border text-[10px] font-bold leading-tight ${
                                isCurrent
                                  ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                                  : isDone
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                  : 'bg-white text-stone-400 border-stone-200'
                              }`}
                            >
                              <div className="flex items-center gap-1 mb-0.5">
                                {isDone ? (
                                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                                ) : (
                                  <Clock className="w-3 h-3 shrink-0" />
                                )}
                                <span>0{idx + 1}</span>
                              </div>
                              <div>{stage.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. CAKES & CATERING TAB */}
            {customerAccountTab === 'CAKES_CATERING' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-700">
                    Custom Cake Orders ({cakeOrders.length})
                  </h4>
                  {cakeOrders.map((cake) => (
                    <div
                      key={cake.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-orange-50/40 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-sm text-stone-900">
                          {cake.cakeType} — {cake.cakeSize} ({cake.flavor})
                        </div>
                        <div className="text-xs text-stone-600">
                          Inscription: &ldquo;{cake.inscription}&rdquo; · Delivery: {cake.deliveryDate} ({cake.deliveryTimeSlot})
                        </div>
                        <div className="text-xs font-bold text-orange-800 mt-1">
                          Stage: {cake.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm text-stone-900 tabular-nums">
                          ₦{cake.estimatedPrice.toLocaleString()}
                        </span>
                        <button
                          onClick={() => setActiveInvoice(cake)}
                          className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-bold cursor-pointer"
                        >
                          Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-stone-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
                    Event Catering Reservations ({cateringBookings.length})
                  </h4>
                  {cateringBookings.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-rose-50/40 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-sm text-stone-900">
                          {cat.eventType} ({cat.expectedGuests} Guests) — {cat.serviceStyle}
                        </div>
                        <div className="text-xs text-stone-600">
                          Venue: {cat.eventLocation} · Date: {cat.eventDate} at {cat.eventTime}
                        </div>
                        <div className="text-xs font-bold text-rose-800 mt-1">
                          Status: {cat.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm text-stone-900 tabular-nums">
                          ₦{cat.totalQuote.toLocaleString()}
                        </span>
                        <button
                          onClick={() => setActiveInvoice(cat)}
                          className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-bold cursor-pointer"
                        >
                          Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. RIDES HISTORY TAB */}
            {customerAccountTab === 'RIDES' && (
              <div className="space-y-3">
                {rideHistory.map((ride) => (
                  <div
                    key={ride.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-blue-700">
                        {ride.vehicleType === 'KEKE' ? '🛺 Keke Tricycle' : '🚗 Comfort Saloon Car'} · {ride.distanceKm} km · {ride.status.replace(/_/g, ' ')}
                      </div>
                      <div className="font-bold text-sm text-stone-900 mt-0.5">
                        {ride.pickupLocation.name} → {ride.destinationLocation.name}
                      </div>
                      {ride.driver && (
                        <div className="text-xs text-stone-500">
                          Driver: {ride.driver.name} ({ride.driver.plateNumber}) · {ride.driver.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-stone-900 tabular-nums">
                        ₦{ride.totalFare.toLocaleString()}
                      </span>
                      <button
                        onClick={() => setActiveInvoice(ride)}
                        className="px-3 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-bold cursor-pointer"
                      >
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 6. VTU HISTORY TAB */}
            {customerAccountTab === 'VTU' && (
              <div className="space-y-3">
                {vtuTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-purple-700">
                        {tx.network} {tx.type} {tx.planName ? `(${tx.planName})` : ''} · {tx.status}
                      </div>
                      <div className="font-bold text-sm text-stone-900">
                        Recipient: {tx.phoneNumber} · Ref: {tx.id}
                      </div>
                      <div className="text-xs text-stone-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-stone-900 tabular-nums">
                        ₦{tx.totalAmount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => setActiveVTUReceipt(tx)}
                        className="px-3 py-1.5 rounded-lg bg-purple-700 text-white text-xs font-bold cursor-pointer"
                      >
                        VTU Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 7. CUSTOMER PROFILE TAB */}
            {customerAccountTab === 'PROFILE' && (
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Nigerian Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Default Kogi State Delivery Address</label>
                  <input
                    type="text"
                    value={profileForm.defaultAddress}
                    onChange={(e) => setProfileForm({ ...profileForm, defaultAddress: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900"
                    required
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs cursor-pointer shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Customer Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      logoutCustomer();
                      setProfileForm({
                        name: 'Guest Customer',
                        phone: '08030000000',
                        email: '',
                        defaultAddress: 'Okene Central, Kogi State',
                        defaultArea: 'Okene Central & Total Junction',
                        role: 'CUSTOMER'
                      });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-stone-200 hover:bg-rose-100 text-stone-700 hover:text-rose-800 font-bold text-xs cursor-pointer transition-colors"
                  >
                    <span>Reset / Sign Out Customer Session</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
