import React from 'react';
import { useApp } from '../../context/AppContext';
import { BUSINESS_INFO } from '../../data/mockData';
import { Phone, MessageSquare, MapPin, Clock, Mail, X, ShieldCheck, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ContactModal: React.FC = () => {
  const { isContactModalOpen, setIsContactModalOpen } = useApp();

  if (!isContactModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-6 relative">
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold">
                FDC
              </div>
              <div>
                <h3 className="font-bold text-lg text-amber-100">{BUSINESS_INFO.name}</h3>
                <p className="text-xs text-stone-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> {BUSINESS_INFO.location}
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-300 mt-2">
              Official customer support, custom tailoring booking, wedding catering reservations & ride assistance.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${BUSINESS_INFO.phone}`}
                className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 transition-colors shadow-sm"
              >
                <Phone className="w-5 h-5 text-amber-400 animate-pulse" />
                <span>Call {BUSINESS_INFO.phone}</span>
              </a>

              <a
                href={BUSINESS_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <MessageSquare className="w-5 h-5 text-white" />
                <span>Chat on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            {/* Business Details Card */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-stone-900">Physical Hub & Showroom</div>
                  <div className="text-stone-600 text-xs mt-0.5">{BUSINESS_INFO.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-stone-900">Working Hours</div>
                  <div className="text-stone-600 text-xs mt-0.5">{BUSINESS_INFO.workingHours}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-stone-900">Official Email</div>
                  <div className="text-stone-600 text-xs mt-0.5">{BUSINESS_INFO.email}</div>
                </div>
              </div>
            </div>

            {/* Payment & Trust info */}
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-950 text-xs">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Verified Okene Business:</strong> Secured online checkouts powered by Paystack & Flutterwave.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
