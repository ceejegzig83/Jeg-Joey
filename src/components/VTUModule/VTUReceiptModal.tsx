import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Share2,
  Smartphone,
  Wifi,
  ShieldCheck,
  Copy,
  Phone,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VTUReceiptModal: React.FC = () => {
  const { activeVTUReceipt, setActiveVTUReceipt, businessInfo, showToast } = useApp();

  if (!activeVTUReceipt) return null;

  const tx = activeVTUReceipt;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(tx.id);
    showToast(`Copied Transaction ID: ${tx.id}`, 'success');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*FLOURISH DESTINY COLLECTION*\n` +
        `*VTU TRANSACTION RECEIPT*\n` +
        `--------------------------------\n` +
        `Transaction: ${tx.id}\n` +
        `Service: ${tx.type === 'AIRTIME' ? 'Airtime' : `Mobile Data (${tx.planName} - ${tx.planValidity})`}\n` +
        `Network: ${tx.network}\n` +
        `Phone: ${tx.phoneNumber}\n` +
        `Amount: ₦${tx.totalAmount.toLocaleString()}\n` +
        `Payment: ${tx.paymentStatus === 'SUCCESSFUL' ? 'Successful' : tx.paymentStatus}\n` +
        `VTU Status: ${tx.status}\n` +
        `Date: ${new Date(tx.createdAt).toLocaleString('en-NG', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}\n` +
        `Mode: ${tx.mode === 'TEST_MODE' ? 'TEST / DEMO MODE' : 'LIVE'}\n` +
        `--------------------------------\n` +
        `Okene, Kogi State • Helpline: ${businessInfo.phone}`
    );
    const url = `https://wa.me/?text=${text}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = () => {
    switch (tx.status) {
      case 'SUCCESSFUL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Transaction Successful
          </span>
        );
      case 'REFUNDED':
      case 'REVERSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            <RotateCcw className="w-4 h-4 text-amber-700" />
            {tx.status === 'REFUNDED' ? 'Payment Auto-Refunded' : 'Transaction Reversed'}
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Transaction Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-4 h-4 text-blue-600" />
            {tx.status.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  const formattedDate = new Date(tx.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = new Date(tx.createdAt).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-lg w-full my-6 overflow-hidden"
        >
          {/* Top Action Bar */}
          <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2">
              {tx.type === 'AIRTIME' ? (
                <Smartphone className="w-4 h-4 text-amber-400" />
              ) : (
                <Wifi className="w-4 h-4 text-amber-400" />
              )}
              <span className="font-bold text-xs tracking-wide uppercase">
                Digital VTU Transaction Receipt
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
              <button
                onClick={() => setActiveVTUReceipt(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Receipt Content */}
          <div className="p-6 sm:p-8 space-y-6 bg-white text-stone-900">
            {/* Test Mode Indicator Banner if Simulated */}
            {tx.mode === 'TEST_MODE' && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-900 uppercase tracking-wider">
                  ⚡ TEST MODE RECEIPT
                </span>
                <span className="text-amber-800 font-medium">
                  Simulated Sandbox Transaction
                </span>
              </div>
            )}

            {/* Brand Header */}
            <div className="text-center space-y-1.5 border-b border-dashed border-stone-300 pb-5">
              <div className="w-11 h-11 rounded-2xl bg-stone-900 text-amber-400 font-black text-base flex items-center justify-center mx-auto shadow-sm">
                FDC
              </div>
              <h2 className="text-lg font-black tracking-tight text-stone-950 font-display">
                FLOURISH DESTINY COLLECTION
              </h2>
              <p className="text-xs font-extrabold uppercase tracking-widest text-amber-700">
                VTU TRANSACTION RECEIPT
              </p>
              <div className="pt-2">{getStatusBadge()}</div>
            </div>

            {/* Amount Highlight */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-center space-y-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-stone-500">
                {tx.network} {tx.type === 'AIRTIME' ? 'Airtime Top-Up' : `Mobile Data (${tx.planName})`}
              </span>
              <div className="text-3xl font-black text-stone-950 font-display">
                ₦{tx.totalAmount.toLocaleString()}
              </div>
              {tx.planValidity && (
                <span className="text-xs font-semibold text-amber-700 block">
                  Bundle Validity: {tx.planValidity}
                </span>
              )}
            </div>

            {/* Key-Value Receipt Details */}
            <div className="space-y-2.5 text-xs border-b border-dashed border-stone-300 pb-5">
              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500 font-medium">Transaction ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-stone-900">{tx.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-900"
                    title="Copy Transaction ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500 font-medium">Service:</span>
                <span className="font-bold text-stone-900">
                  {tx.type === 'AIRTIME' ? 'Airtime' : `Mobile Data (${tx.planName})`}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500 font-medium">Network:</span>
                <span className="font-extrabold text-stone-900">{tx.network}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500 font-medium">Phone:</span>
                <span className="font-mono font-black text-sm text-stone-950">{tx.phoneNumber}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500 font-medium">Amount:</span>
                <span className="font-bold text-stone-900">₦{tx.amount.toLocaleString()}</span>
              </div>

              {tx.serviceFee > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-stone-500 font-medium">Service Fee:</span>
                  <span className="font-bold text-stone-900">₦{tx.serviceFee.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500 font-medium">Payment:</span>
                <span
                  className={`font-extrabold ${
                    tx.paymentStatus === 'SUCCESSFUL'
                      ? 'text-emerald-700'
                      : tx.paymentStatus === 'REFUNDED'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {tx.paymentStatus === 'SUCCESSFUL'
                    ? 'Successful'
                    : tx.paymentStatus === 'REFUNDED'
                    ? 'Refunded'
                    : tx.paymentStatus}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500 font-medium">VTU Delivery:</span>
                <span
                  className={`font-extrabold ${
                    tx.status === 'SUCCESSFUL'
                      ? 'text-emerald-700'
                      : tx.status === 'REFUNDED' || tx.status === 'REVERSED'
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {tx.status === 'SUCCESSFUL'
                    ? 'Successful'
                    : tx.status === 'REFUNDED'
                    ? 'Reversed & Refunded'
                    : tx.status}
                </span>
              </div>

              {tx.paymentGatewayRef && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-stone-500 font-medium">Paystack Reference:</span>
                  <span className="font-mono text-[11px] font-semibold text-stone-700">
                    {tx.paymentGatewayRef}
                  </span>
                </div>
              )}

              {tx.vtuProviderRef && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-stone-500 font-medium">VTU Provider Ref:</span>
                  <span className="font-mono text-[11px] font-semibold text-stone-700">
                    {tx.vtuProviderRef}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-1">
                <span className="text-stone-500 font-medium">Date:</span>
                <span className="font-bold text-stone-900">
                  {formattedDate} • {formattedTime}
                </span>
              </div>
            </div>

            {/* Provider Status Message */}
            {tx.vtuStatusMessage && (
              <div className="bg-stone-100 rounded-xl p-3 text-[11px] text-stone-700 font-medium leading-relaxed">
                <strong>Gateway Note:</strong> {tx.vtuStatusMessage}
              </div>
            )}

            {/* Footer */}
            <div className="text-center space-y-1 text-[11px] text-stone-500">
              <div className="flex items-center justify-center gap-1 font-bold text-stone-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified by Flourish Destiny Collection VTU Engine</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-600" /> Okene, Kogi State
                </span>
                <span className="flex items-center gap-1 font-bold text-stone-700">
                  <Phone className="w-3 h-3 text-amber-600" /> {businessInfo.phone}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
