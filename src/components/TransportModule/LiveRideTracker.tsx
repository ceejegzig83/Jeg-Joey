import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BUSINESS_INFO } from '../../data/mockData';
import { RideRequest } from '../../types';
import { 
  Car, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Clock, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Navigation,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';

export const LiveRideTracker: React.FC = () => {
  const { activeRide, cancelRide, completeRide, verifyRidePayment, showToast, setActiveInvoice } = useApp();

  const [tripProgress, setTripProgress] = useState<number>(15); // 0 to 100%
  const [currentStep, setCurrentStep] = useState<RideRequest['status']>('DRIVER_ASSIGNED');
  const [etaMinutes, setEtaMinutes] = useState<number>(activeRide?.estimatedMinutes || 12);

  // Simulated live driver movement & status progression
  useEffect(() => {
    if (!activeRide) return;

    const interval = setInterval(() => {
      setTripProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          setCurrentStep('TRIP_COMPLETED');
          return 100;
        }

        const next = prev + 4;
        if (next >= 75) {
          setCurrentStep('TRIP_STARTED');
          setEtaMinutes(3);
        } else if (next >= 40) {
          setCurrentStep('DRIVER_ARRIVING');
          setEtaMinutes(5);
        } else if (next >= 20) {
          setCurrentStep('DRIVER_ASSIGNED');
          setEtaMinutes(8);
        }
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [activeRide]);

  if (!activeRide) return null;

  const driver = activeRide.driver;
  const isPaid = activeRide.paymentStatus === 'PAID';

  return (
    <div className="bg-stone-900 text-white rounded-3xl border border-blue-500/40 p-6 shadow-2xl space-y-6 overflow-hidden relative">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-400">
            <Car className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white font-display">
                Intra-City Kogi Ride Live Dispatch
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                {activeRide.vehicleType === 'KEKE' ? '🛺 Keke (Tricycle)' : '🚗 Car (Comfort)'}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Trip ID: <span className="text-stone-300 font-mono">{activeRide.id}</span> • Okene Hub Base
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold justify-end">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Upfront Paid</span>
            </div>
            <div className="text-sm font-black text-emerald-400">
              ₦{activeRide.totalFare.toLocaleString()} (Verified)
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Interactive Map Stage */}
      <div className="relative h-64 sm:h-72 w-full bg-stone-950 rounded-2xl overflow-hidden border border-stone-800 p-4 flex flex-col justify-between">
        {/* Background Grid Roads Representation */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Map Header details */}
        <div className="relative z-10 flex items-center justify-between text-xs">
          <div className="bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            <span className="font-semibold text-stone-200">
              {currentStep === 'DRIVER_ASSIGNED' && 'Driver Dispatched from Okene Total Junction'}
              {currentStep === 'DRIVER_ARRIVING' && 'Driver Approaching Pickup Point'}
              {currentStep === 'TRIP_STARTED' && 'En Route to Destination'}
              {currentStep === 'TRIP_COMPLETED' && 'Trip Completed Successfully!'}
            </span>
          </div>

          <div className="bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700 font-bold text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>ETA: ~{etaMinutes} Mins</span>
          </div>
        </div>

        {/* Route Line & Vehicle Animation SVG */}
        <div className="relative z-10 w-full my-auto py-6 px-4">
          <div className="relative w-full h-12 flex items-center">
            {/* Route track */}
            <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 transition-all duration-700"
                style={{ width: `${tripProgress}%` }}
              />
            </div>

            {/* Pickup Marker */}
            <div className="absolute left-0 -top-2 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-lg ring-4 ring-emerald-950">
                A
              </div>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 whitespace-nowrap">
                {activeRide.pickupLocation.area}
              </span>
            </div>

            {/* Moving Vehicle Icon */}
            <motion.div
              className="absolute -top-4 -ml-4 flex flex-col items-center transition-all duration-700"
              style={{ left: `${Math.min(95, Math.max(5, tripProgress))}%` }}
            >
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl ring-4 ring-blue-900/80">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] font-extrabold text-blue-300 bg-stone-900/90 px-1.5 py-0.5 rounded mt-0.5 border border-blue-500/40">
                {driver?.vehicleModel || 'Driver'}
              </span>
            </motion.div>

            {/* Destination Marker */}
            <div className="absolute right-0 -top-2 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-[10px] font-black shadow-lg ring-4 ring-amber-950">
                B
              </div>
              <span className="text-[10px] text-amber-400 font-bold mt-1 whitespace-nowrap">
                {activeRide.destinationLocation.area}
              </span>
            </div>
          </div>
        </div>

        {/* Live Distance / Progress stats */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-stone-400 bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-800">
          <span>Distance: <strong className="text-white">{activeRide.distanceKm} km</strong></span>
          <span>Geofence: <strong className="text-emerald-400">Kogi State (Verified)</strong></span>
          <span>Speed: <strong className="text-white">38 km/h</strong></span>
        </div>
      </div>

      {/* Driver Information Card */}
      {driver && (
        <div className="bg-stone-800/90 rounded-2xl p-4 border border-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={driver.photo}
              alt={driver.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-white">{driver.name}</h4>
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-amber-400" /> {driver.rating}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {driver.vehicleModel} • <strong className="text-stone-200">{driver.plateNumber}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`tel:${driver.phone}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Driver ({driver.phone})</span>
            </a>

            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center justify-center p-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-amber-300 text-xs"
              title="Platform Hotline 09162723865"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </a>
          </div>
        </div>
      )}

      {/* Trip Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-xs text-stone-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict Security Protocol • Monitored by Flourish Logistics Hub</span>
        </div>

        <div className="flex items-center gap-2">
          {currentStep === 'TRIP_COMPLETED' ? (
            <button
              onClick={() => completeRide(activeRide.id)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-colors"
            >
              ✓ Complete & Get Receipt
            </button>
          ) : (
            <>
              <button
                onClick={() => completeRide(activeRide.id)}
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Simulate Arrival & Complete
              </button>
              <button
                onClick={() => cancelRide(activeRide.id)}
                className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold"
              >
                Cancel Trip
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
