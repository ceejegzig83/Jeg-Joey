import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BUSINESS_INFO } from '../../data/mockData';
import { 
  BarChart3, 
  Package, 
  Scissors, 
  Cake, 
  UtensilsCrossed, 
  Car, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck,
  Clock, 
  MapPin, 
  Phone, 
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const { 
    orders, 
    tailoringRequests, 
    cakeOrders, 
    cateringBookings, 
    rideHistory, 
    updateOrderStatus,
    updateTailoringStatus,
    verifyOrderCoDPayment,
    verifyRidePayment,
    sendReceiptNotification,
    setActiveInvoice,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PAYMENTS' | 'ORDERS' | 'TAILORING' | 'CAKES' | 'CATERING' | 'RIDES'>('OVERVIEW');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'COD_PENDING' | 'COD_VERIFIED' | 'ONLINE'>('ALL');

  // Stats Calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : 0), 0) +
    tailoringRequests.reduce((sum, t) => sum + (t.depositPaid || t.estimatedCost), 0) +
    cakeOrders.reduce((sum, c) => sum + c.estimatedPrice, 0) +
    cateringBookings.reduce((sum, cat) => sum + (cat.depositPaid || 0), 0) +
    rideHistory.reduce((sum, r) => sum + r.totalFare, 0);

  const pendingCodOrders = orders.filter(o => o.paymentMethod === 'CASH_ON_DELIVERY' && o.paymentStatus === 'PENDING');
  const pendingCodRides = rideHistory.filter(r => r.paymentStatus === 'PENDING');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <span>HQ Management & Verification Terminal • Okene, Kogi State</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Flourish Destiny Operations Control
          </h2>
          <p className="text-xs text-stone-400">
            Real-time verification for Dual-Payment Engine (Paystack / Flutterwave & CoD), Delivery Safeguards, and Logistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-bold border border-stone-700"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>HQ Hotline: {BUSINESS_INFO.phone}</span>
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Total Gross Revenue</span>
          <div className="text-2xl font-black text-stone-900 mt-1">
            ₦{totalRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Settled across all 5 divisions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Pending CoD Verifications</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {pendingCodOrders.length + pendingCodRides.length}
          </div>
          <span className="text-[11px] text-amber-700 font-bold block mt-1">
            {pendingCodOrders.length} Orders • {pendingCodRides.length} Trips
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Custom Bespoke & Cakes</span>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {tailoringRequests.length + cakeOrders.length}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {tailoringRequests.length} Tailoring • {cakeOrders.length} Cakes (Online Paid)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 block">Kogi Transport & Catering</span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {rideHistory.length + cateringBookings.length}
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {rideHistory.length} Rides • {cateringBookings.length} Events
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {[
          { key: 'OVERVIEW', label: '📊 Overview' },
          { key: 'PAYMENTS', label: `💳 Payment Safeguards (${pendingCodOrders.length + pendingCodRides.length} Pending)` },
          { key: 'ORDERS', label: `📦 Orders (${orders.length})` },
          { key: 'TAILORING', label: `✂️ Tailoring (${tailoringRequests.length})` },
          { key: 'CAKES', label: `🎂 Custom Cakes (${cakeOrders.length})` },
          { key: 'CATERING', label: `🍽️ Catering (${cateringBookings.length})` },
          { key: 'RIDES', label: `🚗 Kogi Rides (${rideHistory.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Orders List */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-stone-900 font-display flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" /> Recent Retail & Supermarket Orders
            </h3>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-stone-900">{order.customerName}</div>
                    <div className="text-stone-500 font-mono text-[11px]">{order.orderNumber} • {order.deliveryArea}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-stone-900">₦{order.total.toLocaleString()}</div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Division Summary */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-stone-900 font-display flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" /> Division Quick Summary
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex justify-between items-center">
                <span className="font-semibold text-amber-900">👗 Fashion Store & Custom Tailoring</span>
                <strong className="text-stone-900">{tailoringRequests.length} Active Bespoke Orders</strong>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex justify-between items-center">
                <span className="font-semibold text-orange-900">🎂 Artisanal Bakery & Cake Studio</span>
                <strong className="text-stone-900">{cakeOrders.length} Scheduled Deliveries</strong>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex justify-between items-center">
                <span className="font-semibold text-rose-900">🍽️ Royal Catering & Events</span>
                <strong className="text-stone-900">{cateringBookings.length} Reserved Gatherings</strong>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                <span className="font-semibold text-emerald-900">🛒 Grocery Hub & Essentials</span>
                <strong className="text-stone-900">{orders.length} Dispatched Baskets</strong>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex justify-between items-center">
                <span className="font-semibold text-blue-900">🛺 Kogi Intra-City Transport</span>
                <strong className="text-stone-900">{rideHistory.length} Completed Trips</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Safeguards & Backend Verification Tab */}
      {activeTab === 'PAYMENTS' && (
        <div className="space-y-6">
          {/* Summary & Filters */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-lg text-amber-300 font-display">
                  Dual-Payment Engine Verification Hub
                </h3>
                <p className="text-xs text-stone-300">
                  Verify Cash on Delivery (CoD) remittances and field collections from delivery agents & riders before final settlement.
                </p>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { key: 'ALL', label: 'All Transactions' },
                  { key: 'COD_PENDING', label: `Pending CoD (${pendingCodOrders.length + pendingCodRides.length})` },
                  { key: 'COD_VERIFIED', label: 'CoD Verified' },
                  { key: 'ONLINE', label: 'Paystack / Flutterwave Settled' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setPaymentFilter(f.key as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      paymentFilter === f.key
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-800 text-stone-300 hover:text-white border border-stone-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800">
                <span className="text-stone-400 block">Gateway Processors Active:</span>
                <strong className="text-white">Paystack & Flutterwave (256-bit SSL)</strong>
              </div>
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800">
                <span className="text-stone-400 block">Mandatory 100% Online Divisions:</span>
                <strong className="text-amber-400">Transportation, Custom Tailoring, Cakes, Catering</strong>
              </div>
              <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800">
                <span className="text-stone-400 block">Official Confirmation Dispatch:</span>
                <strong className="text-emerald-400">09162723865 & Customer SMS/WhatsApp</strong>
              </div>
            </div>
          </div>

          {/* Pending Verifications Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Live Verification Queue
              </h4>
              <span className="text-xs text-stone-500 font-mono">
                Real-time sync with Okene Hub
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                  <tr>
                    <th className="p-3.5">Ref / ID</th>
                    <th className="p-3.5">Customer & Phone</th>
                    <th className="p-3.5">Type & Channel</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Payment State</th>
                    <th className="p-3.5">Verification & Receipt Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders
                    .filter(o => {
                      if (paymentFilter === 'COD_PENDING') return o.paymentMethod === 'CASH_ON_DELIVERY' && o.paymentStatus === 'PENDING';
                      if (paymentFilter === 'COD_VERIFIED') return o.paymentMethod === 'CASH_ON_DELIVERY' && o.paymentStatus === 'PAID';
                      if (paymentFilter === 'ONLINE') return o.paymentStatus === 'PAID' && o.paymentMethod !== 'CASH_ON_DELIVERY';
                      return true;
                    })
                    .map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50/50">
                        <td className="p-3.5 font-mono font-bold text-stone-900">{order.orderNumber}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900">{order.customerName}</div>
                          <div className="text-stone-500">{order.customerPhone}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-stone-800">Retail / Grocery Order</span>
                          <div className="text-[11px] text-stone-500">
                            {order.paymentMethod === 'CASH_ON_DELIVERY' ? '💵 Cash on Delivery (CoD)' : '💳 Online Gateway'}
                          </div>
                        </td>
                        <td className="p-3.5 font-black text-stone-900">₦{order.total.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {order.paymentStatus === 'PAID' ? '✓ PAID & SETTLED' : '⏳ PENDING COLLECTION'}
                          </span>
                          {order.paymentVerifiedBy && (
                            <div className="text-[10px] text-stone-400 mt-1 font-mono">
                              By: {order.paymentVerifiedBy}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {order.paymentStatus === 'PENDING' ? (
                              <button
                                onClick={() => verifyOrderCoDPayment(order.id, 'Agent Okene HQ')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Payment Received</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </span>
                            )}

                            <button
                              onClick={() => sendReceiptNotification(order, 'WHATSAPP')}
                              className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-[11px] border border-stone-300 flex items-center gap-1"
                              title="Send WhatsApp receipt to customer & 09162723865"
                            >
                              <span>📱 WhatsApp Receipt</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {/* Rides Payments */}
                  {rideHistory
                    .filter(r => {
                      if (paymentFilter === 'COD_PENDING') return false; // Rides are 100% online
                      if (paymentFilter === 'COD_VERIFIED') return false;
                      if (paymentFilter === 'ONLINE') return true;
                      return true;
                    })
                    .map((ride) => (
                      <tr key={ride.id} className="hover:bg-stone-50/50 bg-blue-50/20">
                        <td className="p-3.5 font-mono font-bold text-blue-950">{ride.id}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-stone-900">{ride.customerName}</div>
                          <div className="text-stone-500">{ride.customerPhone}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-blue-900">
                            Intra-City Ride ({ride.vehicleType === 'KEKE' ? '🛺 Keke' : '🚗 Car'})
                          </span>
                          <div className="text-[11px] text-blue-700 font-medium">
                            💳 100% Upfront ({ride.paymentMethod.replace(/_/g, ' ')})
                          </div>
                        </td>
                        <td className="p-3.5 font-black text-blue-950">₦{ride.totalFare.toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1 w-fit">
                            <ShieldCheck className="w-3 h-3" />
                            <span>✓ PAID & DISPATCHED</span>
                          </span>
                          <div className="text-[10px] text-stone-400 mt-1 font-mono">
                            Gateway: 100% Upfront
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => sendReceiptNotification(ride, 'WHATSAPP')}
                              className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-[11px] border border-stone-300 flex items-center gap-1"
                            >
                              <span>📱 WhatsApp Receipt</span>
                            </button>
                            <span className="text-[11px] text-emerald-700 font-bold">✓ Settled</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-stone-200 flex justify-between items-center">
            <h3 className="font-bold text-base text-stone-900">Customer Retail Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer & Phone</th>
                  <th className="p-3.5">Delivery Zone</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50">
                    <td className="p-3.5 font-mono font-bold text-stone-900">{order.orderNumber}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{order.customerName}</div>
                      <div className="text-stone-500">{order.customerPhone}</div>
                    </td>
                    <td className="p-3.5 text-stone-600">{order.deliveryArea}</td>
                    <td className="p-3.5 text-stone-600">{order.items.length} items</td>
                    <td className="p-3.5 font-black text-stone-900">₦{order.total.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.paymentStatus} ({order.paymentMethod.replace(/_/g, ' ')})
                      </span>
                      {order.paymentStatus === 'PENDING' && order.paymentMethod === 'CASH_ON_DELIVERY' && (
                        <button
                          onClick={() => verifyOrderCoDPayment(order.id, 'Dispatch Agent')}
                          className="block mt-1 text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline"
                        >
                          Verify CoD Cash Paid
                        </button>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          className="bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 text-xs font-semibold"
                        >
                          <option value="RECEIVED">Received</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="DISPATCHED">Dispatched</option>
                          <option value="DELIVERED">Delivered</option>
                        </select>
                        <button
                          onClick={() => setActiveInvoice(order)}
                          className="p-1 text-stone-500 hover:text-stone-900"
                          title="View Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tailoring Tab */}
      {activeTab === 'TAILORING' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-stone-200">
            <h3 className="font-bold text-base text-stone-900">Bespoke Custom Tailoring Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Request ID</th>
                  <th className="p-3.5">Client & Phone</th>
                  <th className="p-3.5">Garment Details</th>
                  <th className="p-3.5">Est. Price</th>
                  <th className="p-3.5">Production Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {tailoringRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-stone-50/50">
                    <td className="p-3.5 font-mono font-bold text-stone-900">{req.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{req.customerName}</div>
                      <div className="text-stone-500">{req.customerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-stone-900">{req.garmentType}</div>
                      <div className="text-stone-500">{req.fabricPreference} • {req.colorTheme}</div>
                    </td>
                    <td className="p-3.5 font-black text-amber-700">₦{req.estimatedCost.toLocaleString()}</td>
                    <td className="p-3.5">
                      <select
                        value={req.status}
                        onChange={(e) => updateTailoringStatus(req.id, e.target.value as any)}
                        className="bg-stone-100 border border-stone-300 rounded-lg px-2 py-1 text-xs font-semibold"
                      >
                        <option value="PAYMENT_CONFIRMED">Payment Confirmed</option>
                        <option value="MEASUREMENTS_VERIFIED">Measurements Verified</option>
                        <option value="FABRIC_CUTTING">Fabric Cutting</option>
                        <option value="STITCHING_IN_PROGRESS">Stitching in Progress</option>
                        <option value="QUALITY_INSPECTION">Quality Inspection</option>
                        <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Cakes Tab */}
      {activeTab === 'CAKES' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-stone-200">
            <h3 className="font-bold text-base text-stone-900">Custom Celebration Cakes & Scheduling</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Recipient & Contact</th>
                  <th className="p-3.5">Cake Specs & Inscription</th>
                  <th className="p-3.5">Delivery Slot</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {cakeOrders.map((cake) => (
                  <tr key={cake.id} className="hover:bg-stone-50/50">
                    <td className="p-3.5 font-mono font-bold text-stone-900">{cake.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{cake.recipientName}</div>
                      <div className="text-stone-500">{cake.recipientPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{cake.cakeType} ({cake.cakeSize})</div>
                      <div className="text-stone-500 font-serif italic">&quot;{cake.inscription}&quot;</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-stone-900">{cake.deliveryDate}</div>
                      <div className="text-stone-500">{cake.deliveryTimeSlot}</div>
                    </td>
                    <td className="p-3.5 font-black text-stone-900">₦{cake.estimatedPrice.toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        {cake.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Catering Tab */}
      {activeTab === 'CATERING' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-stone-200">
            <h3 className="font-bold text-base text-stone-900">Catering Reservations & Events</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Booking ID</th>
                  <th className="p-3.5">Host & Phone</th>
                  <th className="p-3.5">Event Date & Venue</th>
                  <th className="p-3.5">Guests</th>
                  <th className="p-3.5">Total Quote</th>
                  <th className="p-3.5">Online Deposit</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {cateringBookings.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/50">
                    <td className="p-3.5 font-mono font-bold text-stone-900">{cat.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{cat.customerName}</div>
                      <div className="text-stone-500">{cat.customerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{cat.eventType} • {cat.eventDate}</div>
                      <div className="text-stone-500">{cat.eventLocation}</div>
                    </td>
                    <td className="p-3.5 font-bold text-stone-800">{cat.expectedGuests} Guests</td>
                    <td className="p-3.5 font-black text-stone-900">₦{cat.totalQuote.toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-emerald-700">₦{cat.depositPaid.toLocaleString()} (Paid)</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900">
                        {cat.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kogi Rides Tab */}
      {activeTab === 'RIDES' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-stone-200">
            <h3 className="font-bold text-base text-stone-900">Kogi Intra-City Ride Dispatch Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Trip ID</th>
                  <th className="p-3.5">Passenger & Contact</th>
                  <th className="p-3.5">Route (Origin → Dest)</th>
                  <th className="p-3.5">Vehicle</th>
                  <th className="p-3.5">Fare (100% Upfront)</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rideHistory.map((ride) => (
                  <tr key={ride.id} className="hover:bg-stone-50/50">
                    <td className="p-3.5 font-mono font-bold text-stone-900">{ride.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{ride.customerName}</div>
                      <div className="text-stone-500">{ride.customerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-stone-900">{ride.pickupLocation.name} → {ride.destinationLocation.name}</div>
                      <div className="text-stone-500">{ride.distanceKm} km • Kogi Geofence Valid</div>
                    </td>
                    <td className="p-3.5 font-bold text-stone-700">{ride.vehicleType}</td>
                    <td className="p-3.5 font-black text-emerald-700">₦{ride.totalFare.toLocaleString()} (PAID)</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                        {ride.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
