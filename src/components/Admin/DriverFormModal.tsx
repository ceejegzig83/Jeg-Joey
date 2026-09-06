import React, { useState, useEffect } from 'react';
import { Driver, VehicleType } from '../../types';
import { X, UserCheck, ShieldCheck, Phone, Car } from 'lucide-react';

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (driver: Driver) => void;
  driverToEdit?: Driver | null;
}

export const DriverFormModal: React.FC<DriverFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  driverToEdit
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('KEKE');
  const [vehicleModel, setVehicleModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [rating, setRating] = useState<number>(4.9);
  const [totalTrips, setTotalTrips] = useState<number>(100);
  const [isAvailable, setIsAvailable] = useState(true);
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (driverToEdit) {
      setName(driverToEdit.name);
      setPhone(driverToEdit.phone);
      setVehicleType(driverToEdit.vehicleType);
      setVehicleModel(driverToEdit.vehicleModel);
      setPlateNumber(driverToEdit.plateNumber);
      setRating(driverToEdit.rating);
      setTotalTrips(driverToEdit.totalTrips);
      setIsAvailable(driverToEdit.isAvailable);
      setAvatar(driverToEdit.avatar);
    } else {
      setName('');
      setPhone('080');
      setVehicleType('KEKE');
      setVehicleModel('TVS King Deluxe (Yellow/Black)');
      setPlateNumber('KGI-');
      setRating(4.9);
      setTotalTrips(50);
      setIsAvailable(true);
      setAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80');
    }
  }, [driverToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !plateNumber.trim()) return;

    onSave({
      id: driverToEdit ? driverToEdit.id : `drv-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      vehicleType,
      vehicleModel: vehicleModel.trim() || (vehicleType === 'KEKE' ? 'Bajaj RE Deluxe' : 'Toyota Corolla'),
      plateNumber: plateNumber.trim().toUpperCase(),
      rating: Number(rating) || 4.9,
      totalTrips: Number(totalTrips) || 0,
      isAvailable,
      avatar: avatar.trim() || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      currentLocation: driverToEdit?.currentLocation || {
        name: 'Okene Total Junction Station',
        latitude: 7.5516,
        longitude: 6.2361,
        isWithinKogi: true
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-stone-900 w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-stone-900 text-white p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg font-display">
                {driverToEdit ? 'Edit Driver Profile' : 'Onboard New Kogi Fleet Driver'}
              </h3>
              <p className="text-xs text-stone-400">
                Register verified Keke and Car operators for immediate intra-Kogi ride dispatch.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Driver Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ibrahim Lawal"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08012345678"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Vehicle Category *</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold"
              >
                <option value="KEKE">🛺 Tricycle (Keke NAPEP)</option>
                <option value="CAR">🚗 Sedan / Taxi Car</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Kogi State Plate Number *</label>
              <input
                type="text"
                required
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="e.g. KGI-458-OKN"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-bold uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Vehicle Model & Color *</label>
              <input
                type="text"
                required
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. TVS King 200cc (Yellow)"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Driver Photo URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="driverAvailableCheck"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="driverAvailableCheck" className="font-bold text-stone-800 cursor-pointer">
                Driver Online & Available for Instant Dispatch
              </label>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
              {isAvailable ? 'ACTIVE DISPATCH' : 'OFFLINE'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md">
              {driverToEdit ? 'Update Driver' : 'Onboard Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
