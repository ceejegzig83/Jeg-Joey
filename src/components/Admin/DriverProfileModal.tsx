import React from 'react';
import { Driver } from '../../types';
import { X, ShieldCheck, Phone, Mail, MapPin, Car, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface DriverProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  driver: Driver | null;
  onStatusChange: (driverId: string, status: Driver['fleetStatus'], reason?: string) => void;
  onPermanentRemove: (driverId: string, reason: string) => void;
}

export const DriverProfileModal: React.FC<DriverProfileModalProps> = ({
  isOpen,
  onClose,
  driver,
  onStatusChange,
  onPermanentRemove
}) => {
  const [suspendReason, setSuspendReason] = React.useState('');
  const [showSuspendInput, setShowSuspendInput] = React.useState(false);
  const [removeReason, setRemoveReason] = React.useState('');
  const [showRemoveInput, setShowRemoveInput] = React.useState(false);

  if (!isOpen || !driver) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-stone-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-4">
            <img
              src={driver.photo || driver.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
              alt={driver.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md bg-stone-800"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg font-display">{driver.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  driver.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  driver.verificationStatus === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {driver.verificationStatus}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">{driver.phone} • {driver.email || 'No email provided'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
          {/* Status & Fleet Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[10px] text-stone-500 font-bold block">Vehicle Category</span>
              <span className="font-extrabold text-stone-900 text-sm">
                {driver.vehicleType === 'KEKE' ? '🛺 Keke NAPEP' : '🚗 Car / Taxi'}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[10px] text-stone-500 font-bold block">Plate Number</span>
              <span className="font-mono font-bold text-stone-900 text-sm">{driver.plateNumber}</span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[10px] text-stone-500 font-bold block">Fleet Status</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                driver.fleetStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                driver.fleetStatus === 'SUSPENDED' ? 'bg-amber-100 text-amber-800' :
                driver.fleetStatus === 'DEACTIVATED' ? 'bg-stone-200 text-stone-700' :
                'bg-blue-100 text-blue-800'
              }`}>
                {driver.fleetStatus}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <span className="text-[10px] text-stone-500 font-bold block">Rating & Trips</span>
              <span className="font-bold text-amber-600">★ {driver.rating} ({driver.totalTrips} trips)</span>
            </div>
          </div>

          {/* Vehicle & Operational Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 border-b border-stone-200 pb-2">
                <Car className="w-4 h-4 text-emerald-600" /> Vehicle & Inspection
              </h4>
              <div className="space-y-1.5 text-stone-700">
                <div><strong className="text-stone-900">Model/Color:</strong> {driver.vehicleModel} ({driver.vehicleColor || 'Standard'})</div>
                <div><strong className="text-stone-900">Inspection:</strong> <span className="text-emerald-700 font-bold">{driver.vehicleInspectionStatus}</span></div>
                <div><strong className="text-stone-900">Insurance:</strong> <span className="text-blue-700 font-bold">{driver.insuranceStatus}</span> (Exp: {driver.insuranceExpiry || 'N/A'})</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 border-b border-stone-200 pb-2">
                <MapPin className="w-4 h-4 text-blue-600" /> Operating Base & LGA
              </h4>
              <div className="space-y-1.5 text-stone-700">
                <div><strong className="text-stone-900">Operating Area:</strong> {driver.operatingArea}</div>
                <div><strong className="text-stone-900">LGA:</strong> {driver.lga} (Kogi State)</div>
                <div><strong className="text-stone-900">Registered:</strong> {driver.registrationDate}</div>
              </div>
            </div>
          </div>

          {/* Identity & Legal Info */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 border-b border-stone-200 pb-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" /> Identity & Emergency Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-700">
              <div><strong className="text-stone-900">ID Type & Ref:</strong> {driver.idType || 'NIN'} ({driver.idReference || 'N/A'})</div>
              <div><strong className="text-stone-900">Licence No:</strong> {driver.licenceNumber || 'N/A'} (Exp: {driver.licenceExpiry || 'N/A'})</div>
              <div><strong className="text-stone-900">Residential Address:</strong> {driver.residentialAddress || 'Okene Central'}</div>
              <div><strong className="text-stone-900">Emergency Contact:</strong> {driver.emergencyContactName || 'N/A'} ({driver.emergencyContactPhone || 'N/A'})</div>
            </div>
          </div>

          {driver.fleetStatus === 'SUSPENDED' && driver.suspensionReason && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Suspension Notice
              </div>
              <p className="text-[11px]">{driver.suspensionReason} (Suspended on {driver.suspendedAt ? new Date(driver.suspendedAt).toLocaleDateString() : 'Recent'})</p>
            </div>
          )}

          {/* Admin Management Actions */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <h4 className="font-bold text-stone-900 text-xs">Administrative Fleet Actions</h4>
            
            <div className="flex flex-wrap items-center gap-2">
              {driver.fleetStatus !== 'ACTIVE' && (
                <button
                  onClick={() => onStatusChange(driver.id, 'ACTIVE')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Activate / Reinstate Driver
                </button>
              )}

              {driver.fleetStatus === 'ACTIVE' && (
                <button
                  onClick={() => onStatusChange(driver.id, 'DEACTIVATED')}
                  className="px-4 py-2 rounded-xl bg-stone-700 hover:bg-stone-800 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Clock className="w-3.5 h-3.5" /> Deactivate Driver
                </button>
              )}

              {driver.fleetStatus !== 'SUSPENDED' && (
                <button
                  onClick={() => setShowSuspendInput(!showSuspendInput)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Suspend Driver
                </button>
              )}

              <button
                onClick={() => setShowRemoveInput(!showRemoveInput)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-xs ml-auto"
              >
                Permanent Remove
              </button>
            </div>

            {showSuspendInput && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 mt-2">
                <label className="block font-bold text-amber-900">Reason for Suspension *</label>
                <input
                  type="text"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Customer complaint regarding reckless driving / policy violation"
                  className="w-full p-2 bg-white border border-amber-300 rounded-xl text-stone-900"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowSuspendInput(false)} className="px-3 py-1.5 text-stone-600 font-bold">Cancel</button>
                  <button
                    onClick={() => {
                      if (!suspendReason.trim()) return;
                      onStatusChange(driver.id, 'SUSPENDED', suspendReason.trim());
                      setShowSuspendInput(false);
                      setSuspendReason('');
                    }}
                    className="px-4 py-1.5 bg-amber-700 text-white font-bold rounded-xl"
                  >
                    Confirm Suspension
                  </button>
                </div>
              </div>
            )}

            {showRemoveInput && (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-2 mt-2">
                <label className="block font-bold text-rose-900">Protected Permanent Removal Reason *</label>
                <input
                  type="text"
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  placeholder="e.g. Driver service agreement terminated permanently"
                  className="w-full p-2 bg-white border border-rose-300 rounded-xl text-stone-900"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowRemoveInput(false)} className="px-3 py-1.5 text-stone-600 font-bold">Cancel</button>
                  <button
                    onClick={() => {
                      if (!removeReason.trim()) return;
                      onPermanentRemove(driver.id, removeReason.trim());
                      setShowRemoveInput(false);
                      setRemoveReason('');
                    }}
                    className="px-4 py-1.5 bg-rose-700 text-white font-bold rounded-xl"
                  >
                    Confirm Permanent Removal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 rounded-xl bg-stone-900 text-white font-bold">
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
