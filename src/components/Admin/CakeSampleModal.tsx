import React, { useState, useEffect } from 'react';
import { CakeCustomSample } from '../../types';
import { X, Cake, Users } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface CakeSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sample: CakeCustomSample) => void;
  sampleToEdit?: CakeCustomSample | null;
}

export const CakeSampleModal: React.FC<CakeSampleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  sampleToEdit
}) => {
  const [name, setName] = useState('');
  const [tier, setTier] = useState('3-Tier Luxury Fondant');
  const [flavor, setFlavor] = useState('Red Velvet & Belgian Chocolate');
  const [servings, setServings] = useState('100 - 150 Guests');
  const [price, setPrice] = useState<number>(65000);
  const [image, setImage] = useState('');
  const [design, setDesign] = useState('');
  const [badge, setBadge] = useState('');

  useEffect(() => {
    if (sampleToEdit) {
      setName(sampleToEdit.name);
      setTier(sampleToEdit.tier);
      setFlavor(sampleToEdit.flavor);
      setServings(sampleToEdit.servings);
      setPrice(sampleToEdit.price);
      setImage(sampleToEdit.image);
      setDesign(sampleToEdit.design);
      setBadge(sampleToEdit.badge || '');
    } else {
      setName('');
      setTier('3-Tier Celebration');
      setFlavor('Red Velvet & Vanilla Bean');
      setServings('80 - 120 Guests');
      setPrice(55000);
      setImage('https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80');
      setDesign('Hand-crafted edible sugar orchids with 24k gold leaf foil.');
      setBadge('Showcase Design');
    }
  }, [sampleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;

    onSave({
      id: sampleToEdit ? sampleToEdit.id : `cake-sample-${Date.now()}`,
      name: name.trim(),
      tier: tier.trim(),
      flavor: flavor.trim(),
      servings: servings.trim(),
      price: Number(price),
      image: image.trim() || 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80',
      design: design.trim(),
      badge: badge.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-stone-900 w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-stone-900 text-white p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Cake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg font-display">
                {sampleToEdit ? 'Edit Custom Cake Design' : 'Add Custom Cake Showcase Design'}
              </h3>
              <p className="text-xs text-stone-400">
                Shown in the Bakery custom ordering gallery for birthdays, weddings, & anniversaries.
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
              <label className="block font-bold text-stone-700 mb-1">Cake Design Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Ivory & Gold Wedding Cake"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Tier / Style *</label>
              <input
                type="text"
                required
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                placeholder="e.g. 3-Tier Luxury Fondant, 2-Tier Buttercream"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Base Price (₦) *</label>
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Servings / Portions</label>
              <input
                type="text"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="e.g. 80-120 Guests"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Badge</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Wedding Top Pick"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Flavor Profile</label>
            <input
              type="text"
              value={flavor}
              onChange={(e) => setFlavor(e.target.value)}
              placeholder="e.g. Red Velvet, Rich Chocolate, Salted Caramel"
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <ImageUploadField
            value={image}
            onChange={(url) => setImage(url)}
            label="Cake Design Photo"
          />

          <div>
            <label className="block font-bold text-stone-700 mb-1">Artisanal Design Description *</label>
            <textarea
              rows={2}
              required
              value={design}
              onChange={(e) => setDesign(e.target.value)}
              placeholder="Describe the frosting technique, edible pearls, topper, floral accents..."
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md">
              {sampleToEdit ? 'Save Cake Changes' : 'Publish Cake Design'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
