import React, { useState } from 'react';
import { X, Plus, Package, DollarSign, Layers, Truck, CheckCircle2 } from 'lucide-react';
import { Category, Product } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Grocery');
  const [price, setPrice] = useState<number>(120);
  const [currentStock, setCurrentStock] = useState<number>(30);
  const [reorderLevel, setReorderLevel] = useState<number>(15);
  const [supplier, setSupplier] = useState('Premier FMCG Wholesale');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      name: name.trim(),
      category,
      price: Number(price),
      currentStock: Number(currentStock),
      reorderLevel: Number(reorderLevel),
      unitsSold: 0,
      revenue: 0,
      salesVelocityPerDay: 5,
      supplier: supplier.trim() || 'Premier FMCG Wholesale',
      lastRestockedDate: new Date().toISOString().split('T')[0],
    };

    onAddProduct(newProduct);
    onClose();
  };

  return (
    <div
      id="add-product-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="add-product-modal-card"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-slate-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Add New Product</h3>
              <p className="text-xs text-slate-400">Register catalog line for inventory tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase text-slate-400 tracking-wider mb-1">
              Product Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cold Pressed Olive Oil 500ml"
              className="w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase text-slate-400 tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-xs font-semibold"
              >
                <option value="Grocery">Grocery</option>
                <option value="Dairy">Dairy</option>
                <option value="Snacks">Snacks</option>
                <option value="Beverages">Beverages</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Household">Household</option>
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-400 tracking-wider mb-1">
                Unit Price (₹)
              </label>
              <input
                type="number"
                min="1"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold uppercase text-slate-400 tracking-wider mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                required
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-slate-400 tracking-wider mb-1">
                Reorder Threshold
              </label>
              <input
                type="number"
                min="1"
                required
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase text-slate-400 tracking-wider mb-1">
              Primary Supplier
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Amul Dairy Cooperative"
              className="w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Add to Inventory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
