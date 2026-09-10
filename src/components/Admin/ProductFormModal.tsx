import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { X, Sparkles, Upload, Tag, DollarSign, Package, AlertCircle } from 'lucide-react';
import { ImageUploadField } from './ImageUploadField';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
}

const PRESET_IMAGES = [
  // Fashion
  { label: 'Aso-Oke Heritage', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80', division: 'FASHION' },
  { label: 'Senator Suit', url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80', division: 'FASHION' },
  { label: 'Bespoke Agbada', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', division: 'FASHION' },
  { label: 'Leather Footwear', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80', division: 'FASHION' },
  // Bakery
  { label: 'Artisan Bread', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', division: 'BAKERY' },
  { label: 'Golden Meat Pies', url: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=800&q=80', division: 'BAKERY' },
  { label: 'Celebration Cake', url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80', division: 'BAKERY' },
  { label: 'Frosted Cupcakes', url: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80', division: 'BAKERY' },
  // Grocery
  { label: 'Kogi Giant Yams', url: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&w=800&q=80', division: 'GROCERY' },
  { label: 'Pure Palm Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80', division: 'GROCERY' },
  { label: 'Smoked Catfish', url: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=800&q=80', division: 'GROCERY' },
  { label: 'Fresh Tomatoes & Peppers', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80', division: 'GROCERY' }
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit
}) => {
  const [division, setDivision] = useState<'FASHION' | 'BAKERY' | 'GROCERY'>('FASHION');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number>(5000);
  const [originalPrice, setOriginalPrice] = useState<number>(0);
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [inStock, setInStock] = useState(true);
  const [stockCount, setStockCount] = useState<number>(20);
  const [badge, setBadge] = useState('');
  
  // Division specific fields
  const [sizesStr, setSizesStr] = useState('S, M, L, XL');
  const [colorsStr, setColorsStr] = useState('Royal Gold, Navy Blue, Wine');
  const [fabric, setFabric] = useState('');
  const [gender, setGender] = useState<'Men' | 'Women' | 'Unisex' | 'Kids'>('Unisex');
  const [unit, setUnit] = useState('per pack');
  const [shelfLife, setShelfLife] = useState('4 Days Room Temp');
  const [isPerishable, setIsPerishable] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setDivision(productToEdit.division);
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.originalPrice || 0);
      setImage(productToEdit.image);
      setDescription(productToEdit.description);
      setInStock(productToEdit.inStock);
      setStockCount(productToEdit.stockCount);
      setBadge(productToEdit.badge || '');
      setSizesStr(productToEdit.sizes ? productToEdit.sizes.join(', ') : '');
      setColorsStr(productToEdit.colors ? productToEdit.colors.join(', ') : '');
      setFabric(productToEdit.fabric || '');
      setGender(productToEdit.gender || 'Unisex');
      setUnit(productToEdit.unit || '');
      setShelfLife(productToEdit.shelfLife || '');
      setIsPerishable(productToEdit.isPerishable || false);
    } else {
      // Default new product values
      setDivision('FASHION');
      setName('');
      setCategory('Traditional Wear');
      setPrice(15000);
      setOriginalPrice(18000);
      setImage(PRESET_IMAGES[0].url);
      setDescription('');
      setInStock(true);
      setStockCount(25);
      setBadge('New Arrival');
      setSizesStr('S, M, L, XL');
      setColorsStr('Black, Navy, Burgundy');
      setFabric('Premium Fabric');
      setGender('Unisex');
      setUnit('1 unit');
      setShelfLife('3 Days');
      setIsPerishable(false);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !category.trim() || price <= 0) {
      alert('Please fill out product name, category, and valid price.');
      return;
    }

    const sizes = sizesStr ? sizesStr.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const colors = colorsStr ? colorsStr.split(',').map(c => c.trim()).filter(Boolean) : undefined;

    const newProduct: Product = {
      id: productToEdit ? productToEdit.id : `prod-${Date.now()}`,
      division,
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      originalPrice: originalPrice > 0 ? Number(originalPrice) : undefined,
      image: image.trim() || PRESET_IMAGES[0].url,
      description: description.trim() || 'High quality guaranteed item from Flourish Destiny Collection, Okene Hub.',
      inStock,
      stockCount: Number(stockCount),
      rating: productToEdit ? productToEdit.rating : 4.9,
      reviewCount: productToEdit ? productToEdit.reviewCount : 12,
      badge: badge.trim() || undefined,
      ...(division === 'FASHION' ? { sizes, colors, fabric, gender } : {}),
      ...(division === 'BAKERY' ? { shelfLife } : {}),
      ...(division === 'GROCERY' ? { unit, isPerishable } : {})
    };

    onSave(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white text-stone-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg font-display">
                {productToEdit ? 'Edit Product Item' : 'Add New Product to Catalog'}
              </h3>
              <p className="text-xs text-stone-400">
                Configure pricing, stock, images, and specifications for your retail hubs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Division Selector */}
          <div>
            <label className="block font-bold text-stone-700 mb-1.5">Business Division Hub *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'FASHION', label: '👗 Fashion Store', color: 'peer-checked:bg-amber-600 peer-checked:text-white peer-checked:border-amber-600' },
                { id: 'BAKERY', label: '🎂 Artisanal Bakery', color: 'peer-checked:bg-orange-600 peer-checked:text-white peer-checked:border-orange-600' },
                { id: 'GROCERY', label: '🛒 Grocery Hub', color: 'peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600' }
              ].map((d) => (
                <label key={d.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="division"
                    checked={division === d.id}
                    onChange={() => setDivision(d.id as any)}
                    className="peer sr-only"
                  />
                  <div className={`p-3 text-center rounded-2xl border border-stone-300 font-bold transition-all ${d.color} peer-checked:shadow-sm bg-stone-50 hover:bg-stone-100`}>
                    {d.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Product Title / Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Ebira Woven Senator Suit"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Category *</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Traditional Wear, Bread, Fresh Produce"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-stone-900"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Selling Price (₦) *</label>
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Original Price (₦, Optional)</label>
              <input
                type="number"
                min={0}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                placeholder="0 if none"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                min={0}
                value={stockCount}
                onChange={(e) => setStockCount(Number(e.target.value))}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* In Stock & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <input
                type="checkbox"
                id="inStockCheck"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <label htmlFor="inStockCheck" className="font-bold text-stone-800 cursor-pointer">
                Currently In Stock (Available for Purchase)
              </label>
            </div>
            <div>
              <label className="block font-bold text-stone-700 mb-1">Promotional Badge (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Best Seller, Okene Specialty, Hot Deal"
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Product Image Upload with strict .jpg, .jpeg, .png and 2MB limit */}
          <ImageUploadField
            value={image}
            onChange={(url) => setImage(url)}
            label="Product Catalog Image"
            presetImages={PRESET_IMAGES}
            currentDivision={division}
          />

          {/* Description */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Detailed Description *</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product material, origin, recipe, ingredients, or sizing..."
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Division Specific Fields */}
          {division === 'FASHION' && (
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Fashion & Tailoring Specifics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-amber-950 mb-1">Available Sizes (Comma-separated)</label>
                  <input
                    type="text"
                    value={sizesStr}
                    onChange={(e) => setSizesStr(e.target.value)}
                    placeholder="S, M, L, XL, XXL, Custom"
                    className="w-full p-2 bg-white border border-amber-300 rounded-xl text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-amber-950 mb-1">Color Options (Comma-separated)</label>
                  <input
                    type="text"
                    value={colorsStr}
                    onChange={(e) => setColorsStr(e.target.value)}
                    placeholder="Gold, Navy, Charcoal, Emerald"
                    className="w-full p-2 bg-white border border-amber-300 rounded-xl text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-amber-950 mb-1">Fabric Type</label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="e.g. Ebira Woven Cotton, Super 140s Wool"
                    className="w-full p-2 bg-white border border-amber-300 rounded-xl text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-amber-950 mb-1">Target Department</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2 bg-white border border-amber-300 rounded-xl text-stone-900 font-semibold"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {division === 'BAKERY' && (
            <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200 space-y-3">
              <h4 className="font-bold text-orange-900 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Bakery & Shelf Life Specifics
              </h4>
              <div>
                <label className="block font-semibold text-orange-950 mb-1">Freshness & Shelf Life</label>
                <input
                  type="text"
                  value={shelfLife}
                  onChange={(e) => setShelfLife(e.target.value)}
                  placeholder="e.g. Best consumed within 3 days room temperature"
                  className="w-full p-2 bg-white border border-orange-300 rounded-xl text-stone-900"
                />
              </div>
            </div>
          )}

          {division === 'GROCERY' && (
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Grocery Unit & Perishables
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-emerald-950 mb-1">Measurement Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. 5 Tubers, 5-Litre Gallon, 10kg Bag, Basket"
                    className="w-full p-2 bg-white border border-emerald-300 rounded-xl text-stone-900"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="perishCheck"
                    checked={isPerishable}
                    onChange={(e) => setIsPerishable(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="perishCheck" className="font-bold text-emerald-950 cursor-pointer">
                    Perishable Item (Same-Day Delivery Priority)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold shadow-md transition-colors"
            >
              {productToEdit ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
