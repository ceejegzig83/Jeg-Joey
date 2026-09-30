import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BUSINESS_INFO } from '../../data/mockData';
import { 
  Car, 
  Power, 
  DollarSign, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Star, 
  Navigation, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export const DriverPortal: React.FC = () => {
  const {
    drivers,
    activeRide,
    rideHistory,
    completeRide,
    updateRideStatus,
    toggleDriverOnline,
    setActiveInvoice,
    showToast
  } = useApp();
  const [todayEarnings, setTodayEarnings] = useState(24500);
  const [completedTripsCount, setCompletedTripsCount] = useState(9);

  const activeDriver = drivers[0]; // Suleiman Yusuf
  const isOnline = activeDriver?.isOnline ?? true;

  const toggleOnline = () => {
    if (activeDriver) {
      toggleDriverOnline(activeDriver.id);
    }
  };

  const canStartRide =
    activeRide?.status === 'REQUESTED' ||
    activeRide?.status === 'DRIVER_ASSIGNED' ||
    activeRide?.status === 'DRIVER_ARRIVING' ||
    activeRide?.status === 'ARRIVED_PICKUP';

  const isRideStarted =
    activeRide?.status === 'IN_PROGRESS' ||
    activeRide?.status === 'TRIP_STARTED';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Driver Header Card */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={activeDriver.photo}
              alt={activeDriver.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{activeDriver.name}</h2>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {activeDriver.rating}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {activeDriver.vehicleModel} • <strong className="text-stone-200">{activeDriver.plateNumber}</strong>
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                Base: Okene Central Hub • Registered Kogi Intra-City Pilot
              </p>
            </div>
          </div>

          {/* Online/Offline Toggle */}
          <button
            onClick={toggleOnline}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-md cursor-pointer ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-400 border border-stone-700'
            }`}
          >
            <Power className={`w-5 h-5 ${isOnline ? 'text-white animate-pulse' : 'text-stone-500'}`} />
            <span>{isOnline ? 'ONLINE & ACTIVE' : 'OFFLINE'}</span>
          </button>
        </div>

        {/* Driver Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-800 text-xs">
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
            <span className="text-stone-400 block mb-1">Today&apos;s Earnings</span>
            <div className="text-xl font-extrabold text-emerald-400 tabular-nums">
              ₦{todayEarnings.toLocaleString()}
            </div>
          </div>

          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
            <span className="text-stone-400 block mb-1">Completed Trips Today</span>
            <div className="text-xl font-extrabold text-white tabular-nums">
              {completedTripsCount} Trips
            </div>
          </div>

          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80 col-span-2 sm:col-span-1">
            <span className="text-stone-400 block mb-1">Logistics Control Hotline</span>
            <div className="text-sm font-bold text-amber-300">
              {BUSINESS_INFO.phone}
            </div>
          </div>
        </div>
      </div>

      {/* Active Trip from Driver Perspective */}
      {activeRide ? (
        <div className="bg-white rounded-3xl border border-blue-300 p-6 shadow-md space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
              <h3 className="font-extrabold text-base text-stone-900">
                Active Trip Assignment ({activeRide.id})
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900">
                Stage: {activeRide.status.replace(/_/g, ' ')}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>₦{activeRide.totalFare.toLocaleString()} 100% PAID ONLINE</span>
            </span>
          </div>

          {/* Stepper of Driver Trip Stages */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            {[
              { key: 'DRIVER_ASSIGNED', label: '1. Assigned / Accepted' },
              { key: 'ARRIVED_PICKUP', label: '2. Arrived Pickup' },
              { key: 'IN_PROGRESS', label: '3. Trip In Progress' },
              { key: 'COMPLETED', label: '4. Completed' },
            ].map((st) => {
              const active =
                activeRide.status === st.key ||
                (st.key === 'IN_PROGRESS' && activeRide.status === 'TRIP_STARTED') ||
                (st.key === 'ARRIVED_PICKUP' && activeRide.status === 'DRIVER_ARRIVING');
              return (
                <div
                  key={st.key}
                  className={`p-2.5 rounded-xl border font-bold ${
                    active
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-stone-50 text-stone-500 border-stone-200'
                  }`}
                >
                  {st.label}
                </div>
              );
            })}
          </div>

          <div className="space-y-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">Pickup Location:</strong>
                <span className="text-stone-600">{activeRide.pickupLocation.name} ({activeRide.pickupLocation.address})</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Navigation className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">Destination:</strong>
                <span className="text-stone-600">{activeRide.destinationLocation.name} ({activeRide.destinationLocation.address})</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2 text-stone-600">
              <span>Passenger: <strong>{activeRide.customerName}</strong> ({activeRide.vehicleType === 'KEKE' ? '🛺 Keke Hire' : '🚗 Car Hire'})</span>
              <a href={`tel:${activeRide.customerPhone}`} className="text-blue-700 font-bold flex items-center gap-1">
                <Phone className="w-3 h-3" /> {activeRide.customerPhone}
              </a>
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Fare of <strong>₦{activeRide.totalFare.toLocaleString()}</strong> has been 100% paid upfront via Paystack/Flutterwave gateway and credited to driver account balance.
            </span>
          </div>

          {/* Driver Workflow Controls (Enforces Accept -> Arrive Pickup -> Start Ride -> Complete Ride) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => updateRideStatus(activeRide.id, 'ARRIVED_PICKUP')}
              disabled={isRideStarted}
              className={`py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                activeRide.status === 'ARRIVED_PICKUP'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : isRideStarted
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer'
              }`}
            >
              1. Confirm Arrived at Pickup
            </button>

            <button
              type="button"
              onClick={() => updateRideStatus(activeRide.id, 'IN_PROGRESS')}
              disabled={!canStartRide && !isRideStarted}
              className={`py-3 px-4 rounded-xl font-bold text-xs transition-all ${
                isRideStarted
                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                  : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-xs'
              }`}
            >
              {isRideStarted ? '✓ Ride In Progress' : '2. Start Trip (Passenger Onboard)'}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isRideStarted) {
                  showToast('Cannot complete a ride before starting the trip!', 'error', 'Start Trip First');
                  return;
                }
                setTodayEarnings(prev => prev + activeRide.totalFare);
                setCompletedTripsCount(prev => prev + 1);
                completeRide(activeRide.id);
              }}
              disabled={!isRideStarted}
              className={`py-3 px-4 rounded-xl font-black text-xs transition-all ${
                isRideStarted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              3. Complete Trip & Issue Receipt
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-3">
          <Car className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-bold text-base text-stone-800">
            {isOnline ? 'Scanning for Ride Requests in Okene...' : 'Driver Status is Offline'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {isOnline 
              ? 'When a passenger books a Keke or Car trip, the dispatch system will alert your terminal here immediately.' 
              : 'Turn your status to ONLINE to start receiving ride assignments.'}
          </p>
        </div>
      )}

      {/* Driver Ride History & Earnings Ledger */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-stone-900 font-display">
              Driver Trip History & Payout Ledger ({rideHistory.length})
            </h3>
            <p className="text-xs text-stone-500">
              Recent intra-state Kogi dispatches completed or assigned to your terminal.
            </p>
          </div>
        </div>

        {rideHistory.length === 0 ? (
          <div className="text-center py-8 text-xs text-stone-400">
            No past trips recorded in this session yet.
          </div>
        ) : (
          <div className="space-y-3">
            {rideHistory.map((trip) => (
              <div
                key={trip.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">{trip.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-800">
                      {trip.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="font-bold text-stone-900">
                    {trip.pickupLocation.name} → {trip.destinationLocation.name}
                  </div>
                  <div className="text-stone-500">
                    Passenger: {trip.customerName} ({trip.customerPhone}) • {trip.distanceKm} km
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-black text-sm text-emerald-700 tabular-nums">
                      ₦{trip.totalFare.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-stone-500">{trip.paymentStatus}</div>
                  </div>
                  <button
                    onClick={() => setActiveInvoice(trip)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 text-white font-bold cursor-pointer"
                  >
                    Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
