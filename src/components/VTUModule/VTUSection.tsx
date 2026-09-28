import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  VTUNetwork,
  VTUServiceType,
  VTUDataPlan,
  VTUTransaction
} from '../../types';
import { VTU_NETWORKS, COMMON_AIRTIME_AMOUNTS } from '../../data/vtuData';
import { validateNigerianPhone } from '../../utils/nigerianPhone';
import { VTUPaymentModal } from './VTUPaymentModal';
import {
  Smartphone,
  Wifi,
  History,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Phone,
  Search,
  Filter,
  Receipt,
  Bookmark,
  Plus,
  Trash2,
  Clock,
  RotateCcw,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VTUSection: React.FC = () => {
  const {
    vtuConfig,
    vtuDataPlans,
    vtuTransactions,
    savedBeneficiaries,
    addSavedBeneficiary,
    removeSavedBeneficiary,
    initiateVTUTransaction,
    verifyAndFulfillVTUPayment,
    setActiveVTUReceipt,
    userProfile,
    showToast
  } = useApp();

  // Main VTU View Tabs: 'AIRTIME' | 'DATA' | 'HISTORY'
  const [activeTab, setActiveTab] = useState<'AIRTIME' | 'DATA' | 'HISTORY'>('AIRTIME');

  // Shared Form State
  const [selectedNetwork, setSelectedNetwork] = useState<VTUNetwork>('MTN');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [confirmPhoneNumber, setConfirmPhoneNumber] = useState<string>('');
  const [requirePhoneConfirmation, setRequirePhoneConfirmation] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'PAYSTACK_CARD' | 'BANK_TRANSFER' | 'USSD'>('PAYSTACK_CARD');

  // Airtime Specific State
  const [airtimeAmount, setAirtimeAmount] = useState<number>(1000);
  const [customAmountInput, setCustomAmountInput] = useState<string>('');
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);

  // Data Specific State
  const [selectedPlanId, setSelectedPlanId] = useState<string>('mtn-1gb-30d');
  const [dataCategoryFilter, setDataCategoryFilter] = useState<'ALL' | 'MONTHLY' | 'MEGA'>('ALL');

  // Step State: 'FORM' | 'REVIEW' | 'RESULT'
  const [step, setStep] = useState<'FORM' | 'REVIEW' | 'RESULT'>('FORM');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active Payment Checkout Session
  const [pendingTx, setPendingTx] = useState<VTUTransaction | null>(null);
  const [authUrl, setAuthUrl] = useState<string | undefined>(undefined);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<VTUTransaction | null>(null);

  // Save Beneficiary Form
  const [newBenName, setNewBenName] = useState<string>('');
  const [showAddBeneficiary, setShowAddBeneficiary] = useState<boolean>(false);

  // Transaction History Filters
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'ALL' | VTUServiceType>('ALL');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('ALL');
  const [historyNetworkFilter, setHistoryNetworkFilter] = useState<'ALL' | VTUNetwork>('ALL');
  const [historyDateFilter, setHistoryDateFilter] = useState<string>('');
  const [historySearch, setHistorySearch] = useState<string>('');

  // Validate Phone Number & Auto-Detect Network
  const phoneCheck = useMemo(() => validateNigerianPhone(phoneNumber), [phoneNumber]);

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    const check = validateNigerianPhone(val);
    if (check.isValid && check.detectedNetwork) {
      setSelectedNetwork(check.detectedNetwork);
      // Also select first active plan for that network if on DATA tab
      const firstPlan = vtuDataPlans.find(
        (p) => p.network === check.detectedNetwork && p.status === 'ACTIVE'
      );
      if (firstPlan) setSelectedPlanId(firstPlan.planId);
    }
  };

  const handleNetworkSelect = (net: VTUNetwork) => {
    if (!vtuConfig.networksEnabled[net]) {
      showToast(`${net} VTU is currently under maintenance.`, 'warning');
      return;
    }
    setSelectedNetwork(net);
    const firstPlan = vtuDataPlans.find((p) => p.network === net && p.status === 'ACTIVE');
    if (firstPlan) setSelectedPlanId(firstPlan.planId);
  };

  // Filtered Data Plans for Selected Network
  const availableDataPlans = useMemo(() => {
    return vtuDataPlans.filter(
      (p) =>
        p.network === selectedNetwork &&
        p.status === 'ACTIVE' &&
        (dataCategoryFilter === 'ALL' || p.category === dataCategoryFilter)
    );
  }, [vtuDataPlans, selectedNetwork, dataCategoryFilter]);

  const selectedDataPlan: VTUDataPlan | undefined = useMemo(
    () =>
      vtuDataPlans.find(
        (p) => p.planId === selectedPlanId && p.network === selectedNetwork && p.status === 'ACTIVE'
      ) || availableDataPlans[0],
    [vtuDataPlans, selectedPlanId, selectedNetwork, availableDataPlans]
  );

  // Effective Airtime Amount
  const effectiveAirtimeAmount = isCustomAmount
    ? Number(customAmountInput) || 0
    : airtimeAmount;

  const currentServiceFee =
    activeTab === 'AIRTIME' ? vtuConfig.airtimeServiceFee : vtuConfig.dataServiceFee;

  const currentNominalAmount =
    activeTab === 'AIRTIME'
      ? effectiveAirtimeAmount
      : selectedDataPlan?.customerPrice || 0;

  const currentTotalAmount = currentNominalAmount + currentServiceFee;

  // Proceed to Review Step
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneCheck.isValid) {
      showToast(phoneCheck.error || 'Please enter a valid 11-digit Nigerian phone number.', 'error');
      return;
    }

    if (requirePhoneConfirmation) {
      const confirmCheck = validateNigerianPhone(confirmPhoneNumber);
      if (confirmCheck.normalized !== phoneCheck.normalized) {
        showToast('Confirmation phone number does not match recipient phone number.', 'error');
        return;
      }
    }

    if (activeTab === 'AIRTIME') {
      if (
        effectiveAirtimeAmount < vtuConfig.minAirtimeAmount ||
        effectiveAirtimeAmount > vtuConfig.maxAirtimeAmount
      ) {
        showToast(
          `Airtime amount must be between ₦${vtuConfig.minAirtimeAmount.toLocaleString()} and ₦${vtuConfig.maxAirtimeAmount.toLocaleString()}.`,
          'error'
        );
        return;
      }
    } else if (activeTab === 'DATA') {
      if (!selectedDataPlan) {
        showToast('Please select a valid mobile data bundle.', 'error');
        return;
      }
    }

    setStep('REVIEW');
  };

  // Continue to Payment -> Create Pending Transaction on Backend
  const handleContinueToPayment = async () => {
    setIsSubmitting(true);
    const idempotencyKey = `${activeTab}_${selectedNetwork}_${phoneCheck.normalized}_${currentNominalAmount}_${Math.floor(
      Date.now() / 15000
    )}`;

    const res = await initiateVTUTransaction({
      type: activeTab === 'AIRTIME' ? 'AIRTIME' : 'DATA',
      network: selectedNetwork,
      phoneNumber: phoneCheck.normalized,
      amount: currentNominalAmount,
      planId: activeTab === 'DATA' ? selectedDataPlan?.planId : undefined,
      customerName: userProfile.name,
      customerEmail: userProfile.email,
      paymentMethod,
      idempotencyKey
    });

    setIsSubmitting(false);

    if (res.success && res.transaction) {
      setPendingTx(res.transaction);
      setAuthUrl(res.paymentSession?.authorizationUrl);
      setIsPaymentModalOpen(true);
    }
  };

  // Handle Backend Payment Verification & VTU Delivery
  const handleVerifyPayment = async (params: {
    reference: string;
    simulatedPaymentOutcome: 'SUCCESS' | 'FAILED' | 'ABANDONED';
    simulateProviderFailure?: boolean;
  }) => {
    const res = await verifyAndFulfillVTUPayment(params);
    setIsPaymentModalOpen(false);
    if (res.transaction) {
      setCompletedTx(res.transaction);
      setStep('RESULT');
    }
  };

  // Filtered Transaction History
  const filteredTransactions = useMemo(() => {
    return vtuTransactions.filter((tx) => {
      if (historyTypeFilter !== 'ALL' && tx.type !== historyTypeFilter) return false;
      if (historyNetworkFilter !== 'ALL' && tx.network !== historyNetworkFilter) return false;
      if (historyStatusFilter !== 'ALL') {
        if (historyStatusFilter === 'PENDING_GROUP') {
          if (!['PENDING', 'PAYMENT_PENDING', 'PAYMENT_SUCCESSFUL', 'PROCESSING'].includes(tx.status))
            return false;
        } else if (tx.status !== historyStatusFilter) {
          return false;
        }
      }
      if (historyDateFilter) {
        const txDate = tx.createdAt.slice(0, 10);
        if (txDate !== historyDateFilter) return false;
      }
      if (historySearch.trim() !== '') {
        const q = historySearch.toLowerCase().trim();
        const matchesId = tx.id.toLowerCase().includes(q);
        const matchesPhone = tx.phoneNumber.toLowerCase().includes(q);
        const matchesPlan = (tx.planName || '').toLowerCase().includes(q);
        if (!matchesId && !matchesPhone && !matchesPlan) return false;
      }
      return true;
    });
  }, [
    vtuTransactions,
    historyTypeFilter,
    historyNetworkFilter,
    historyStatusFilter,
    historyDateFilter,
    historySearch
  ]);

  const resetOrderFlow = () => {
    setStep('FORM');
    setPendingTx(null);
    setCompletedTx(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Paystack / Test Mode Checkout Modal */}
      <VTUPaymentModal
        isOpen={isPaymentModalOpen}
        transaction={pendingTx}
        authorizationUrl={authUrl}
        onClose={() => setIsPaymentModalOpen(false)}
        onVerifyPayment={handleVerifyPayment}
      />

      {/* Top Hero Banner for VTU Module */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-extrabold">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Instant Airtime & Mobile Data VTU</span>
              </span>

              {vtuConfig.mode === 'TEST_MODE' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider">
                  ⚡ TEST MODE (Sandbox Payment & VTU Active)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-stone-950 text-xs font-black uppercase tracking-wider">
                  ✓ LIVE PAYSTACK & VTU GATEWAY
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              Airtime & Mobile Data Top-Up
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Instant automated delivery for <strong>MTN, Airtel, Glo, and 9mobile</strong> across Nigeria. Powered by Flourish Destiny Collection secure backend payment verification.
            </p>
          </div>

          {/* Primary Service Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 bg-stone-950/90 p-2 rounded-2xl border border-stone-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('AIRTIME');
                resetOrderFlow();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'AIRTIME'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Buy Airtime</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('DATA');
                resetOrderFlow();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'DATA'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Wifi className="w-4 h-4" />
              <span>Buy Data</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('HISTORY');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'HISTORY'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>VTU History ({vtuTransactions.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Mode Informative Banner */}
      {vtuConfig.mode === 'TEST_MODE' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 font-black uppercase tracking-wider shrink-0">
              TEST MODE
            </span>
            <p className="text-amber-950 font-medium leading-relaxed">
              Live Paystack & VTU credentials are not yet configured in server environment variables. You can test the complete Airtime & Data purchase flow, payment verification, auto-refund protection, and digital receipts using simulated transactions.
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-800 shrink-0">
            Provider: {vtuConfig.vtuProviderName.split('(')[0]}
          </span>
        </div>
      )}

      {/* =================================================================== */}
      {/* BUY AIRTIME OR BUY DATA WORKFLOW */}
      {/* =================================================================== */}
      {(activeTab === 'AIRTIME' || activeTab === 'DATA') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Purchase Form / Confirmation / Result */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP 1: PURCHASE INPUT FORM */}
              {step === 'FORM' && (
                <motion.form
                  key="vtu-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleProceedToReview}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                        {activeTab === 'AIRTIME' ? (
                          <Smartphone className="w-5 h-5" />
                        ) : (
                          <Wifi className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-stone-900 font-display">
                          {activeTab === 'AIRTIME'
                            ? 'Purchase Instant Mobile Airtime'
                            : 'Purchase Mobile Data Bundle'}
                        </h2>
                        <p className="text-xs text-stone-500">
                          Select network, enter 11-digit Nigerian number, and choose{' '}
                          {activeTab === 'AIRTIME' ? 'amount' : 'data plan'}.
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                      Step 1 of 3
                    </span>
                  </div>

                  {/* 1. Network Selection */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-600">
                      1. Select Mobile Network
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {VTU_NETWORKS.map((net) => {
                        const isSelected = selectedNetwork === net.id;
                        const isEnabled = vtuConfig.networksEnabled[net.id] ?? true;
                        return (
                          <button
                            key={net.id}
                            type="button"
                            onClick={() => handleNetworkSelect(net.id)}
                            className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? `${net.borderColor} ${net.bgLight} shadow-sm scale-[1.01]`
                                : 'border-stone-200 bg-white hover:border-stone-300'
                            } ${!isEnabled ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span
                                className={`px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r ${net.color} text-white shadow-2xs`}
                              >
                                {net.shortName}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              )}
                            </div>
                            <div className="mt-3">
                              <div className="font-bold text-xs text-stone-900">{net.name}</div>
                              <div className="text-[10px] text-stone-500 font-medium">
                                {isEnabled ? 'Instant Delivery' : 'Maintenance'}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Recipient Phone Number + Saved Beneficiaries */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-600">
                        2. Recipient Nigerian Phone Number (11 Digits)
                      </label>
                      {phoneCheck.isValid && phoneCheck.detectedNetwork && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          ✓ Valid {phoneCheck.detectedNetwork} Prefix Detected
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="e.g. 08031234567, 08123456789, 070..., 090..., 091..."
                        maxLength={14}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-stone-950 font-mono font-bold text-sm focus:outline-hidden focus:border-amber-500 focus:bg-white transition-colors"
                        required
                      />
                    </div>

                    {phoneNumber && !phoneCheck.isValid && (
                      <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{phoneCheck.error}</span>
                      </p>
                    )}

                    {/* Optional Confirm Phone Number Toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="inline-flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requirePhoneConfirmation}
                          onChange={(e) => setRequirePhoneConfirmation(e.target.checked)}
                          className="w-3.5 h-3.5 accent-amber-600 rounded"
                        />
                        <span>Double-check by re-entering phone number</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handlePhoneChange(userProfile.phone)}
                        className="text-xs font-bold text-amber-700 hover:underline"
                      >
                        Use My Profile Phone ({userProfile.phone})
                      </button>
                    </div>

                    {requirePhoneConfirmation && (
                      <div>
                        <input
                          type="tel"
                          value={confirmPhoneNumber}
                          onChange={(e) => setConfirmPhoneNumber(e.target.value)}
                          placeholder="Confirm 11-digit recipient phone number"
                          className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-950 font-mono font-bold text-xs focus:outline-hidden focus:border-amber-500"
                          required
                        />
                      </div>
                    )}

                    {/* Quick Saved Beneficiaries Pills */}
                    {savedBeneficiaries.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                          Quick Select Saved Number:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {savedBeneficiaries.map((ben) => (
                            <button
                              key={ben.id}
                              type="button"
                              onClick={() => {
                                setPhoneNumber(ben.phoneNumber);
                                setConfirmPhoneNumber(ben.phoneNumber);
                                setSelectedNetwork(ben.network);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-50 text-stone-800 hover:text-amber-900 border border-stone-200 hover:border-amber-300 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Bookmark className="w-3 h-3 text-amber-600" />
                              <span>{ben.name}</span>
                              <span className="font-mono text-[11px] text-stone-500">
                                ({ben.phoneNumber})
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3A. AIRTIME AMOUNT SELECTION */}
                  {activeTab === 'AIRTIME' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-600">
                          3. Select or Enter Airtime Amount (₦)
                        </label>
                        <span className="text-[11px] text-stone-500 font-medium">
                          Min: ₦{vtuConfig.minAirtimeAmount.toLocaleString()} • Max: ₦
                          {vtuConfig.maxAirtimeAmount.toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                        {COMMON_AIRTIME_AMOUNTS.map((amt) => {
                          const active = !isCustomAmount && airtimeAmount === amt;
                          return (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => {
                                setIsCustomAmount(false);
                                setAirtimeAmount(amt);
                              }}
                              className={`py-3 px-3 rounded-2xl font-extrabold text-xs sm:text-sm border transition-all cursor-pointer ${
                                active
                                  ? 'bg-stone-900 text-amber-400 border-stone-900 shadow-sm'
                                  : 'bg-stone-50 text-stone-800 border-stone-200 hover:border-amber-400 hover:bg-amber-50/40'
                              }`}
                            >
                              ₦{amt.toLocaleString()}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => setIsCustomAmount(true)}
                          className={`py-3 px-3 rounded-2xl font-extrabold text-xs sm:text-sm border transition-all cursor-pointer ${
                            isCustomAmount
                              ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-sm'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-400'
                          }`}
                        >
                          Custom Amount
                        </button>
                      </div>

                      {isCustomAmount && (
                        <div className="pt-2">
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Enter Custom Airtime Amount (₦{vtuConfig.minAirtimeAmount} – ₦
                            {vtuConfig.maxAirtimeAmount.toLocaleString()})
                          </label>
                          <input
                            type="number"
                            min={vtuConfig.minAirtimeAmount}
                            max={vtuConfig.maxAirtimeAmount}
                            value={customAmountInput}
                            onChange={(e) => setCustomAmountInput(e.target.value)}
                            placeholder="Enter amount in Naira e.g. 1500"
                            className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-300 text-stone-950 font-extrabold text-sm focus:outline-hidden focus:border-amber-500"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3B. MOBILE DATA BUNDLE SELECTION */}
                  {activeTab === 'DATA' && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-600">
                          3. Select {selectedNetwork} Data Bundle
                        </label>

                        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-[11px] font-bold">
                          {(['ALL', 'MONTHLY', 'MEGA'] as const).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setDataCategoryFilter(cat)}
                              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                                dataCategoryFilter === cat
                                  ? 'bg-stone-900 text-white'
                                  : 'text-stone-600 hover:text-stone-900'
                              }`}
                            >
                              {cat === 'ALL' ? 'All Plans' : cat === 'MONTHLY' ? 'Standard' : 'Mega Plans'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableDataPlans.map((plan) => {
                          const isSelected = selectedDataPlan?.planId === plan.planId;
                          return (
                            <div
                              key={plan.planId}
                              onClick={() => setSelectedPlanId(plan.planId)}
                              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                                  : 'border-stone-200 bg-stone-50/60 hover:border-stone-300 hover:bg-white'
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-black text-stone-950 font-display">
                                    {plan.name}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-800">
                                    {plan.validity}
                                  </span>
                                </div>
                                <p className="text-[11px] text-stone-500">{plan.description}</p>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-base font-black text-amber-800">
                                  ₦{plan.customerPrice.toLocaleString()}
                                </div>
                                <span className="text-[10px] font-bold text-stone-400 uppercase">
                                  {isSelected ? '✓ Selected' : 'Select Plan'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4. Preferred Payment Method */}
                  <div className="space-y-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-600">
                      4. Payment Channel (via Paystack)
                    </label>
                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      {[
                        { id: 'PAYSTACK_CARD', label: 'ATM / Debit Card' },
                        { id: 'BANK_TRANSFER', label: 'Instant Bank Transfer' },
                        { id: 'USSD', label: 'Bank USSD Code' }
                      ].map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id as any)}
                          className={`py-2.5 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                            paymentMethod === pm.id
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {pm.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit to Confirmation Screen */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Review Transaction</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 2: ORDER CONFIRMATION PAGE BEFORE PAYMENT */}
              {step === 'REVIEW' && (
                <motion.div
                  key="vtu-review"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                        Step 2 of 3 • Confirm Details
                      </span>
                      <h2 className="text-xl font-black text-stone-900 font-display mt-0.5">
                        Review Your VTU Order
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep('FORM')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                  </div>

                  {/* Confirmation Summary Card */}
                  <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3.5 text-xs sm:text-sm">
                    <div className="flex items-center justify-between py-1.5 border-b border-stone-200/70">
                      <span className="text-stone-500 font-medium">Service Type</span>
                      <span className="font-extrabold text-stone-900">
                        {activeTab === 'AIRTIME' ? 'Instant Mobile Airtime' : 'Mobile Data Bundle'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-stone-200/70">
                      <span className="text-stone-500 font-medium">Network</span>
                      <span className="font-black text-stone-950 px-2.5 py-0.5 rounded-lg bg-amber-200/70">
                        {selectedNetwork}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-stone-200/70">
                      <span className="text-stone-500 font-medium">Recipient Phone Number</span>
                      <span className="font-mono font-black text-base text-stone-950">
                        {phoneCheck.normalized}
                      </span>
                    </div>

                    {activeTab === 'DATA' && selectedDataPlan && (
                      <>
                        <div className="flex items-center justify-between py-1.5 border-b border-stone-200/70">
                          <span className="text-stone-500 font-medium">Data Bundle</span>
                          <span className="font-extrabold text-stone-900">
                            {selectedDataPlan.name} ({selectedDataPlan.description})
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-stone-200/70">
                          <span className="text-stone-500 font-medium">Bundle Validity</span>
                          <span className="font-bold text-amber-800">{selectedDataPlan.validity}</span>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between py-1.5 border-b border-stone-200/70">
                      <span className="text-stone-500 font-medium">Amount</span>
                      <span className="font-bold text-stone-900">
                        ₦{currentNominalAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-stone-200/70">
                      <span className="text-stone-500 font-medium">Service Fee</span>
                      <span className="font-bold text-emerald-700">
                        {currentServiceFee === 0
                          ? '₦0 (Free)'
                          : `₦${currentServiceFee.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-base">
                      <span className="font-extrabold text-stone-900">Total Amount</span>
                      <span className="text-2xl font-black text-stone-950 font-display">
                        ₦{currentTotalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 text-xs text-blue-950 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Protected Transaction Flow:</strong> Your airtime or data will be automatically credited to{' '}
                      <span className="font-mono font-bold">{phoneCheck.normalized}</span> immediately after our backend verifies payment confirmation from Paystack.
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('FORM')}
                      className="py-3.5 px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleContinueToPayment}
                      className="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {isSubmitting
                          ? 'Initializing Payment...'
                          : `Continue to Payment (₦${currentTotalAmount.toLocaleString()})`}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: TRANSACTION STATUS & RESULT SCREEN */}
              {step === 'RESULT' && completedTx && (
                <motion.div
                  key="vtu-result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6"
                >
                  <div className="text-center space-y-2 border-b border-stone-100 pb-6">
                    {completedTx.status === 'SUCCESSFUL' ? (
                      <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-9 h-9" />
                      </div>
                    ) : completedTx.status === 'REFUNDED' ? (
                      <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                        <RotateCcw className="w-9 h-9" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                        <AlertCircle className="w-9 h-9" />
                      </div>
                    )}

                    <h2 className="text-2xl font-black text-stone-950 font-display">
                      {completedTx.status === 'SUCCESSFUL'
                        ? 'Transaction Successful'
                        : completedTx.status === 'REFUNDED'
                        ? 'VTU Failed — Payment Auto-Refunded'
                        : 'Transaction Failed'}
                    </h2>

                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                      {completedTx.vtuStatusMessage}
                    </p>
                  </div>

                  {/* Status Details Box */}
                  <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-2.5 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">Service:</span>
                      <span className="font-extrabold text-stone-900">
                        {completedTx.network}{' '}
                        {completedTx.type === 'AIRTIME'
                          ? 'Airtime'
                          : `Mobile Data (${completedTx.planName})`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">Phone:</span>
                      <span className="font-mono font-black text-sm text-stone-950">
                        {completedTx.phoneNumber}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">Amount:</span>
                      <span className="font-black text-stone-950">
                        ₦{completedTx.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">Transaction ID:</span>
                      <span className="font-mono font-bold text-stone-900">{completedTx.id}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">Status:</span>
                      <span
                        className={`font-extrabold ${
                          completedTx.status === 'SUCCESSFUL'
                            ? 'text-emerald-700'
                            : completedTx.status === 'REFUNDED'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {completedTx.status}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">Date:</span>
                      <span className="font-semibold text-stone-800">
                        {new Date(completedTx.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveVTUReceipt(completedTx)}
                      className="flex-1 py-3.5 px-5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>Open Official Digital Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={resetOrderFlow}
                      className="py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Make Another Purchase
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Saved Beneficiaries & Recent VTU Activity */}
          <div className="space-y-6">
            {/* Saved Beneficiaries Manager */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-stone-900 font-display flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-600" />
                  <span>Saved Numbers</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddBeneficiary(!showAddBeneficiary)}
                  className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Number</span>
                </button>
              </div>

              {showAddBeneficiary && (
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5 text-xs">
                  <input
                    type="text"
                    value={newBenName}
                    onChange={(e) => setNewBenName(e.target.value)}
                    placeholder="Label (e.g. Mum's MTN, Office Router)"
                    className="w-full p-2 rounded-xl bg-white border border-stone-300 text-stone-900 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!phoneCheck.isValid) {
                        showToast('Enter a valid 11-digit phone number in the form first.', 'error');
                        return;
                      }
                      addSavedBeneficiary({
                        name: newBenName.trim() || `${selectedNetwork} Beneficiary`,
                        phoneNumber: phoneCheck.normalized,
                        network: selectedNetwork
                      });
                      setNewBenName('');
                      setShowAddBeneficiary(false);
                    }}
                    className="w-full py-2 rounded-xl bg-stone-900 text-amber-400 font-bold"
                  >
                    Save Current Form Phone ({phoneCheck.normalized || 'None'})
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {savedBeneficiaries.map((ben) => (
                  <div
                    key={ben.id}
                    className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div
                      onClick={() => {
                        setPhoneNumber(ben.phoneNumber);
                        setSelectedNetwork(ben.network);
                      }}
                      className="cursor-pointer flex-1"
                    >
                      <div className="font-bold text-stone-900">{ben.name}</div>
                      <div className="text-[11px] font-mono text-stone-500">
                        {ben.network} • {ben.phoneNumber}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSavedBeneficiary(ben.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                      title="Remove Beneficiary"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent VTU Transactions Quick Card */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-stone-900 font-display flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Recent VTU Transactions</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('HISTORY')}
                  className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {vtuTransactions.slice(0, 4).map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => setActiveVTUReceipt(tx)}
                    className="p-3.5 rounded-2xl bg-stone-50 hover:bg-amber-50/40 border border-stone-200 hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-stone-900">
                        {tx.network} {tx.type === 'AIRTIME' ? 'Airtime' : tx.planName}
                      </div>
                      <div className="font-mono text-[11px] text-stone-500">{tx.phoneNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-stone-900">
                        ₦{tx.totalAmount.toLocaleString()}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tx.status === 'SUCCESSFUL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'REFUNDED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* VTU TRANSACTION HISTORY & CUSTOMER ACCOUNT VIEW */}
      {/* =================================================================== */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-stone-900 font-display flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                <span>VTU Transaction History & Receipts</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Filter by Airtime, Data, Successful, Failed, Pending, or Date. Click any transaction to view or print its receipt.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('AIRTIME');
                  resetOrderFlow();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs cursor-pointer"
              >
                + New Top-Up
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* Search by ID or Phone */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search ID or Phone..."
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 font-medium"
              />
            </div>

            {/* Filter Service Type */}
            <select
              value={historyTypeFilter}
              onChange={(e) => setHistoryTypeFilter(e.target.value as any)}
              className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 font-bold"
            >
              <option value="ALL">All Services (Airtime & Data)</option>
              <option value="AIRTIME">Airtime Only</option>
              <option value="DATA">Mobile Data Only</option>
            </select>

            {/* Filter Status */}
            <select
              value={historyStatusFilter}
              onChange={(e) => setHistoryStatusFilter(e.target.value)}
              className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 font-bold"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESSFUL">Successful</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING_GROUP">Pending / Processing</option>
              <option value="REFUNDED">Refunded</option>
              <option value="REVERSED">Reversed</option>
            </select>

            {/* Filter Network */}
            <select
              value={historyNetworkFilter}
              onChange={(e) => setHistoryNetworkFilter(e.target.value as any)}
              className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 font-bold"
            >
              <option value="ALL">All Networks</option>
              <option value="MTN">MTN</option>
              <option value="AIRTEL">Airtel</option>
              <option value="GLO">Glo</option>
              <option value="9MOBILE">9mobile</option>
            </select>

            {/* Filter Date */}
            <input
              type="date"
              value={historyDateFilter}
              onChange={(e) => setHistoryDateFilter(e.target.value)}
              className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 font-bold"
            />
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-extrabold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Transaction ID</th>
                  <th className="p-3.5">Type & Bundle</th>
                  <th className="p-3.5">Network</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-stone-400 font-medium">
                      No VTU transactions match your current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => setActiveVTUReceipt(tx)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 font-mono font-bold text-stone-900">{tx.id}</td>
                      <td className="p-3.5 font-semibold text-stone-800">
                        {tx.type === 'AIRTIME'
                          ? 'Airtime Top-Up'
                          : `Data (${tx.planName} • ${tx.planValidity})`}
                      </td>
                      <td className="p-3.5">
                        <span className="font-extrabold text-stone-900">{tx.network}</span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-stone-900">{tx.phoneNumber}</td>
                      <td className="p-3.5 font-black text-stone-950">
                        ₦{tx.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-stone-500">
                        {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            tx.status === 'SUCCESSFUL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.status === 'REFUNDED' || tx.status === 'REVERSED'
                              ? 'bg-amber-100 text-amber-900'
                              : tx.status === 'FAILED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveVTUReceipt(tx);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 text-amber-400 font-bold text-[11px] hover:bg-stone-800"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
