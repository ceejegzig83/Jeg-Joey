import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATERING_PACKAGES, BUSINESS_INFO, CATERING_SAMPLE_DISHES } from '../../data/mockData';
import { CateringPackage, CateringBooking } from '../../types';
import { 
  UtensilsCrossed, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Phone, 
  CreditCard, 
  FileText,
  DollarSign,
  Tag,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const CateringSection: React.FC = () => {
  const { userProfile, createCateringBooking, showToast, cateringBookings } = useApp();

  // Selected package state
  const [selectedPackageId, setSelectedPackageId] = useState<string>('cat-standard');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [eventType, setEventType] = useState<CateringBooking['eventType']>('Wedding');
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [eventTime, setEventTime] = useState('1:00 PM');
  const [eventLocation, setEventLocation] = useState('Okene Civic Centre, Inoziomi, Kogi State');
  const [serviceStyle, setServiceStyle] = useState<CateringBooking['serviceStyle']>('Buffet');
  const [specialRequirements, setSpecialRequirements] = useState('');

  // Contact details
  const [customerName, setCustomerName] = useState(userProfile.name || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile.phone || '');
  const [customerEmail, setCustomerEmail] = useState(userProfile.email || '');

  // Addon extras
  const [includeCocktailBar, setIncludeCocktailBar] = useState(true);
  const [includeExtraWaitstaff, setIncludeExtraWaitstaff] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const selectedPkg = CATERING_PACKAGES.find(p => p.id === selectedPackageId) || CATERING_PACKAGES[1];

  // Dynamic Quote Calculation
  const baseFoodCost = selectedPkg.pricePerGuest * guestCount;
  const staffCost = includeExtraWaitstaff ? Math.max(30000, guestCount * 250) : 0;
  const cocktailCost = includeCocktailBar ? guestCount * 450 : 0;
  const transportCharge = 25000;
  const totalQuote = baseFoodCost + staffCost + cocktailCost + transportCharge;
  const depositRequired = Math.round(totalQuote * 0.5); // 50% deposit mandatory online

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone || !eventLocation) {
      showToast('Please provide your name, phone, and event location in Kogi State', 'error');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      createCateringBooking({
        customerName,
        customerPhone,
        customerEmail,
        eventType,
        eventDate,
        eventTime,
        eventLocation,
        expectedGuests: guestCount,
        selectedPackageId: selectedPkg.id,
        customMenuPreferences: selectedPkg.menuItems,
        serviceStyle,
        specialRequirements,
        baseFoodCost,
        serviceCharge: staffCost + cocktailCost,
        transportCharge,
        totalQuote,
        depositRequired,
        depositPaid: depositRequired,
      });

      setShowConfirmation(true);
      showToast(`Catering reservation for ${guestCount} guests confirmed!`, 'success');
    }, 1600);
  };

  return (
    <div className="space-y-10">
      {/* Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-400/30">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Kogi State Premier Event Hospitality & Royal Banqueting</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Flourish Royal Catering & Event Reservation
          </h2>

          <p className="text-sm text-stone-300 leading-relaxed">
            Delivering authentic Nigerian delicacies, firewood party Jollof, gourmet seafood fried rice, hot pounded yam with native Egusi, and royal Ebira specialities for weddings, burials, political summits, and grand milestones across Kogi State.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Catering Desk: {BUSINESS_INFO.phone}</span>
            </a>

            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs sm:text-sm transition-colors"
            >
              <span>Instant Menu Consultation</span>
            </a>
          </div>
        </div>
      </div>

      {/* Package Selection Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-display">
              Select Catering Menu Package
            </h3>
            <p className="text-xs text-stone-500">
              Prices scale automatically per guest with chafing warmers and full table setup.
            </p>
          </div>

          {/* Quick guest count adjuster */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-xs">
            <Users className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-stone-700">Expected Guests:</span>
            <input
              type="number"
              min={30}
              max={2000}
              step={10}
              value={guestCount}
              onChange={(e) => setGuestCount(Math.max(30, Number(e.target.value)))}
              className="w-20 px-2 py-0.5 text-xs font-bold bg-stone-100 rounded border border-stone-300 text-center"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CATERING_PACKAGES.map((pkg) => {
            const isSelected = selectedPackageId === pkg.id;

            return (
              <motion.div
                key={pkg.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`relative rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-stone-900 text-white border-amber-500 shadow-xl ring-2 ring-amber-500/50'
                    : 'bg-white text-stone-900 border-stone-200 hover:border-amber-400 shadow-xs'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full bg-amber-500 text-stone-950 shadow-sm">
                    Most Popular Choice
                  </span>
                )}

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-base font-display">
                        {pkg.name}
                      </h4>
                      <p className={`text-xs mt-1 ${isSelected ? 'text-stone-300' : 'text-stone-600'}`}>
                        {pkg.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-700/40">
                    <div className="text-2xl font-black text-amber-400">
                      ₦{pkg.pricePerGuest.toLocaleString()}
                      <span className={`text-xs font-normal ml-1 ${isSelected ? 'text-stone-400' : 'text-stone-500'}`}>
                        / guest
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-stone-400 mt-0.5">
                      Est. ₦{(pkg.pricePerGuest * guestCount).toLocaleString()} for {guestCount} guests
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
                      Sample Dishes Included:
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      {pkg.menuItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className={isSelected ? 'text-stone-200' : 'text-stone-700'}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-stone-700/30">
                  <button
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                    }`}
                  >
                    {isSelected ? '✓ Selected Package' : 'Select Package'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Signature Catering Dishes & Live Station Samples */}
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Event Dish Samples & Live Stations</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-display">
            Signature Catering Gallery & Live Food Stations
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Real samples prepared live by our chefs for banquet halls, marquees, and VIP receptions across Kogi State.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATERING_SAMPLE_DISHES.map((dish) => (
            <div
              key={dish.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {dish.isEbiraSpecialty ? (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-stone-900/90 backdrop-blur-xs text-amber-300 font-bold text-[10px] rounded-lg border border-stone-700">
                      Ebira Native Special
                    </span>
                  ) : (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-rose-950/90 backdrop-blur-xs text-rose-200 font-bold text-[10px] rounded-lg border border-rose-800">
                      Chef Special
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider">
                    {dish.category}
                  </div>
                  <h4 className="font-bold text-sm text-stone-900 line-clamp-1">{dish.name}</h4>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-rose-700">₦{dish.pricePerPortion.toLocaleString()}</span>
                  <span className="text-[11px] text-stone-500 font-medium">per guest portion</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Reservation Form & Live Quote Breakdown */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-extrabold text-stone-900 font-display">
            Event Booking & Custom Catering Quote
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Fill in your event specifications below. 50% online deposit confirms date on our Okene kitchen master schedule.
          </p>
        </div>

        <form onSubmit={handleBookingSubmit} className="space-y-6">
          {/* Event Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium"
              >
                <option>Wedding</option>
                <option>Birthday</option>
                <option>Burial / Celebration of Life</option>
                <option>Corporate Event / Banquet</option>
                <option>Political Gathering / Summit</option>
                <option>Traditional Celebration</option>
                <option>Religious Event</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Start Serving Time</label>
              <input
                type="text"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                placeholder="e.g. 1:00 PM"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Venue / Event Location (Kogi State)</label>
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Hall / Street, Town (e.g. Okene, Lokoja, Kabba)"
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Service Presentation Style</label>
              <select
                value={serviceStyle}
                onChange={(e) => setServiceStyle(e.target.value as any)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium"
              >
                <option>Buffet Service with Warmers</option>
                <option>Plated VIP Table Service</option>
                <option>Hygienic Packed Meal Boxes</option>
                <option>Live Cooking & Carving Stations</option>
              </select>
            </div>
          </div>

          {/* Add-ons checkbox */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <span className="text-xs font-bold text-stone-700 block">Optional Event Upgrades:</span>
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeExtraWaitstaff}
                  onChange={(e) => setIncludeExtraWaitstaff(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Uniformed Professional Waiters & Servers (+₦{staffCost.toLocaleString()})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCocktailBar}
                  onChange={(e) => setIncludeCocktailBar(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Palm Wine Mocktail & Cold Drink Bar Setup (+₦{cocktailCost.toLocaleString()})</span>
              </label>
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Contact Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Live Quote Breakdown & Payment Bar */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <span className="text-xs text-stone-400">Total Calculated Event Quote ({guestCount} Guests)</span>
                <div className="text-3xl font-black text-amber-400">
                  ₦{totalQuote.toLocaleString()}
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-xs text-stone-400">Mandatory 50% Online Reservation Deposit</span>
                <div className="text-2xl font-extrabold text-emerald-400">
                  ₦{depositRequired.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-400">
              <div>Food: ₦{baseFoodCost.toLocaleString()}</div>
              <div>Staff & Service: ₦{staffCost.toLocaleString()}</div>
              <div>Cocktails/Bar: ₦{cocktailCost.toLocaleString()}</div>
              <div>Logistics: ₦{transportCharge.toLocaleString()}</div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs text-amber-300">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                <strong>Platform Rule:</strong> Catering reservations require upfront online deposit via Paystack/Flutterwave to lock date and reserve event inventory.
              </span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing ₦{depositRequired.toLocaleString()} Deposit...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₦{depositRequired.toLocaleString()} Deposit & Reserve Date</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
