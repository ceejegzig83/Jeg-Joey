import React, { useState, useEffect } from 'react';
import { CateringPackage } from '../../types';
import { X, UtensilsCrossed, Plus, Trash2 } from 'lucide-react';

interface CateringPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkg: CateringPackage) => void;
  packageToEdit?: CateringPackage | null;
}

export const CateringPackageModal: React.FC<CateringPackageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  packageToEdit
}) => {
  const [name, setName] = useState('');
  const [tier, setTier] = useState('Classic Banquet Tier');
  const [pricePerGuest, setPricePerGuest] = useState<number>(3200);
  const [minGuests, setMinGuests] = useState<number>(50);
  const [description, setDescription] = useState('');
  const [menuItemsStr, setMenuItemsStr] = useState('Jollof Rice, Fried Rice, Roasted Chicken, Fresh Salad');
  const [drinksStr, setDrinksStr] = useState('Chilled Soft Drinks, Table Water, Zobo Special');
  const [serversIncluded, setServersIncluded] = useState<number>(4);
  const [chafingWarmers, setChafingWarmers] = useState(true);
  const [popular, setPopular] = useState(false);

  useEffect(() => {
    if (packageToEdit) {
      setName(packageToEdit.name);
      setTier(packageToEdit.tier);
      setPricePerGuest(packageToEdit.pricePerGuest);
      setMinGuests(packageToEdit.minGuests);
      setDescription(packageToEdit.description);
      setMenuItemsStr(packageToEdit.menuItems.join(', '));
      setDrinksStr(packageToEdit.drinks.join(', '));
      setServersIncluded(packageToEdit.serversIncluded);
      setChafingWarmers(packageToEdit.chafingWarmers);
      setPopular(packageToEdit.popular || false);
    } else {
      setName('');
      setTier('Gold Banquet Tier');
      setPricePerGuest(4500);
      setMinGuests(50);
      setDescription('');
      setMenuItemsStr('Smoky Jollof, Fried Rice, Asun Pepper Goat, Fried Catfish, Moimoi Elewe');
      setDrinksStr('Chapman Cocktail, Premium Soda, Bottled Water');
      setServersIncluded(6);
      setChafingWarmers(true);
      setPopular(false);
    }
  }, [packageToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || pricePerGuest <= 0) return;

    const menuItems = menuItemsStr.split(',').map(m => m.trim()).filter(Boolean);
    const drinks = drinksStr.split(',').map(d => d.trim()).filter(Boolean);

    onSave({
      id: packageToEdit ? packageToEdit.id : `cat-${Date.now()}`,
      name: name.trim(),
      tier: tier.trim(),
      pricePerGuest: Number(pricePerGuest),
      minGuests: Number(minGuests) || 30,
      description: description.trim() || 'Complete banquet catering service tailored for Kogi royal events.',
      menuItems,
      drinks,
      serversIncluded: Number(serversIncluded) || 2,
      chafingWarmers,
      popular
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-stone-900 w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-stone-900 text-white p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg font-display">
                {packageToEdit ? 'Edit Catering Package' : 'Create New Catering Banquet Package'}
              </h3>
              <p className="text-xs text-stone-400">
                Configure per-guest rates, menu courses, and staff provision for Kogi banquets.
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
              <label className="block font-bold text-stone-700 mb-1">Package Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Emerald Buffet"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Tier Badge</label>
              <input
                type="text"
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                placeholder="e.g. Standard, Executive, Royal VIP"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Price Per Guest (₦) *</label>
              <input
                type="number"
                min={0}
                required
                value={pricePerGuest}
                onChange={(e) => setPricePerGuest(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Min Guests</label>
              <input
                type="number"
                min={10}
                value={minGuests}
                onChange={(e) => setMinGuests(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Uniformed Servers</label>
              <input
                type="number"
                min={1}
                value={serversIncluded}
                onChange={(e) => setServersIncluded(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Menu Items (Comma-separated) *</label>
            <textarea
              rows={2}
              required
              value={menuItemsStr}
              onChange={(e) => setMenuItemsStr(e.target.value)}
              placeholder="e.g. Party Jollof Rice, Fried Rice, Asun Pepper Goat, Moimoi Elewe, Grilled Croaker"
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Drinks & Refreshments (Comma-separated)</label>
            <input
              type="text"
              value={drinksStr}
              onChange={(e) => setDrinksStr(e.target.value)}
              placeholder="e.g. Chapman, Hibiscus Zobo, Bottled Spring Water"
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Package Summary & Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full buffet chaffing setup, silver cutlery, chef stations, and white-glove service."
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
              <input
                type="checkbox"
                checked={chafingWarmers}
                onChange={(e) => setChafingWarmers(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
              <span className="font-semibold text-stone-800">Chafing Warmers Included</span>
            </label>
            <label className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer">
              <input
                type="checkbox"
                checked={popular}
                onChange={(e) => setPopular(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span className="font-semibold text-stone-800">Mark as Most Popular</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md">
              {packageToEdit ? 'Save Package' : 'Publish Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
