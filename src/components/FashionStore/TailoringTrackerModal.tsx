import React from 'react';
import { useApp } from '../../context/AppContext';
import { TailoringRequest } from '../../types';
import { BUSINESS_INFO } from '../../data/mockData';
import { 
  Scissors, 
  X, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Phone, 
  FileText, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TailoringTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TailoringTrackerModal: React.FC<TailoringTrackerModalProps> = ({ isOpen, onClose }) => {
  const { tailoringRequests, setActiveInvoice } = useApp();

  if (!isOpen) return null;

  const stages: { key: TailoringRequest['status']; label: string; desc: string }[] = [
    { key: 'REQUESTED', label: 'Requested', desc: 'Order logged & measurements received' },
    { key: 'APPROVED', label: 'Payment Approved', desc: '100% Upfront payment verified' },
    { key: 'IN_PRODUCTION', label: 'In Production', desc: 'Fabrics cut & master tailoring active' },
    { key: 'READY', label: 'Ready for Pickup / Fitting', desc: 'Finished, ironed & packaged at Okene Hub' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Delivered to customer' },
  ];

  const getStageIndex = (status: TailoringRequest['status']) => {
    switch (status) {
      case 'REQUESTED': return 0;
      case 'REVIEWING': case 'QUOTED': case 'APPROVED': return 1;
      case 'IN_PRODUCTION': return 2;
      case 'READY': return 3;
      case 'COMPLETED': return 4;
      default: return 0;
    }
  };

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
          <div className="bg-stone-900 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-stone-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-amber-100 font-display">
                  Active Bespoke Tailoring Tracker
                </h3>
                <p className="text-xs text-stone-300">
                  Real-time status of your custom garments at Flourish Destiny Okene Hub.
                </p>
              </div>
            </div>
          </div>

          {/* List of active requests */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {tailoringRequests.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Scissors className="w-10 h-10 text-stone-400 mx-auto" />
                <h4 className="font-bold text-stone-800 text-sm">No tailoring requests found</h4>
                <p className="text-xs text-stone-500">Submit a new bespoke sewing request to see progress.</p>
              </div>
            ) : (
              tailoringRequests.map((req) => {
                const currentIndex = getStageIndex(req.status);

                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/70 space-y-5 shadow-xs"
                  >
                    {/* Item Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-stone-900">{req.garmentType}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {req.fabricPreference}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Client: <strong className="text-stone-700">{req.customerName}</strong> ({req.customerPhone})
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-amber-700">
                          ₦{req.estimatedCost.toLocaleString()}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          100% PAID (Online)
                        </span>
                      </div>
                    </div>

                    {/* Stepper Progression */}
                    <div className="relative pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                        {stages.map((stage, idx) => {
                          const isDone = idx <= currentIndex;
                          const isCurrent = idx === currentIndex;

                          return (
                            <div
                              key={stage.key}
                              className={`p-2.5 rounded-xl border text-xs transition-all ${
                                isCurrent
                                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-600 shadow-sm'
                                  : isDone
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                  : 'bg-white text-stone-400 border-stone-200'
                              }`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {isDone ? (
                                  <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-stone-950' : 'text-emerald-600'}`} />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                                )}
                                <span className="font-bold text-[11px]">{stage.label}</span>
                              </div>
                              <p className={`text-[10px] leading-tight ${isCurrent ? 'text-stone-900' : 'opacity-80'}`}>
                                {stage.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Metadata & Inquiries */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 text-xs">
                      <div className="flex items-center gap-4 text-stone-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" /> Target Date: <strong className="text-stone-800">{req.preferredCompletionDate}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${BUSINESS_INFO.phone}`}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs"
                        >
                          <Phone className="w-3 h-3 text-amber-700" />
                          <span>Fitting Desk</span>
                        </a>

                        <button
                          onClick={() => {
                            setActiveInvoice(req);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs"
                        >
                          <FileText className="w-3 h-3 text-amber-400" />
                          <span>View Invoice</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
