import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KOGI_LOCATIONS, BUSINESS_INFO, TRANSPORT_SAMPLE_ROUTES } from '../../data/mockData';
import { LocationPoint, VehicleType } from '../../types';
import { LiveRideTracker } from './LiveRideTracker';
import { 
  Car, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  AlertTriangle, 
  Phone, 
  CreditCard, 
  Clock, 
  Compass, 
  Sparkles,
  ChevronRight,
  Info,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const TransportSection: React.FC = () => {
  const { activeRide, requestRide, userProfile, showToast } = useApp();

  // Location selector (Default origin: Okene Hub)
  const [pickupLocation, setPickupLocation] = useState<LocationPoint>(KOGI_LOCATIONS[0]); // Okene Total Junction
  const [destinationLocation, setDestinationLocation] = useState<LocationPoint>(KOGI_LOCATIONS[1]); // Obehira Market
  const [vehicleType, setVehicleType] = useState<VehicleType>('KEKE');

  // Customer contact info
  const [customerName, setCustomerName] = useState(userProfile.name || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile.phone || '');
  
  // Mandatory Online Payment Gateway Selector (Paystack / Flutterwave)
  const [paymentGateway, setPaymentGateway] = useState<'PAYSTACK' | 'FLUTTERWAVE'>('PAYSTACK');
  const [onlineChannel, setOnlineChannel] = useState<'CARD' | 'BANK_TRANSFER' | 'USSD'>('CARD');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Dynamic Distance Calculation (simplified haversine formula)
  const calculateDistanceKm = (loc1: LocationPoint, loc2: LocationPoint) => {
    const latDiff = Math.abs(loc1.latitude - loc2.latitude) * 111;
    const lngDiff = Math.abs(loc1.longitude - loc2.longitude) * 105;
    const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    return Math.max(1.8, Number(dist.toFixed(1)));
  };

  const distanceKm = calculateDistanceKm(pickupLocation, destinationLocation);
  const estimatedMinutes = Math.max(5, Math.round(distanceKm * 2.8));

  // Dynamic Fare calculation based on Vehicle Type (Keke vs Car)
  const calculateFare = (vType: VehicleType, dist: number, mins: number) => {
    const base = vType === 'KEKE' ? 300 : 800;
    const perKm = vType === 'KEKE' ? 120 : 250;
    const distFare = Math.round(dist * perKm);
    const timeFare = Math.round(mins * 25);
    return base + distFare + timeFare;
  };

  const totalFare = calculateFare(vehicleType, distanceKm, estimatedMinutes);

  // Geofence check
  const isGeofenceValid = pickupLocation.isWithinKogi && destinationLocation.isWithinKogi;

  const handleBookAndPay = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone) {
      showToast('Please enter your name and phone number for ride dispatch', 'error');
      return;
    }

    // Strict Kogi Geofence validation
    if (!isGeofenceValid) {
      showToast('Transportation is strictly geofenced within Kogi State boundaries (Okene hub base).', 'error', 'Geofence Violation');
      return;
    }

    setIsProcessingPayment(true);

    let chosenMethod: 'PAYSTACK_CARD' | 'FLUTTERWAVE_CARD' | 'BANK_TRANSFER' | 'USSD' = 'PAYSTACK_CARD';
    if (paymentGateway === 'PAYSTACK') {
      chosenMethod = onlineChannel === 'CARD' ? 'PAYSTACK_CARD' : onlineChannel === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'USSD';
    } else {
      chosenMethod = 'FLUTTERWAVE_CARD';
    }

    // Simulate Paystack / Flutterwave 100% Upfront authorization & Instant Driver Dispatch
    setTimeout(() => {
      setIsProcessingPayment(false);

      requestRide({
        customerName,
        customerPhone,
        pickupLocation,
        destinationLocation,
        vehicleType,
        distanceKm,
        estimatedMinutes,
        totalFare,
        paymentMethod: chosenMethod,
      });
    }, 1400);
  };

  return (
    <div className="space-y-8">
      {/* If there is an active ride in progress, show the live tracker first */}
      {activeRide && <LiveRideTracker />}

      {/* Main Transport Hero Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-blue-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <Car className="w-3.5 h-3.5" />
            <span>Kogi State Intra-City Ride-Hailing & Logistics (Okene Base)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Fast, Reliable Keke & Car Rides Across Kogi State
          </h2>

          <p className="text-sm text-stone-300 leading-relaxed">
            Geofenced exclusively within Kogi State boundaries with our headquarters at Okene Total Junction. Travel smoothly between Okene, Adavi, Okehi, Ajaokuta, Lokoja, and Kabba.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Dual-Payment Engine: Pay Online (Paystack/Flutterwave) OR Pay Driver upon Trip Completion (Cash/Transfer)</span>
            </div>

            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/90 text-stone-300 hover:text-white border border-stone-800 text-xs"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>Logistics Hotline: {BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Booking Form & Vehicle Selector Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleBookAndPay} className="space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="text-xl font-extrabold text-stone-900 font-display">
              Book a Ride in Kogi State
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Select your pickup and destination in Kogi State. Drivers are dispatched immediately upon online payment confirmation.
            </p>
          </div>

          {/* Location Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pickup */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Pickup Location (Origin)</span>
              </label>
              <select
                value={pickupLocation.name}
                onChange={(e) => {
                  const found = KOGI_LOCATIONS.find(l => l.name === e.target.value);
                  if (found) setPickupLocation(found);
                }}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium focus:border-blue-600 focus:outline-hidden"
              >
                {KOGI_LOCATIONS.map(loc => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} ({loc.lga} LGA) {!loc.isWithinKogi && '⚠️ OUTSIDE KOGI'}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" /> {pickupLocation.address}
              </p>
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>Destination (Where to?)</span>
              </label>
              <select
                value={destinationLocation.name}
                onChange={(e) => {
                  const found = KOGI_LOCATIONS.find(l => l.name === e.target.value);
                  if (found) setDestinationLocation(found);
                }}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium focus:border-blue-600 focus:outline-hidden"
              >
                {KOGI_LOCATIONS.map(loc => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} ({loc.lga} LGA) {!loc.isWithinKogi && '⚠️ OUTSIDE KOGI'}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-stone-500 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-600" /> {destinationLocation.address}
              </p>
            </div>
          </div>

          {/* Geofence Alert if Out of Bounds */}
          {!isGeofenceValid && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-300 flex items-start gap-3 text-xs text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm block font-bold text-rose-950">Geofence Restriction Warning</strong>
                <span>
                  FLOURISH DESTINY COLLECTION intra-city transportation operates strictly within <strong>Kogi State boundaries</strong>. One of your selected locations is outside Kogi State. Please choose an address within Okene, Adavi, Okehi, Ajaokuta, Lokoja, or surrounding Kogi towns.
                </span>
              </div>
            </div>
          )}

          {/* Vehicle Type Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
                Choose Vehicle Type
              </label>
              <span className="text-xs text-stone-500 font-medium">
                Est. Distance: <strong>{distanceKm} km</strong> • Duration: ~<strong>{estimatedMinutes} mins</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Keke Option */}
              <div
                onClick={() => setVehicleType('KEKE')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  vehicleType === 'KEKE'
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/40'
                    : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xl">🛺</span>
                    <h4 className="font-extrabold text-sm text-stone-900 mt-2">Keke (Tricycle)</h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Budget intra-city hiring option for Okene, Kuroko, Nagazi & Adavi.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    ₦{calculateFare('KEKE', distanceKm, estimatedMinutes).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-stone-400 mt-3 pt-2 border-t border-stone-200">
                  Base: ₦300 + ₦120/km • 1-3 Passengers
                </div>
              </div>

              {/* Car Option */}
              <div
                onClick={() => setVehicleType('CAR')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  vehicleType === 'CAR'
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/40'
                    : 'border-stone-200 bg-white hover:border-stone-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xl">🚗</span>
                    <h4 className="font-extrabold text-sm text-stone-900 mt-2">Car (Standard / Comfort)</h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Standard / Comfort vehicle hiring option across all Kogi State towns.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    ₦{calculateFare('CAR', distanceKm, estimatedMinutes).toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-stone-400 mt-3 pt-2 border-t border-stone-200">
                  Base: ₦800 + ₦250/km • AC Saloon Comfort
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Passenger Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Destiny Audu"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Passenger Phone (for Driver Dispatch)</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 08034567890"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900"
                required
              />
            </div>
          </div>

          {/* Strict Mandatory Online Payment Architecture */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40 mb-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Mandatory 100% Upfront Online Payment Policy</span>
                </div>
                <div className="text-3xl font-black text-amber-400">
                  ₦{totalFare.toLocaleString()}
                </div>
                <p className="text-[11px] text-stone-400">
                  Cash on Delivery (CoD) is strictly disabled for transportation. Payment is securely held until trip dispatch.
                </p>
              </div>

              {/* Gateway Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-300">Gateway:</span>
                <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('PAYSTACK')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      paymentGateway === 'PAYSTACK'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Paystack
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentGateway('FLUTTERWAVE')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      paymentGateway === 'FLUTTERWAVE'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Flutterwave
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Channel Sub-Tabs */}
            <div className="space-y-3 bg-stone-800/60 p-4 rounded-2xl border border-stone-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-300">Select Instant Payment Channel:</span>
                <span className="text-[11px] text-emerald-400 font-medium">✓ 256-bit Bank-Grade Encryption</span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setOnlineChannel('CARD')}
                  className={`py-2.5 px-2 rounded-xl text-center font-bold border transition-all ${
                    onlineChannel === 'CARD'
                      ? 'bg-blue-500/20 border-blue-400 text-blue-200 shadow-xs'
                      : 'border-stone-700 text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  💳 Debit Card (Verve/Visa/Mastercard)
                </button>
                <button
                  type="button"
                  onClick={() => setOnlineChannel('BANK_TRANSFER')}
                  className={`py-2.5 px-2 rounded-xl text-center font-bold border transition-all ${
                    onlineChannel === 'BANK_TRANSFER'
                      ? 'bg-blue-500/20 border-blue-400 text-blue-200 shadow-xs'
                      : 'border-stone-700 text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  🏦 Instant Bank Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setOnlineChannel('USSD')}
                  className={`py-2.5 px-2 rounded-xl text-center font-bold border transition-all ${
                    onlineChannel === 'USSD'
                      ? 'bg-blue-500/20 border-blue-400 text-blue-200 shadow-xs'
                      : 'border-stone-700 text-stone-400 hover:bg-stone-700'
                  }`}
                >
                  🔢 USSD Bank Code
                </button>
              </div>

              <div className="text-[11px] text-stone-400 pt-1 flex items-center justify-between">
                <span>SMS & WhatsApp receipt automatically dispatched to passenger & <strong>{BUSINESS_INFO.phone}</strong></span>
                <span className="text-amber-400 font-semibold">100% Upfront Verified</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessingPayment || !isGeofenceValid}
              className="w-full py-4 rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying 100% Upfront Payment & Dispatching Pilot...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>
                    Pay ₦{totalFare.toLocaleString()} via {paymentGateway} ({onlineChannel.replace(/_/g, ' ')}) & Dispatch {vehicleType === 'KEKE' ? 'Keke' : 'Car'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Popular Sample Routes & Rate Cards Showcase */}
      <div className="pt-6 border-t border-stone-200 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Kogi State Popular Route Samples & Fixed Fare Guide</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display">
            Sample Intra-City Routes & Estimated Fares
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Transparent pricing based on actual road distance from our Okene Central Hub to key transit hubs and institutions across Kogi State.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRANSPORT_SAMPLE_ROUTES.map((route) => (
            <div
              key={route.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                  <img
                    src={route.image}
                    alt={`${route.pickup} to ${route.destination}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-stone-900/90 backdrop-blur-xs text-blue-300 font-bold text-[10px] rounded-lg border border-stone-700">
                    {route.pickup.split(',')[0]} → {route.destination.split('/')[0].split(',')[0]}
                  </span>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-blue-600 text-white font-black text-xs rounded-md shadow-xs">
                    {route.distanceKm} km
                  </span>
                </div>

                <div className="p-4 space-y-2.5">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 line-clamp-1">
                      {route.pickup.split(',')[0]} to {route.destination.split('/')[0].split(',')[0]}
                    </h4>
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>~{route.durationMins} mins average trip</span>
                    </p>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {route.description}
                  </p>

                  <div className="pt-2 border-t border-stone-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">🛺 Keke Fare:</span>
                      <span className="font-extrabold text-stone-900">
                        {route.kekeFare > 0 ? `₦${route.kekeFare.toLocaleString()}` : 'Car Highway Only'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">🚗 Car/Cab Fare:</span>
                      <span className="font-extrabold text-blue-700">₦{route.carFare.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    const origin = KOGI_LOCATIONS.find(l => l.name.toLowerCase().includes('okene') || l.name.toLowerCase().includes('total')) || KOGI_LOCATIONS[0];
                    const dest = KOGI_LOCATIONS.find(l => 
                      l.name.toLowerCase().includes(route.destination.toLowerCase().split(' ')[0]) || 
                      route.destination.toLowerCase().includes(l.name.toLowerCase().split(' ')[0])
                    ) || KOGI_LOCATIONS[1];
                    
                    setPickupLocation(origin);
                    setDestinationLocation(dest);
                    if (route.kekeFare === 0) {
                      setVehicleType('CAR');
                    }
                    showToast(`Loaded route: ${route.pickup.split(',')[0]} to ${route.destination.split(',')[0]}`, 'info');
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-blue-200"
                >
                  <span>Select This Route</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
