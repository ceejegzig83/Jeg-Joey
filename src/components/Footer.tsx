import React from 'react';
import { useApp } from '../context/AppContext';
import { BUSINESS_INFO } from '../data/mockData';
import { Division } from '../types';
import { 
  Phone, 
  MessageSquare, 
  MapPin, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CreditCard, 
  ExternalLink,
  Car,
  Lock
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveDivision, setIsContactModalOpen, setIsAdminLoginModalOpen, isAdminAuthenticated, setCurrentRole } = useApp();

  const handleDivisionClick = (div: Division) => {
    setActiveDivision(div);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 text-sm mt-16">
      {/* Top Banner with Direct Phone & WhatsApp CTA */}
      <div className="bg-gradient-to-r from-amber-900/40 via-stone-900 to-amber-950/40 border-b border-stone-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h4 className="text-lg font-bold text-amber-100 font-display">
              Ready to Order, Book an Event, or Request a Ride in Kogi State?
            </h4>
            <p className="text-xs text-stone-400 mt-1">
              Call our Okene headquarters directly or chat with our desk on WhatsApp 24/7.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition-colors shadow-sm text-xs"
            >
              <Phone className="w-4 h-4" />
              <span>Call: {BUSINESS_INFO.phone}</span>
            </a>

            <a
              href={BUSINESS_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors shadow-sm text-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Us (09162723865)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-black text-lg">
                FDC
              </div>
              <div>
                <span className="text-lg font-extrabold text-white font-display">
                  FLOURISH DESTINY
                </span>
                <span className="block text-xs font-semibold text-amber-400">
                  COLLECTION MULTI-SERVICE PLATFORM
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Your premier multi-service destination in Okene, Kogi State. Seamlessly combining authentic fashion & bespoke tailoring, fresh artisanal bakery, royal event catering, everyday grocery essentials, and intra-state ride-hailing logistics.
            </p>

            {/* Direct Contact Details */}
            <div className="space-y-2 text-xs text-stone-300 pt-2 border-t border-stone-800">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">{BUSINESS_INFO.phone}</span>
                <span className="text-stone-500">/</span>
                <span className="text-stone-400">{BUSINESS_INFO.formattedPhone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{BUSINESS_INFO.workingHours}</span>
              </div>
            </div>
          </div>

          {/* Business Hubs Navigation */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
              Our 5 Business Hubs
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => handleDivisionClick('FASHION')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  👗 Fashion Store & Tailoring
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleDivisionClick('BAKERY')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  🥖 Artisanal Bakery & Cakes
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleDivisionClick('CATERING')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  🍽️ Catering & Event Feasts
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleDivisionClick('GROCERY')}
                  className="hover:text-amber-300 transition-colors text-left"
                >
                  🛒 Grocery & Supermarket
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleDivisionClick('TRANSPORT')}
                  className="hover:text-amber-300 transition-colors text-left flex items-center gap-1 font-semibold text-blue-400"
                >
                  <Car className="w-3.5 h-3.5" /> Kogi Ride-Hailing (Keke / Car)
                </button>
              </li>
            </ul>
          </div>

          {/* Payment & Operational Rules */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
              Payment Guidelines
            </h5>
            <ul className="space-y-2 text-xs text-stone-400 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>100% Upfront Online:</strong> Mandatory for Transport (Rides), Custom Tailoring & Catering deposits.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Cash on Delivery (CoD):</strong> Enabled only for Grocery, ready-to-wear Fashion, and daily Bakery items.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CreditCard className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Paystack & Flutterwave, Naira Debit Cards, USSD & Instant Bank Transfers supported.</span>
              </li>
            </ul>
          </div>

          {/* Service Area & Geofencing */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
              Kogi State Service Areas
            </h5>
            <p className="text-xs text-stone-400 leading-relaxed">
              Transportation and courier dispatch is geofenced exclusively within Kogi State:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Okene', 'Adavi', 'Okehi', 'Ajaokuta', 'Lokoja', 'Kabba', 'Anyigba', 'Ankpa', 'Idah'].map((town) => (
                <span key={town} className="text-[11px] bg-stone-900 px-2 py-0.5 rounded border border-stone-800 text-stone-300">
                  {town}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} <strong className="text-stone-300">FLOURISH DESTINY COLLECTION</strong>. All Rights Reserved. Okene, Kogi State, Nigeria.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button onClick={() => setIsContactModalOpen(true)} className="hover:text-amber-400 transition-colors">
              Help Center & Inquiries (09162723865)
            </button>
            <span>•</span>
            <span className="text-amber-500 font-semibold">Strict 100% Upfront Policy for Rides</span>
            <span>•</span>
            {isAdminAuthenticated ? (
              <button 
                onClick={() => setCurrentRole('ADMIN')}
                className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Terminal Active</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="text-stone-500 hover:text-stone-300 inline-flex items-center gap-1 transition-colors"
                title="Authorized HQ Staff Login"
              >
                <Lock className="w-3 h-3" />
                <span>Staff Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
