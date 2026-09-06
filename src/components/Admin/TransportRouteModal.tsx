import React, { useState, useEffect } from 'react';
import { TransportSampleRoute } from '../../types';
import { X, Navigation, MapPin } from 'lucide-react';

interface TransportRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (route: TransportSampleRoute) => void;
  routeToEdit?: TransportSampleRoute | null;
}

export const TransportRouteModal: React.FC<TransportRouteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  routeToEdit
}) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(5.5);
  const [estimatedKekeFare, setEstimatedKekeFare] = useState<number>(850);
  const [estimatedCarFare, setEstimatedCarFare] = useState<number>(2000);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(15);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (routeToEdit) {
      setPickup(routeToEdit.pickup);
      setDestination(routeToEdit.destination);
      setDistanceKm(routeToEdit.distanceKm);
      setEstimatedKekeFare(routeToEdit.estimatedKekeFare);
      setEstimatedCarFare(routeToEdit.estimatedCarFare);
      setEstimatedMinutes(routeToEdit.estimatedMinutes);
      setImage(routeToEdit.image);
      setDescription(routeToEdit.description);
    } else {
      setPickup('Okene Total Junction Hub');
      setDestination('Lokoja Ganaja Junction');
      setDistanceKm(62);
      setEstimatedKekeFare(0);
      setEstimatedCarFare(9500);
      setEstimatedMinutes(65);
      setImage('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80');
      setDescription('Smooth inter-city transit linking Central Kogi with the state capital.');
    }
  }, [routeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim() || !destination.trim() || distanceKm <= 0) return;

    onSave({
      id: routeToEdit ? routeToEdit.id : `route-${Date.now()}`,
      pickup: pickup.trim(),
      destination: destination.trim(),
      distanceKm: Number(distanceKm),
      estimatedKekeFare: Number(estimatedKekeFare),
      estimatedCarFare: Number(estimatedCarFare),
      estimatedMinutes: Number(estimatedMinutes),
      image: image.trim() || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      description: description.trim() || 'Frequent intra-Kogi transit route with verified drivers.'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-stone-900 w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-stone-900 text-white p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg font-display">
                {routeToEdit ? 'Edit Transit Route Guide' : 'Add Kogi Popular Transit Route'}
              </h3>
              <p className="text-xs text-stone-400">
                Configure standard fixed fare guides and distance estimates for passengers.
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
              <label className="block font-bold text-stone-700 mb-1">Pickup Origin *</label>
              <input
                type="text"
                required
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="e.g. Okene Central Hub"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Destination Target *</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Federal Poly Idah / CUSTECH Osara"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Distance (km) *</label>
              <input
                type="number"
                step="0.1"
                min={0.5}
                required
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Keke Fare (₦)</label>
              <input
                type="number"
                min={0}
                value={estimatedKekeFare}
                onChange={(e) => setEstimatedKekeFare(Number(e.target.value))}
                placeholder="0 if N/A"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Car Fare (₦) *</label>
              <input
                type="number"
                min={0}
                required
                value={estimatedCarFare}
                onChange={(e) => setEstimatedCarFare(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Est. Mins</label>
              <input
                type="number"
                min={1}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Route Photo Image URL *</label>
            <input
              type="url"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Route Corridor Highlights</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key landmarks along the route: Checkpoints, scenic hills, institutions..."
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md">
              {routeToEdit ? 'Save Route' : 'Publish Route Guide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
