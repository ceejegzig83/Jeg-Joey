import React, { useState, useEffect } from 'react';
import { BespokeTailoringSample } from '../../types';
import { X, Scissors, Tag } from 'lucide-react';

interface BespokeSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sample: BespokeTailoringSample) => void;
  sampleToEdit?: BespokeTailoringSample | null;
}

export const BespokeSampleModal: React.FC<BespokeSampleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  sampleToEdit
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number>(35000);
  const [turnaroundDays, setTurnaroundDays] = useState<number>(7);
  const [fabric, setFabric] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');

  useEffect(() => {
    if (sampleToEdit) {
      setName(sampleToEdit.name);
      setCategory(sampleToEdit.category);
      setPrice(sampleToEdit.price);
      setTurnaroundDays(sampleToEdit.turnaroundDays);
      setFabric(sampleToEdit.fabric);
      setImage(sampleToEdit.image);
      setDescription(sampleToEdit.description);
      setBadge(sampleToEdit.badge || '');
    } else {
      setName('');
      setCategory('Traditional Wear');
      setPrice(40000);
      setTurnaroundDays(7);
      setFabric('Ebira Woven Cloth (Okene Origin)');
      setImage('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80');
      setDescription('');
      setBadge('Popular Style');
    }
  }, [sampleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;

    onSave({
      id: sampleToEdit ? sampleToEdit.id : `sample-${Date.now()}`,
      name: name.trim(),
      category: category.trim() || 'Custom Craft',
      price: Number(price),
      turnaroundDays: Number(turnaroundDays) || 5,
      fabric: fabric.trim() || 'Custom Material',
      image: image.trim() || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
      description: description.trim() || 'Handcrafted bespoke tailoring piece by master artisans.',
      badge: badge.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-stone-900 w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-stone-900 text-white p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg font-display">
                {sampleToEdit ? 'Edit Tailoring Style Sample' : 'Add Bespoke Tailoring Sample'}
              </h3>
              <p className="text-xs text-stone-400">
                Shown in the Fashion Hub catalog for clients exploring custom sewing rates.
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
              <label className="block font-bold text-stone-700 mb-1">Style Name / Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Ebira 3-Piece Agbada"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Category *</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Traditional Wedding, Men Senator, Footwear"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Starting Price (₦) *</label>
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
              <label className="block font-bold text-stone-700 mb-1">Turnaround (Days)</label>
              <input
                type="number"
                min={1}
                value={turnaroundDays}
                onChange={(e) => setTurnaroundDays(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Badge (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Bestseller, High Demand"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Fabric & Texture Info</label>
            <input
              type="text"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              placeholder="e.g. Handwoven Ebira Cotton with Gold Filament"
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Sample Image URL *</label>
            <input
              type="url"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Craft Description *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the embroidery, lining, cuffs, and accessories..."
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md">
              {sampleToEdit ? 'Update Sample' : 'Publish Sample'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
