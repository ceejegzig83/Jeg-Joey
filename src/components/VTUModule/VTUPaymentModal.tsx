import React, { useState } from 'react';
import { VTUTransaction } from '../../types';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Building2,
  Hash,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Zap,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VTUPaymentModalProps {
  isOpen: boolean;
  transaction: VTUTransaction | null;
  authorizationUrl?: string;
  onClose: () => void;
  onVerifyPayment: (params: {
    reference: string;
    simulatedPaymentOutcome: 'SUCCESS' | 'FAILED' | 'ABANDONED';
    simulateProviderFailure?: boolean;
  }) => Promise<void>;
}

export const VTUPaymentModal: React.FC<VTUPaymentModalProps> = ({
  isOpen,
  transaction,
  authorizationUrl,
  onClose,
  onVerifyPayment
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'CARD' | 'TRANSFER' | 'USSD'>('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [simulateVtuOutage, setSimulateVtuOutage] = useState(false);

  if (!isOpen || !transaction) return null;

  const isTestMode = transaction.mode === 'TEST_MODE';

  const handleTriggerVerification = async (
    outcome: 'SUCCESS' | 'FAILED' | 'ABANDONED'
  ) => {
    setIsProcessing(true);
    setProcessingStep(
      outcome === 'SUCCESS'
        ? '1/3 Verifying payment status with Paystack server...'
        : 'Verifying payment response...'
    );

    await new Promise((r) => setTimeout(r, 600));

    if (outcome === 'SUCCESS') {
      setProcessingStep(
        `2/3 Payment verified! Dispatching ${transaction.network} ${transaction.type} via VTU Provider...`
      );
      await new Promise((r) => setTimeout(r, 700));
    }

    await onVerifyPayment({
      reference: transaction.reference,
      simulatedPaymentOutcome: outcome,
      simulateProviderFailure: simulateVtuOutage
    });

    setIsProcessing(false);
    setProcessingStep('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-md w-full overflow-hidden my-6"
        >
          {/* Paystack Header */}
          <div className="bg-stone-900 text-white p-5 border-b border-stone-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm tracking-tight">
                      Paystack Checkout
                    </span>
                    {isTestMode ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-stone-950">
                        TEST MODE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-stone-950">
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Flourish Destiny Collection • {transaction.customerEmail}
                  </p>
                </div>
              </div>

              {!isProcessing && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Order Summary Strip */}
            <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
              <div className="text-xs text-stone-300">
                <span className="font-bold text-white">{transaction.network}</span>{' '}
                {transaction.type === 'AIRTIME'
                  ? 'Airtime'
                  : `Data (${transaction.planName})`}{' '}
                → <span className="font-mono text-amber-300">{transaction.phoneNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-stone-400 block">Pay Now</span>
                <span className="text-lg font-black text-emerald-400 font-display">
                  ₦{transaction.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Test Mode Notice */}
            {isTestMode && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>DEMO / TEST PAYMENT MODE ACTIVE</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Live <code className="font-mono font-bold">PAYSTACK_SECRET_KEY</code> is not yet configured in environment variables. This checkout simulates Paystack authorization so you can test the full VTU workflow without real money charges.
                </p>
              </div>
            )}

            {/* Payment Channel Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedChannel('CARD')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                  selectedChannel === 'CARD'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedChannel('TRANSFER')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                  selectedChannel === 'TRANSFER'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Transfer</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedChannel('USSD')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                  selectedChannel === 'USSD'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                <span>USSD</span>
              </button>
            </div>

            {/* Channel Preview Details */}
            {selectedChannel === 'CARD' && (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-stone-500 font-semibold">
                  <span>Paystack Test Card</span>
                  <span className="font-mono text-stone-800 font-bold">4084 08•• •••• 4081</span>
                </div>
                <div className="flex items-center justify-between text-stone-500">
                  <span>Expiry: 09/29</span>
                  <span>CVV: •••</span>
                </div>
              </div>
            )}

            {selectedChannel === 'TRANSFER' && (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5 text-xs text-center">
                <span className="text-stone-500 font-medium block">
                  Paystack Virtual Account (Instant Confirmation)
                </span>
                <div className="text-base font-mono font-black text-stone-900">
                  9982410392 • Paystack-Titan
                </div>
                <span className="text-[11px] text-emerald-700 font-bold block">
                  Beneficiary: FLOURISH DESTINY COLLECTION VTU
                </span>
              </div>
            )}

            {selectedChannel === 'USSD' && (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5 text-xs text-center">
                <span className="text-stone-500 font-medium block">
                  Dial USSD Code on your mobile phone:
                </span>
                <div className="text-base font-mono font-black text-stone-900">
                  *737*000*{Math.round(transaction.totalAmount)}#
                </div>
                <span className="text-[11px] text-stone-500 block">
                  Supports GTBank, Access, Zenith, UBA, FirstBank & Kuda
                </span>
              </div>
            )}

            {/* Live Paystack Redirect Link if configured */}
            {!isTestMode && authorizationUrl && (
              <a
                href={authorizationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Live Paystack Checkout Window</span>
              </a>
            )}

            {/* Sandbox Provider Failure Toggle for testing Auto-Refund */}
            {isTestMode && (
              <label className="flex items-center justify-between p-3 rounded-xl bg-stone-100 border border-stone-200 cursor-pointer text-xs">
                <div>
                  <span className="font-bold text-stone-800 block">
                    Simulate VTU Provider Timeout (Test Auto-Refund)
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Tests payment succeeding while telecom provider fails → triggers automatic refund
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={simulateVtuOutage}
                  onChange={(e) => setSimulateVtuOutage(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
              </label>
            )}

            {/* Processing Spinner or Action Buttons */}
            {isProcessing ? (
              <div className="py-6 text-center space-y-3 bg-stone-50 rounded-2xl border border-stone-200 p-4">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <div className="text-xs font-extrabold text-stone-900">{processingStep}</div>
                <p className="text-[11px] text-stone-500">
                  Do not close this window. Backend is verifying payment before VTU dispatch.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleTriggerVerification('SUCCESS')}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isTestMode
                      ? `Authorize Test Payment (₦${transaction.totalAmount.toLocaleString()})`
                      : `Verify Payment & Deliver VTU (₦${transaction.totalAmount.toLocaleString()})`}
                  </span>
                </button>

                {isTestMode && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleTriggerVerification('FAILED')}
                      className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Simulate Failed Payment</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerVerification('ABANDONED')}
                      className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Simulate Abandoned</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Security Footer */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Server-Verified Before VTU Dispense
              </span>
              <span className="font-mono">{transaction.id}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
