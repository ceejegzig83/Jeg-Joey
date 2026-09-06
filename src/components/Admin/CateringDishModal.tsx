import React, { useState, useEffect } from 'react';
import { CateringSampleDish } from '../../types';
import { X, Utensils, Tag } from 'lucide-react';

interface CateringDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dish: CateringSampleDish) => void;
  dishToEdit?: CateringSampleDish | null;
}

export const CateringDishModal: React.FC<CateringDishModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dishToEdit
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Native Specialty');
  const [pricePerPortion, setPricePerPortion] = useState<number>(3500);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isEbiraSpecialty, setIsEbiraSpecialty] = useState(false);

  useEffect(() => {
    if (dishToEdit) {
      setName(dishToEdit.name);
      setCategory(dishToEdit.category);
      setPricePerPortion(dishToEdit.pricePerPortion);
      setImage(dishToEdit.image);
      setDescription(dishToEdit.description);
      setIsEbiraSpecialty(dishToEdit.isEbiraSpecialty || false);
    } else {
      setName('');
      setCategory('Main Course');
      setPricePerPortion(4000);
      setImage('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80');
      setDescription('');
      setIsEbiraSpecialty(true);
    }
  }, [dishToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || pricePerPortion <= 0) return;

    onSave({
      id: dishToEdit ? dishToEdit.id : `dish-${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      pricePerPortion: Number(pricePerPortion),
      image: image.trim() || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      description: description.trim() || 'Delicious Kogi event banquet staple prepared fresh.',
      isEbiraSpecialty
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-stone-900 w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-stone-900 text-white p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg font-display">
                {dishToEdit ? 'Edit Catering Sample Dish' : 'Add Signature Dish / Live Station'}
              </h3>
              <p className="text-xs text-stone-400">
                Showcase individual dishes & live stations in the Catering showcase gallery.
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
              <label className="block font-bold text-stone-700 mb-1">Dish Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apapa (Ebira Steamed Bean Pudding)"
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
                placeholder="e.g. Main Course, Live Grills, Native Specialty"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Add-on Price Per Portion (₦) *</label>
              <input
                type="number"
                min={0}
                required
                value={pricePerPortion}
                onChange={(e) => setPricePerPortion(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 p-2.5 bg-stone-50 rounded-xl border border-stone-200 cursor-pointer w-full">
                <input
                  type="checkbox"
                  checked={isEbiraSpecialty}
                  onChange={(e) => setIsEbiraSpecialty(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span className="font-bold text-stone-800">Ebira Native Heritage Special</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Dish Image URL *</label>
            <input
              type="url"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Culinary Description *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe authentic spices, preparation, garnished proteins, and pairing..."
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md">
              {dishToEdit ? 'Save Dish' : 'Publish Dish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
