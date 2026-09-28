import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VTUNetwork, VTUDataPlan } from '../../types';
import {
  Smartphone,
  Wifi,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Settings,
  Save,
  Search
} from 'lucide-react';

export const AdminVTUPanel: React.FC = () => {
  const {
    vtuConfig,
    vtuDataPlans,
    vtuTransactions,
    saveVTUDataPlan,
    deleteVTUDataPlan,
    toggleVTUDataPlanStatus,
    updateVTUConfig,
    adminVTUTransactionAction,
    setActiveVTUReceipt
  } = useApp();

  const [subTab, setSubTab] = useState<'TRANSACTIONS' | 'PLANS' | 'SETTINGS'>('TRANSACTIONS');
  const [planNetworkFilter, setPlanNetworkFilter] = useState<'ALL' | VTUNetwork>('ALL');
  const [txSearch, setTxSearch] = useState('');
  const [txStatusFilter, setTxStatusFilter] = useState('ALL');

  // Plan Form State
  const [editingPlan, setEditingPlan] = useState<VTUDataPlan | null>(null);
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [planForm, setPlanForm] = useState<VTUDataPlan>({
    planId: '',
    network: 'MTN',
    name: '1GB',
    description: 'MTN Monthly SME Data Plan',
    category: 'MONTHLY',
    validity: '30 Days',
    providerPrice: 450,
    customerPrice: 500,
    status: 'ACTIVE'
  });

  // Settings Form State
  const [configForm, setConfigForm] = useState({
    minAirtimeAmount: vtuConfig.minAirtimeAmount,
    maxAirtimeAmount: vtuConfig.maxAirtimeAmount,
    airtimeServiceFee: vtuConfig.airtimeServiceFee,
    dataServiceFee: vtuConfig.dataServiceFee,
    networksEnabled: { ...vtuConfig.networksEnabled }
  });

  // KPIs
  const successfulTxs = vtuTransactions.filter((t) => t.status === 'SUCCESSFUL');
  const totalVtuRevenue = successfulTxs.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalVtuProfit = successfulTxs.reduce(
    (sum, t) => sum + (t.totalAmount - (t.providerCost || Math.round(t.amount * 0.96))),
    0
  );
  const airtimeSoldCount = successfulTxs.filter((t) => t.type === 'AIRTIME').length;
  const dataSoldCount = successfulTxs.filter((t) => t.type === 'DATA').length;

  const filteredPlans = vtuDataPlans.filter(
    (p) => planNetworkFilter === 'ALL' || p.network === planNetworkFilter
  );

  const filteredTxs = vtuTransactions.filter((t) => {
    if (txStatusFilter !== 'ALL' && t.status !== txStatusFilter) return false;
    if (txSearch.trim() !== '') {
      const q = txSearch.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.phoneNumber.toLowerCase().includes(q) ||
        t.network.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenNewPlan = () => {
    setEditingPlan(null);
    setPlanForm({
      planId: `plan-${Date.now().toString().slice(-5)}`,
      network: 'MTN',
      name: '',
      description: '',
      category: 'MONTHLY',
      validity: '30 Days',
      providerPrice: 450,
      customerPrice: 500,
      status: 'ACTIVE'
    });
    setIsPlanFormOpen(true);
  };

  const handleOpenEditPlan = (plan: VTUDataPlan) => {
    setEditingPlan(plan);
    setPlanForm({ ...plan });
    setIsPlanFormOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveVTUDataPlan(planForm);
    setIsPlanFormOpen(false);
    setEditingPlan(null);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateVTUConfig(configForm);
  };

  return (
    <div className="space-y-6">
      {/* VTU Summary Header & Mode Status */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-stone-950">
              {vtuConfig.mode === 'TEST_MODE' ? 'TEST / SANDBOX MODE' : 'LIVE GATEWAY'}
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Provider: {vtuConfig.vtuProviderName}
            </span>
          </div>
          <h3 className="text-xl font-black font-display">
            Airtime & Mobile Data VTU Control Center
          </h3>
          <p className="text-xs text-stone-400">
            Manage data bundle commercial prices, monitor Paystack-verified VTU dispenses, retry failed orders, or issue customer refunds.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'TRANSACTIONS', label: `Transactions (${vtuTransactions.length})` },
            { id: 'PLANS', label: `Data Plans (${vtuDataPlans.length})` },
            { id: 'SETTINGS', label: 'VTU Gateway Settings' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                subTab === t.id
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <span className="text-xs font-semibold text-stone-500">Total VTU Sales</span>
          <div className="text-2xl font-black text-stone-950 mt-1">
            ₦{totalVtuRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold">
            {successfulTxs.length} Fulfilled Top-Ups
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <span className="text-xs font-semibold text-stone-500">Estimated VTU Margin</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₦{totalVtuProfit.toLocaleString()}
          </div>
          <span className="text-[11px] text-stone-500">Customer Price − Provider Cost</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <span className="text-xs font-semibold text-stone-500">Airtime Vouchers Sold</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{airtimeSoldCount}</div>
          <span className="text-[11px] text-stone-500">MTN • Airtel • Glo • 9mobile</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <span className="text-xs font-semibold text-stone-500">Data Bundles Activated</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{dataSoldCount}</div>
          <span className="text-[11px] text-stone-500">
            {vtuDataPlans.filter((p) => p.status === 'ACTIVE').length} Active Plans
          </span>
        </div>
      </div>

      {/* 1. VTU TRANSACTIONS LOG & ADMIN ACTIONS */}
      {subTab === 'TRANSACTIONS' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h4 className="font-extrabold text-base text-stone-900 font-display">
              All Customer VTU Transactions
            </h4>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="Search ID, Phone, Network..."
                  className="pl-8 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900"
                />
              </div>

              <select
                value={txStatusFilter}
                onChange={(e) => setTxStatusFilter(e.target.value)}
                className="p-2 rounded-xl bg-stone-50 border border-stone-200 font-bold text-stone-800"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESSFUL">SUCCESSFUL</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
                <option value="REVERSED">REVERSED</option>
                <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-extrabold border-b border-stone-200">
                <tr>
                  <th className="p-3">Transaction ID</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Network & Phone</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">VTU Status</th>
                  <th className="p-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono font-bold text-stone-900">
                      {tx.id}
                      <span className="block text-[10px] text-stone-400">
                        {new Date(tx.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-stone-800">
                      {tx.type === 'AIRTIME' ? 'Airtime' : `Data (${tx.planName})`}
                    </td>
                    <td className="p-3">
                      <span className="font-extrabold text-stone-900">{tx.network}</span>
                      <span className="block font-mono text-stone-600">{tx.phoneNumber}</span>
                    </td>
                    <td className="p-3 font-black text-stone-900">
                      ₦{tx.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.paymentStatus === 'SUCCESSFUL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.paymentStatus === 'REFUNDED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          tx.status === 'SUCCESSFUL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'REFUNDED' || tx.status === 'REVERSED'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setActiveVTUReceipt(tx)}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 text-amber-400 font-bold text-[11px] hover:bg-stone-800"
                      >
                        Receipt
                      </button>
                      {tx.status !== 'SUCCESSFUL' && (
                        <button
                          type="button"
                          onClick={() => adminVTUTransactionAction(tx.id, 'RETRY')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-500"
                        >
                          Retry VTU
                        </button>
                      )}
                      {tx.status !== 'REFUNDED' && (
                        <button
                          type="button"
                          onClick={() => adminVTUTransactionAction(tx.id, 'REFUND')}
                          className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-[11px] hover:bg-rose-200"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC DATA PLANS MANAGER */}
      {subTab === 'PLANS' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-base text-stone-900 font-display">
                VTU Mobile Data Plans & Pricing Catalog
              </h4>
              <p className="text-xs text-stone-500">
                Adjust provider cost, customer retail price, validity, and active status dynamically without hardcoding.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={planNetworkFilter}
                onChange={(e) => setPlanNetworkFilter(e.target.value as any)}
                className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold"
              >
                <option value="ALL">All Networks</option>
                <option value="MTN">MTN</option>
                <option value="AIRTEL">Airtel</option>
                <option value="GLO">Glo</option>
                <option value="9MOBILE">9mobile</option>
              </select>

              <button
                type="button"
                onClick={handleOpenNewPlan}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Data Bundle</span>
              </button>
            </div>
          </div>

          {isPlanFormOpen && (
            <form
              onSubmit={handleSavePlan}
              className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4 text-xs"
            >
              <div className="font-extrabold text-sm text-stone-900">
                {editingPlan ? `Edit Plan: ${editingPlan.planId}` : 'Create New VTU Data Plan'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Plan ID (Provider Code)</label>
                  <input
                    type="text"
                    value={planForm.planId}
                    onChange={(e) => setPlanForm({ ...planForm, planId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-300 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Network</label>
                  <select
                    value={planForm.network}
                    onChange={(e) => setPlanForm({ ...planForm, network: e.target.value as VTUNetwork })}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-300 font-bold"
                  >
                    <option value="MTN">MTN</option>
                    <option value="AIRTEL">AIRTEL</option>
                    <option value="GLO">GLO</option>
                    <option value="9MOBILE">9MOBILE</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Bundle Size Name (e.g. 2GB)</label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-300 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Validity (e.g. 30 Days)</label>
                  <input
                    type="text"
                    value={planForm.validity}
                    onChange={(e) => setPlanForm({ ...planForm, validity: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Provider Cost (₦)</label>
                  <input
                    type="number"
                    value={planForm.providerPrice}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, providerPrice: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-300 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Customer Price (₦)</label>
                  <input
                    type="number"
                    value={planForm.customerPrice}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, customerPrice: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-300 font-black text-amber-800"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-bold text-stone-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-stone-300"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlanFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-200 text-stone-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 text-amber-400 font-extrabold"
                >
                  Save Data Plan
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto border border-stone-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100 text-stone-700 font-extrabold border-b border-stone-200">
                <tr>
                  <th className="p-3">Network</th>
                  <th className="p-3">Bundle</th>
                  <th className="p-3">Validity</th>
                  <th className="p-3">Provider Price</th>
                  <th className="p-3">Customer Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPlans.map((plan) => (
                  <tr key={plan.planId} className="hover:bg-stone-50">
                    <td className="p-3 font-extrabold text-stone-900">{plan.network}</td>
                    <td className="p-3">
                      <span className="font-black text-stone-950">{plan.name}</span>
                      <span className="block text-[11px] text-stone-500">{plan.description}</span>
                    </td>
                    <td className="p-3 font-semibold text-stone-700">{plan.validity}</td>
                    <td className="p-3 text-stone-600">₦{plan.providerPrice.toLocaleString()}</td>
                    <td className="p-3 font-black text-amber-800">
                      ₦{plan.customerPrice.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => toggleVTUDataPlanStatus(plan.planId)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          plan.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {plan.status}
                      </button>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPlan(plan)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteVTUDataPlan(plan.planId)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. VTU GATEWAY & LIMITS SETTINGS */}
      {subTab === 'SETTINGS' && (
        <form
          onSubmit={handleSaveConfig}
          className="bg-white rounded-3xl p-6 border border-stone-200 space-y-6 text-xs"
        >
          <h4 className="font-extrabold text-base text-stone-900 font-display flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-600" />
            <span>VTU Limits, Service Fees & Network Availability</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Minimum Airtime Amount (₦)
              </label>
              <input
                type="number"
                value={configForm.minAirtimeAmount}
                onChange={(e) =>
                  setConfigForm({ ...configForm, minAirtimeAmount: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Maximum Airtime Amount (₦)
              </label>
              <input
                type="number"
                value={configForm.maxAirtimeAmount}
                onChange={(e) =>
                  setConfigForm({ ...configForm, maxAirtimeAmount: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Airtime Service Fee (₦)
              </label>
              <input
                type="number"
                value={configForm.airtimeServiceFee}
                onChange={(e) =>
                  setConfigForm({ ...configForm, airtimeServiceFee: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Mobile Data Service Fee (₦)
              </label>
              <input
                type="number"
                value={configForm.dataServiceFee}
                onChange={(e) =>
                  setConfigForm({ ...configForm, dataServiceFee: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-300 font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-stone-700">
              Enable / Disable Telecom Networks
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['MTN', 'AIRTEL', 'GLO', '9MOBILE'] as VTUNetwork[]).map((net) => (
                <label
                  key={net}
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer font-bold"
                >
                  <span>{net} Nigeria</span>
                  <input
                    type="checkbox"
                    checked={configForm.networksEnabled[net]}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        networksEnabled: {
                          ...configForm.networksEnabled,
                          [net]: e.target.checked
                        }
                      })
                    }
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-extrabold"
            >
              <Save className="w-4 h-4" />
              <span>Save VTU Settings</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
